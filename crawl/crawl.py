from __future__ import annotations

import asyncio
import json
import random
import re
from html import unescape
from html.parser import HTMLParser
from typing import TYPE_CHECKING, Any, TypedDict
from urllib.parse import unquote, urljoin, urlsplit, urlunsplit

import httpx
from crawl4ai import AsyncWebCrawler, BrowserConfig, CacheMode, CrawlerRunConfig
from crawl4ai.content_filter_strategy import PruningContentFilter
from crawl4ai.markdown_generation_strategy import DefaultMarkdownGenerator
from modal import App, Image

if TYPE_CHECKING:
  from collections.abc import Iterable


class PageMarkdown(TypedDict):
  inputUrl: str
  emails: list[str]
  emailSources: dict[str, int]
  url: str
  route: str
  markdown: str
  links: list[str]


class LinkedinInfo(TypedDict, total=False):
  description: str
  name: str
  sameAs: str
  url: str


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

SCRIPT_JSON_RE = re.compile(
  r'<script[^>]*type=["\']application/ld\+json["\'][^>]*>(.*?)</script>',
  re.IGNORECASE | re.DOTALL,
)

REFERERS = ['https://www.google.com/', 'https://www.bing.com/', 'https://www.yahoo.com/']
USER_AGENTS = [
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
]
MODAL_FUNCTION_TIMEOUT_SECONDS = 300
DEFAULT_PAGE_TIMEOUT_MS = 270000
MAX_INTERNAL_LINKS = 200

EMAIL_PATTERN: re.Pattern[str] = re.compile(
  r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,}',
  re.IGNORECASE,
)
CFEMAIL_PATTERN: re.Pattern[str] = re.compile(r'data-cfemail="([0-9a-fA-F]+)"')
OBFUSCATED_EMAIL_PATTERN: re.Pattern[str] = re.compile(
  r'([A-Z0-9._%+-]+)\s*(?:\(|\[|\{)?\s*at\s*(?:\)|\]|\})?\s*'
  r'([A-Z0-9.-]+)\s*(?:\(|\[|\{)?\s*dot\s*(?:\)|\]|\})?\s*'
  r'([A-Z]{2,})',
  re.IGNORECASE,
)
IGNORED_PLAYWRIGHT_ERRORS: tuple[str, ...] = (
  'Target page, context or browser has been closed',
  'net::ERR_ABORTED',
  'frame was detached',
  'Execution context was destroyed',
)


def _ensure_scheme(url: str) -> str:
  u = url.strip()
  split = urlsplit(u)
  if split.scheme:
    return u
  if split.netloc:
    return urlunsplit(('https', split.netloc, split.path, split.query, split.fragment))
  return f'https://{u.lstrip("/")}'


def _to_route(url: str) -> str:
  path = urlsplit(url).path or '/'
  return path.rstrip('/') or '/'


def _is_disallowed(path: str) -> bool:
  return path.lower().endswith(BLACKLISTED_EXTENSIONS)


def _collect_links(
  hrefs: Iterable[str],
  base_url: str,
  base_host_no_www: str,
  limit: int = MAX_INTERNAL_LINKS,
) -> list[str]:
  links: list[str] = []
  seen_links: set[str] = set()
  for href in hrefs:
    canonical = _canonicalize(href, base_url, base_host_no_www)
    if not canonical or canonical in seen_links:
      continue
    seen_links.add(canonical)
    links.append(canonical)
    if len(links) >= limit:
      break
  return links


def _canonicalize(raw: str, base_url: str, base_host_no_www: str) -> str | None:
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
  if _is_disallowed(path):
    return None

  return urlunsplit((scheme, split.netloc or host, path, '', ''))


def _extract_markdown(raw: Any) -> str:
  if raw is None:
    return ''
  if isinstance(raw, str):
    return raw.strip()
  fit = getattr(raw, 'fit_markdown', None)
  if isinstance(fit, str) and fit.strip():
    return fit.strip()
  raw_md = getattr(raw, 'raw_markdown', None)
  if isinstance(raw_md, str) and raw_md.strip():
    return raw_md.strip()
  md = getattr(raw, 'markdown', None)
  if isinstance(md, str) and md.strip():
    return md.strip()
  if isinstance(raw, dict):
    for key in ('fit_markdown', 'raw_markdown', 'markdown'):
      value = raw.get(key)
      if isinstance(value, str) and value.strip():
        return value.strip()
  return ''


