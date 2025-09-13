import Ajv from "ajv"
import addFormats from "ajv-formats"

// JSON Schema imports - these would be loaded from the JSON files
import userRegistrationSchema from "@/data/validation/user-registration.json"
import contactFormSchema from "@/data/validation/contact-form.json"
import newsletterSchema from "@/data/validation/newsletter-subscription.json"
import careerProfileSchema from "@/data/validation/career-profile.json"

// Initialize AJV with format support for email, date, etc.
const ajv = new Ajv({ allErrors: true, removeAdditional: true })
addFormats(ajv)

// Compile schemas for better performance
const validators = {
  userRegistration: ajv.compile(userRegistrationSchema),
  contactForm: ajv.compile(contactFormSchema),
  newsletter: ajv.compile(newsletterSchema),
  careerProfile: ajv.compile(careerProfileSchema),
}

// Validation result interface
export interface ValidationResult {
  isValid: boolean
  errors: string[]
  data?: any
}

// Password strength checker with detailed feedback
export const validatePasswordStrength = (password: string): ValidationResult => {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long")
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter")
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter")
  }

  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one number")
  }

  if (!/[@$!%*?&]/.test(password)) {
    errors.push("Password must contain at least one special character (@$!%*?&)")
  }

  // Check for common weak patterns
  const commonPatterns = [/123456/, /password/i, /qwerty/i, /abc123/i, /admin/i]

  if (commonPatterns.some((pattern) => pattern.test(password))) {
    errors.push("Password contains common patterns that are easily guessed")
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: password,
  }
}

// Email validation with domain checking
export const validateEmail = (email: string): ValidationResult => {
  const errors: string[] = []
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

  if (!email || !email.trim()) {
    errors.push("Email is required")
  } else if (!emailRegex.test(email.trim())) {
    errors.push("Please enter a valid email address")
  } else {
    // Check for suspicious domains
    const suspiciousDomains = ["tempmail.com", "10minutemail.com", "guerrillamail.com"]
    const domain = email.split("@")[1]?.toLowerCase()

    if (suspiciousDomains.includes(domain)) {
      errors.push("Please use a permanent email address")
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: email.trim().toLowerCase(),
  }
}

// Name validation with cultural sensitivity
export const validateName = (name: string): ValidationResult => {
  const errors: string[] = []
  const nameRegex = /^[a-zA-Z\s'-]+$/

  if (!name || !name.trim()) {
    errors.push("Name is required")
  } else if (name.trim().length < 2) {
    errors.push("Name must be at least 2 characters long")
  } else if (name.trim().length > 50) {
    errors.push("Name must be less than 50 characters")
  } else if (!nameRegex.test(name.trim())) {
    errors.push("Name can only contain letters, spaces, hyphens, and apostrophes")
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: name.trim(),
  }
}

// Generic schema validator
export const validateWithSchema = (data: any, schemaType: keyof typeof validators): ValidationResult => {
  const validator = validators[schemaType]
  const isValid = validator(data)

  if (isValid) {
    return {
      isValid: true,
      errors: [],
      data,
    }
  }

  const errors = validator.errors?.map((error) => {
    const field = error.instancePath.replace("/", "") || error.params?.missingProperty || "field"
    return `${field}: ${error.message}`
  }) || ["Validation failed"]

  return {
    isValid: false,
    errors,
    data,
  }
}

// User registration validation
export const validateUserRegistration = (userData: any): ValidationResult => {
  // First validate individual fields for better error messages
  const nameValidation = validateName(userData.name)
  const emailValidation = validateEmail(userData.email)
  const passwordValidation = validatePasswordStrength(userData.password)

  const allErrors = [...nameValidation.errors, ...emailValidation.errors, ...passwordValidation.errors]

  // Then validate against schema
  const schemaValidation = validateWithSchema(userData, "userRegistration")
  allErrors.push(...schemaValidation.errors)

  // Remove duplicates
  const uniqueErrors = [...new Set(allErrors)]

  return {
    isValid: uniqueErrors.length === 0,
    errors: uniqueErrors,
    data: {
      name: nameValidation.data,
      email: emailValidation.data,
      password: userData.password, // Don't return processed password
      userType: userData.userType,
      agreeToTerms: userData.agreeToTerms,
    },
  }
}

// Contact form validation
export const validateContactForm = (formData: any): ValidationResult => {
  const nameValidation = validateName(formData.name)
  const emailValidation = validateEmail(formData.email)

  const errors = [...nameValidation.errors, ...emailValidation.errors]

  // Validate subject
  if (!formData.subject || formData.subject.trim().length < 5) {
    errors.push("Subject must be at least 5 characters long")
  }

  // Validate message
  if (!formData.message || formData.message.trim().length < 10) {
    errors.push("Message must be at least 10 characters long")
  } else if (formData.message.trim().length > 1000) {
    errors.push("Message must be less than 1000 characters")
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: {
      name: nameValidation.data,
      email: emailValidation.data,
      subject: formData.subject?.trim(),
      message: formData.message?.trim(),
      category: formData.category || "general",
    },
  }
}

// Newsletter subscription validation
export const validateNewsletterSubscription = (data: any): ValidationResult => {
  const emailValidation = validateEmail(data.email)

  return {
    isValid: emailValidation.isValid,
    errors: emailValidation.errors,
    data: {
      email: emailValidation.data,
      preferences: data.preferences || ["career-tips"],
      frequency: data.frequency || "weekly",
    },
  }
}

// Real-time validation for form fields
export const validateField = (fieldName: string, value: any, context?: any): ValidationResult => {
  switch (fieldName) {
    case "name":
      return validateName(value)
    case "email":
      return validateEmail(value)
    case "password":
      return validatePasswordStrength(value)
    case "confirmPassword":
      if (value !== context?.password) {
        return { isValid: false, errors: ["Passwords do not match"], data: value }
      }
      return { isValid: true, errors: [], data: value }
    default:
      return { isValid: true, errors: [], data: value }
  }
}

// Sanitize user input to prevent XSS
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, "") // Remove angle brackets
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+=/gi, "") // Remove event handlers
    .trim()
}

// Export all validators for easy access
export const validators_export = {
  userRegistration: validateUserRegistration,
  contactForm: validateContactForm,
  newsletter: validateNewsletterSubscription,
  field: validateField,
  email: validateEmail,
  name: validateName,
  password: validatePasswordStrength,
  schema: validateWithSchema,
}
