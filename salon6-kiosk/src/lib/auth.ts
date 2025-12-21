import {
  getStaffContext,
  requireStaffContext,
  type StaffContextValue,
} from "./staff-context";

export type StaffSession = StaffContextValue;
export const getStaffSession = getStaffContext;
export const requireStaffSession = requireStaffContext;