def _extract_emails_from_links(links: dict[str, list[dict[str, Any]]]) -> list[str]:
  hrefs: list[str] = []
  for bucket in ('internal', 'external'):
    for link in links.get(bucket, []):
      href = link.get('href')
      if isinstance(href, str) and href:
        hrefs.append(href)
  return _extract_mailto_emails(hrefs)


def _extract_emails_from_text(text: str) -> list[str]:
  if not text or '@' not in text:
    return []
  return sorted({e.lower() for e in EMAIL_PATTERN.findall(text)})


def _decode_cfemail(value: str) -> str | None:
  if not value or len(value) < 4 or len(value) % 2 != 0:
    return None
  try:
    key = int(value[:2], 16)
  except ValueError:
    return None
  chars: list[str] = []
  for index in range(2, len(value), 2):
    try:
      byte = int(value[index : index + 2], 16)
    except ValueError:
      return None
    chars.append(chr(byte ^ key))
  decoded = ''.join(chars)
  return decoded if EMAIL_PATTERN.match(decoded) else None


def _extract_cfemails_from_html(html: str) -> list[str]:
  if not html:
    return []
  emails: set[str] = set()
  for match in CFEMAIL_PATTERN.findall(html):
    decoded = _decode_cfemail(match)
    if decoded:
      emails.add(decoded.lower())
  return sorted(emails)


def _extract_obfuscated_emails(text: str) -> list[str]:
  if not text:
    return []
  emails: set[str] = set()
  for user, domain, tld in OBFUSCATED_EMAIL_PATTERN.findall(text):
    candidate = f'{user}@{domain}.{tld}'
    if EMAIL_PATTERN.match(candidate):
      emails.add(candidate.lower())
  return sorted(emails)


def _extract_mailto_emails(hrefs: Iterable[str]) -> list[str]:
  emails: set[str] = set()
  for href in hrefs:
    if not href or not isinstance(href, str):
      continue
    if not href.lower().startswith('mailto:'):
      continue
    email_part = unescape(unquote(href[7:].split('?')[0].strip()))
    if email_part and EMAIL_PATTERN.match(email_part):
      emails.add(email_part.lower())
  return sorted(emails)


class SimpleHtmlParser(HTMLParser):
  def __init__(self, collect_links: bool = True) -> None:
    super().__init__()
    self.links: list[str] = []
    self.text: list[str] = []
    self._skip = False
    self._collect_links = collect_links

  def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
    if tag in {'script', 'style', 'noscript'}:
      self._skip = True
    if self._collect_links and tag == 'a':
      for key, value in attrs:
        if key == 'href' and isinstance(value, str) and value:
          self.links.append(value)

  def handle_endtag(self, tag: str) -> None:
    if tag in {'script', 'style', 'noscript'}:
      self._skip = False

  def handle_data(self, data: str) -> None:
    if self._skip:
      return
    text = data.strip()
    if text:
      self.text.append(text)


def _parse_html(html: str, *, collect_links: bool = True) -> tuple[str, list[str]]:
  if not html or len(html) < 20:
    return '', []
  lower = html.lower()
  if '<html' not in lower and '<body' not in lower:
    return '', []
  parser = SimpleHtmlParser(collect_links=collect_links)
  parser.feed(html)
  return '\n'.join(parser.text), parser.links


def _random_headers() -> dict[str, str]:
  return {
    'referer': random.choice(REFERERS),
    'user-agent': random.choice(USER_AGENTS),
  }


app = App(
  'app-0',
  image=Image
  .debian_slim(python_version='3.13')
  .uv_pip_install('crawl4ai', 'httpx')
  .run_commands('playwright install-deps chromium', 'playwright install', 'crawl4ai-doctor'),
)


