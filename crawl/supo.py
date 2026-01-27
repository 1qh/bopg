from __future__ import annotations

import operator
import re
import time
from datetime import datetime
from typing import Any, TypedDict
from urllib.parse import urljoin, urlsplit, urlunsplit

from crawl4ai import (
  AsyncWebCrawler,
  BrowserConfig,
  CacheMode,
  CrawlerRunConfig,
  RateLimiter,
)
from crawl4ai.async_dispatcher import MemoryAdaptiveDispatcher
from crawl4ai.content_filter_strategy import PruningContentFilter
from crawl4ai.markdown_generation_strategy import DefaultMarkdownGenerator
from modal import App, Image


class RouteMarkdown(TypedDict):
  route: str
  markdown: str


BLACKLISTED_EXTENSIONS: tuple[str, ...] = (
  '.7z',
  '.apk',
  '.avi',
  '.avif',
  '.bmp',
  '.bz2',
  '.css',
  '.csv',
  '.dmg',
  '.doc',
  '.docx',
  '.eot',
  '.epub',
  '.exe',
  '.gif',
  '.gz',
  '.ico',
  '.iso',
  '.jar',
  '.jpeg',
  '.jpg',
  '.js',
  '.json',
  '.m4a',
  '.m4v',
  '.mht',
  '.mhtml',
  '.mkv',
  '.mov',
  '.mp3',
  '.mp4',
  '.ogg',
  '.otf',
  '.pdf',
  '.png',
  '.ppt',
  '.pptx',
  '.rar',
  '.rss',
  '.svg',
  '.tar',
  '.tgz',
  '.tif',
  '.tiff',
  '.tsv',
  '.ttf',
  '.txt',
  '.wav',
  '.webm',
  '.webp',
  '.woff',
  '.woff2',
  '.xml',
  '.zip',
)

PRIORITY_KEYWORDS: tuple[str, ...] = (
  'contact',
  'kontakt',
  'contacto',
  'contato',
  'contattaci',
  'kapcsolat',
  'about',
  'about-us',
  'aboutus',
  'team',
  'support',
  'help',
  'reach',
  'get-in-touch',
  'getintouch',
  'inquiry',
  'enquiry',
)

EMAIL_PATTERN: re.Pattern[str] = re.compile(
  r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,}',
  re.IGNORECASE,
)

MIN_CONTENT_LENGTH: int = 100


def _ensure_scheme(url: str) -> str:
  u = url.strip()
  split = urlsplit(u)
  if split.scheme:
    return u
  if split.netloc:
    return urlunsplit(('https', split.netloc, split.path, split.query, split.fragment))
  return f'https://{u.lstrip("/")}'


def _compute_prefix(path: str) -> str:
  p = (path or '/').strip()
  if not p.startswith('/'):
    p = f'/{p}'
  p = p.rstrip('/') or '/'
  last = p.rsplit('/', 1)[-1]
  if '.' in last and p != '/':
    return p.rsplit('/', 1)[0] or '/'
  return p


def _is_under_prefix(path: str, prefix: str) -> bool:
  if prefix == '/':
    return True
  return path == prefix or path.startswith(f'{prefix}/')


def _is_disallowed(path: str) -> bool:
  return path.lower().endswith(BLACKLISTED_EXTENSIONS)


def _to_route(url: str) -> str:
  path = urlsplit(url).path or '/'
  return path.rstrip('/') or '/'


def _is_contact_route(route: str) -> bool:
  lower = route.lower()
  return any(kw in lower for kw in PRIORITY_KEYWORDS)


def _extract_emails_from_text(text: str) -> set[str]:
  return {e.lower() for e in EMAIL_PATTERN.findall(text)}


def _extract_emails_from_links(links: dict[str, list[dict[str, Any]]]) -> set[str]:
  emails: set[str] = set()
  for bucket in ('internal', 'external'):
    for link in links.get(bucket, []):
      href = link.get('href', '')
      if isinstance(href, str) and href.lower().startswith('mailto:'):
        email_part = href[7:].split('?')[0].strip()
        if email_part and EMAIL_PATTERN.match(email_part):
          emails.add(email_part.lower())
  return emails


