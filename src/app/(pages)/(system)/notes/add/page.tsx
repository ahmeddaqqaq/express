"use client";

import { useRouter } from "next/navigation";
import AddNoteTab from "../components/add-note-tab";

export default function AddNotePage() {
  const router = useRouter();

  const handleNoteCreated = () => {
    router.push("/notes");
  };

  return (
    <div className="mt-6">
      <AddNoteTab onNoteCreated={handleNoteCreated} />
    </div>
  );
}
