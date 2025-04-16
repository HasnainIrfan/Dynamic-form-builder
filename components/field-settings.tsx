"use client"

import type React from "react"
import { v4 as uuidv4 } from "uuid"
import type { FormField, Section, Option, ConditionalLogic } from "@/lib/types"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { InfoIcon } from "lucide-react"

interface FieldSettingsProps {
  field: FormField | Section
  onUpdate: (field: FormField | Section) => void
}

export default function FieldSettings({ field, onUpdate }: FieldSettingsProps) {
  /**
   * Check if field type supports options
   */
  const supportsOptions = (type: string): boolean => {
    return ["dropdown", "radio", "checkbox"].includes(type)
  }

  /**
   * Handle label change
   */
  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ ...field, label: e.target.value })
  }

  /**
   * Handle required change for form fields
   */
  const handleRequiredChange = (checked: boolean) => {
    if ("validation" in field) {
      onUpdate({
        ...field,
        validation: {
          ...field.validation,
          required: checked,
        },
      })
    } else if (field.type === "section") {
      // For sections, we set the required property directly
      onUpdate({
        ...field,
        required: checked,
      })
    }
  }

  /**
   * Handle placeholder change
   */
  const handlePlaceholderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if ("placeholder" in field) {
      onUpdate({ ...(field as FormField), placeholder: e.target.value })
    }
  }

  /**
   * Add a new option to a field
   */
  const addOption = () => {
    if ("options" in field) {
      const newOption: Option = {
        id: uuidv4(),
        label: `Option ${(field.options?.length || 0) + 1}`,
        value: `option${(field.options?.length || 0) + 1}`,
      }

      onUpdate({
        ...(field as FormField),
        options: [...(field.options || []), newOption],
      })
    }
  }

  /**
   * Update an option in a field
   */
  const updateOption = (id: string, key: keyof Option, value: string) => {
    if ("options" in field && field.options) {
      const updatedOptions = field.options.map((option) => (option.id === id ? { ...option, [key]: value } : option))

      onUpdate({
        ...(field as FormField),
        options: updatedOptions,
      })
    }
  }

  /**
   * Remove an option from a field
   */
  const removeOption = (id: string) => {
    if ("options" in field && field.options) {
      onUpdate({
        ...(field as FormField),
        options: field.options.filter((option) => option.id !== id),
      })
    }
  }

  /**
   * Add conditional logic to a field
   */
  const addConditionalLogic = () => {
    const newLogic: ConditionalLogic = {
      fieldId: "",
      operator: "equals",
      value: "",
      action: "show",
    }

    onUpdate({
      ...field,
      conditionalLogic: newLogic,
    })
  }

  /**
   * Update conditional logic for a field
   */
  const updateConditionalLogic = (key: keyof ConditionalLogic, value: string) => {
    if (field.conditionalLogic) {
      onUpdate({
        ...field,
        conditionalLogic: {
          ...field.conditionalLogic,
          [key]: value,
        },
      })
    }
  }

  /**
   * Remove conditional logic from a field
   */
  const removeConditionalLogic = () => {
    onUpdate({
      ...field,
      conditionalLogic: null,
    })
  }

  /**
   * Handle validation changes for a field
   */
  const handleValidationChange = (key: string, value: string | number | null) => {
    if ("validation" in field) {
      onUpdate({
        ...field,
        validation: {
          ...field.validation,
          [key]: value,
        },
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-md border text-sm mb-4">
        <div className="font-medium mb-1">Field ID:</div>
        <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs break-all">{field.id}</code>
      </div>

      <div className="space-y-2">
        <Label htmlFor="field-label">Label</Label>
        <Input id="field-label" value={field.label} onChange={handleLabelChange} />
      </div>

      {"placeholder" in field && (
        <div className="space-y-2">
          <Label htmlFor="field-placeholder">Placeholder</Label>
          <Input id="field-placeholder" value={field.placeholder || ""} onChange={handlePlaceholderChange} />
        </div>
      )}

      <div className="flex items-center justify-between">
        <Label htmlFor="field-required">Required</Label>
        <Switch
          id="field-required"
          checked={
            "validation" in field ? field.validation.required : field.type === "section" ? field.required : false
          }
          onCheckedChange={handleRequiredChange}
        />
      </div>

      {"type" in field && supportsOptions(field.type) && "options" in field && field.options && (
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="options">
            <AccordionTrigger>Options</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                {field.options.map((option) => (
                  <div key={option.id} className="flex items-center gap-2">
                    <Input
                      value={option.label}
                      onChange={(e) => updateOption(option.id, "label", e.target.value)}
                      placeholder="Label"
                      className="flex-1"
                    />
                    <Input
                      value={option.value}
                      onChange={(e) => updateOption(option.id, "value", e.target.value)}
                      placeholder="Value"
                      className="flex-1"
                    />
                    <Button variant="ghost" size="icon" onClick={() => removeOption(option.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full" onClick={addOption}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Option
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}

      {"type" in field && !supportsOptions(field.type) && "options" in field && (
        <Alert className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <InfoIcon className="h-4 w-4" />
          <AlertDescription>Options are only available for dropdown, radio, and checkbox fields.</AlertDescription>
        </Alert>
      )}

      {"validation" in field && (
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="validation">
            <AccordionTrigger>Validation</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                {"type" in field && field.type === "text" && (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-2">
                        <Label htmlFor="min-length">Min Length</Label>
                        <Input
                          id="min-length"
                          type="number"
                          value={field.validation.minLength || ""}
                          onChange={(e) =>
                            handleValidationChange("minLength", e.target.value ? Number.parseInt(e.target.value) : null)
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="max-length">Max Length</Label>
                        <Input
                          id="max-length"
                          type="number"
                          value={field.validation.maxLength || ""}
                          onChange={(e) =>
                            handleValidationChange("maxLength", e.target.value ? Number.parseInt(e.target.value) : null)
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pattern">Pattern (Regex)</Label>
                      <Input
                        id="pattern"
                        value={field.validation.pattern || ""}
                        onChange={(e) => handleValidationChange("pattern", e.target.value || null)}
                        placeholder="e.g. ^[A-Za-z]+$"
                      />
                    </div>
                  </>
                )}

                {"type" in field && field.type === "phone" && (
                  <div className="space-y-2">
                    <Label htmlFor="pattern">Phone Format</Label>
                    <Input
                      id="pattern"
                      value={field.validation.pattern || "^\\+[0-9]{1,3} [0-9]{4,14}$"}
                      onChange={(e) =>
                        handleValidationChange("pattern", e.target.value || "^\\+[0-9]{1,3} [0-9]{4,14}$")
                      }
                      placeholder="Phone number pattern"
                    />
                    <h6 className="text-xs text-muted-foreground mt-1">
                      Default pattern validates international format: +XX XXXXXXXXXX
                    </h6>
                  </div>
                )}

                {"type" in field && field.type === "email" && (
                  <div className="space-y-2">
                    <Label htmlFor="pattern">Email Format</Label>
                    <Input
                      id="pattern"
                      value={field.validation.pattern || "^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$"}
                      onChange={(e) =>
                        handleValidationChange("pattern", e.target.value || "^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$")
                      }
                      placeholder="Email pattern"
                    />
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="conditional">
          <AccordionTrigger>Conditional Logic</AccordionTrigger>
          <AccordionContent>
            {!field.conditionalLogic ? (
              <Button variant="outline" size="sm" className="w-full" onClick={addConditionalLogic}>
                <Plus className="h-4 w-4 mr-2" />
                Add Condition
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>When</Label>
                  <Input
                    placeholder="Field ID"
                    value={field.conditionalLogic.fieldId}
                    onChange={(e) => updateConditionalLogic("fieldId", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Operator</Label>
                  <Select
                    value={field.conditionalLogic.operator}
                    onValueChange={(value) => updateConditionalLogic("operator", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select operator" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="equals">Equals</SelectItem>
                      <SelectItem value="not_equals">Not Equals</SelectItem>
                      <SelectItem value="contains">Contains</SelectItem>
                      <SelectItem value="not_contains">Not Contains</SelectItem>
                      <SelectItem value="greater_than">Greater Than</SelectItem>
                      <SelectItem value="less_than">Less Than</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Value</Label>
                  <Input
                    placeholder="Value"
                    value={field.conditionalLogic.value}
                    onChange={(e) => updateConditionalLogic("value", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Action</Label>
                  <Select
                    value={field.conditionalLogic.action}
                    onValueChange={(value) => updateConditionalLogic("action", value as "show" | "hide")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select action" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="show">Show this field</SelectItem>
                      <SelectItem value="hide">Hide this field</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button variant="outline" size="sm" className="w-full" onClick={removeConditionalLogic}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove Condition
                </Button>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
