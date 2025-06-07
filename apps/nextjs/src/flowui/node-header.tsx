import type { buttonVariants } from '@a/ui/button'
import type { VariantProps } from 'class-variance-authority'

import { cn } from '@a/ui'
import { Button } from '@a/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@a/ui/dropdown-menu'
import { Slot } from '@radix-ui/react-slot'
import { EllipsisVertical } from 'lucide-react'
import * as React from 'react'

/* NODE HEADER -------------------------------------------------------------- */

export type NodeHeaderProps = React.HTMLAttributes<HTMLElement>

/**
 * A container for a consistent header layout intended to be used inside the
 * `<BaseNode />` component.
 */
export const NodeHeader = React.forwardRef<HTMLElement, NodeHeaderProps>(({ className, ...props }, ref) => (
  <header ref={ref} {...props} className={cn('flex items-center justify-between gap-2 p-2 pt-1 pr-1', className)} />
))

NodeHeader.displayName = 'NodeHeader'

/* NODE HEADER TITLE -------------------------------------------------------- */

export interface NodeHeaderTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  asChild?: boolean
}

/**
 * The title text for the node. To maintain a native application feel, the title
 * text is not selectable.
 */
export const NodeHeaderTitle = React.forwardRef<HTMLHeadingElement, NodeHeaderTitleProps>(
  ({ asChild, className, ...props }, ref) => {
    const Comp = asChild ? Slot : 'h3'

    return <Comp ref={ref} {...props} className={cn(className, 'user-select-none flex-1 font-semibold')} />
  }
)

NodeHeaderTitle.displayName = 'NodeHeaderTitle'

/* NODE HEADER ICON --------------------------------------------------------- */

export type NodeHeaderIconProps = React.HTMLAttributes<HTMLSpanElement>

export const NodeHeaderIcon = React.forwardRef<HTMLSpanElement, NodeHeaderIconProps>(({ className, ...props }, ref) => (
  <span ref={ref} {...props} className={cn(className, '[&>*]:size-5')} />
))

NodeHeaderIcon.displayName = 'NodeHeaderIcon'

/* NODE HEADER ACTIONS ------------------------------------------------------ */

export type NodeHeaderActionsProps = React.HTMLAttributes<HTMLDivElement>

/**
 * A container for right-aligned action buttons in the node header.
 */
export const NodeHeaderActions = React.forwardRef<HTMLDivElement, NodeHeaderActionsProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} {...props} className={cn('ml-auto flex items-center gap-1 justify-self-end', className)} />
  )
)

NodeHeaderActions.displayName = 'NodeHeaderActions'

/* NODE HEADER ACTION ------------------------------------------------------- */

export interface NodeHeaderActionProps extends React.ComponentProps<'button'> {
  label: string
}

/**
 * A thin wrapper around the `<Button />` component with a fixed sized suitable
 * for icons.
 *
 * Beacuse the `<NodeHeaderAction />` component is intended to render icons, it's
 * important to provide a meaningful and accessible `label` prop that describes
 * the action.
 */
export const NodeHeaderAction = React.forwardRef<
  HTMLButtonElement,
  NodeHeaderActionProps & VariantProps<typeof buttonVariants>
>(({ className, label, title, ...props }, ref) => (
  <Button
    aria-label={label}
    className={cn(className, 'nodrag size-6 p-1')}
    ref={ref}
    title={title ?? label}
    variant='ghost'
    {...props}
  />
))

NodeHeaderAction.displayName = 'NodeHeaderAction'

//

export type NodeHeaderMenuActionProps = Omit<NodeHeaderActionProps, 'onClick'> & {
  trigger?: React.ReactNode
}

/**
 * Renders a header action that opens a dropdown menu when clicked. The dropdown
 * trigger is a button with an ellipsis icon. The trigger's content can be changed
 * by using the `trigger` prop.
 *
 * Any children passed to the `<NodeHeaderMenuAction />` component will be rendered
 * inside the dropdown menu. You can read the docs for the shadcn dropdown menu
 * here: https://ui.shadcn.com/docs/components/dropdown-menu
 *
 */
export const NodeHeaderMenuAction = React.forwardRef<HTMLButtonElement, NodeHeaderMenuActionProps>(
  ({ children, trigger, ...props }, ref) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <NodeHeaderAction ref={ref} {...props}>
          {trigger ?? <EllipsisVertical />}
        </NodeHeaderAction>
      </DropdownMenuTrigger>
      <DropdownMenuContent>{children}</DropdownMenuContent>
    </DropdownMenu>
  )
)

NodeHeaderMenuAction.displayName = 'NodeHeaderMenuAction'
