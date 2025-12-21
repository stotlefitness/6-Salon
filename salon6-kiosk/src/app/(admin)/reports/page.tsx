"use client";

import { useStaff } from "@/lib/staff-context";

export default function AdminReportsPage() {
  const staff = useStaff();
  const canView = staff.role === "owner" || staff.role === "manager";

  return (
    <main className="flex min-h-screen flex-col gap-4 bg-white p-8 text-zinc-900">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Admin</p>
        <h1 className="text-3xl font-semibold">Reports</h1>
        <p className="text-sm text-zinc-600">
          Daily and weekly summaries: bookings, show rate, walk-ins, and revenue
          split between services and products.
        </p>
      </div>

      {!canView ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Reports are limited to owners/managers. Your role: {staff.role}.
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-6 text-sm text-zinc-700">
          Reporting widgets will render here using salon_id filtering; RLS blocks
          cross-salon access.
        </div>
      )}
    </main>
  );
}

