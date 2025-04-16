"use client";

import type React from "react";
import { useState, useEffect } from "react";
import type { FormField, Section, FormStyle } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { countries } from "@/lib/countries";
import { PhoneInput } from "./phone-input";
import { Card } from "@/components/ui/card";
import toast from "react-hot-toast";

interface FormPreviewProps {
  fields: (FormField | Section)[];
  onDataChange: (data: Record<string, any>) => void;
  onSubmit: (data: Record<string, any>) => void;
  submittedData: Record<string, any> | null;
  style?: FormStyle;
}

export default function FormPreview({
  fields,
  onDataChange,
  onSubmit,
  submittedData,
  style,
}: FormPreviewProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Default style if not provided
  const defaultStyle: FormStyle = {
    backgroundColor: "#ffffff",
    headerColor: "#000000",
    textColor: "#000000",
    buttonColor: "#0f172a",
    borderColor: "#e2e8f0",
    borderRadius: "md",
  };

  const formStyle = style || defaultStyle;

  // Get border radius class based on the selected radius
  const getBorderRadiusClass = (radius: string): string => {
    switch (radius) {
      case "none":
        return "rounded-none";
      case "sm":
        return "rounded-sm";
      case "md":
        return "rounded-md";
      case "lg":
        return "rounded-lg";
      case "xl":
        return "rounded-xl";
      case "full":
        return "rounded-full";
      default:
        return "rounded-md";
    }
  };

  // Initialize form data with submitted data if available
  useEffect(() => {
    if (submittedData && Object.keys(submittedData).length > 0) {
      setFormData(submittedData);
    }
  }, [submittedData]);

  // Update parent component with form data changes
  useEffect(() => {
    onDataChange(formData);
  }, [formData, onDataChange]);

  /**
   * Handle field value changes
   */
  const handleChange = (id: string, value: any) => {
    setFormData((prev) => ({ ...prev, [id]: value }));

    // Clear error when field is updated
    if (errors[id]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[id];
        return newErrors;
      });
    }
  };

  /**
   * Validate a single field
   */
  const validateField = (field: FormField) => {
    if (field.validation?.required && !formData[field.id]) {
      return `${field.label} is required`;
    }

    if (
      field.type === "text" &&
      field.validation?.pattern &&
      formData[field.id]
    ) {
      const regex = new RegExp(field.validation.pattern);
      if (!regex.test(formData[field.id])) {
        return `${field.label} has an invalid format`;
      }
    }

    if (
      field.type === "phone" &&
      field.validation?.pattern &&
      formData[field.id]
    ) {
      const regex = new RegExp(field.validation.pattern);
      if (!regex.test(formData[field.id])) {
        return `${field.label} has an invalid format`;
      }
    }

    if (
      field.type === "text" &&
      field.validation?.minLength &&
      formData[field.id]?.length < field.validation.minLength
    ) {
      return `${field.label} must be at least ${field.validation.minLength} characters`;
    }

    if (
      field.type === "text" &&
      field.validation?.maxLength &&
      formData[field.id]?.length > field.validation.maxLength
    ) {
      return `${field.label} must be at most ${field.validation.maxLength} characters`;
    }

    return null;
  };

  /**
   * Validate a section (all fields within must be valid)
   */
  const validateSection = (section: Section) => {
    // If section is not required, we don't need to validate its fields
    if (!section.required) return null;

    // Check if any field in the section has a value
    const hasValue = section.fields.some((field) => {
      if (field.type === "section") {
        return validateSection(field as Section) === null;
      } else {
        return (
          formData[field.id] !== undefined &&
          formData[field.id] !== null &&
          formData[field.id] !== ""
        );
      }
    });

    if (!hasValue) {
      return `Section "${section.label}" requires at least one field to be filled`;
    }

    return null;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};

    // Validate all fields
    const validateFields = (fieldsToValidate: (FormField | Section)[]) => {
      fieldsToValidate.forEach((field) => {
        if (field.type === "section") {
          // Validate the section itself
          const sectionError = validateSection(field as Section);
          if (sectionError) {
            newErrors[field.id] = sectionError;
          }

          // Validate fields within the section
          validateFields((field as Section).fields);
        } else {
          const error = validateField(field as FormField);
          if (error) {
            newErrors[field.id] = error;
          }
        }
      });
    };

    validateFields(fields);

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      // Form is valid, submit the data
      onSubmit(formData);
    } else {
      // Show validation error toast
      toast.error(
        `Please fix the ${Object.keys(newErrors).length} error${
          Object.keys(newErrors).length > 1 ? "s" : ""
        } in the form.`
      );
    }
  };

  /**
   * Determine if a field should be shown based on conditional logic
   */
  const shouldShowField = (field: FormField | Section) => {
    if (!field.conditionalLogic) return true;

    const { fieldId, operator, value, action } = field.conditionalLogic;
    const fieldValue = formData[fieldId];

    let conditionMet = false;

    switch (operator) {
      case "equals":
        conditionMet = fieldValue === value;
        break;
      case "not_equals":
        conditionMet = fieldValue !== value;
        break;
      case "contains":
        conditionMet = String(fieldValue).includes(value);
        break;
      case "not_contains":
        conditionMet = !String(fieldValue).includes(value);
        break;
      case "greater_than":
        conditionMet = Number(fieldValue) > Number(value);
        break;
      case "less_than":
        conditionMet = Number(fieldValue) < Number(value);
        break;
      default:
        conditionMet = false;
    }

    return action === "show" ? conditionMet : !conditionMet;
  };

  /**
   * Render a form field
   */
  const renderField = (field: FormField) => {
    if (!shouldShowField(field)) return null;

    const borderRadiusClass = getBorderRadiusClass(formStyle.borderRadius);

    switch (field.type) {
      case "text":
        return (
          <div className="space-y-2" key={field.id}>
            <Label htmlFor={field.id} style={{ color: formStyle.textColor }}>
              {field.label}
              {field.validation?.required && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </Label>
            <Input
              id={field.id}
              placeholder={field.placeholder}
              value={formData[field.id] || ""}
              onChange={(e) => handleChange(field.id, e.target.value)}
              className={cn(
                errors[field.id] ? "border-red-500" : "",
                borderRadiusClass
              )}
              style={{
                borderColor: errors[field.id]
                  ? "rgb(239, 68, 68)"
                  : formStyle.borderColor,
                color: formStyle.textColor,
                backgroundColor: "transparent",
              }}
            />
            {errors[field.id] && (
              <p className="text-sm text-red-500">{errors[field.id]}</p>
            )}
          </div>
        );

      case "dropdown":
        return (
          <div className="space-y-2" key={field.id}>
            <Label htmlFor={field.id} style={{ color: formStyle.textColor }}>
              {field.label}
              {field.validation?.required && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </Label>
            <Select
              value={formData[field.id] || ""}
              onValueChange={(value) => handleChange(field.id, value)}
            >
              <SelectTrigger
                id={field.id}
                className={cn(
                  errors[field.id] ? "border-red-500" : "",
                  borderRadiusClass
                )}
                style={{
                  borderColor: errors[field.id]
                    ? "rgb(239, 68, 68)"
                    : formStyle.borderColor,
                  color: formStyle.textColor,
                  backgroundColor: "transparent",
                }}
              >
                <SelectValue placeholder={field.placeholder} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem key={option.id} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors[field.id] && (
              <p className="text-sm text-red-500">{errors[field.id]}</p>
            )}
          </div>
        );

      case "radio":
        return (
          <div className="space-y-2" key={field.id}>
            <Label style={{ color: formStyle.textColor }}>
              {field.label}
              {field.validation?.required && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </Label>
            <RadioGroup
              value={formData[field.id] || ""}
              onValueChange={(value) => handleChange(field.id, value)}
              className={cn(
                errors[field.id] ? "border border-red-500 p-3 rounded-md" : ""
              )}
            >
              {field.options?.map((option) => (
                <div className="flex items-center space-x-2" key={option.id}>
                  <RadioGroupItem
                    value={option.value}
                    id={`${field.id}-${option.id}`}
                  />
                  <Label
                    htmlFor={`${field.id}-${option.id}`}
                    style={{ color: formStyle.textColor }}
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            {errors[field.id] && (
              <p className="text-sm text-red-500">{errors[field.id]}</p>
            )}
          </div>
        );

      case "checkbox":
        return (
          <div className="space-y-2" key={field.id}>
            <div className="flex items-center space-x-2">
              <Checkbox
                id={field.id}
                checked={formData[field.id] || false}
                onCheckedChange={(checked) => handleChange(field.id, checked)}
                className={errors[field.id] ? "border-red-500" : ""}
              />
              <Label htmlFor={field.id} style={{ color: formStyle.textColor }}>
                {field.label}
                {field.validation?.required && (
                  <span className="text-red-500 ml-1">*</span>
                )}
              </Label>
            </div>
            {errors[field.id] && (
              <p className="text-sm text-red-500">{errors[field.id]}</p>
            )}
          </div>
        );

      case "file":
        return (
          <div className="space-y-2" key={field.id}>
            <Label htmlFor={field.id} style={{ color: formStyle.textColor }}>
              {field.label}
              {field.validation?.required && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </Label>
            <Input
              id={field.id}
              type="file"
              onChange={(e) => {
                const files = (e.target as HTMLInputElement).files;
                handleChange(field.id, files ? files[0] : null);
              }}
              className={cn(
                errors[field.id] ? "border-red-500" : "",
                borderRadiusClass
              )}
              style={{
                borderColor: errors[field.id]
                  ? "rgb(239, 68, 68)"
                  : formStyle.borderColor,
                color: formStyle.textColor,
              }}
            />
            {errors[field.id] && (
              <p className="text-sm text-red-500">{errors[field.id]}</p>
            )}
          </div>
        );

      case "date":
        return (
          <div className="space-y-2" key={field.id}>
            <Label style={{ color: formStyle.textColor }}>
              {field.label}
              {field.validation?.required && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData[field.id] && "text-muted-foreground",
                    errors[field.id] && "border-red-500",
                    borderRadiusClass
                  )}
                  style={{
                    borderColor: errors[field.id]
                      ? "rgb(239, 68, 68)"
                      : formStyle.borderColor,
                    color: formStyle.textColor,
                    backgroundColor: "transparent",
                  }}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData[field.id] ? (
                    format(formData[field.id], "PPP")
                  ) : (
                    <span>{field.placeholder || "Pick a date"}</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData[field.id]}
                  onSelect={(date) => handleChange(field.id, date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {errors[field.id] && (
              <p className="text-sm text-red-500">{errors[field.id]}</p>
            )}
          </div>
        );

      case "country":
        return (
          <div className="space-y-2" key={field.id}>
            <Label htmlFor={field.id} style={{ color: formStyle.textColor }}>
              {field.label}
              {field.validation?.required && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </Label>
            <Select
              value={formData[field.id] || ""}
              onValueChange={(value) => handleChange(field.id, value)}
            >
              <SelectTrigger
                id={field.id}
                className={cn(
                  errors[field.id] ? "border-red-500" : "",
                  borderRadiusClass
                )}
                style={{
                  borderColor: errors[field.id]
                    ? "rgb(239, 68, 68)"
                    : formStyle.borderColor,
                  color: formStyle.textColor,
                  backgroundColor: "transparent",
                }}
              >
                <SelectValue
                  placeholder={field.placeholder || "Select a country"}
                />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {countries.map((country) => (
                  <SelectItem key={country.code} value={country.code}>
                    <div className="flex items-center gap-2">
                      <span>{country.flag}</span>
                      <span>{country.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors[field.id] && (
              <p className="text-sm text-red-500">{errors[field.id]}</p>
            )}
          </div>
        );

      case "phone":
        return (
          <div className="space-y-2" key={field.id}>
            <Label htmlFor={field.id} style={{ color: formStyle.textColor }}>
              {field.label}
              {field.validation?.required && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </Label>
            <PhoneInput
              id={field.id}
              value={formData[field.id] || ""}
              onChange={(value) => handleChange(field.id, value)}
              placeholder={field.placeholder || "Enter phone number"}
              borderRadius={formStyle.borderRadius}
              borderColor={formStyle.borderColor}
              textColor={formStyle.textColor}
            />
            {errors[field.id] && (
              <p className="text-sm text-red-500">{errors[field.id]}</p>
            )}
          </div>
        );

      case "email":
        return (
          <div className="space-y-2" key={field.id}>
            <Label htmlFor={field.id} style={{ color: formStyle.textColor }}>
              {field.label}
              {field.validation?.required && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </Label>
            <Input
              id={field.id}
              type="email"
              placeholder={field.placeholder}
              value={formData[field.id] || ""}
              onChange={(e) => handleChange(field.id, e.target.value)}
              className={cn(
                errors[field.id] ? "border-red-500" : "",
                borderRadiusClass
              )}
              style={{
                borderColor: errors[field.id]
                  ? "rgb(239, 68, 68)"
                  : formStyle.borderColor,
                color: formStyle.textColor,
                backgroundColor: "transparent",
              }}
            />
            {errors[field.id] && (
              <p className="text-sm text-red-500">{errors[field.id]}</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  /**
   * Render a section with its fields
   */
  const renderSection = (section: Section) => {
    if (!shouldShowField(section)) return null;

    const borderRadiusClass = getBorderRadiusClass(formStyle.borderRadius);

    return (
      <Card
        key={section.id}
        className={cn(
          `p-4 space-y-4 shadow-sm ${
            errors[section.id] ? "border-red-500" : ""
          }`,
          borderRadiusClass
        )}
        style={{
          backgroundColor: "transparent",
          borderColor: errors[section.id]
            ? "rgb(239, 68, 68)"
            : formStyle.borderColor,
          color: formStyle.textColor,
        }}
      >
        <h3
          className="font-medium text-lg border-b pb-2"
          style={{
            borderColor: formStyle.borderColor,
            color: formStyle.headerColor,
          }}
        >
          {section.label}
          {section.required && <span className="text-red-500 ml-1">*</span>}
        </h3>
        <div className="space-y-6">
          {section.fields.map((field) => {
            if (field.type === "section") {
              return renderSection(field as Section);
            } else {
              return renderField(field as FormField);
            }
          })}
        </div>
        {errors[section.id] && (
          <p className="text-sm text-red-500 mt-2">{errors[section.id]}</p>
        )}
      </Card>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {fields.map((field) => {
        if (field.type === "section") {
          return renderSection(field as Section);
        } else {
          return renderField(field as FormField);
        }
      })}

      {fields.length > 0 && (
        <Button
          type="submit"
          className={cn("w-full", getBorderRadiusClass(formStyle.borderRadius))}
          style={{
            backgroundColor: formStyle.buttonColor,
            borderColor: formStyle.buttonColor,
          }}
        >
          Submit
        </Button>
      )}
    </form>
  );
}
