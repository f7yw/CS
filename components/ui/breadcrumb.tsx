'use client'

import * as React from 'react'
import { forwardRef } from 'react'
import { Slot } from '@radix-ui/react-slot'
import { ChevronRight, MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Breadcrumb container
 * - تصميم متجاوب وحديث
 * - يدعم جميع العناصر والـ aria accessibility
 */
const Breadcrumb = forwardRef<HTMLElement, React.ComponentProps<'nav'>>(function Breadcrumb(
  props,
  ref
) {
  return (
    <nav
      ref={ref}
      aria-label="breadcrumb"
      data-slot="breadcrumb"
      className="w-full"
      {...props}
    />
  )
})

/**
 * Breadcrumb list (ol)
 */
const BreadcrumbList = forwardRef<HTMLOListElement, React.ComponentProps<'ol'>>(function BreadcrumbList(
  { className, ...props },
  ref
) {
  return (
    <ol
      ref={ref}
      data-slot="breadcrumb-list"
      className={cn(
        'flex flex-wrap items-center gap-1.5 sm:gap-2.5 break-words text-sm text-muted-foreground',
        className
      )}
      {...props}
    />
  )
})

/**
 * Breadcrumb item (li)
 */
const BreadcrumbItem = forwardRef<HTMLLIElement, React.ComponentProps<'li'>>(function BreadcrumbItem(
  { className, ...props },
  ref
) {
  return (
    <li
      ref={ref}
      data-slot="breadcrumb-item"
      className={cn('inline-flex items-center gap-1.5', className)}
      {...props}
    />
  )
})

/**
 * Breadcrumb link
 * - يدعم asChild polymorphic rendering
 */
const BreadcrumbLink = forwardRef<
  HTMLAnchorElement,
  React.ComponentProps<'a'> & { asChild?: boolean }
>(function BreadcrumbLink({ asChild, className, ...props }, ref) {
  const Comp = asChild ? Slot : 'a'
  return (
    <Comp
      ref={ref as any}
      data-slot="breadcrumb-link"
      className={cn(
        'transition-colors hover:text-foreground text-muted-foreground',
        className
      )}
      {...props}
    />
  )
})

/**
 * Breadcrumb page (current)
 */
const BreadcrumbPage = forwardRef<HTMLSpanElement, React.ComponentProps<'span'>>(function BreadcrumbPage(
  { className, ...props },
  ref
) {
  return (
    <span
      ref={ref}
      data-slot="breadcrumb-page"
      role="link"
      aria-disabled="true"
      aria-current="page"
      className={cn('font-medium text-foreground', className)}
      {...props}
    />
  )
})

/**
 * Breadcrumb separator
 * - يستخدم أيقونة افتراضية ChevronRight
 */
const BreadcrumbSeparator = forwardRef<HTMLLIElement, React.ComponentProps<'li'>>(function BreadcrumbSeparator(
  { children, className, ...props },
  ref
) {
  return (
    <li
      ref={ref}
      data-slot="breadcrumb-separator"
      role="presentation"
      aria-hidden="true"
      className={cn(
        'flex items-center [&>svg]:size-3.5 text-muted-foreground',
        className
      )}
      {...props}
    >
      {children ?? <ChevronRight />}
    </li>
  )
})

/**
 * Breadcrumb ellipsis
 * - يظهر عند كثرة العناصر
 */
const BreadcrumbEllipsis = forwardRef<HTMLSpanElement, React.ComponentProps<'span'>>(function BreadcrumbEllipsis(
  { className, ...props },
  ref
) {
  return (
    <span
      ref={ref}
      data-slot="breadcrumb-ellipsis"
      role="presentation"
      aria-hidden="true"
      className={cn(
        'flex size-9 items-center justify-center text-muted-foreground',
        className
      )}
      {...props}
    >
      <MoreHorizontal className="size-4" />
      <span className="sr-only">More</span>
    </span>
  )
})

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
}
