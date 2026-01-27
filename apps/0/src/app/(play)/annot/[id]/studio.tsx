/* eslint-disable complexity */

'use client'

import type { Box } from '@a/db/schema'
import type { S3ListObjectsResponse } from 'bun'

import { cn } from '@a/ui'
import { Button } from '@a/ui/button'
import { Checkbox } from '@a/ui/checkbox'
import { Dialog, DialogContent, DialogTrigger } from '@a/ui/dialog'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@a/ui/hover-card'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@a/ui/resizable'
import Num from '@number-flow/react'
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { formatDistance } from 'date-fns'
import { useAtom } from 'jotai/react'
import {
  ChartColumn,
  ChevronLeft,
  ChevronRight,
  DownloadCloud,
  LayoutList,
  ListChecks,
  Sparkles,
  SquaresIntersect,
  Trash,
  Upload,
  X
} from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useQueryState } from 'nuqs'
import plur from 'plur'
import readable from 'pretty-bytes'
import { useEffect, useState } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { toast } from 'sonner'

import type { JobRes } from '~/types'

import { boxesDetectA, objectDetectionA, s3buf, s3del } from '~/action'
import { Annotator, BoxList } from '~/components/annotator'
import Uploader from '~/components/img-uploader'
import PercentBar from '~/components/percent-bar'
import { VLM_MODEL } from '~/constant'
import { getJobs, postJobs } from '~/job-utils'
import { jobIdsAtom } from '~/store'
import { api } from '~/trpc/react'
import { boxesStat, tagPredictPercent, url2b64 } from '~/utils'

import StatsDashboard from './stat'

interface StudioProps {
  id: number
  objects: NonNullable<S3ListObjectsResponse['contents']>
}

