"use client";

import { useStaff } from "@/lib/staff-context";
import { supabaseBrowserClient } from "@/lib/supabase-browser";
import { useEffect, useEffectEvent, useMemo, useState } from "react";

type BookingRow = {
  id: string;
  status: string;
};

export default function AdminDashboardPage() {
  const staff = useStaff();
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);

  const load = useEffectEvent(async () => {
    try {
      const res = await fetch("/api/admin/bookings");
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Failed to load bookings");
        return;
      }
      setBookings(json.bookings ?? []);
      setCounts(json.counts ?? {});
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    }
  });

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const channel = supabaseBrowserClient
      .channel(`bookings-${staff.salonId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookings",
          filter: `salon_id=eq.${staff.salonId}`,
        },
        () => {
          load();
        }
      )
      .subscribe();

    return () => {
      supabaseBrowserClient.removeChannel(channel);
    };
  }, [staff.salonId]);

  const statusCounts = useMemo(() => {
    if (Object.keys(counts).length > 0) {
      return counts;
    }
    return bookings.reduce<Record<string, number>>((acc, row) => {
      acc[row.status] = (acc[row.status] || 0) + 1;
      return acc;
    }, {});
  }, [bookings, counts]);

  return (
    <main className="flex min-h-screen flex-col gap-6 bg-white p-8 text-zinc-900">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Admin</p>
        <div className="flex items-baseline gap-3">
          <h1 className="text-3xl font-semibold">Dashboard</h1>
          <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700">
            {staff.role} • Salon {staff.salonId.slice(0, 6)}
          </span>
        </div>
        <p className="text-sm text-zinc-600">
          Today view: upcoming bookings, check-ins, chair status, and completed
          appointments.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.15em] text-zinc-500">
            Check-ins
          </p>
          <p className="mt-2 text-2xl font-semibold text-zinc-900">
            {statusCounts["checked_in"] ?? 0}
          </p>
          <p className="text-sm text-zinc-600">Clients checked in today.</p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.15em] text-zinc-500">
            Upcoming
          </p>
          <p className="mt-2 text-2xl font-semibold text-zinc-900">
            {(statusCounts["scheduled"] ?? 0) + (statusCounts["in_service"] ?? 0)}
          </p>
          <p className="text-sm text-zinc-600">Scheduled for today.</p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.15em] text-zinc-500">
            My role
          </p>
          <p className="mt-2 text-2xl font-semibold text-zinc-900">
            {staff.role}
          </p>
          <p className="text-sm text-zinc-600">
            UI/API enforce role-specific behavior; RLS keeps data within the
            salon.
          </p>
        </div>
      </section>

      {error && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          {error}
        </div>
      )}
    </main>
  );
}