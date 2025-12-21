"use client";

import { useMemo, useState } from "react";

type BookingRequest = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  preferred_window: string;
  service_interest: string | null;
  notes: string | null;
  staff_note: string | null;
  phorest_appointment_id: string | null;
  status: "new" | "in_progress" | "scheduled_in_phorest" | "closed";
  request_source: "kiosk" | "web" | "staff_manual";
  created_at: string;
  updated_at: string;
};

const STATUS_OPTIONS: BookingRequest["status"][] = [
  "new",
  "in_progress",
  "scheduled_in_phorest",
  "closed",
];

type Draft = {
  status: BookingRequest["status"];
  staff_note: string;
  phorest_appointment_id: string;
};

type Props = {
  salonId: string;
  staffRole: string;
  initialRequests: BookingRequest[];
};

export default function RequestsClient({ salonId, staffRole, initialRequests }: Props) {
  const [requests, setRequests] = useState<BookingRequest[]>(initialRequests);
  const [drafts, setDrafts] = useState<Record<string, Draft>>(() =>
    Object.fromEntries(
      initialRequests.map((req) => [
        req.id,
        {
          status: req.status,
          staff_note: req.staff_note ?? "",
          phorest_appointment_id: req.phorest_appointment_id ?? "",
        },
      ])
    )
  );
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const openCount = useMemo(
    () => requests.filter((r) => r.status === "new" || r.status === "in_progress").length,
    [requests]
  );

  function updateDraft(id: string, patch: Partial<Draft>) {
    setDrafts((prev) => ({
      ...prev,
      [id]: { ...prev[id], ...patch },
    }));
  }

  async function save(id: string) {
    const draft = drafts[id];
    if (!draft) return;
    setSavingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/booking-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: draft.status,
          staffNote: draft.staff_note.trim() || null,
          phorestAppointmentId: draft.phorest_appointment_id.trim() || null,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json.error || "Failed to update request");
      }
      const updated: BookingRequest | undefined = json.bookingRequest;
      if (updated) {
        setRequests((prev) => prev.map((r) => (r.id === id ? updated : r)));
        updateDraft(id, {
          status: updated.status,
          staff_note: updated.staff_note ?? "",
          phorest_appointment_id: updated.phorest_appointment_id ?? "",
        });
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSavingId(null);
    }
  }

  return (
    <main className="flex min-h-screen flex-col gap-6 bg-white p-8 text-zinc-900">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Admin</p>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-semibold">Requests</h1>
          <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700">
            {staffRole} • Salon {salonId.slice(0, 6)}
          </span>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-900">
            Open {openCount}
          </span>
        </div>
        <p className="text-sm text-zinc-600">
          Review kiosk and staff-submitted requests, add notes, and update status as you
          schedule.
        </p>
      </header>

      {error && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          {error}
        </div>
      )}

      <section className="grid gap-4">
        {requests.length === 0 ? (
          <div className="rounded-lg border border-dashed border-zinc-200 bg-zinc-50 p-8 text-center text-sm text-zinc-600">
            No booking requests yet.
          </div>
        ) : (
          requests.map((req) => {
            const draft = drafts[req.id];
            return (
              <article
                key={req.id}
                className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-semibold text-zinc-900">{req.name}</h2>
                      <span className="rounded-full bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-700">
                        {req.request_source}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-700">
                      {req.phone}
                      {req.email ? ` • ${req.email}` : ""}
                    </p>
                    <p className="text-sm text-zinc-700">
                      Preferred: {req.preferred_window}
                      {req.service_interest ? ` • ${req.service_interest}` : ""}
                    </p>
                    {req.notes && (
                      <p className="text-sm text-zinc-600">Client note: {req.notes}</p>
                    )}
                    <p className="text-xs text-zinc-500">
                      Created {new Date(req.created_at).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 sm:items-end">
                    <label className="flex flex-col gap-1 text-sm text-zinc-800">
                      Status
                      <select
                        value={draft?.status ?? req.status}
                        onChange={(e) => updateDraft(req.id, { status: e.target.value as Draft["status"] })}
                        className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200"
                      >
                        {STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>
                            {status.replace(/_/g, " ")}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="flex flex-col gap-1 text-sm text-zinc-800">
                      Staff note
                      <textarea
                        rows={2}
                        value={draft?.staff_note ?? ""}
                        onChange={(e) => updateDraft(req.id, { staff_note: e.target.value })}
                        className="w-72 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200"
                        placeholder="Notes for the team"
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-sm text-zinc-800">
                      Phorest appt ID
                      <input
                        value={draft?.phorest_appointment_id ?? ""}
                        onChange={(e) =>
                          updateDraft(req.id, { phorest_appointment_id: e.target.value })
                        }
                        className="w-72 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200"
                        placeholder="Optional"
                      />
                    </label>
                    <button
                      onClick={() => save(req.id)}
                      disabled={savingId === req.id}
                      className="mt-1 inline-flex items-center justify-center rounded-lg bg-zinc-900 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
                    >
                      {savingId === req.id ? "Saving..." : "Save"}
                    </button>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </section>
    </main>
  );
}

