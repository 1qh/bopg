/* eslint-disable react-hooks/refs, @next/next/no-img-element */

'use client'

import type { Box } from '@a/db/schema'
import type { XYPosition as XY } from '@xyflow/react'
import type { ComponentProps, CSSProperties, MouseEvent } from 'react'
import type { HW, HWXY } from 'types'

import { cn } from '@a/ui'
import { Check, Sparkles, ThumbsUp, Trash, Trash2, X } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { Fragment, useRef, useState } from 'react'
import { ulid } from 'ulid'
import { sleep } from 'utils'

import { classifyImageA } from '~/action'
import { VLM_MODEL } from '~/constant'
import { url2b64 } from '~/utils'

interface XXYY {
  x1: number
  x2: number
  y1: number
  y2: number
}

const { abs, min } = Math,
  coords2yolo = ({ h, w, x1, x2, y1, y2 }: HW & XXYY): HWXY => {
    const wp = abs(x2 - x1),
      hp = abs(y2 - y1),
      xp = min(x1, x2) + wp / 2,
      yp = min(y1, y2) + hp / 2
    return {
      h: hp / h,
      w: wp / w,
      x: xp / w,
      y: yp / h
    }
  },
  yolo2css = ({ aH, aW, h, w, x, y }: HWXY & { aH: number; aW: number }): CSSProperties => {
    const width = w * aW,
      height = h * aH,
      left = x * aW - width / 2,
      top = y * aH - height / 2
    return {
      height: `${height}px`,
      left: `${left}px`,
      top: `${top}px`,
      width: `${width}px`
    }
  },
  toURL = ({ img, x1, x2, y1, y2 }: XXYY & { img: HTMLImageElement }) => {
    const cv = document.createElement('canvas'),
      ctx = cv.getContext('2d')
    if (!ctx) return ''
    const scaleX = img.naturalWidth / img.offsetWidth,
      scaleY = img.naturalHeight / img.offsetHeight,
      w = abs(x2 - x1) * scaleX,
      h = abs(y2 - y1) * scaleY
    cv.width = w
    cv.height = h
    ctx.drawImage(img, min(x1, x2) * scaleX, min(y1, y2) * scaleY, w, h, 0, 0, w, h)
    return cv.toDataURL()
  }

type BoxItemProps = ComponentProps<'div'> & {
  box: Box
  onAssign: (id: string, tag: string) => void
  onDelete: (id: string) => void
  onPredict: (id: string, predict: string) => void
  tags: string[]
}