@app.function(timeout=MODAL_FUNCTION_TIMEOUT_SECONDS)
async def crawl_pages(
  url: str,
  page_timeout: int = DEFAULT_PAGE_TIMEOUT_MS,
  max_markdown_chars: int | None = None,
) -> PageMarkdown:
  if not url:
    return {
      'emails': [],
      'emailSources': {},
      'inputUrl': '',
      'links': [],
      'markdown': '',
      'route': '/',
      'url': '',
    }
  input_url = url
  base_url = _ensure_scheme(url)
  base_split = urlsplit(base_url)
  candidates: list[str] = [base_url]
  if base_split.scheme == 'https':
    candidates.append(urlunsplit(('http', base_split.netloc, base_split.path, base_split.query, base_split.fragment)))
  elif base_split.scheme == 'http':
    candidates.append(urlunsplit(('https', base_split.netloc, base_split.path, base_split.query, base_split.fragment)))
  candidates = [c for c in dict.fromkeys(candidates) if c]
  print(
    f'[crawl_pages] input={input_url} candidates={candidates} page_timeout={page_timeout}ms max_markdown={max_markdown_chars}'
  )

  page_timeout_seconds = max(5.0, page_timeout / 1000 + 5.0)
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
      threshold=0.0,
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
    check_robots_txt=False,
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
    stream=False,
    verbose=False,
  )

  loop = asyncio.get_running_loop()
  original_handler = loop.get_exception_handler()

  def handle_loop_exception(loop: asyncio.AbstractEventLoop, context: dict[str, Any]) -> None:
    exc = context.get('exception')
    msg = str(exc) if exc else context.get('message', '')
    if any(err in msg for err in IGNORED_PLAYWRIGHT_ERRORS):
      print(f'[crawl_pages] suppressed playwright error: {msg}')
      return
    if original_handler:
      original_handler(loop, context)
    else:
      loop.default_exception_handler(context)

  loop.set_exception_handler(handle_loop_exception)

  def empty_result(target_url: str) -> PageMarkdown:
    route = _to_route(target_url)
    return {
      'emails': [],
      'emailSources': {},
      'inputUrl': input_url,
      'links': [],
      'markdown': '',
      'route': route,
      'url': target_url,
    }

  async def attempt(target_url: str, crawler: AsyncWebCrawler, fallback_client: httpx.AsyncClient) -> PageMarkdown:
    base_url = _ensure_scheme(target_url)
    base_split = urlsplit(base_url)
    base_host_no_www = (base_split.hostname or '').lower().removeprefix('www.')

    async def fallback_fetch(reason: str) -> PageMarkdown:
      headers = _random_headers()
      try:
        res = await fallback_client.get(base_url, headers=headers)
        if res.status_code >= 400:
          print(f'[crawl_pages] fallback status={res.status_code} url={base_url}')
          return empty_result(base_url)
        content_type = (res.headers.get('content-type') or '').lower()
        if 'text/' not in content_type:
          print(f'[crawl_pages] fallback non-text content-type={content_type} url={base_url}')
          return empty_result(base_url)
        html = res.text
        text, hrefs = _parse_html(html, collect_links=('<a' in html or 'href=' in html))
      except Exception as error:
        print(f'[crawl_pages] fallback fail url={base_url} err={error}')
        return empty_result(base_url)
      mailto_emails = _extract_mailto_emails(hrefs)
      text_emails = _extract_emails_from_text(text)
      html_text = unescape(html)
      cf_emails = _extract_cfemails_from_html(html)
      obf_emails = _extract_obfuscated_emails(html_text)
      html_emails = _extract_emails_from_text(html_text)
      emails = sorted(set(mailto_emails + text_emails + html_emails + cf_emails + obf_emails))
      email_sources = {
        'cf': len(cf_emails),
        'html': len(html_emails),
        'mailto': len(mailto_emails),
        'obfuscated': len(obf_emails),
        'text': len(text_emails),
      }
      links = _collect_links(hrefs, base_url, base_host_no_www)
      markdown = text
      if isinstance(max_markdown_chars, int) and max_markdown_chars > 0 and len(markdown) > max_markdown_chars:
        markdown = markdown[:max_markdown_chars]
      route = _to_route(base_url)
      print(
        f'[crawl_pages] fallback ok reason={reason} route={route} markdown={len(markdown)} links={len(links)} mailto={len(mailto_emails)} html_emails={len(html_emails)} cf_emails={len(cf_emails)} obf_emails={len(obf_emails)} text_emails={len(text_emails)} emails={len(emails)}'
      )
      return {
        'emails': emails,
        'emailSources': email_sources,
        'inputUrl': input_url,
        'links': links,
        'markdown': markdown,
        'route': route,
        'url': base_url,
      }

    try:
      print(f'[crawl_pages] start url={base_url}')
      result = await asyncio.wait_for(crawler.arun(base_url, config=run_cfg), timeout=page_timeout_seconds)
    except Exception as error:
      print(f'[crawl_pages] fail url={base_url} err={error}')
      return await fallback_fetch('crawler-error')

    md = _extract_markdown(getattr(result, 'markdown', None))
    if isinstance(max_markdown_chars, int) and max_markdown_chars > 0 and len(md) > max_markdown_chars:
      md = md[:max_markdown_chars]
    raw_links: dict[str, list[dict[str, Any]]] = getattr(result, 'links', {}) or {}
    mailto_emails = _extract_emails_from_links(raw_links)
    raw_html = getattr(result, 'raw_html', None) or getattr(result, 'html', None)
    html_emails: list[str] = []
    cf_emails: list[str] = []
    obf_emails: list[str] = []
    if isinstance(raw_html, str) and raw_html:
      html_text = unescape(raw_html)
      cf_emails = _extract_cfemails_from_html(raw_html)
      obf_emails = _extract_obfuscated_emails(html_text)
      html_emails = _extract_emails_from_text(html_text)
      if 'mailto:' in raw_html.lower():
        _, hrefs = _parse_html(raw_html, collect_links=True)
        mailto_emails = sorted(set(mailto_emails + _extract_mailto_emails(hrefs)))
    hrefs = [href for link in raw_links.get('internal', []) if isinstance((href := link.get('href')), str) and href]
    links = _collect_links(hrefs, base_url, base_host_no_www)
    route = _to_route(base_url)
    text_emails = _extract_emails_from_text(md)
    emails = sorted(set(mailto_emails + text_emails + html_emails + cf_emails + obf_emails))
    email_sources = {
      'cf': len(cf_emails),
      'html': len(html_emails),
      'mailto': len(mailto_emails),
      'obfuscated': len(obf_emails),
      'text': len(text_emails),
    }
    if len(md.strip()) < 40:
      fallback = await fallback_fetch('low-markdown')
      if fallback.get('markdown') or fallback.get('links') or fallback.get('emails'):
        if not fallback['emails'] and emails:
          fallback['emails'] = emails
          fallback['emailSources'] = email_sources
        return fallback
    print(
      f'[crawl_pages] done route={route} markdown={len(md)} links={len(links)} mailto={len(mailto_emails)} text_emails={len(text_emails)} html_emails={len(html_emails)} cf_emails={len(cf_emails)} obf_emails={len(obf_emails)} emails={len(emails)}'
    )
    return {
      'emails': emails,
      'emailSources': email_sources,
      'inputUrl': input_url,
      'links': links,
      'markdown': md,
      'route': route,
      'url': base_url,
    }

  try:
    async with httpx.AsyncClient(timeout=page_timeout_seconds, follow_redirects=True) as fallback_client:
      async with AsyncWebCrawler(config=browser_cfg) as crawler:
        last_result: PageMarkdown | None = None
        for index, candidate in enumerate(candidates, start=1):
          print(f'[crawl_pages] attempt {index}/{len(candidates)} url={candidate}')
          result = await attempt(candidate, crawler, fallback_client)
          last_result = result
          if result.get('markdown') or result.get('links') or result.get('emails'):
            return result
        return last_result or empty_result(base_url)
  finally:
    loop.set_exception_handler(original_handler)


