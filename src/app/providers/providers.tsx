"use client";

import { NotificationsProvider } from "./notification/provider";
import { UserProvider } from "../contexts/UserContext";
import { Toaster } from "@/components/ui/sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <NotificationsProvider duration={3000}>
        {children}
        <Toaster />
      </NotificationsProvider>
    </UserProvider>
  );
}
