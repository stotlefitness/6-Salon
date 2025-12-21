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
  initialFetchedAt: string;
};

export default function RequestsClient({
  salonId,
  staffRole,
  initialRequests,
  initialFetchedAt,
}: Props) {
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
  const [statusFilter, setStatusFilter] = useState<BookingRequest["status"] | "all">("new");
  const [toast, setToast] = useState<string | null>(null);

  const openCount = useMemo(
    () => requests.filter((r) => r.status === "new" || r.status === "in_progress").length,
    [requests]
  );

  const filtered = useMemo(() => {
    if (statusFilter === "all") return requests;
    return requests.filter((r) => r.status === statusFilter);
  }, [requests, statusFilter]);

  const statusPill = (value: BookingRequest["status"]) => (
    <button
      key={value}
      onClick={() => setStatusFilter(value)}
      className={`rounded-full px-3 py-1 text-xs font-medium transition ${
        statusFilter === value
          ? "bg-zinc-900 text-white"
          : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
      }`}
    >
      {value.replace(/_/g, " ")}
    </button>
  );

  const nextActions = (status: BookingRequest["status"]) => {
    if (status === "new") return { label: "Start triage", next: "in_progress" as const };
    if (status === "in_progress")
      return { label: "Mark scheduled in Phorest", next: "scheduled_in_phorest" as const };
    return { label: "Close", next: "closed" as const };
  };

  function updatedAgo(ts: string) {
    const minutes = Math.max(0, Math.floor((Date.now() - new Date(ts).getTime()) / 60000));
    if (minutes < 1) return "just now";
    if (minutes === 1) return "1 minute ago";
    if (minutes < 60) return `${minutes} minutes ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  }

  function updateDraft(id: string, patch: Partial<Draft>) {
    setDrafts((prev) => ({
      ...prev,
      [id]: { ...prev[id], ...patch },
    }));
  }

  async function save(
    id: string,
    opts?: {
      optimisticStatus?: BookingRequest["status"];
      optimisticNote?: string;
      optimisticPhorestId?: string;
    }
  ) {
    const draft = drafts[id];
    if (!draft) return;
    const previousRequests = requests;
    const previousDrafts = drafts;

    // Optimistic apply
    setRequests((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: opts?.optimisticStatus ?? draft.status,
              staff_note: opts?.optimisticNote ?? draft.staff_note ?? r.staff_note,
              phorest_appointment_id:
                opts?.optimisticPhorestId ?? draft.phorest_appointment_id ?? r.phorest_appointment_id,
              updated_at: new Date().toISOString(),
            }
          : r
      )
    );

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
      // rollback optimistic change
      setRequests(previousRequests);
      setDrafts(previousDrafts);
      setError((err as Error).message);
      setToast("Couldn’t save — try again.");
    } finally {
      setSavingId(null);
      setTimeout(() => setToast(null), 3000);
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

      <div className="flex flex-wrap items-center gap-3">
        <span className="text-xs uppercase tracking-[0.2em] text-zinc-500">Filter</span>
        {STATUS_OPTIONS.map((s) => statusPill(s))}
        <button
          onClick={() => setStatusFilter("all")}
          className={`rounded-full px-3 py-1 text-xs font-medium transition ${
            statusFilter === "all"
              ? "bg-zinc-900 text-white"
              : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
          }`}
        >
          all
        </button>
      </div>

      {toast && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          {toast}
        </div>
      )}
      {error && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          {error}
        </div>
      )}

      <section className="grid gap-4">
        {filtered.length === 0 ? (
          <div className="rounded-lg border border-dashed border-zinc-200 bg-zinc-50 p-8 text-center text-sm text-zinc-600">
            {statusFilter === "new" ? "No new requests." : "No booking requests in this view."}
            <div className="mt-2 text-xs text-zinc-500">
              Last refreshed {new Date(initialFetchedAt).toLocaleString()}
            </div>
          </div>
        ) : (
          filtered.map((req) => {
            const draft = drafts[req.id];
            const action = nextActions(req.status);
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
                      Updated {updatedAgo(req.updated_at)} • Created{" "}
                      {new Date(req.created_at).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 sm:items-end">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => {
                          updateDraft(req.id, { status: action.next });
                          save(req.id, { optimisticStatus: action.next });
                        }}
                        disabled={savingId === req.id}
                        className="inline-flex items-center justify-center rounded-lg bg-amber-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:bg-amber-300"
                      >
                        {action.label}
                      </button>
                      {req.status !== "closed" && (
                        <button
                          onClick={() => {
                            updateDraft(req.id, { status: "closed" });
                            save(req.id, { optimisticStatus: "closed" });
                          }}
                          disabled={savingId === req.id}
                          className="inline-flex items-center justify-center rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-900 shadow-sm transition hover:border-zinc-300 disabled:cursor-not-allowed disabled:bg-zinc-100"
                        >
                          Close
                        </button>
                      )}
                    </div>
                    <label className="flex flex-col gap-1 text-sm text-zinc-800">
                      Status
                      <select
                        value={draft?.status ?? req.status}
                        onChange={(e) => updateDraft(req.id, { status: e.target.value as Draft["status"] })}
                        disabled={savingId === req.id}
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
                        disabled={savingId === req.id}
                        className="w-72 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200"
                        placeholder="Notes for the team"
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-sm text-zinc-800">
                      Phorest appt ID
                      <input
                        value={draft?.phorest_appointment_id ?? ""}
                        onChange={(e) => updateDraft(req.id, { phorest_appointment_id: e.target.value })}
                        className="w-72 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200"
                        placeholder="Optional"
                        disabled={req.status !== "scheduled_in_phorest" && (draft?.status ?? req.status) !== "scheduled_in_phorest"}
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

