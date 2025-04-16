"use client"

import { useState, useEffect } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Check, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface ColorPickerProps {
  value: string
  onChange: (value: string) => void
  presetColors?: { name: string; value: string }[]
}

export function ColorPicker({ value, onChange, presetColors }: ColorPickerProps) {
  const [color, setColor] = useState(value || "#ffffff")

  // Default preset colors if none provided
  const defaultColors = [
    { name: "White", value: "#ffffff" },
    { name: "Light Gray", value: "#f3f4f6" },
    { name: "Light Blue", value: "#e0f2fe" },
    { name: "Light Green", value: "#dcfce7" },
    { name: "Light Yellow", value: "#fef9c3" },
    { name: "Light Red", value: "#fee2e2" },
    { name: "Light Purple", value: "#f3e8ff" },
    { name: "Light Pink", value: "#fce7f3" },
  ]

  const colors = presetColors || defaultColors

  useEffect(() => {
    setColor(value)
  }, [value])

  const handleColorChange = (newColor: string) => {
    setColor(newColor)
    onChange(newColor)
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-between" style={{ backgroundColor: color }}>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded border" style={{ backgroundColor: color }} />
            <span className={cn("text-sm", color === "#ffffff" || color === "#f3f4f6" ? "text-black" : "text-white")}>
              {colors.find((c) => c.value === color)?.name || color}
            </span>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <div className="grid grid-cols-4 gap-2">
          {colors.map((colorOption) => (
            <button
              key={colorOption.value}
              className={cn(
                "h-8 w-full rounded-md border border-gray-200 flex items-center justify-center",
                color === colorOption.value && "ring-2 ring-black dark:ring-white",
              )}
              style={{ backgroundColor: colorOption.value }}
              onClick={() => handleColorChange(colorOption.value)}
            >
              {color === colorOption.value && (
                <Check
                  className={cn(
                    "h-4 w-4",
                    colorOption.value === "#ffffff" || colorOption.value === "#f3f4f6" ? "text-black" : "text-white",
                  )}
                />
              )}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 mt-4">
          <input
            type="color"
            value={color}
            onChange={(e) => handleColorChange(e.target.value)}
            className="h-8 w-8 cursor-pointer"
          />
          <input
            type="text"
            value={color}
            onChange={(e) => handleColorChange(e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}