const BoxItem = ({
  box: { id, predict, src, tag },
  className,
  onAssign,
  onDelete,
  onPredict,
  tags,
  ...props
}: BoxItemProps) => {
  const classify = useAction(classifyImageA, {
    onError: error => console.error(error),
    onSuccess: ({ data }) => onPredict(id, data)
  })
  return (
    <div className={cn('group flex items-center *:transition-all *:duration-300', className)} key={id} {...props}>
      <div className='mr-2.5 flex size-24 shrink-0 rounded-md border-[0.5px] border-transparent drop-shadow-md group-hover:scale-125'>
        <img alt='' className='m-auto max-h-20 max-w-20 rounded-sm shadow-sm' src={src} />
      </div>
      <div className='space-y-1.5 *:transition-all *:duration-300'>
        {predict ? (
          <p className='group flex items-center justify-between rounded-lg border border-indigo-500/50 py-1 pr-1.5 pl-2.5 font-light text-indigo-500/70 hover:bg-indigo-500/10 hover:font-normal hover:text-indigo-500'>
            {predict}
            <X
              className='size-5 cursor-pointer rounded-full stroke-0 p-0.5 text-muted-foreground transition-all duration-300 group-hover:stroke-1 hover:scale-110 hover:bg-background hover:stroke-2 hover:text-destructive active:scale-75'
              onClick={() => onPredict(id, '')}
            />
          </p>
        ) : null}
        <select
          className={cn(
            'cursor-pointer appearance-none rounded-lg border px-2.5 py-1 font-light outline-0 hover:font-normal',
            tag
              ? 'border-yellow-500/50 text-yellow-500/80 hover:bg-yellow-500/10 hover:text-yellow-500'
              : 'border-muted text-muted-foreground/30 hover:bg-muted hover:text-muted-foreground'
          )}
          onChange={e => onAssign(id, e.target.value)}
          value={tag ?? ''}>
          <option value=''>untagged</option>
          {tags.map(t => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>
      <Sparkles
        className={cn(
          'ml-1 size-8 shrink-0 cursor-pointer rounded-lg stroke-1 p-1.5',
          classify.isPending
            ? 'pointer-events-none animate-spin rounded-full border border-muted-foreground border-t-transparent stroke-none'
            : 'text-indigo-500/80 hover:scale-110 hover:bg-indigo-500/10 hover:text-indigo-500 active:scale-75'
        )}
        onClick={() => classify.execute({ b64: url2b64(src), model: VLM_MODEL, tags })}
      />
      {predict && tag ? tag === predict ? <Check className='text-green-500' /> : <X className='text-destructive' /> : null}
      {predict && !tag ? (
        <ThumbsUp
          className='size-8 shrink-0 cursor-pointer rounded-lg stroke-1 p-1.5 text-muted-foreground hover:scale-110 hover:bg-blue-500/20 hover:text-blue-500 active:scale-75'
          onClick={() => onAssign(id, predict)}
        />
      ) : null}
      <Trash
        className='ml-auto size-8 shrink-0 cursor-pointer rounded-lg stroke-1 p-1.5 text-muted-foreground hover:scale-110 hover:bg-destructive/20 hover:text-destructive active:scale-75'
        onClick={() => onDelete(id)}
      />
    </div>
  )
}

type BoxListProp = ComponentProps<'div'> & {
  boxes: Box[]
  deleteBox: (id: string) => void
  tags: string[]
  updateBox: (id: string, box: Partial<Box>) => void
}

const BoxList = ({ boxes, className, deleteBox, tags, updateBox, ...props }: BoxListProp) =>
  boxes.map(box => (
    <Fragment key={box.id}>
      <BoxItem
        box={box}
        className={className}
        onAssign={(id, tag) => updateBox(id, { tag })}
        onDelete={deleteBox}
        onPredict={(id, predict) => updateBox(id, { predict })}
        tags={tags}
        {...props}
      />
      <hr className='ml-28 w-full' />
    </Fragment>
  ))

type ImageAnnotatorProps = BoxListProp & {
  insertBox: (box: Box) => void
  src: string
}

const Annotator = ({ boxes, className, deleteBox, insertBox, src, tags, updateBox, ...props }: ImageAnnotatorProps) => {
  const [anchor, setAnchor] = useState<null | XY>(null),
    [mousePos, setMousePos] = useState<null | XY>(null),
    conRef = useRef<HTMLDivElement>(null),
    ref = useRef<HTMLImageElement>(null),
    getCoords = (e: MouseEvent): XY => {
      if (!conRef.current) return { x: 0, y: 0 }
      const { left, top } = conRef.current.getBoundingClientRect()
      return { x: e.clientX - left, y: e.clientY - top }
    },
    moveMouse = (e: MouseEvent) => setMousePos(getCoords(e)),
    addBox = (xy: XY) => {
      if (anchor && ref.current) {
        const { x, y } = anchor,
          { offsetHeight: h, offsetWidth: w } = ref.current,
          xxyy = {
            x1: x,
            x2: xy.x,
            y1: y,
            y2: xy.y
          }
        insertBox({
          hwxy: coords2yolo({ h, w, ...xxyy }),
          id: ulid(),
          src: toURL({ img: ref.current, ...xxyy })
        })
        setAnchor(null)
      } else setAnchor(xy)
    }
  return (
    <div
      className={cn(
        'relative cursor-crosshair overflow-hidden rounded-md outline-offset-2 outline-muted select-none hover:outline-2',
        className
      )}
      onClick={e => addBox(getCoords(e))}
      onKeyDown={e => {
        if (e.key === 's' && mousePos) addBox(mousePos)
        if (e.key === 'Escape') setAnchor(null)
      }}
      onMouseEnter={moveMouse}
      onMouseLeave={() => setMousePos(null)}
      onMouseMove={moveMouse}
      ref={conRef}
      role='button'
      tabIndex={0}
      {...props}>
      <img
        alt=''
        className='max-h-full max-w-full'
        crossOrigin='anonymous'
        // eslint-disable-next-line @typescript-eslint/strict-void-return
        onLoad={async () => {
          setMousePos({ x: 1, y: 1 })
          await sleep(1)
          setMousePos(null)
        }}
        ref={ref}
        src={src}
      />
      {mousePos ? (
        <>
          <div className='absolute top-0 h-full w-px bg-border' style={{ left: `${mousePos.x}px` }} />
          <div className='absolute left-0 h-px w-full bg-border' style={{ top: `${mousePos.y}px` }} />
          {anchor ? (
            <div
              className='absolute border-2 border-dashed'
              style={{
                height: `${abs(mousePos.y - anchor.y)}px`,
                left: `${min(anchor.x, mousePos.x)}px`,
                top: `${min(anchor.y, mousePos.y)}px`,
                width: `${abs(mousePos.x - anchor.x)}px`
              }}
            />
          ) : null}
        </>
      ) : null}
      {boxes.map(({ hwxy: { h, w, x, y }, id, tag }) =>
        ref.current ? (
          <div
            className='group absolute cursor-crosshair rounded-sm border text-border outline outline-border transition-[outline] duration-500 *:absolute *:cursor-pointer hover:outline-4'
            key={id}
            role='button'
            style={yolo2css({ aH: ref.current.offsetHeight, aW: ref.current.offsetWidth, h, w, x, y })}>
            <select
              className='-top-3 left-1/2 -translate-x-1/2 appearance-none rounded-full border bg-muted bg-none p-1 text-center text-xs text-foreground outline-0 hover:bg-background'
              onChange={e => updateBox(id, { tag: e.target.value })}
              onClick={e => e.stopPropagation()}
              value={tag ?? ''}>
              <option value=''>untagged</option>
              {tags.map(t => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <Trash2
              className='bottom-0 left-1/2 size-0 -translate-x-1/2 rounded-md stroke-1 p-0 backdrop-blur-sm transition-all duration-500 text-shadow-sm group-hover:-bottom-3.5 group-hover:size-6 group-hover:p-1 hover:scale-110 hover:text-destructive active:scale-75'
              onClick={e => {
                e.stopPropagation()
                deleteBox(id)
              }}
            />
          </div>
        ) : null
      )}
    </div>
  )
}

export { Annotator, BoxList }
