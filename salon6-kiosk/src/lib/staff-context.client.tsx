"use client";

import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import type { StaffContextValue } from "./staff-context";

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