@app.function()
async def linkedin_scrape_batch(urls: list[str], max_concurrency: int = 50) -> dict[str, LinkedinInfo]:
  print(f'[linkedin_scrape_batch] input={len(urls)} concurrency={max_concurrency} sample={urls[:3]}')
  semaphore = asyncio.Semaphore(max_concurrency)

  async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as client:

    async def fetch(url: str) -> tuple[str, LinkedinInfo | None]:
      headers = _random_headers()
      async with semaphore:
        try:
          res = await client.get(url, headers=headers)
          res.raise_for_status()
          html = res.text
        except Exception as error:
          print(f'[linkedin_scrape_batch] fail url={url} err={error}')
          return url, None

      for match in SCRIPT_JSON_RE.finditer(html):
        try:
          data = json.loads(match.group(1))
        except Exception:
          continue
        graph = data.get('@graph') if isinstance(data, dict) else None
        if isinstance(graph, list):
          org = next((item for item in graph if item.get('@type') == 'Organization'), None)
        elif isinstance(data, dict) and data.get('@type') == 'Organization':
          org = data
        else:
          org = None
        if not org or not isinstance(org, dict):
          continue
        info = {k: v for k, v in org.items() if k not in {'@context', '@type'}}
        print(f'[linkedin_scrape_batch] ok url={url}')
        return url, info
      return url, None

    results = await asyncio.gather(*[fetch(u) for u in urls])

  payload: dict[str, LinkedinInfo] = {url: info for url, info in results if info}
  print(f'[linkedin_scrape_batch] complete success={len(payload)}/{len(urls)}')
  return payload
