"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, Trash2, ChevronDown, ChevronRight, Calendar, Clock } from "lucide-react"
import { format } from "date-fns"
import type { FormSubmission } from "@/lib/types"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface FormSubmissionsDisplayProps {
  submissions: FormSubmission[]
  selectedSubmissionId: string | null
  onSelectSubmission: (id: string) => void
  onViewField: (submissionId: string, fieldKey: string) => void
  onDeleteSubmission: (id: string) => void
}

export default function FormSubmissionsDisplay({
  submissions,
  selectedSubmissionId,
  onSelectSubmission,
  onViewField,
  onDeleteSubmission,
}: FormSubmissionsDisplayProps) {
  const [expandedSubmissions, setExpandedSubmissions] = useState<Record<string, boolean>>({})
  const [submissionToDelete, setSubmissionToDelete] = useState<string | null>(null)

  /**
   * Toggle the expanded state of a submission
   */
  const toggleSubmission = (id: string) => {
    setExpandedSubmissions((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  /**
   * Format a value for display in the table
   */
  const formatValue = (value: any): string => {
    if (value === null || value === undefined) {
      return "N/A"
    }

    if (value instanceof Date) {
      return format(value, "PPP")
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

  /**
   * Get the number of fields in a submission
   */
  const getFieldCount = (submission: FormSubmission): number => {
    return Object.keys(submission.data).length
  }

  /**
   * Confirm deletion of a submission
   */
  const confirmDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setSubmissionToDelete(id)
  }

  /**
   * Handle deletion of a submission
   */
  const handleDelete = () => {
    if (submissionToDelete) {
      onDeleteSubmission(submissionToDelete)
      setSubmissionToDelete(null)
    }
  }

  /**
   * Cancel deletion of a submission
   */
  const cancelDelete = () => {
    setSubmissionToDelete(null)
  }

  return (
    <Card className="shadow-sm">
      <CardContent className="p-4">
        {submissions.length === 0 ? (
          <div className="text-muted-foreground text-center py-12 border-2 border-dashed rounded-lg">
            <h6>No form submissions available.</h6>
            <h6 className="text-sm mt-2">Submit the form in the Preview tab to see data here.</h6>
          </div>
        ) : (
          <ScrollArea className="h-[600px]">
            <div className="space-y-4 p-1">
              {submissions.map((submission) => (
                <Collapsible
                  key={submission.id}
                  open={expandedSubmissions[submission.id] || submission.id === selectedSubmissionId}
                  onOpenChange={() => toggleSubmission(submission.id)}
                  className={`border rounded-lg overflow-hidden ${
                    submission.id === selectedSubmissionId ? "ring-2 ring-primary" : ""
                  }`}
                >
                  <div
                    className={`flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900`}
                    onClick={() => onSelectSubmission(submission.id)}
                  >
                    <div className="flex items-center gap-3">
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                          {expandedSubmissions[submission.id] ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                      </CollapsibleTrigger>
                      <div>
                        <div className="font-medium">
                          Submission #{submissions.length - submissions.indexOf(submission)}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{format(submission.timestamp, "PPP")}</span>
                          <Clock className="h-3 w-3 ml-2" />
                          <span>{format(submission.timestamp, "p")}</span>
                        </div>
                      </div>
                      <Badge className="ml-2">{getFieldCount(submission)} fields</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleSubmission(submission.id)
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={(e) => confirmDelete(submission.id, e)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <CollapsibleContent>
                    <div className="border-t">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[30%]">Field</TableHead>
                            <TableHead className="w-[50%]">Value</TableHead>
                            <TableHead className="w-[10%]">Type</TableHead>
                            <TableHead className="w-[10%]">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {Object.entries(submission.data).map(([key, value]) => (
                            <TableRow key={key}>
                              <TableCell className="font-medium">{key}</TableCell>
                              <TableCell className="break-words">{formatValue(value)}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className={`text-xs ${getBadgeColor(getValueType(value))}`}>
                                  {getValueType(value)}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Button variant="ghost" size="icon" onClick={() => onViewField(submission.id, key)}>
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>

      <AlertDialog open={!!submissionToDelete} onOpenChange={(open) => !open && cancelDelete()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Submission</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this submission? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
