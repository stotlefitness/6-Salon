import { createSupabaseServerClient, type SupabaseRole } from "./supabase-server";

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

export async function getStaffContext(): Promise<StaffContextValue | null> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }
  const email = user.email ?? null;

  const { data: staff, error: staffError } = await supabase
    .from("staff_users")
    .select("id, salon_id, role, display_name")
    .eq("user_id", user.id)
    .single();

  if (staffError || !staff) {
    return null;
  }

  return {
    user: { id: user.id, email },
    userId: user.id,
    email,
    role: staff.role as SupabaseRole,
    salonId: staff.salon_id,
    staffId: staff.id,
    displayName: staff.display_name,
  };
}

export async function requireStaffContext(): Promise<StaffContextValue> {
  const context = await getStaffContext();
  if (!context) {
    throw new Error("Unauthorized");
  }
  return context;
}

export { StaffProvider, useStaff } from "./staff-context.client";
