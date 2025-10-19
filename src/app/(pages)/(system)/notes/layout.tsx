"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { FileText, Plus } from "lucide-react";

export default function NotesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const tabs = [
    {
      label: "All Notes",
      href: "/notes",
      icon: FileText,
    },
    {
      label: "Add Note",
      href: "/notes/add",
      icon: Plus,
    },
  ];

  return (
    <div className="p-2">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Notes Management</h1>
          <p className="text-muted-foreground">
            View all notes and create new notes with file attachments
          </p>
        </div>
      </div>

      <div className="border-b border-border mb-6">
        <div className="flex gap-1">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;
            const Icon = tab.icon;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "relative px-6 py-3 text-sm font-medium transition-colors hover:text-foreground flex items-center gap-2",
                  isActive ? "text-foreground" : "text-muted-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {children}
    </div>
  );
}
