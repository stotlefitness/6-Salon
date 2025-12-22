import { redirect } from "next/navigation";
import { StaffProvider, getStaffContext } from "@/lib/staff-context";
import AdminNav from "./AdminNav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const staff = await getStaffContext();

  if (!staff) {
    if (process.env.NODE_ENV === "development") {
      console.log("[AdminLayout] No staff context, redirecting to login");
    }
    redirect("/login");
  }

  return (
    <StaffProvider value={staff}>
      <div className="min-h-screen bg-zinc-50 text-zinc-900">
        <AdminNav />
        <div className="min-h-[calc(100vh-56px)]">{children}</div>
      </div>
    </StaffProvider>
  );
}
