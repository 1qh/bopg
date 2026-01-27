// oxlint-disable unicorn/prefer-add-event-listener
'use client'

import type { Id } from '@a/cv/model'

import { api } from '@a/cv'
import { useMutation } from 'convex/react'
import { useCallback, useRef, useState } from 'react'

const useUpload = () => {
  const getUrl = useMutation(api.file.upload),
    [progress, setProgress] = useState(0),
    [isUploading, setIsUploading] = useState(false),
    xhrRef = useRef<null | XMLHttpRequest>(null),
    upload = useCallback(
      async (file: File): Promise<Id<'_storage'> | null> => {
        setIsUploading(true)
        setProgress(0)
        try {
          const url = await getUrl()
          // oxlint-disable-next-line promise/avoid-new
          return await new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest()
            xhrRef.current = xhr
            xhr.upload.onprogress = e => e.lengthComputable && setProgress(Math.round((e.loaded / e.total) * 100))
            xhr.onload = () => {
              if (xhr.status >= 200 && xhr.status < 300) {
                setProgress(100)
                const response = JSON.parse(xhr.responseText) as { storageId: Id<'_storage'> }
                resolve(response.storageId)
              } else {
                setIsUploading(false)
                reject(new Error(`Upload failed: ${xhr.status}`))
              }
            }
            xhr.onerror = () => {
              setIsUploading(false)
              reject(new Error('Network error'))
            }
            xhr.open('POST', url)
            xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream')
            xhr.send(file)
          })
        } catch {
          return null
        } finally {
          setIsUploading(false)
        }
      },
      [getUrl]
    ),
    cancel = useCallback(() => {
      xhrRef.current?.abort()
      setIsUploading(false)
      setProgress(0)
    }, []),
    reset = useCallback(() => {
      setIsUploading(false)
      setProgress(0)
    }, [])

  return { cancel, isUploading, progress, reset, upload }
}

export default useUpload
