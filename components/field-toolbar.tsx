"use client"

import { Button } from "@/components/ui/button"
import { Type, ListFilter, CheckSquare, Upload, Calendar, Phone, Globe, Radio, LayoutGrid, Mail } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface FieldToolbarProps {
  onAddField: (type: string) => void
  onAddSection: () => void
}

export default function FieldToolbar({ onAddField, onAddSection }: FieldToolbarProps) {
  const fieldTypes = [
    { type: "text", icon: <Type className="h-4 w-4" />, label: "Text", description: "Single line text input" },
    {
      type: "dropdown",
      icon: <ListFilter className="h-4 w-4" />,
      label: "Dropdown",
      description: "Select from a list of options",
    },
    { type: "checkbox", icon: <CheckSquare className="h-4 w-4" />, label: "Checkbox", description: "Yes/No selection" },
    {
      type: "radio",
      icon: <Radio className="h-4 w-4" />,
      label: "Radio",
      description: "Choose one from multiple options",
    },
    { type: "file", icon: <Upload className="h-4 w-4" />, label: "File Upload", description: "Allow file uploads" },
    { type: "date", icon: <Calendar className="h-4 w-4" />, label: "Date", description: "Date picker" },
    {
      type: "phone",
      icon: <Phone className="h-4 w-4" />,
      label: "Phone",
      description: "International phone number input",
    },
    { type: "country", icon: <Globe className="h-4 w-4" />, label: "Country", description: "Country selector" },
    { type: "email", icon: <Mail className="h-4 w-4" />, label: "Email", description: "Email address input" },
  ]

  return (
    <TooltipProvider>
      <div className="grid grid-cols-2 gap-2">
        {fieldTypes.map((field) => (
          <Tooltip key={field.type}>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                className="flex flex-col h-auto py-3 justify-start items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                onClick={() => onAddField(field.type)}
              >
                {field.icon}
                <span className="text-xs">{field.label}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{field.description}</p>
            </TooltipContent>
          </Tooltip>
        ))}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              className="flex flex-col h-auto py-3 justify-start items-center gap-2 col-span-2 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={onAddSection}
            >
              <LayoutGrid className="h-4 w-4" />
              <span className="text-xs">Section</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Group fields into a section</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  )
}
