// oxlint-disable no-useless-undefined
/* eslint-disable no-continue, max-statements */
/** biome-ignore-all lint/nursery/noContinue: x */
import type { FieldErrors, UseFormReturn } from 'react-hook-form'

import { cn } from '@a/ui'
import { Button } from '@a/ui/button'
import { Dialog, DialogContent } from '@a/ui/dialog'
import { Spinner } from '@a/ui/spinner'
import { Check } from 'lucide-react'
import { useNavigationGuard } from 'next-navigation-guard'
import { useEffect, useRef, useState } from 'react'
import { useWatch } from 'react-hook-form'
import { toast } from 'sonner'

const isEmpty = (value: unknown): boolean => {
    if (value === '' || value === null || value === undefined) return true
    if (typeof value === 'object' && !Array.isArray(value)) return Object.values(value as R).every(isEmpty)
    return false
  },
  hasDirty = (dirtyFields: R, formValues: R): boolean => {
    for (const key of Object.keys(dirtyFields)) {
      const dirtyValue = dirtyFields[key],
        formValue = formValues[key]

      if (Array.isArray(dirtyValue)) {
        const formArray = formValue as unknown[]
        for (let i = 0; i < dirtyValue.length; i += 1) {
          const item = dirtyValue[i] as unknown,
            formItem = formArray[i]
          if (item)
            if (typeof item === 'object' && !Array.isArray(item)) {
              // eslint-disable-next-line max-depth
              if (!isEmpty(formItem) && hasDirty(item as R, formItem as R)) return true
            } else if (!isEmpty(formItem)) return true
        }
      } else if (typeof dirtyValue === 'object' && dirtyValue !== null && !Array.isArray(dirtyValue)) {
        if (hasDirty(dirtyValue as R, formValue as R)) return true
      } else if (dirtyValue) return true
    }
    return false
  },
  hasArrayDeletion = (previous: unknown, current: unknown): boolean => {
    if (Array.isArray(previous) && Array.isArray(current)) {
      if (previous.length > current.length) return true
      const len = Math.min(previous.length, current.length)
      for (let i = 0; i < len; i += 1) if (hasArrayDeletion(previous[i], current[i])) return true
      return false
    }
    if (previous && current && typeof previous === 'object' && typeof current === 'object') {
      const previousObj = previous as Record<string, unknown>,
        currentObj = current as Record<string, unknown>
      for (const key of Object.keys(previousObj)) {
        if (!Object.hasOwn(currentObj, key)) continue
        if (hasArrayDeletion(previousObj[key], currentObj[key])) return true
      }
    }
    return false
  },
  normalizeErrorMessage = (message: string): string => {
    const trimmed = message.trim()
    if (!trimmed) return ''
    const normalized = trimmed.trim().replaceAll(/\[\d+\]./gu, ' ')
    return normalized || trimmed
  },
  getErrorMessages = (errors: FieldErrors | undefined): string[] => {
    if (!errors) return []
    const messages: string[] = [],
      seen = new Set<string>(),
      addMessage = (message: unknown) => {
        if (typeof message !== 'string') return
        const normalized = normalizeErrorMessage(message)
        if (!normalized || seen.has(normalized)) return
        seen.add(normalized)
        messages.push(normalized)
      },
      walk = (value: unknown) => {
        if (!value) return
        if (Array.isArray(value)) {
          for (const item of value) walk(item)
          return
        }
        if (typeof value !== 'object') return
        const error = value as Record<string, unknown>
        addMessage(error.message)
        if (error.types && typeof error.types === 'object')
          for (const message of Object.values(error.types as Record<string, unknown>)) addMessage(message)

        for (const [key, child] of Object.entries(error)) {
          if (key === 'message' || key === 'ref' || key === 'types') continue
          walk(child)
        }
      }
    walk(errors)
    return messages
  }

type R = Record<string, unknown>

