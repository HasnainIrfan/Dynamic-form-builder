"use client";

import type React from "react";

import { useState, useRef } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { v4 as uuidv4 } from "uuid";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Trash2,
  Settings,
  Eye,
  Database,
  MoveVertical,
  PlusCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import FieldToolbar from "./field-toolbar";
import FormPreview from "./form-preview";
import FieldSettings from "./field-settings";
import FormDataDisplay from "./form-data-display";
import FormDataModal from "./form-data-modal";
import FormSubmissionsDisplay from "./form-submissions-display";
import FormStyleSettings from "./form-style-settings";
import { ThemeToggle } from "./theme-toggle";
import type {
  FormField,
  Section,
  FormSubmission,
  FormStyle,
} from "@/lib/types";
import { Input } from "@/components/ui/input";

export default function FormBuilder() {
  const { toast } = useToast();
  const [formTitle, setFormTitle] = useState("Untitled Form");
  const [activeTab, setActiveTab] = useState("build");
  const [formFields, setFormFields] = useState<(FormField | Section)[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [formSubmissions, setFormSubmissions] = useState<FormSubmission[]>([]);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<
    string | null
  >(null);
  const [selectedDataKey, setSelectedDataKey] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [menuSectionId, setMenuSectionId] = useState<string | null>(null);
  const [activeDataTab, setActiveDataTab] = useState<"current" | "all">("all");
  const [activeSidebarTab, setActiveSidebarTab] = useState<
    "fields" | "settings" | "style"
  >("fields");
  const [formStyle, setFormStyle] = useState<FormStyle>({
    backgroundColor: "#ffffff",
    headerColor: "#000000",
    textColor: "#000000",
    buttonColor: "#0f172a",
    borderColor: "#e2e8f0",
    borderRadius: "md",
  });

  /**
   * Add a new field to the form
   */
  const addField = (type: string) => {
    const newField: FormField = {
      id: uuidv4(),
      type,
      label: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      placeholder: `Enter ${type}`,
      required: false,
      options:
        type === "dropdown" || type === "radio" || type === "checkbox"
          ? [
              { id: uuidv4(), label: "Option 1", value: "option1" },
              { id: uuidv4(), label: "Option 2", value: "option2" },
            ]
          : [],
      validation: {
        required: false,
        pattern: type === "phone" ? "^\\+[0-9]{1,3} [0-9]{4,14}$" : null,
        minLength: null,
        maxLength: null,
      },
      conditionalLogic: null,
    };

    setFormFields([...formFields, newField]);
    setSelectedFieldId(newField.id);

    toast({
      title: "Field Added",
      description: `Added a new ${type} field to your form.`,
    });
  };

  /**
   * Add a new section to the form
   */
  const addSection = () => {
    const newSection: Section = {
      id: uuidv4(),
      type: "section",
      label: "New Section",
      fields: [],
      required: false,
      conditionalLogic: null,
    };

    setFormFields([...formFields, newSection]);
    setSelectedFieldId(newSection.id);

    toast({
      title: "Section Added",
      description: "Added a new section to your form.",
    });
  };

  /**
   * Update a field or section
   */
  const updateField = (updatedField: FormField | Section) => {
    // Handle updating fields at the root level
    const updatedFields = formFields.map((field) => {
      if (field.id === updatedField.id) {
        return updatedField;
      }

      // Check if the field is in a section
      if (field.type === "section") {
        const updatedSectionFields = (field as Section).fields.map(
          (sectionField) =>
            sectionField.id === updatedField.id ? updatedField : sectionField
        );

        return {
          ...field,
          fields: updatedSectionFields,
        };
      }

      return field;
    });

    setFormFields(updatedFields);

    toast({
      title: "Field Updated",
      description: `Updated "${updatedField.label}" settings.`,
      variant: "default",
    });
  };

  /**
   * Delete a field or section
   */
  const deleteField = (id: string) => {
    // Get the field name before deletion
    let fieldName = "field";

    // Find the field at root level
    const rootField = formFields.find((f) => f.id === id);
    if (rootField) {
      fieldName = rootField.label;
    } else {
      // Look in sections
      formFields.forEach((field) => {
        if (field.type === "section") {
          const sectionField = (field as Section).fields.find(
            (f) => f.id === id
          );
          if (sectionField) {
            fieldName = sectionField.label;
          }
        }
      });
    }

    // First check if the field is at the root level
    const fieldAtRoot = formFields.some((field) => field.id === id);

    if (fieldAtRoot) {
      setFormFields(formFields.filter((field) => field.id !== id));
    } else {
      // The field must be in a section, so update the sections
      const updatedFields = formFields.map((field) => {
        if (field.type === "section") {
          return {
            ...field,
            fields: (field as Section).fields.filter(
              (sectionField) => sectionField.id !== id
            ),
          };
        }
        return field;
      });

      setFormFields(updatedFields);
    }

    if (selectedFieldId === id) {
      setSelectedFieldId(null);
    }

    toast({
      title: "Field Deleted",
      description: `Deleted "${fieldName}" from your form.`,
      variant: "destructive",
    });
  };

  /**
   * Handle drag and drop reordering
   */
  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(formFields);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setFormFields(items);
  };

  /**
   * Update form data from the preview
   */
  const handleFormDataChange = (data: Record<string, any>) => {
    setFormData(data);
  };

  /**
   * Handle form submission
   */
  const handleFormSubmit = (data: Record<string, any>) => {
    // Create a new submission with timestamp and ID
    const newSubmission: FormSubmission = {
      id: uuidv4(),
      timestamp: new Date(),
      data: { ...data },
    };

    // Add to submissions list
    setFormSubmissions([newSubmission, ...formSubmissions]);

    // Select the new submission
    setSelectedSubmissionId(newSubmission.id);

    // Switch to the "all" tab to show all submissions
    setActiveDataTab("all");

    toast({
      title: "Form Submitted Successfully",
      description: "Your form data has been submitted and saved.",
    });
  };

  /**
   * Add a field to a section
   */
  const addFieldToSection = (sectionId: string, fieldType: string) => {
    const newField: FormField = {
      id: uuidv4(),
      type: fieldType,
      label: `New ${fieldType.charAt(0).toUpperCase() + fieldType.slice(1)}`,
      placeholder: `Enter ${fieldType}`,
      required: false,
      options:
        fieldType === "dropdown" ||
        fieldType === "radio" ||
        fieldType === "checkbox"
          ? [
              { id: uuidv4(), label: "Option 1", value: "option1" },
              { id: uuidv4(), label: "Option 2", value: "option2" },
            ]
          : [],
      validation: {
        required: false,
        pattern: fieldType === "phone" ? "^\\+[0-9]{1,3} [0-9]{4,14}$" : null,
        minLength: null,
        maxLength: null,
      },
      conditionalLogic: null,
    };

    const updatedFields = formFields.map((field) => {
      if (field.id === sectionId && field.type === "section") {
        return {
          ...field,
          fields: [...(field as Section).fields, newField],
        };
      }
      return field;
    });

    setFormFields(updatedFields);
    setSelectedFieldId(newField.id);
    closeFieldMenu();
  };

  /**
   * Open the field menu for a section
   */
  const openFieldMenu = (e: React.MouseEvent, sectionId: string) => {
    e.stopPropagation();
    e.preventDefault();

    // Close any existing menu first
    closeFieldMenu();

    // Set the position and section ID for the menu
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPosition({
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX,
    });

    setMenuSectionId(sectionId);
    setMenuOpen(true);
  };

  /**
   * Close the field menu
   */
  const closeFieldMenu = () => {
    setMenuOpen(false);
    setMenuSectionId(null);
  };

  /**
   * Get the selected field or section
   */
  const getSelectedField = () => {
    // First check at the root level
    const rootField = formFields.find((f) => f.id === selectedFieldId);
    if (rootField) return rootField;

    // Then check in sections
    for (const field of formFields) {
      if (field.type === "section") {
        const sectionField = (field as Section).fields.find(
          (f) => f.id === selectedFieldId
        );
        if (sectionField) return sectionField;
      }
    }

    return null;
  };

  /**
   * Get the currently selected submission
   */
  const getSelectedSubmission = () => {
    if (!selectedSubmissionId) return null;
    return (
      formSubmissions.find(
        (submission) => submission.id === selectedSubmissionId
      ) || null
    );
  };

  /**
   * Handle viewing a specific data field from a submission
   */
  const handleViewSubmissionField = (
    submissionId: string,
    fieldKey: string
  ) => {
    setSelectedSubmissionId(submissionId);
    setSelectedDataKey(fieldKey);
  };

  /**
   * Delete a submission
   */
  const deleteSubmission = (submissionId: string) => {
    setFormSubmissions(
      formSubmissions.filter((submission) => submission.id !== submissionId)
    );

    if (selectedSubmissionId === submissionId) {
      setSelectedSubmissionId(null);
      setSelectedDataKey(null);
    }

    toast({
      title: "Submission Deleted",
      description: "The form submission has been deleted.",
      variant: "destructive",
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-9">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Form Builder</h1>
          <div className="bg-background p-2 rounded-full shadow-sm">
            <ThemeToggle />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="build" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span>Build</span>
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              <span>Preview</span>
            </TabsTrigger>
            <TabsTrigger value="data" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              <span>Data</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="build" className="space-y-4">
            <Card className="shadow-sm">
              <CardContent className="p-6">
                <Input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full text-2xl font-bold border-none focus:outline-none focus:ring-0 p-0 mb-4"
                />

                <DragDropContext onDragEnd={onDragEnd}>
                  <Droppable droppableId="form-fields">
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="space-y-4 min-h-[200px]"
                      >
                        {formFields.length === 0 && (
                          <div className="text-center py-12 border-2 border-dashed rounded-lg bg-gray-50 dark:bg-gray-900">
                            <h6 className="text-muted-foreground">
                              Use the toolbar to add fields
                            </h6>
                          </div>
                        )}

                        {formFields.map((field, index) => (
                          <Draggable
                            key={field.id}
                            draggableId={field.id}
                            index={index}
                          >
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`border rounded-lg p-4 ${
                                  selectedFieldId === field.id
                                    ? "ring-2 ring-primary"
                                    : ""
                                } bg-white dark:bg-gray-800 shadow-sm hover:shadow transition-shadow`}
                                onClick={() => setSelectedFieldId(field.id)}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <div
                                      {...provided.dragHandleProps}
                                      className="cursor-grab"
                                    >
                                      <MoveVertical className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                    <span className="font-medium">
                                      {field.label}
                                    </span>
                                    <span className="text-xs text-muted-foreground bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                      {field.type}
                                    </span>
                                    {field.type === "section" &&
                                      field.required && (
                                        <span className="text-xs text-white bg-red-500 px-2 py-1 rounded">
                                          Required
                                        </span>
                                      )}
                                    {"validation" in field &&
                                      field.validation.required && (
                                        <span className="text-xs text-white bg-red-500 px-2 py-1 rounded">
                                          Required
                                        </span>
                                      )}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    {field.type === "section" && (
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={(e) =>
                                          openFieldMenu(e, field.id)
                                        }
                                      >
                                        <PlusCircle className="h-4 w-4" />
                                      </Button>
                                    )}
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        deleteField(field.id);
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>

                                {field.type === "section" && (
                                  <div className="mt-2 pl-6 border-l-2 border-gray-200 dark:border-gray-700">
                                    {(field as Section).fields.length === 0 ? (
                                      <h6 className="text-sm text-muted-foreground py-2">
                                        No fields in this section. Click + to
                                        add fields.
                                      </h6>
                                    ) : (
                                      <div className="space-y-2">
                                        {(field as Section).fields.map(
                                          (subField) => (
                                            <div
                                              key={subField.id}
                                              className={`border rounded-lg p-3 ${
                                                selectedFieldId === subField.id
                                                  ? "ring-2 ring-primary"
                                                  : ""
                                              } bg-white dark:bg-gray-800`}
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedFieldId(subField.id);
                                              }}
                                            >
                                              <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                  <span className="font-medium">
                                                    {subField.label}
                                                  </span>
                                                  <span className="text-xs text-muted-foreground bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                                    {subField.type}
                                                  </span>
                                                  {"validation" in subField &&
                                                    subField.validation
                                                      .required && (
                                                      <span className="text-xs text-white bg-red-500 px-2 py-1 rounded">
                                                        Required
                                                      </span>
                                                    )}
                                                </div>
                                                <Button
                                                  variant="ghost"
                                                  size="icon"
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteField(subField.id);
                                                  }}
                                                >
                                                  <Trash2 className="h-4 w-4" />
                                                </Button>
                                              </div>
                                            </div>
                                          )
                                        )}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preview">
            <Card className="shadow-sm">
              <CardContent
                className="p-6"
                style={{
                  backgroundColor: formStyle.backgroundColor,
                  color: formStyle.textColor,
                  borderColor: formStyle.borderColor,
                }}
              >
                <h2
                  className="text-2xl font-bold mb-6"
                  style={{ color: formStyle.headerColor }}
                >
                  {formTitle}
                </h2>
                <FormPreview
                  fields={formFields}
                  onDataChange={handleFormDataChange}
                  onSubmit={handleFormSubmit}
                  submittedData={getSelectedSubmission()?.data || null}
                  style={formStyle}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="data">
            <Card className="shadow-sm">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-6">Form Data</h2>

                <Tabs
                  value={activeDataTab}
                  onValueChange={(value) =>
                    setActiveDataTab(value as "current" | "all")
                  }
                  className="w-full"
                >
                  <TabsList className="grid grid-cols-2 mb-4">
                    <TabsTrigger
                      value="all"
                      className="flex items-center gap-2"
                    >
                      <Database className="h-4 w-4" />
                      <span>All Submissions ({formSubmissions.length})</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="current"
                      className="flex items-center gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      <span>Current Submission</span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="all">
                    <FormSubmissionsDisplay
                      submissions={formSubmissions}
                      selectedSubmissionId={selectedSubmissionId}
                      onSelectSubmission={setSelectedSubmissionId}
                      onViewField={handleViewSubmissionField}
                      onDeleteSubmission={deleteSubmission}
                    />
                  </TabsContent>

                  <TabsContent value="current">
                    <FormDataDisplay
                      data={getSelectedSubmission()?.data || {}}
                      onRowClick={(key) => setSelectedDataKey(key)}
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <div className="lg:col-span-3">
        <Card className="sticky top-4 shadow-sm">
          <CardContent className="p-4">
            {activeTab === "build" ? (
              <>
                <Tabs
                  value={activeSidebarTab}
                  onValueChange={(value) => setActiveSidebarTab(value as any)}
                  className="w-full"
                >
                  <TabsList className="grid grid-cols-3 mb-4">
                    <TabsTrigger value="fields" className="text-xs">
                      Fields
                    </TabsTrigger>
                    <TabsTrigger value="settings" className="text-xs">
                      Settings
                    </TabsTrigger>
                    <TabsTrigger value="style" className="text-xs">
                      Style
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="fields">
                    <h3 className="font-medium mb-4">Add Fields</h3>
                    <FieldToolbar
                      onAddField={addField}
                      onAddSection={addSection}
                    />
                  </TabsContent>

                  <TabsContent value="settings">
                    <h3 className="font-medium mb-4">Field Settings</h3>
                    <ScrollArea className="h-[500px] pr-4">
                      {selectedFieldId && getSelectedField() ? (
                        <FieldSettings
                          field={getSelectedField()!}
                          onUpdate={updateField}
                        />
                      ) : (
                        <h6 className="text-muted-foreground text-sm">
                          Select a field to edit its properties
                        </h6>
                      )}
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="style">
                    <h3 className="font-medium mb-4">Form Style</h3>
                    <ScrollArea className="h-[500px] pr-4">
                      <FormStyleSettings
                        style={formStyle}
                        onStyleChange={setFormStyle}
                      />
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              </>
            ) : (
              <div className="py-4">
                <Button
                  onClick={() => setActiveTab("build")}
                  className="w-full"
                >
                  Back to Editor
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Field Menu for Sections */}
      {menuOpen && menuSectionId && (
        <div
          ref={menuRef}
          className="fixed z-50 bg-white dark:bg-gray-800 shadow-md rounded-md p-2 border"
          style={{
            top: `${menuPosition.top}px`,
            left: `${menuPosition.left}px`,
          }}
        >
          <div className="p-2 font-medium text-sm border-b mb-1">
            Add Field to Section
          </div>
          {[
            "text",
            "dropdown",
            "checkbox",
            "radio",
            "date",
            "phone",
            "country",
            "file",
            "email",
          ].map((type) => (
            <button
              key={type}
              className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              onClick={() => addFieldToSection(menuSectionId, type)}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      )}

      {/* Overlay to close the menu when clicking outside */}
      {menuOpen && (
        <div className="fixed inset-0 z-40" onClick={closeFieldMenu} />
      )}

      {/* Modal for displaying detailed form data */}
      {selectedDataKey && selectedSubmissionId && (
        <FormDataModal
          isOpen={!!selectedDataKey}
          onClose={() => setSelectedDataKey(null)}
          dataKey={selectedDataKey}
          value={
            formSubmissions.find((s) => s.id === selectedSubmissionId)?.data?.[
              selectedDataKey
            ]
          }
        />
      )}
    </div>
  );
}
