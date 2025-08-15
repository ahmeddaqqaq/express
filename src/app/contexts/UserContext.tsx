"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { AuthService, UserInfoResponse } from "../../../client";

export type UserRole = "ADMIN" | "SUPERVISOR";

export interface User {
  id: string;
  name: string;
  mobileNumber: string;
  role: UserRole;
  isActive: boolean;
}

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSupervisor: boolean;
  refetchUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = async () => {
    try {
      console.log('Fetching user data...');
      const response: UserInfoResponse = await AuthService.authControllerGetCurrentUser();
      console.log('User API response:', response);
      
      // Map API response to our User interface
      const userData: User = {
        id: response.userId,
        name: response.name,
        mobileNumber: response.mobileNumber,
        role: response.role as UserRole,
        isActive: response.isActive,
      };
      
      console.log('Mapped user data:', userData);
      setUser(userData);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const value: UserContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN',
    isSupervisor: user?.role === 'SUPERVISOR',
    refetchUser: fetchUser,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}