export type StaffSession = {
  userId: string;
  role: "owner" | "manager" | "staff";
};

export async function requireStaffSession(): Promise<StaffSession> {
  // TODO: implement Supabase auth lookup + role enforcement.
  throw new Error("Staff authentication not implemented yet");
}


