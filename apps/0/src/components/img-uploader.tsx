'use client'

import type { ComponentProps } from 'react'

import { cn } from '@a/ui'
import { Button } from '@a/ui/button'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@a/ui/form'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { Trash, Upload } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { usePathname } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { array, custom, object } from 'zod/v4'

import { s3put } from '~/action'
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadItem,
  FileUploadItemDelete,
  FileUploadItemMetadata,
  FileUploadItemPreview,
  FileUploadTrigger
} from '~/components/upload'
import { MAX_SIZE } from '~/constant'

interface UploaderProps {
  onSuccess?: () => void
  prefix?: string
}

const Uploader = ({ className, onSuccess, prefix }: ComponentProps<'div'> & UploaderProps) => {
  const form = useForm({
      defaultValues: { files: [] },
      resolver: standardSchemaResolver(
        object({
          files: array(custom<File>())
            .min(1, 'No files selected')
            .refine(files => files.every(f => f.size <= MAX_SIZE), {
              message: 'File size must be less than 5MB',
              path: ['files']
            })
        })
      )
    }),
    { execute, isPending } = useAction(s3put, {
      onError: ({ error }) => toast.error(JSON.stringify(error, null, 2)),
      onSuccess: ({ input }) => {
        toast.success(`${input.files.length} files uploaded successfully!`)
        form.reset()
        onSuccess?.()
      }
    }),
    pathname = usePathname()
  return (
    <Form {...form}>
      <form
        className='flex flex-col'
        onSubmit={() => {
          form.handleSubmit(({ files }) => execute({ files, pathname, prefix }))
        }}>
        <FormField
          control={form.control}
          name='files'
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <FileUpload
                  accept='image/*'
                  maxSize={MAX_SIZE}
                  multiple
                  onFileReject={(_, message) => form.setError('files', { message })}
                  onValueChange={field.onChange}
                  value={field.value}>
                  <FileUploadDropzone className={cn('rounded-2xl py-5 font-light', className)}>
                    <Upload className='size-10 rounded-full border py-2' />
                    <p className='text-center text-muted-foreground'>Drag & drop files here</p>
                    <FileUploadTrigger asChild className='mt-3'>
                      <Button size='sm' variant='outline'>
                        Browse files
                      </Button>
                    </FileUploadTrigger>
                  </FileUploadDropzone>
                  {field.value.map((file, i) => (
                    <FileUploadItem
                      className='w-full gap-2 rounded-lg pr-1.5 hover:bg-muted'
                      key={i + file.name}
                      value={file}>
                      <FileUploadItemPreview />
                      <FileUploadItemMetadata />
                      <FileUploadItemDelete asChild>
                        <Trash className='size-7 cursor-pointer rounded-md border border-transparent stroke-1 p-1 transition-all duration-300 hover:border-destructive/30 hover:bg-destructive/10 hover:stroke-[1.5] hover:text-destructive' />
                      </FileUploadItemDelete>
                    </FileUploadItem>
                  ))}
                </FileUpload>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {form.formState.isValid ? (
          <Button className='mt-2 w-full gap-0' disabled={isPending} type='submit'>
            Upload
            <p
              className={cn(
                'size-0 animate-spin rounded-full border-background border-t-transparent transition-all duration-500',
                isPending && 'ml-2 size-5 border'
              )}
            />
          </Button>
        ) : null}
      </form>
    </Form>
  )
}
export default Uploader
