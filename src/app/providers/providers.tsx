"use client";

import { NotificationsProvider } from "./notification/provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NotificationsProvider duration={3000}>{children}</NotificationsProvider>
  );
}