def _canonicalize(
  raw: str,
  base_url: str,
  base_scheme: str,
  base_netloc: str,
  base_host_no_www: str,
  prefix: str,
) -> str | None:
  u = raw.strip()
  if not u or u.startswith(('#', 'mailto:', 'tel:', 'javascript:', 'data:')):
    return None

  abs_url = urljoin(base_url, u)
  split = urlsplit(abs_url)

  scheme = split.scheme.lower()
  if scheme not in {'http', 'https'}:
    return None

  host = (split.hostname or '').lower()
  host_no_www = host.removeprefix('www.')
  if not host_no_www or host_no_www != base_host_no_www:
    return None

  path = (split.path or '/').rstrip('/') or '/'
  if not _is_under_prefix(path, prefix):
    return None
  if _is_disallowed(path):
    return None

  return urlunsplit((base_scheme, base_netloc, path, '', ''))


def _extract_markdown(field: Any) -> str:
  if field is None:
    return ''
  if isinstance(field, str):
    return field.strip()
  fit = getattr(field, 'fit_markdown', None)
  raw = getattr(field, 'raw_markdown', None)
  if isinstance(fit, str) and fit.strip():
    return fit.strip()
  if isinstance(raw, str) and raw.strip():
    return raw.strip()
  return ''


def _elapsed(dispatch_result: Any, fallback: float | None) -> float:
  if dispatch_result is not None:
    start = getattr(dispatch_result, 'start_time', None)
    end = getattr(dispatch_result, 'end_time', None)
    if isinstance(start, datetime) and isinstance(end, datetime):
      return max(0.0, (end - start).total_seconds())
  if fallback is not None:
    return max(0.0, time.perf_counter() - fallback)
  return 0.0


app = App(
  'app-0',
  image=Image
  .debian_slim(python_version='3.13')
  .uv_pip_install('crawl4ai')
  .run_commands('playwright install-deps chromium', 'playwright install', 'crawl4ai-doctor'),
)


