"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const tabs = [
    {
      label: "Technicians",
      href: "/settings",
    },
    {
      label: "Services",
      href: "/settings/services",
    },
    {
      label: "Add-Ons",
      href: "/settings/add-ons",
    },
    {
      label: "Users",
      href: "/settings/users",
    },
    {
      label: "Sales",
      href: "/settings/sales",
    },
  ];

  return (
    <div className="p-2">
      <h1 className="text-2xl font-bold mb-8">Admin Settings</h1>

      <div className="border-b border-border mb-6">
        <div className="flex gap-1">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "relative px-6 py-3 text-sm font-medium transition-colors hover:text-foreground",
                  isActive ? "text-foreground" : "text-muted-foreground"
                )}
              >
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
