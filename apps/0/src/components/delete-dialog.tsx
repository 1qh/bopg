'use client'

import type { AlertDialog as AlertDialogPrimitive } from 'radix-ui'
import type { ComponentProps } from 'react'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@a/ui/alert-dialog'
import { Button } from '@a/ui/button'
import { Spinner } from '@a/ui/spinner'
import { Trash } from 'lucide-react'

interface DeleteProps {
  isPending: boolean
}

const DeleteDialog = ({ isPending, ...props }: ComponentProps<typeof AlertDialogPrimitive.Action> & DeleteProps) => (
  <AlertDialog>
    <AlertDialogTrigger asChild>
      <Button disabled={props.disabled} variant='destructive'>
        <Trash />
        Delete
      </Button>
    </AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
        <AlertDialogDescription>
          This action cannot be undone. This will permanently delete your data from our servers.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction disabled={isPending} {...props}>
          {isPending ? <Spinner /> : null}
          Continue
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
)

export default DeleteDialog