@app.function()
async def crawl_site(
  url: str,
  max_pages: int = 16,
  max_concurrency: int = 8,
  pruning_threshold: float = 0.0,
  page_timeout: int = 30000,
  min_content_length: int = MIN_CONTENT_LENGTH,
) -> list[RouteMarkdown]:
  base_url = _ensure_scheme(url)
  base_split = urlsplit(base_url)
  base_scheme = base_split.scheme or 'https'
  base_netloc = base_split.netloc
  base_host = (base_split.hostname or '').lower()
  base_host_no_www = base_host.removeprefix('www.')
  prefix = _compute_prefix(base_split.path)

  browser_cfg = BrowserConfig(
    headless=True,
    text_mode=True,
    enable_stealth=True,
    ignore_https_errors=True,
    verbose=False,
  )

  md_gen = DefaultMarkdownGenerator(
    content_filter=PruningContentFilter(
      threshold_type='dynamic',
      threshold=pruning_threshold,
      min_word_threshold=5,
    ),
    options={
      'ignore_links': True,
      'ignore_images': True,
      'skip_internal_links': True,
      'body_width': 0,
      'include_sup_sub': True,
    },
  )

  run_cfg = CrawlerRunConfig(
    cache_mode=CacheMode.BYPASS,
    check_robots_txt=True,
    wait_until='domcontentloaded',
    page_timeout=page_timeout,
    delay_before_return_html=0.3,
    word_count_threshold=5,
    scan_full_page=True,
    scroll_delay=0.2,
    process_iframes=True,
    remove_overlay_elements=True,
    remove_forms=False,
    excluded_tags=['script', 'style', 'noscript'],
    exclude_external_links=True,
    exclude_social_media_links=True,
    magic=True,
    simulate_user=True,
    override_navigator=True,
    markdown_generator=md_gen,
    stream=True,
    verbose=False,
  )

  dispatcher = MemoryAdaptiveDispatcher(
    memory_threshold_percent=85.0,
    max_session_permit=max_concurrency,
    rate_limiter=RateLimiter(
      base_delay=(0.1, 0.3),
      max_delay=10.0,
      max_retries=2,
    ),
  )

  route_markdown: dict[str, str] = {}
  all_emails: set[str] = set()
  crawled_urls: set[str] = set()

  def process_result(result: Any, route: str) -> bool:
    nonlocal all_emails

    links: dict[str, list[dict[str, Any]]] = getattr(result, 'links', {}) or {}
    mailto_emails = _extract_emails_from_links(links)
    if mailto_emails:
      all_emails.update(mailto_emails)
      print(f'  -> found mailto emails: {mailto_emails}')

    md = _extract_markdown(getattr(result, 'markdown', None))
    if not md:
      return bool(mailto_emails)

    text_emails = _extract_emails_from_text(md)
    if text_emails:
      all_emails.update(text_emails)
      print(f'  -> found text emails: {text_emails}')

    has_any_email = bool(mailto_emails or text_emails)

    if len(md) >= min_content_length or has_any_email:
      prev = route_markdown.get(route)
      if prev is None or len(md) > len(prev):
        if mailto_emails:
          md = md + '\n\nEmails: ' + ', '.join(sorted(mailto_emails))
        route_markdown[route] = md

    return has_any_email

  async with AsyncWebCrawler(config=browser_cfg) as crawler:
    print(f'crawling homepage: {base_url}')
    start_time = time.perf_counter()

    homepage_result = await crawler.arun(base_url, config=run_cfg)

    homepage_route = _to_route(base_url)
    crawled_urls.add(base_url)
    elapsed = time.perf_counter() - start_time
    print(f'route {homepage_route} finished in {elapsed:.2f}s')

    process_result(homepage_result, homepage_route)

    discovered_urls: list[tuple[int, str]] = []
    links: dict[str, list[dict[str, Any]]] = getattr(homepage_result, 'links', {}) or {}

    for bucket in ('internal',):
      for link in links.get(bucket, []):
        href = link.get('href')
        if not isinstance(href, str) or not href:
          continue
        canonical = _canonicalize(href, base_url, base_scheme, base_netloc, base_host_no_www, prefix)
        if canonical and canonical not in crawled_urls:
          route = _to_route(canonical)
          priority = 0 if _is_contact_route(route) else 1
          discovered_urls.append((priority, canonical))
          crawled_urls.add(canonical)

    discovered_urls.sort(key=operator.itemgetter(0, 1))
    discovered_urls = discovered_urls[: max_pages - 1]

    print(f'discovered {len(discovered_urls)} links from homepage')

    contact_urls: list[str] = []
    other_urls: list[str] = []

    for priority, u in discovered_urls:
      if priority == 0:
        contact_urls.append(u)
      else:
        other_urls.append(u)

    print(f'  -> {len(contact_urls)} contact-related, {len(other_urls)} other')

    async def crawl_batch(urls: list[str], label: str) -> None:
      if not urls:
        return

      batch_start: dict[str, float] = {}
      for u in urls:
        batch_start[_to_route(u)] = time.perf_counter()

      print(f'crawling {len(urls)} {label} pages...')

      async for result in await crawler.arun_many(urls, config=run_cfg, dispatcher=dispatcher):
        route = _to_route(getattr(result, 'url', '') or '')
        elapsed = _elapsed(getattr(result, 'dispatch_result', None), batch_start.get(route))
        print(f'route {route} finished in {elapsed:.2f}s')
        process_result(result, route)

    await crawl_batch(contact_urls, 'contact')

    if not all_emails and other_urls:
      await crawl_batch(other_urls, 'other')

    if all_emails:
      remaining_other = [u for u in other_urls if _to_route(u) not in route_markdown]
      if remaining_other:
        await crawl_batch(remaining_other, 'remaining')

  results: list[RouteMarkdown] = [{'route': r, 'markdown': m} for r, m in sorted(route_markdown.items())]

  print(f'\ntotal: {len(results)} pages')
  print(f'all emails found: {sorted(all_emails) if all_emails else "none"}')

  return results
