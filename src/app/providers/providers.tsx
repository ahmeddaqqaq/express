"use client";

import { NotificationsProvider } from "./notification/provider";
import { UserProvider } from "../contexts/UserContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <NotificationsProvider duration={3000}>{children}</NotificationsProvider>
    </UserProvider>
  );
}
