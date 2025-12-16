"use client";

import { useStaff } from "@/lib/staff-context";

export default function CatalogServicesPage() {
  const staff = useStaff();
  const canEdit = staff.role === "owner" || staff.role === "manager";

  return (
    <main className="flex min-h-screen flex-col gap-4 bg-white p-8 text-zinc-900">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Admin</p>
        <h1 className="text-3xl font-semibold">Services</h1>
        <p className="text-sm text-zinc-600">
          Manage services with name, duration, price, and category. Scoped to
          your salon via RLS.
        </p>
      </div>

      {!canEdit ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Only owners/managers can edit services. Ask a manager to update the
          catalog.
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-6 text-sm text-zinc-700">
          Service list/editor will render here. API routes will include
          salon_id automatically.
        </div>
      )}
    </main>
  );
}