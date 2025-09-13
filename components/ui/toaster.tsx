'use client'

import { useToast } from '@/hooks/use-toast'
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from '@/components/ui/toast'

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast
            key={id}
            {...props}
            className="border rounded-md shadow-lg p-3 flex items-start gap-3"
            style={{
              background: 'var(--color-popover)',
              color: 'var(--color-popover-foreground)',
              borderColor: 'var(--color-border)',
            }}
          >
            <div className="grid gap-1 flex-1">
              {title && (
                <ToastTitle
                  className="font-medium"
                  style={{ color: 'var(--color-foreground)' }}
                >
                  {title}
                </ToastTitle>
              )}
              {description && (
                <ToastDescription style={{ color: 'var(--color-muted-foreground)' }}>
                  {description}
                </ToastDescription>
              )}
            </div>

            {action && (
              <div className="flex items-center justify-end ml-2">
                {action}
              </div>
            )}

            <ToastClose
              aria-label="Close"
              className="ml-2"
              style={{ color: 'var(--color-muted-foreground)' }}
            />
          </Toast>
        )
      })}

      <ToastViewport
        className="fixed z-50 right-4 bottom-4 p-2 w-full max-w-xs space-y-2 outline-none"
        style={{
          inset: 'auto 1rem 1rem auto',
          maxWidth: '360px',
          transform: 'translateZ(0)',
        }}
      />
    </ToastProvider>
  )
}
