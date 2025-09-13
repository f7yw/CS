'use client'

import * as React from 'react'
import { forwardRef } from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

/**
 * Badge component
 * - يدعم variant, size, وrounded
 * - يمكن استخدامه كـ span أو أي عنصر آخر باستخدام asChild
 * - تصميم حديث متجاوب مع تأثير hover سلس
 */
const badgeVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap shrink-0 gap-1 overflow-hidden font-medium border transition-all duration-200 ease-in-out',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground border-transparent hover:bg-primary/90',
        secondary: 'bg-secondary text-secondary-foreground border-transparent hover:bg-secondary/80',
        destructive: 'bg-destructive text-destructive-foreground border-transparent hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40',
        outline: 'text-foreground border-border hover:bg-accent hover:text-accent-foreground',
        muted: 'bg-muted text-muted-foreground border-transparent',
        accent: 'bg-accent text-accent-foreground border-transparent hover:bg-accent/90',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-3 py-1 text-sm',
        lg: 'px-4 py-1.5 text-sm',
      },
      rounded: {
        sm: 'rounded',
        md: 'rounded-md',
        lg: 'rounded-lg',
        full: 'rounded-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'sm',
      rounded: 'md',
    },
  }
)

export type BadgeProps = React.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { className, variant, size, rounded, asChild = false, ...props },
  ref
) {
  const Comp = asChild ? Slot : 'span'

  return (
    <Comp
      ref={ref as any}
      data-slot="badge"
      className={cn(badgeVariants({ variant, size, rounded }), className)}
      {...props}
    />
  )
})

Badge.displayName = 'Badge'

export { Badge, badgeVariants }
