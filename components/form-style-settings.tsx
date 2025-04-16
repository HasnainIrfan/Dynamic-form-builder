"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ColorPicker } from "./color-picker"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { FormStyle } from "@/lib/types"

interface FormStyleSettingsProps {
  style: FormStyle
  onStyleChange: (style: FormStyle) => void
}

export default function FormStyleSettings({ style, onStyleChange }: FormStyleSettingsProps) {
  const [activeTab, setActiveTab] = useState("colors")

  const handleStyleChange = (key: keyof FormStyle, value: string) => {
    onStyleChange({
      ...style,
      [key]: value,
    })
  }

  const presetThemes = [
    {
      name: "Default",
      style: {
        backgroundColor: "#ffffff",
        headerColor: "#000000",
        textColor: "#000000",
        buttonColor: "#0f172a",
        borderColor: "#e2e8f0",
        borderRadius: "md",
      },
    },
    {
      name: "Modern Blue",
      style: {
        backgroundColor: "#f0f9ff",
        headerColor: "#0369a1",
        textColor: "#0c4a6e",
        buttonColor: "#0284c7",
        borderColor: "#bae6fd",
        borderRadius: "lg",
      },
    },
    {
      name: "Soft Green",
      style: {
        backgroundColor: "#f0fdf4",
        headerColor: "#166534",
        textColor: "#14532d",
        buttonColor: "#16a34a",
        borderColor: "#bbf7d0",
        borderRadius: "md",
      },
    },
    {
      name: "Warm Orange",
      style: {
        backgroundColor: "#fff7ed",
        headerColor: "#9a3412",
        textColor: "#7c2d12",
        buttonColor: "#ea580c",
        borderColor: "#fed7aa",
        borderRadius: "xl",
      },
    },
    {
      name: "Purple Elegance",
      style: {
        backgroundColor: "#faf5ff",
        headerColor: "#6b21a8",
        textColor: "#581c87",
        buttonColor: "#9333ea",
        borderColor: "#e9d5ff",
        borderRadius: "full",
      },
    },
    {
      name: "Dark Mode",
      style: {
        backgroundColor: "#1e293b",
        headerColor: "#f8fafc",
        textColor: "#e2e8f0",
        buttonColor: "#3b82f6",
        borderColor: "#334155",
        borderRadius: "md",
      },
    },
  ]

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Theme Presets</Label>
        <Select
          onValueChange={(value) => {
            const theme = presetThemes.find((theme) => theme.name === value)
            if (theme) {
              onStyleChange(theme.style as FormStyle)
            }
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a theme" />
          </SelectTrigger>
          <SelectContent>
            {presetThemes.map((theme) => (
              <SelectItem key={theme.name} value={theme.name}>
                {theme.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="colors">Colors</TabsTrigger>
          <TabsTrigger value="layout">Layout</TabsTrigger>
        </TabsList>

        <TabsContent value="colors" className="space-y-4">
          <div className="space-y-2">
            <Label>Background Color</Label>
            <ColorPicker
              value={style.backgroundColor}
              onChange={(value) => handleStyleChange("backgroundColor", value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Header Color</Label>
            <ColorPicker value={style.headerColor} onChange={(value) => handleStyleChange("headerColor", value)} />
          </div>

          <div className="space-y-2">
            <Label>Text Color</Label>
            <ColorPicker value={style.textColor} onChange={(value) => handleStyleChange("textColor", value)} />
          </div>

          <div className="space-y-2">
            <Label>Button Color</Label>
            <ColorPicker
              value={style.buttonColor}
              onChange={(value) => handleStyleChange("buttonColor", value)}
              presetColors={[
                { name: "Blue", value: "#3b82f6" },
                { name: "Green", value: "#10b981" },
                { name: "Red", value: "#ef4444" },
                { name: "Purple", value: "#8b5cf6" },
                { name: "Pink", value: "#ec4899" },
                { name: "Orange", value: "#f97316" },
                { name: "Teal", value: "#14b8a6" },
                { name: "Dark", value: "#0f172a" },
              ]}
            />
          </div>

          <div className="space-y-2">
            <Label>Border Color</Label>
            <ColorPicker value={style.borderColor} onChange={(value) => handleStyleChange("borderColor", value)} />
          </div>
        </TabsContent>

        <TabsContent value="layout" className="space-y-4">
          <div className="space-y-2">
            <Label>Border Radius</Label>
            <Select value={style.borderRadius} onValueChange={(value) => handleStyleChange("borderRadius", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select border radius" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="sm">Small</SelectItem>
                <SelectItem value="md">Medium</SelectItem>
                <SelectItem value="lg">Large</SelectItem>
                <SelectItem value="xl">Extra Large</SelectItem>
                <SelectItem value="full">Full (Rounded)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
