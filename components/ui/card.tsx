'use client'

import * as React from 'react'
import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export type CardProps = React.ComponentPropsWithRef<'div'>
export type CardPartProps = React.ComponentPropsWithRef<'div'>

/**
 * Main Card container
 * Updated: Added modern shadow, hover effect, backdrop blur, and smooth transitions
 */
const Card = forwardRef<HTMLDivElement, CardProps>(function Card({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      data-slot="card"
      className={cn(
        'bg-card text-card-foreground flex flex-col gap-6 rounded-xl border border-transparent shadow-md backdrop-blur-sm transition-all hover:shadow-lg hover:scale-[1.02] hover:border-border/30 duration-300',
        className,
      )}
      {...props}
    />
  )
})
Card.displayName = 'Card'

/**
 * CardHeader
 * Updated: Improved responsive grid and alignment
 */
const CardHeader = forwardRef<HTMLDivElement, CardPartProps>(function CardHeader({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      data-slot="card-header"
      className={cn(
        '@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 py-2 sm:gap-1.5 sm:py-0 has-data-[slot=card-action]:grid-cols-[1fr_auto]',
        className,
      )}
      {...props}
    />
  )
})
CardHeader.displayName = 'CardHeader'

/**
 * CardTitle
 * Updated: Added tracking-tight and text-lg for modern typography
 */
const CardTitle = forwardRef<HTMLDivElement, CardPartProps>(function CardTitle({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      data-slot="card-title"
      className={cn('leading-none font-semibold text-lg tracking-tight', className)}
      {...props}
    />
  )
})
CardTitle.displayName = 'CardTitle'

/**
 * CardDescription
 * Updated: Added smooth color transition for light/dark mode
 */
const CardDescription = forwardRef<HTMLDivElement, CardPartProps>(function CardDescription({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      data-slot="card-description"
      className={cn(
        'text-muted-foreground text-sm transition-colors duration-200',
        className,
      )}
      {...props}
    />
  )
})
CardDescription.displayName = 'CardDescription'

/**
 * CardAction (positioned to the right in header)
 */
const CardAction = forwardRef<HTMLDivElement, CardPartProps>(function CardAction({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      data-slot="card-action"
      className={cn('col-start-2 row-span-2 row-start-1 self-start justify-self-end', className)}
      {...props}
    />
  )
})
CardAction.displayName = 'CardAction'

/**
 * CardContent
 * Updated: Added responsive padding and spacing improvements
 */
const CardContent = forwardRef<HTMLDivElement, CardPartProps>(function CardContent({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      data-slot="card-content"
      className={cn('px-6 py-4 sm:px-6 sm:py-3', className)}
      {...props}
    />
  )
})
CardContent.displayName = 'CardContent'

/**
 * CardFooter
 * Updated: Added responsive spacing and gap
 */
const CardFooter = forwardRef<HTMLDivElement, CardPartProps>(function CardFooter({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      data-slot="card-footer"
      className={cn(
        'flex flex-wrap items-center justify-end gap-2 px-6 py-4 border-t border-border/20 sm:pt-6',
        className,
      )}
      {...props}
    />
  )
})
CardFooter.displayName = 'CardFooter'

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
