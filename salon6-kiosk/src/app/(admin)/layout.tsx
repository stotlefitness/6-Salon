import { redirect } from "next/navigation";
import { StaffProvider, getStaffContext } from "@/lib/staff-context";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const staff = await getStaffContext();

  if (!staff) {
    redirect("/login");
  }

  return <StaffProvider value={staff}>{children}</StaffProvider>;
}


