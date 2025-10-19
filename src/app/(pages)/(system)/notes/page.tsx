"use client";

import { useState } from "react";
import AllNotesTab from "./components/all-notes-tab";

export default function NotesPage() {
  const [refreshKey] = useState(0);

  return (
    <div className="mt-6">
      <AllNotesTab refreshKey={refreshKey} />
    </div>
  );
}
