"use client"

import type React from "react"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Copy, Check, Info, FileText, Calendar, Phone, Mail, Globe } from "lucide-react"
import { useState } from "react"

interface FormDataModalProps {
  isOpen: boolean
  onClose: () => void
  dataKey: string
  value: any
}

export default function FormDataModal({ isOpen, onClose, dataKey, value }: FormDataModalProps) {
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState("formatted")

  /**
   * Copy value to clipboard
   */
  const copyToClipboard = () => {
    let textToCopy = ""

    if (value === null || value === undefined) {
      textToCopy = ""
    } else if (typeof value === "object" && !(value instanceof Date) && !(value instanceof File)) {
      textToCopy = JSON.stringify(value, null, 2)
    } else {
      textToCopy = String(value)
    }

    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  /**
   * Get icon based on value type
   */
  const getValueIcon = () => {
    if (value instanceof Date) {
      return <Calendar className="h-5 w-5 text-blue-500" />
    }

    if (value instanceof File) {
      return <FileText className="h-5 w-5 text-purple-500" />
    }

    if (typeof value === "string") {
      if (value.startsWith("+")) {
        return <Phone className="h-5 w-5 text-pink-500" />
      }

      if (value.includes("@")) {
        return <Mail className="h-5 w-5 text-green-500" />
      }

      if (countries.some((c) => c.code === value)) {
        return <Globe className="h-5 w-5 text-cyan-500" />
      }
    }

    return <Info className="h-5 w-5 text-gray-500" />
  }

  /**
   * Format a value for detailed display
   */
  const formatDetailedValue = (value: any): React.ReactNode => {
    if (value === null || value === undefined) {
      return <span className="text-muted-foreground">No value provided</span>
    }

    if (value instanceof Date) {
      return (
        <div className="space-y-3">
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm font-medium">Date Information</CardTitle>
            </CardHeader>
            <CardContent className="py-2">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="font-medium">Date:</div>
                <div>{format(value, "PPP")}</div>
                <div className="font-medium">Day:</div>
                <div>{format(value, "EEEE")}</div>
                <div className="font-medium">Time:</div>
                <div>{format(value, "p")}</div>
                <div className="font-medium">ISO:</div>
                <div className="font-mono text-xs break-all">{value.toISOString()}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    if (value instanceof File) {
      return (
        <div className="space-y-3">
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm font-medium">File Information</CardTitle>
            </CardHeader>
            <CardContent className="py-2">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="font-medium">Name:</div>
                <div>{value.name}</div>
                <div className="font-medium">Size:</div>
                <div>{(value.size / 1024).toFixed(2)} KB</div>
                <div className="font-medium">Type:</div>
                <div>{value.type || "Unknown"}</div>
                <div className="font-medium">Last Modified:</div>
                <div>{new Date(value.lastModified).toLocaleString()}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    if (typeof value === "boolean") {
      return (
        <div className="space-y-3">
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm font-medium">Boolean Value</CardTitle>
            </CardHeader>
            <CardContent className="py-2">
              <div className="text-center py-4">
                <Badge
                  className={
                    value
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 text-lg py-2 px-4"
                      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 text-lg py-2 px-4"
                  }
                >
                  {value ? "TRUE" : "FALSE"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    if (typeof value === "object") {
      return (
        <div className="space-y-3">
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm font-medium">Object Data</CardTitle>
            </CardHeader>
            <CardContent className="py-2">
              <pre className="bg-gray-100 dark:bg-gray-900 p-3 rounded overflow-auto text-sm font-mono">
                {JSON.stringify(value, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </div>
      )
    }

    if (typeof value === "string" && value.startsWith("+")) {
      // Phone number
      return (
        <div className="space-y-3">
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm font-medium">Phone Number</CardTitle>
            </CardHeader>
            <CardContent className="py-2">
              <div className="text-center py-2 text-xl font-medium">{value}</div>
              <div className="flex justify-center mt-2">
                <a
                  href={`tel:${value.replace(/\s/g, "")}`}
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                >
                  <Phone className="mr-2 h-4 w-4" /> Call this number
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    if (typeof value === "string" && value.includes("@")) {
      // Possible email
      return (
        <div className="space-y-3">
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm font-medium">Email Address</CardTitle>
            </CardHeader>
            <CardContent className="py-2">
              <div className="text-center py-2 text-xl font-medium break-all">{value}</div>
              <div className="flex justify-center mt-2">
                <a
                  href={`mailto:${value}`}
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                >
                  <Mail className="mr-2 h-4 w-4" /> Send email
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    // For country codes
    if (typeof value === "string" && countries.some((c) => c.code === value)) {
      const country = countries.find((c) => c.code === value)
      if (country) {
        return (
          <div className="space-y-3">
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm font-medium">Country Information</CardTitle>
              </CardHeader>
              <CardContent className="py-2">
                <div className="text-center py-2">
                  <div className="text-4xl mb-2">{country.flag}</div>
                  <div className="text-xl font-medium">{country.name}</div>
                  <div className="text-sm text-muted-foreground mt-1">Code: {country.code}</div>
                  <div className="text-sm text-muted-foreground">Dial Code: {country.dial_code}</div>
                </div>
              </CardContent>
            </Card>
          </div>
        )
      }
    }

    return (
      <div className="space-y-3">
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium">Text Value</CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-md break-words">{String(value)}</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  /**
   * Get the type of a value
   */
  const getValueType = (value: any): string => {
    if (value === null || value === undefined) {
      return "Empty"
    }

    if (value instanceof Date) {
      return "Date"
    }

    if (value instanceof File) {
      return "File"
    }

    if (typeof value === "boolean") {
      return "Boolean"
    }

    if (typeof value === "object") {
      return "Object"
    }

    if (typeof value === "number") {
      return "Number"
    }

    if (typeof value === "string") {
      if (value.startsWith("+")) {
        return "Phone Number"
      }
      if (value.includes("@")) {
        return "Email"
      }
      if (countries.some((c) => c.code === value)) {
        return "Country"
      }
    }

    return "Text"
  }

  /**
   * Get raw value representation
   */
  const getRawValue = (value: any): string => {
    if (value === null || value === undefined) {
      return "null"
    }

    if (value instanceof Date) {
      return value.toISOString()
    }

    if (value instanceof File) {
      return `File: ${value.name} (${value.size} bytes)`
    }

    if (typeof value === "object") {
      return JSON.stringify(value, null, 2)
    }

    return String(value)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            {getValueIcon()}
            <div>
              <DialogTitle className="text-xl">{dataKey}</DialogTitle>
              <h6 className="text-sm text-muted-foreground mt-1">
                Type: <Badge variant="outline">{getValueType(value)}</Badge>
              </h6>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={copyToClipboard}>
            {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
            {copied ? "Copied" : "Copy"}
          </Button>
        </DialogHeader>

        <Tabs
          defaultValue="formatted"
          className="flex-1 overflow-hidden flex flex-col"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList className="mx-auto mb-4">
            <TabsTrigger value="formatted">Formatted</TabsTrigger>
            <TabsTrigger value="raw">Raw</TabsTrigger>
          </TabsList>

          <TabsContent value="formatted" className="flex-1 overflow-hidden">
            <ScrollArea className="h-[400px]">
              <div className="p-1">{formatDetailedValue(value)}</div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="raw" className="flex-1 overflow-hidden">
            <ScrollArea className="h-[400px]">
              <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-md font-mono text-sm whitespace-pre-wrap break-all">
                {getRawValue(value)}
              </pre>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-4">
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Import countries for country code detection
import { countries } from "@/lib/countries"
