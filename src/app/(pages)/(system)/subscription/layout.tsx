"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function SubscriptionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const tabs = [
    {
      label: "Subscriptions",
      href: "/subscription",
    },
    {
      label: "QR Codes",
      href: "/subscription/qr-codes",
    },
    {
      label: "Customer Subscription",
      href: "/subscription/customer-subscription",
    },
  ];

  return (
    <div className="p-2">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Subscription Management</h1>
          <p className="text-muted-foreground">
            Manage subscription plans, QR codes, and customer subscriptions
          </p>
        </div>
      </div>

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
