"use client";

import { useStaff } from "@/lib/staff-context";

export default function AdminBookingsPage() {
  const staff = useStaff();
  const isStylist = staff.role === "stylist";

  return (
    <main className="flex min-h-screen flex-col gap-4 bg-white p-8 text-zinc-900">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Admin</p>
        <h1 className="text-3xl font-semibold">Bookings</h1>
        <p className="text-sm text-zinc-600">
          {isStylist
            ? "Showing your chair for today; other appointments are hidden."
            : "Owners/managers see the whole salon; front desk can check people in."}
        </p>
      </div>
      <div className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-6 text-sm text-zinc-700">
        Booking list will render here filtered by salon_id
        {isStylist ? " and your stylist_id." : "."} API routes enforce scope.
      </div>
    </main>
  );
}