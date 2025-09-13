import * as React from 'react'

import { cn } from '@/lib/utils'

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'flex min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base md:text-sm shadow-xs outline-none transition-[color,box-shadow] field-sizing-content',
        'border-input placeholder:text-muted-foreground',
        'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
        'aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'dark:bg-input/30',
        className,
      )}
      style={{
        color: 'var(--color-foreground)',
        background: 'var(--color-background)',
        borderColor: 'var(--color-border)',
      }}
      {...props}
    />
  )
}

export { Textarea }