const useAutoSave = <T extends R>({
  className,
  delay = 3000,
  enable = true,
  errorDelay = 3000,
  form,
  isPending,
  mutate
}: {
  className?: string
  delay?: number
  enable?: boolean
  errorDelay?: number
  form: UseFormReturn<T>
  isPending: boolean
  mutate: (values: T) => void
}) => {
  const timeoutRef = useRef<NodeJS.Timeout>(undefined),
    toastTimeoutRef = useRef<NodeJS.Timeout>(undefined),
    previousValuesRef = useRef<null | T>(null),
    [saved, setSaved] = useState(false),
    {
      control,
      formState: { dirtyFields, isDirty },
      getValues,
      reset,
      trigger
    } = form,
    watchValues = useWatch({ control })

  useEffect(() => {
    const previousValues = previousValuesRef.current
    previousValuesRef.current = watchValues as T
    if (!(enable && isDirty)) return
    setSaved(false)
    clearTimeout(timeoutRef.current)
    clearTimeout(toastTimeoutRef.current)
    // eslint-disable-next-line @typescript-eslint/no-misused-promises, @typescript-eslint/strict-void-return
    timeoutRef.current = setTimeout(async () => {
      const data = getValues()
      if (!(await trigger())) return
      const removedArrayItem = previousValues ? hasArrayDeletion(previousValues, data) : false
      if (!hasDirty(dirtyFields, data)) {
        if (removedArrayItem) {
          mutate(data)
          reset(data, { keepValues: true })
          setSaved(true)
          return
        }
        console.log('Empty item added, skipping validation')
        return
      }
      mutate(data)
      reset(data, { keepValues: true })
      setSaved(true)
    }, delay)
    // eslint-disable-next-line @typescript-eslint/no-misused-promises, @typescript-eslint/strict-void-return
    toastTimeoutRef.current = setTimeout(async () => {
      if (await trigger()) return
      let messages = getErrorMessages(form.control._formState.errors)
      if (!messages.length) {
        const result = await form.control._runSchema([...form.control._names.mount])
        messages = getErrorMessages(result.errors)
      }
      if (!messages.length) return
      toast.error(
        messages.length === 1 ? (
          messages[0]
        ) : (
          <ol className='list-inside list-decimal'>
            {messages.map(v => (
              <li key={v}>{v}</li>
            ))}
          </ol>
        ),
        { duration: 3000 }
      )
    }, errorDelay)
    return () => {
      clearTimeout(timeoutRef.current)
      clearTimeout(toastTimeoutRef.current)
    }
  }, [isDirty, watchValues, dirtyFields])
  const guard = useNavigationGuard({ enabled: isDirty || isPending })
  return enable ? (
    <>
      <div
        className={cn(
          'pointer-events-none fixed right-1.5 bottom-1 flex items-center gap-0.5 text-xs font-light capitalize transition-all select-none [&>svg]:stroke-1',
          saved && 'animate-[fadeOut_3s_forwards]',
          className
        )}>
        {saved || isDirty ? (
          isDirty ? (
            <div className='mb-1 flex animate-pulse items-center justify-center gap-1 *:size-2.5 *:rounded-full *:border *:border-foreground'>
              <p className='animate-bounce' />
              <p className='animate-bounce [animation-delay:-0.2s]' />
              <p className='animate-bounce [animation-delay:-0.4s]' />
            </div>
          ) : isPending ? (
            <>
              <Spinner />
              saving
            </>
          ) : (
            <>
              <Check className='size-4 stroke-1' />
              saved
            </>
          )
        ) : null}
      </div>
      <Dialog open={guard.active}>
        <DialogContent onInteractOutside={guard.reject} showCloseButton={false}>
          You have unsaved changes that will be lost.
          <div className='flex justify-end gap-2'>
            <Button onClick={guard.reject} variant='outline'>
              Cancel
            </Button>
            <Button onClick={guard.accept} variant='destructive'>
              Discard
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  ) : null
}

export default useAutoSave
