"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, FileText } from "lucide-react";
import AllNotesTab from "./components/all-notes-tab";
import AddNoteTab from "./components/add-note-tab";

export default function NotesPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleNoteCreated = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Notes Management</h1>
          <p className="text-muted-foreground">
            View all notes and create new notes with file attachments
          </p>
        </div>
      </div>

      <Tabs defaultValue="all-notes" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="all-notes" className="gap-2">
            <FileText className="h-4 w-4" />
            All Notes
          </TabsTrigger>
          <TabsTrigger value="add-note" className="gap-2">
            <Plus className="h-4 w-4" />
            Add Note
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all-notes">
          <div className="mt-6">
            <AllNotesTab refreshKey={refreshKey} />
          </div>
        </TabsContent>

        <TabsContent value="add-note">
          <div className="mt-6">
            <AddNoteTab onNoteCreated={handleNoteCreated} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}