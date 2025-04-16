export interface Option {
  id: string
  label: string
  value: string
}

export interface Validation {
  required: boolean
  pattern: string | null
  minLength: number | null
  maxLength: number | null
}

export interface ConditionalLogic {
  fieldId: string
  operator: string
  value: string
  action: "show" | "hide"
}

export interface FormField {
  id: string
  type: string
  label: string
  placeholder?: string
  required?: boolean
  options?: Option[]
  validation: Validation
  conditionalLogic: ConditionalLogic | null
}

export interface Section {
  id: string
  type: "section"
  label: string
  fields: (FormField | Section)[]
  required: boolean
  conditionalLogic: ConditionalLogic | null
}

export interface FormSubmission {
  id: string
  timestamp: Date
  data: Record<string, any>
}

export interface FormStyle {
  backgroundColor: string
  headerColor: string
  textColor: string
  buttonColor: string
  borderColor: string
  borderRadius: string
}