const Studio = ({ id, objects }: StudioProps) => {
  const { annot, bbox } = api(),
    [active, setActive] = useQueryState('k', { defaultValue: '' }),
    [boxListOpen, setBoxListOpen] = useState(true),
    [dialogOpen, setDialogOpen] = useState(false),
    [select, setSelect] = useState<Set<string>>(() => new Set()),
    [src, setSrc] = useState(''),
    [isDeleting, setIsDeleting] = useState<string[]>([]),
    activeIdx = objects.findIndex(({ key }) => key === active),
    queryClient = useQueryClient(),
    invalidateData = async () => {
      await queryClient.invalidateQueries(bbox.pathFilter())
    },
    delImg = useAction(s3del, {
      onExecute: ({ input: { keys } }) => setIsDeleting(p => [...p, ...keys]),
      onSuccess: async () => {
        await invalidateData()
        setIsDeleting([])
      }
    }),
    getBuf = useAction(s3buf, { onSuccess: ({ data }) => setSrc(data) }),
    objDet = useAction(objectDetectionA, { onSuccess: ({ data }) => console.log(data) }),
    boxDet = useAction(boxesDetectA, { onSuccess: invalidateData }),
    next = () => {
      setActive(objects[activeIdx + 1]?.key ?? '')
    },
    prev = () => {
      setActive(objects[activeIdx - 1]?.key ?? '')
    },
    toggleSelectAll = () => setSelect(new Set(select.size === objects.length ? undefined : objects.map(({ key }) => key))),
    { data: tags } = useSuspenseQuery(annot.tagsById.queryOptions(id)),
    { data: wsBoxes } = useSuspenseQuery(bbox.byAnnot.queryOptions(id)),
    mutOptions = { onSuccess: invalidateData } satisfies Parameters<typeof bbox.insert.mutationOptions>[0],
    { mutate: deleteBox } = useMutation(bbox.delete.mutationOptions(mutOptions)),
    { mutate: inBox } = useMutation(bbox.insert.mutationOptions(mutOptions)),
    { mutate: upBox } = useMutation(bbox.update.mutationOptions(mutOptions)),
    updateBox = (boxId: string, box: Partial<Box>) => upBox({ id: boxId, ...box }),
    prefix = `${id}/`,
    pathname = usePathname(),
    boxes = wsBoxes.filter(({ path }) => path === active),
    [ids, setIds] = useAtom(jobIdsAtom),
    [jobs, setJobs] = useState<JobRes[] | undefined>(),
    needDetectPaths = objects.filter(({ key }) => !wsBoxes.some(box => box.path === key)).map(({ key }) => key),
    needPredictBoxes = wsBoxes.filter(box => !box.predict?.length),
    fetchJobs = async () => {
      if (!ids.length) return
      setJobs(await getJobs(ids.join(',')))
    },
    batchDetectBoxes = async () => {
      const newIds = await postJobs({
        name: 'detectBoxes',
        payloads: needDetectPaths
      })
      setIds(p => [...p, ...newIds])
    },
    batchClassify = async () => {
      const newIds = await postJobs({
        name: 'classifyImage',
        payloads: needPredictBoxes.map(box => ({ id: box.id, tags }))
      })
      setIds(p => [...p, ...newIds])
    }

  useEffect(() => {
    fetchJobs()
  }, [])
  useEffect(() => {
    if (!ids.length) return
    const t = setInterval(() => {
      fetchJobs()
    }, 1000)
    return () => clearInterval(t)
  }, [ids])
  useEffect(() => {
    if (jobs?.every(j => ['completed', 'failed'].includes(j.state))) {
      const numCompleted = jobs.filter(j => j.state === 'completed').length
      toast.success(`${numCompleted}/${jobs.length} ${plur('job', jobs.length)} completed`)
      invalidateData()
      setIds([])
      setJobs(undefined)
    }
  }, [jobs])

  useHotkeys('left,up', prev)
  useHotkeys('right,down', next)
  useHotkeys('ctrl+a,meta+a', toggleSelectAll)
  useEffect(() => {
    if (!active) return
    getBuf.execute(active)
  }, [active])

  return (
    <ResizablePanelGroup className='select-none' orientation='horizontal'>
      <ResizablePanel
        className='relative flex flex-col overflow-auto! py-1.5 pr-px'
        defaultSize={15}
        maxSize={30}
        minSize={10}>
        {wsBoxes.length ? (
          <Button
            className='mb-2'
            disabled={Boolean(jobs?.length) || needPredictBoxes.length === 0}
            // eslint-disable-next-line @typescript-eslint/strict-void-return
            onClick={batchClassify}
            variant='outline'>
            {jobs?.filter(j => j.state === 'completed' && j.name === 'classifyImage').length
              ? `${jobs.filter(j => j.state === 'completed' && j.name === 'classifyImage').length}/${jobs.length} completed`
              : needPredictBoxes.length
                ? `Classify ${needPredictBoxes.length} remaining bounding ${plur('box', needPredictBoxes.length)}`
                : 'All bounding boxes classified'}
          </Button>
        ) : null}
        {needDetectPaths.length ? (
          // eslint-disable-next-line @typescript-eslint/strict-void-return
          <Button className='mb-2' disabled={Boolean(jobs?.length)} onClick={batchDetectBoxes} variant='outline'>
            {jobs?.filter(j => j.state === 'completed' && j.name === 'detectBoxes').length
              ? `${jobs.filter(j => j.state === 'completed' && j.name === 'detectBoxes').length}/${jobs.length} completed`
              : `Detect bounding boxes for ${needDetectPaths.length} new ${plur('image', needDetectPaths.length)}`}
          </Button>
        ) : null}
        {objects.map(({ key, lastModified, size }) => {
          const numBoxes = wsBoxes.filter(({ path }) => path === key).length,
            isActive = key === active,
            disable = isDeleting.includes(key) || delImg.isPending
          return (
            <div
              className={cn(
                'group -my-0.5 flex items-center gap-2 rounded-lg py-1 pr-1 pl-2.5 text-xs font-light text-muted-foreground transition-all duration-300 select-none hover:bg-muted',
                isActive && 'bg-muted hover:bg-border',
                disable && 'pointer-events-none'
              )}
              key={key}>
              <Checkbox
                checked={select.has(key)}
                className='transition-all duration-300 hover:scale-125 active:scale-75'
                onCheckedChange={x => {
                  const temp = new Set(select)
                  if (x) temp.add(key)
                  else temp.delete(key)
                  setSelect(temp)
                }}
              />
              <button
                className='flex grow items-center gap-1 overflow-hidden'
                disabled={disable}
                onClick={() => {
                  setActive(key)
                }}
                type='button'>
                <p className='text-base text-foreground transition-all duration-300 group-hover:font-medium'>
                  {key.replace(prefix, '')}
                </p>
                {numBoxes ? (
                  <Num
                    className='ml-1 flex size-5 shrink-0 items-center justify-center rounded-full border bg-muted text-xs text-foreground'
                    value={numBoxes}
                  />
                ) : null}
                <p className='grow' />
                <p className='truncate group-hover:hidden'>{readable(size ?? 0)}</p>
                {lastModified?.length ? (
                  <p className='hidden truncate group-hover:block'>
                    {formatDistance(lastModified, new Date(), { addSuffix: true })}
                  </p>
                ) : null}
              </button>
              <Trash
                className='size-6 shrink-0 cursor-pointer rounded-md stroke-1 p-1 transition-all duration-300 hover:scale-110 hover:bg-destructive/20 hover:text-destructive active:scale-75'
                onClick={() => {
                  if (isActive) setActive('')
                  delImg.execute({ keys: [key], pathname })
                }}
              />
            </div>
          )
        })}
        <p className='grow' />
        {select.size > 0 ? (
          <div className='sticky bottom-0 flex justify-center gap-2'>
            <Trash
              className='size-9 cursor-pointer rounded-lg bg-background stroke-1 p-1.5 text-destructive drop-shadow-md transition-all duration-500 hover:scale-110 hover:bg-destructive hover:stroke-[1.5] hover:text-white active:scale-75 dark:border'
              onClick={() => {
                if (active && select.has(active)) setActive('')
                delImg.execute({ keys: [...select], pathname })
                setSelect(new Set())
              }}
            />
            <ListChecks
              className='size-9 cursor-pointer rounded-lg bg-background stroke-1 p-1.5 text-green-500 drop-shadow-md transition-all duration-500 hover:scale-110 hover:bg-green-500 hover:stroke-[1.5] hover:text-white active:scale-75 dark:border'
              onClick={() => toggleSelectAll()}
            />
            <Link
              download='bboxes.json'
              href={`data:text/json;charset=utf-8,${encodeURIComponent(
                JSON.stringify(
                  wsBoxes
                    .filter(({ path }) => select.has(path))
                    .map(({ id: boxId, predict, tag }) => ({ id: boxId, predict, tag })),
                  null,
                  2
                )
              )}`}
              type='button'>
              <DownloadCloud className='size-9 cursor-pointer rounded-lg bg-background stroke-1 p-1.5 text-blue-500 drop-shadow-md transition-all duration-500 hover:scale-110 hover:bg-blue-500 hover:stroke-[1.5] hover:text-white active:scale-75 dark:border' />
            </Link>
          </div>
        ) : objects.length ? (
          <div className='sticky bottom-1 flex justify-center gap-1'>
            <Dialog onOpenChange={setDialogOpen} open={dialogOpen}>
              <DialogTrigger>
                <Upload className='size-14 cursor-pointer rounded-2xl bg-transparent stroke-1 px-2.5 text-sky-500 drop-shadow-md transition-all duration-500 hover:scale-110 hover:bg-linear-to-bl hover:from-green-500 hover:to-blue-500 hover:stroke-[1.5] hover:text-background active:scale-75 dark:border' />
              </DialogTrigger>
              <DialogContent className='max-h-[calc(100vh-2rem)] overflow-auto p-2' showCloseButton={false}>
                <Uploader className='space-y-1 py-14' onSuccess={() => setDialogOpen(false)} prefix={prefix} />
              </DialogContent>
            </Dialog>
            <Dialog>
              <DialogTrigger>
                <ChartColumn className='size-14 cursor-pointer rounded-2xl bg-transparent stroke-1 px-2.5 text-orange-500 drop-shadow-md transition-all duration-500 hover:scale-110 hover:bg-linear-to-bl hover:from-red-500 hover:to-yellow-500 hover:stroke-[1.5] hover:text-background active:scale-75 dark:border' />
              </DialogTrigger>
              <DialogContent
                className='max-h-[calc(100vh-2rem)] max-w-3xl! overflow-auto p-2 pt-4 [&_h2]:-mb-3 [&_h2]:text-center [&_h2]:text-2xl [&_h2]:font-light'
                showCloseButton={false}>
                <Link
                  download='stats.json'
                  href={`data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(boxesStat(wsBoxes), null, 2))}`}
                  type='button'>
                  <DownloadCloud className='absolute top-3 left-3 size-9 cursor-pointer rounded-lg bg-background stroke-1 p-1.5 text-blue-500 drop-shadow-md transition-all duration-500 hover:scale-110 hover:bg-blue-500 hover:stroke-[1.5] hover:text-white active:scale-75 dark:border' />
                </Link>
                <StatsDashboard data={Object.entries(boxesStat(wsBoxes)).map(([k, stats]) => ({ k, ...stats }))} />
              </DialogContent>
            </Dialog>
          </div>
        ) : (
          <Uploader prefix={prefix} />
        )}
      </ResizablePanel>
      <ResizableHandle className={cn(objects.length ? 'bg-muted' : 'bg-transparent')} />
      <ResizablePanel
        className='relative flex h-screen w-full flex-col items-center justify-center p-2'
        defaultSize={50}
        minSize={50}>
        {objects.length ? (
          <>
            <ChevronLeft
              className='absolute top-1/2 left-1.5 z-1 size-8 -translate-y-1/2 cursor-pointer rounded-full bg-background stroke-1 pr-0.5 text-muted-foreground drop-shadow-md transition-all duration-500 hover:size-10 hover:bg-muted hover:stroke-[1.5] hover:text-foreground active:scale-75 dark:border'
              onClick={prev}
            />
            <ChevronRight
              className='absolute top-1/2 right-1.5 z-1 size-8 -translate-y-1/2 cursor-pointer rounded-full bg-background stroke-1 pl-0.5 text-muted-foreground drop-shadow-md transition-all duration-500 hover:size-10 hover:bg-muted hover:stroke-[1.5] hover:text-foreground active:scale-75 dark:border'
              onClick={next}
            />
          </>
        ) : null}
        {getBuf.isPending ? (
          <p className='size-10 animate-spin rounded-full border-2 border-t-transparent' />
        ) : active.length && src.length ? (
          <>
            <X
              className='absolute top-1.5 left-1.5 z-1 size-6 cursor-pointer rounded-md bg-background stroke-1 p-1 text-destructive drop-shadow-md transition-all duration-500 hover:size-7 hover:bg-destructive hover:stroke-[1.5] hover:text-white active:scale-75 dark:border'
              onClick={() => {
                setActive('')
              }}
            />
            <Button
              className='absolute bottom-2 left-2 hidden rounded-xl'
              disabled={objDet.isPending}
              onClick={() => objDet.execute({ b64: url2b64(src), model: VLM_MODEL, tags })}
              variant='outline'>
              <Sparkles className='stroke-1' />
              Auto Detect (experimental)
            </Button>
            <Button
              className='absolute bottom-2 left-2 rounded-xl'
              disabled={boxDet.isPending}
              onClick={() => boxDet.execute(active)}
              variant='outline'>
              <SquaresIntersect className='stroke-1' />
              Detect bounding boxes
            </Button>
            <Annotator
              boxes={boxes}
              deleteBox={deleteBox}
              insertBox={(box: Box) => inBox({ ...box, annot: id, path: active })}
              src={src}
              tags={tags}
              updateBox={updateBox}
            />
          </>
        ) : (
          <p className='text-3xl font-light tracking-tight text-input'>
            {objects.length ? 'Select an image to annotate' : 'Upload images to start annotating'}
          </p>
        )}
      </ResizablePanel>
      {boxListOpen && boxes.length ? (
        <>
          <ResizableHandle className='bg-muted' />
          <ResizablePanel className='overflow-auto! pl-1.5' defaultSize={15} maxSize={30} minSize={10}>
            <HoverCard openDelay={0}>
              <HoverCardTrigger asChild>
                <p className='mt-1 mr-6 cursor-pointer truncate text-center text-xl font-light text-muted-foreground'>
                  {boxes.length} {plur('box', boxes.length)}
                </p>
              </HoverCardTrigger>
              <HoverCardContent className='mx-1.5 w-96 p-2'>
                <PercentBar
                  colors={['bg-green-500', 'bg-destructive', 'bg-indigo-500', 'bg-yellow-500']}
                  data={tagPredictPercent(boxes)}
                />
              </HoverCardContent>
            </HoverCard>
            <BoxList boxes={boxes} deleteBox={deleteBox} tags={tags} updateBox={updateBox} />
          </ResizablePanel>
        </>
      ) : null}
      {boxes.length ? (
        <LayoutList
          className='absolute top-1.5 right-1.5 z-1 size-6 cursor-pointer rounded-md bg-background stroke-1 p-1 text-green-500 drop-shadow-md transition-all duration-500 hover:size-7 hover:bg-green-500 hover:stroke-[1.5] hover:text-white active:scale-75 dark:border'
          onClick={() => setBoxListOpen(!boxListOpen)}
        />
      ) : null}
    </ResizablePanelGroup>
  )
}
export default Studio
