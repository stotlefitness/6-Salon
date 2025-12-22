import { createSupabaseServerClient, createSupabaseServiceRoleClient } from "./supabase-server";
import type { StaffContextValue, SupabaseRole } from "./staff-context.client";

export type { StaffContextValue, SupabaseRole };

export async function getStaffContext(): Promise<StaffContextValue | null> {
  try {
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("[getStaffContext] Auth error:", {
        error: userError?.message,
        code: userError?.code,
        hasUser: !!user,
      });
      return null;
    }

    console.log("[getStaffContext] User found:", {
      userId: user.id,
      email: user.email,
    });

    const email = user.email ?? null;

    // Use service role client to bypass RLS for staff_users lookup
    // This is necessary because the RLS policy requires checking staff_users to read staff_users (circular dependency)
    const serviceClient = createSupabaseServiceRoleClient();
    const { data: staff, error: staffError } = await serviceClient
      .from("staff_users")
      .select("id, salon_id, role, display_name")
      .eq("user_id", user.id)
      .single();

    if (staffError || !staff) {
      console.error("[getStaffContext] Staff lookup failed:", {
        userId: user.id,
        error: staffError?.message,
        code: staffError?.code,
        details: staffError?.details,
        hint: staffError?.hint,
      });
      return null;
    }

    console.log("[getStaffContext] Staff found:", {
      staffId: staff.id,
      role: staff.role,
      salonId: staff.salon_id,
    });

    return {
      user: { id: user.id, email },
      userId: user.id,
      email,
      role: staff.role as SupabaseRole,
      salonId: staff.salon_id,
      staffId: staff.id,
      displayName: staff.display_name,
    };
  } catch (err) {
    console.error("[getStaffContext] Unexpected error:", err);
    return null;
  }
}

export async function requireStaffContext(): Promise<StaffContextValue> {
  const context = await getStaffContext();
  if (!context) {
    throw new Error("Unauthorized");
  }
  return context;
}

export { StaffProvider, useStaff } from "./staff-context.client";



