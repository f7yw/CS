"use client"
import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from "next-themes"

/**
 * ✅ ThemeProvider المحسّن:
 * - يدعم light / dark / system
 * - يستخدم attribute="class" لتفعيل الـ CSS variables مع Tailwind
 * - fallbackTheme = "light" عشان يكون عندك ضمان ثبات
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class" // يضيف class="light" أو "dark" للـ <html>
      defaultTheme="system" // ياخذ theme من الجهاز أولاً
      enableSystem // يفعّل system preference
      disableTransitionOnChange // يمنع فلاشات مزعجة عند التبديل
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}
