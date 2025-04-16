"use client"

import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"

interface FormDataDisplayProps {
  data: Record<string, any>
  onRowClick: (key: string) => void
}

export default function FormDataDisplay({ data, onRowClick }: FormDataDisplayProps) {
  /**
   * Format a value for display
   */
  const formatValue = (value: any): string => {
    if (value === null || value === undefined) {
      return "N/A"
    }

    if (value instanceof Date) {
      return value.toLocaleDateString()
    }

    if (value instanceof File) {
      return `File: ${value.name} (${(value.size / 1024).toFixed(2)} KB)`
    }

    if (typeof value === "boolean") {
      return value ? "Yes" : "No"
    }

    if (typeof value === "object") {
      return JSON.stringify(value, null, 2)
    }

    // Truncate long strings for display
    if (typeof value === "string" && value.length > 50) {
      return value.substring(0, 50) + "..."
    }

    return String(value)
  }

  /**
   * Get the type of a value
   */
  const getValueType = (value: any): string => {
    if (value === null || value === undefined) {
      return "empty"
    }

    if (value instanceof Date) {
      return "date"
    }

    if (value instanceof File) {
      return "file"
    }

    if (typeof value === "boolean") {
      return "boolean"
    }

    if (typeof value === "object") {
      return "object"
    }

    if (typeof value === "number") {
      return "number"
    }

    if (typeof value === "string") {
      if (value.startsWith("+")) {
        return "phone"
      }
    }

    return "text"
  }

  /**
   * Get the appropriate badge color based on value type
   */
  const getBadgeColor = (type: string): string => {
    switch (type) {
      case "date":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "file":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      case "boolean":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "object":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "number":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
      case "phone":
        return "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300"
      case "empty":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  return (
    <Card className="shadow-sm">
      <CardContent className="p-4">
        {Object.keys(data).length === 0 ? (
          <div className="text-muted-foreground text-center py-12 border-2 border-dashed rounded-lg">
            <p>No form data available.</p>
            <p className="text-sm mt-2">Fill out the form in the Preview tab to see data here.</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {Object.entries(data).map(([key, value]) => (
                <div
                  key={key}
                  className="grid grid-cols-12 gap-4 py-3 border-b hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer transition-colors"
                  onClick={() => onRowClick(key)}
                >
                  <div className="col-span-4 font-medium flex items-center">
                    <span className="truncate">{key}</span>
                  </div>
                  <div className="col-span-6 break-words">{formatValue(value)}</div>
                  <div className="col-span-2 flex justify-end items-center gap-2">
                    <Badge variant="outline" className={`text-xs ${getBadgeColor(getValueType(value))}`}>
                      {getValueType(value)}
                    </Badge>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <Eye className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
