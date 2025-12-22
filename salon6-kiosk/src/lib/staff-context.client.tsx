"use client";

import { createContext, useContext } from "react";
import type { ReactNode } from "react";

export type SupabaseRole = "owner" | "manager" | "stylist" | "frontdesk";

export type StaffContextValue = {
  user: {
    id: string;
    email: string | null;
  };
  userId: string;
  email: string | null;
  role: SupabaseRole;
  salonId: string;
  staffId: string;
  displayName: string;
};

const StaffContext = createContext<StaffContextValue | null>(null);

type ProviderProps = {
  value: StaffContextValue;
  children: ReactNode;
};

export function StaffProvider({ value, children }: ProviderProps) {
  return <StaffContext.Provider value={value}>{children}</StaffContext.Provider>;
}

export function useStaff() {
  const ctx = useContext(StaffContext);
  if (!ctx) {
    throw new Error("useStaff must be used within a StaffProvider");
  }
  return ctx;
}



