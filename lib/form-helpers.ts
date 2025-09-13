import type { ValidationResult } from "./validation"

/**
 * Form Helper Utilities
 * Provides additional functionality for form handling, validation feedback,
 * and user experience enhancements across the application.
 */

// Real-time validation debouncer
export const createValidationDebouncer = (validationFn: Function, delay = 300) => {
  let timeoutId: NodeJS.Timeout

  return (...args: any[]) => {
    clearTimeout(timeoutId)
    return new Promise((resolve) => {
      timeoutId = setTimeout(() => {
        resolve(validationFn(...args))
      }, delay)
    })
  }
}

// Form field state manager
export interface FieldState {
  value: string
  errors: string[]
  touched: boolean
  validating: boolean
}

export class FormStateManager {
  private fields: Map<string, FieldState> = new Map()
  private listeners: Set<() => void> = new Set()

  // Initialize field state
  initField(name: string, initialValue = ""): void {
    this.fields.set(name, {
      value: initialValue,
      errors: [],
      touched: false,
      validating: false,
    })
    this.notifyListeners()
  }

  // Update field value
  updateField(name: string, value: string): void {
    const field = this.fields.get(name)
    if (field) {
      this.fields.set(name, {
        ...field,
        value,
        touched: true,
      })
      this.notifyListeners()
    }
  }

  // Set field validation state
  setFieldValidation(name: string, validationResult: ValidationResult): void {
    const field = this.fields.get(name)
    if (field) {
      this.fields.set(name, {
        ...field,
        errors: validationResult.errors,
        validating: false,
      })
      this.notifyListeners()
    }
  }

  // Set field as validating
  setFieldValidating(name: string, validating: boolean): void {
    const field = this.fields.get(name)
    if (field) {
      this.fields.set(name, {
        ...field,
        validating,
      })
      this.notifyListeners()
    }
  }

  // Get field state
  getField(name: string): FieldState | undefined {
    return this.fields.get(name)
  }

  // Get all fields
  getAllFields(): Record<string, FieldState> {
    const result: Record<string, FieldState> = {}
    this.fields.forEach((state, name) => {
      result[name] = state
    })
    return result
  }

  // Check if form is valid
  isFormValid(): boolean {
    for (const field of this.fields.values()) {
      if (field.errors.length > 0) return false
    }
    return true
  }

  // Get form data
  getFormData(): Record<string, string> {
    const result: Record<string, string> = {}
    this.fields.forEach((state, name) => {
      result[name] = state.value
    })
    return result
  }

  // Subscribe to state changes
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  // Notify all listeners
  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener())
  }

  // Reset form
  reset(): void {
    this.fields.clear()
    this.notifyListeners()
  }
}

// Password strength indicator
export const getPasswordStrengthIndicator = (password: string) => {
  if (!password) return { strength: 0, label: "Enter password", color: "gray" }

  let score = 0
  const checks = [
    { test: /.{8,}/, label: "8+ characters" },
    { test: /[a-z]/, label: "lowercase letter" },
    { test: /[A-Z]/, label: "uppercase letter" },
    { test: /\d/, label: "number" },
    { test: /[@$!%*?&]/, label: "special character" },
  ]

  const passed = checks.filter((check) => check.test.test(password))
  score = passed.length

  const strengthLevels = [
    { min: 0, label: "Very Weak", color: "red" },
    { min: 1, label: "Weak", color: "orange" },
    { min: 2, label: "Fair", color: "yellow" },
    { min: 3, label: "Good", color: "blue" },
    { min: 4, label: "Strong", color: "green" },
    { min: 5, label: "Very Strong", color: "green" },
  ]

  const level = strengthLevels.reverse().find((level) => score >= level.min) || strengthLevels[0]

  return {
    strength: score,
    label: level.label,
    color: level.color,
    passed: passed.map((p) => p.label),
    missing: checks.filter((check) => !check.test.test(password)).map((p) => p.label),
  }
}

// Form submission handler with loading states
export const createSubmissionHandler = (
  submitFn: (data: any) => Promise<any>,
  options: {
    onStart?: () => void
    onSuccess?: (result: any) => void
    onError?: (error: any) => void
    onFinally?: () => void
  } = {},
) => {
  return async (data: any) => {
    try {
      options.onStart?.()
      const result = await submitFn(data)
      options.onSuccess?.(result)
      return result
    } catch (error) {
      options.onError?.(error)
      throw error
    } finally {
      options.onFinally?.()
    }
  }
}

// Local storage helpers for form data persistence
export const formStorageHelpers = {
  // Save form data to localStorage
  saveFormData: (formId: string, data: Record<string, any>) => {
    try {
      localStorage.setItem(
        `form_${formId}`,
        JSON.stringify({
          data,
          timestamp: Date.now(),
        }),
      )
    } catch (error) {
      console.warn("[v0] Failed to save form data:", error)
    }
  },

  // Load form data from localStorage
  loadFormData: (formId: string, maxAge: number = 24 * 60 * 60 * 1000): Record<string, any> | null => {
    try {
      const stored = localStorage.getItem(`form_${formId}`)
      if (!stored) return null

      const { data, timestamp } = JSON.parse(stored)
      if (Date.now() - timestamp > maxAge) {
        localStorage.removeItem(`form_${formId}`)
        return null
      }

      return data
    } catch (error) {
      console.warn("[v0] Failed to load form data:", error)
      return null
    }
  },

  // Clear form data from localStorage
  clearFormData: (formId: string) => {
    try {
      localStorage.removeItem(`form_${formId}`)
    } catch (error) {
      console.warn("[v0] Failed to clear form data:", error)
    }
  },
}

// Export commonly used validation patterns
export const validationPatterns = {
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  phone: /^[+]?[1-9]\d{1,14}$/,
  strongPassword: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  name: /^[a-zA-Z\s'-]+$/,
  alphanumeric: /^[a-zA-Z0-9]+$/,
  url: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/,
}
