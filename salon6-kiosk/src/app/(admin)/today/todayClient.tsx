"use client";

import { useEffect, useMemo, useState } from "react";
import type { TodaySummary } from "@/lib/todaySummary";

type Props = {
  initialSummary: TodaySummary;
  salonId: string;
};

export default function TodayClient({ initialSummary, salonId }: Props) {
  const [summary, setSummary] = useState<TodaySummary>(initialSummary);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/today");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to refresh");
      setSummary(json);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(refresh, 20000);
    return () => clearInterval(interval);
  }, []);

  const visitCounts = useMemo(() => {
    const counts = { waiting: 0, completed: 0 };
    summary.visits.forEach((v) => {
      counts[v.status as keyof typeof counts] = (counts[v.status as keyof typeof counts] ?? 0) + 1;
    });
    return counts;
  }, [summary.visits]);

  const newRequestCount = useMemo(
    () => summary.bookingRequests.filter((r) => r.status === "new").length,
    [summary.bookingRequests]
  );

  const requestCounts = useMemo(() => {
    const map: Record<string, number> = {};
    summary.bookingRequests.forEach((r) => {
      map[r.status] = (map[r.status] ?? 0) + 1;
    });
    return map;
  }, [summary.bookingRequests]);

  const currency = (cents: number) =>
    (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });

  const waitingCount = visitCounts.waiting ?? 0;
  const paidCount = summary.payments.count;
  const paidTotal = summary.payments.total_cents;

  return (
    <main className="flex min-h-screen flex-col gap-6 bg-white p-8 text-zinc-900">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Admin</p>
          <h1 className="text-3xl font-semibold">Ops Home</h1>
          <p className="text-sm text-zinc-600">
            Salon {salonId.slice(0, 6)} • Timezone {summary.timezone} • Last refresh {" "}
            {new Date(summary.fetchedAt).toLocaleTimeString()}
          </p>
          <p className="text-xs text-zinc-500">
            Appointments are managed in Phorest. This view shows kiosk check-ins, booking requests, and payments.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={refresh}
            disabled={loading}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </header>

      {error && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">{error}</div>
      )}

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.15em] text-zinc-500">Waiting</p>
          <p className="mt-2 text-2xl font-semibold text-zinc-900">{waitingCount}</p>
          <p className="text-sm text-zinc-600">Checked-in visitors not yet completed.</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.15em] text-zinc-500">New requests</p>
          <p className="mt-2 text-2xl font-semibold text-zinc-900">{newRequestCount}</p>
          <p className="text-sm text-zinc-600">Booking requests awaiting triage.</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.15em] text-zinc-500">Paid today</p>
          <p className="mt-2 text-2xl font-semibold text-zinc-900">{currency(paidTotal)}</p>
          <p className="text-sm text-zinc-600">{paidCount} completed payments.</p>
        </div>
      </section>

      <section className="space-y-2">
        <div className="grid gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold">Visits today</h2>
          {summary.visits.length === 0 ? (
            <p className="text-sm text-zinc-600">No visits yet today.</p>
          ) : (
            <div className="grid gap-2">
              {summary.visits.map((v) => (
                <div
                  key={v.id}
                  className="flex flex-col gap-1 rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{v.name}</span>
                    <span className="rounded-full bg-zinc-100 px-2 py-1 text-xs font-medium">{v.status}</span>
                    <span className="rounded-full bg-zinc-50 px-2 py-1 text-xs text-zinc-700">{v.source}</span>
                  </div>
                  <div className="text-xs text-zinc-600">
                    Checked in {new Date(v.checked_in_at).toLocaleTimeString()} {" "}
                    {v.completed_at ? `• Done ${new Date(v.completed_at).toLocaleTimeString()}` : ""}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="space-y-2">
        <div className="flex flex-wrap gap-2 text-sm text-zinc-700">
          {Object.entries(requestCounts).map(([status, count]) => (
            <span
              key={status}
              className={`rounded-full px-3 py-1 ${
                status === "new" ? "bg-amber-100 text-amber-900" : "bg-zinc-100 text-zinc-700"
              }`}
            >
              {status.replace(/_/g, " ")} {count}
            </span>
          ))}
        </div>
        <div className="grid gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold">Booking requests today</h2>
          {summary.bookingRequests.length === 0 ? (
            <p className="text-sm text-zinc-600">No booking requests today.</p>
          ) : (
            <div className="grid gap-2">
              {summary.bookingRequests.map((r) => (
                <div
                  key={r.id}
                  className="flex flex-col gap-1 rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{r.name}</span>
                    <span className="rounded-full bg-zinc-100 px-2 py-1 text-xs font-medium">
                      {r.status.replace(/_/g, " ")}
                    </span>
                    <span className="rounded-full bg-zinc-50 px-2 py-1 text-xs text-zinc-700">
                      {r.request_source}
                    </span>
                  </div>
                  <div className="text-xs text-zinc-600">
                    Preferred: {r.preferred_window} • Created {new Date(r.created_at).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="space-y-2">
        <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-700">
          <span className="rounded-full bg-zinc-100 px-3 py-1">
            Paid {summary.payments.count} • {currency(summary.payments.total_cents)}
          </span>
          <span className="text-xs text-zinc-600">
            Paid totals reflect sessions marked completed by Stripe webhook.
          </span>
        </div>
        <div className="grid gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold">Payments today</h2>
          {summary.payments.rows.length === 0 ? (
            <p className="text-sm text-zinc-600">No payments yet today.</p>
          ) : (
            <div className="grid gap-2">
              {summary.payments.rows.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                >
                  <div className="flex flex-col">
                    <span className="font-semibold">{currency(p.total_cents)}</span>
                    <span className="text-xs text-zinc-600">{new Date(p.created_at).toLocaleTimeString()}</span>
                  </div>
                  <div className="text-xs text-zinc-600">Status: {p.status}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
