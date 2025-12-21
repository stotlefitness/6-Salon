"use client";

import { useState } from "react";

type FormState = {
  name: string;
  phone: string;
  email: string;
  serviceInterest: string;
  preferredWindow: string;
  notes: string;
};

const kioskToken = process.env.NEXT_PUBLIC_KIOSK_TOKEN;

export default function BookPage() {
  const [form, setForm] = useState<FormState>({
    name: "",
    phone: "",
    email: "",
    serviceInterest: "",
    preferredWindow: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const updateField = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.preferredWindow.trim()) {
      setError("Name, phone, and preferred time are required.");
      return;
    }
    if (!kioskToken) {
      setError("Kiosk token is not configured.");
      return;
    }
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/booking-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-kiosk-token": kioskToken,
        },
        body: JSON.stringify({
          name: form.name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim() || null,
          serviceInterest: form.serviceInterest.trim() || null,
          preferredWindow: form.preferredWindow.trim(),
          notes: form.notes.trim() || null,
        }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || "Could not submit request.");
      }

      setSuccess(true);
      setForm({
        name: "",
        phone: "",
        email: "",
        serviceInterest: "",
        preferredWindow: "",
        notes: "",
      });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center bg-zinc-50 p-6 text-zinc-900">
      <div className="w-full max-w-xl space-y-6 rounded-2xl bg-white p-6 shadow-sm sm:p-8">
        <header className="space-y-2 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Book</p>
          <h1 className="text-3xl font-semibold">Request a visit</h1>
          <p className="text-sm text-zinc-600">
            Tell us how to reach you and when you prefer to come in. A team member will
            follow up to confirm details.
          </p>
        </header>

        {success && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            Request received! We&apos;ll confirm shortly.
          </div>
        )}
        {error && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1">
              <span className="text-sm font-medium text-zinc-800">Name</span>
              <input
                required
                autoComplete="name"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-3 text-base text-zinc-900 shadow-sm outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200"
                placeholder="Full name"
              />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium text-zinc-800">Phone</span>
              <input
                required
                inputMode="tel"
                autoComplete="tel"
                value={form.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-3 text-base text-zinc-900 shadow-sm outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200"
                placeholder="(555) 123-4567"
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1">
              <span className="text-sm font-medium text-zinc-800">Email (optional)</span>
              <input
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-3 text-base text-zinc-900 shadow-sm outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200"
                placeholder="you@example.com"
              />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium text-zinc-800">Preferred time</span>
              <input
                required
                value={form.preferredWindow}
                onChange={(e) => updateField("preferredWindow", e.target.value)}
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-3 text-base text-zinc-900 shadow-sm outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200"
                placeholder="e.g., This Friday after 3pm"
              />
            </label>
          </div>

          <label className="space-y-1">
            <span className="text-sm font-medium text-zinc-800">
              Service interest (optional)
            </span>
            <input
              value={form.serviceInterest}
              onChange={(e) => updateField("serviceInterest", e.target.value)}
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-3 text-base text-zinc-900 shadow-sm outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200"
              placeholder="Cut, color, consultation, etc."
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium text-zinc-800">
              Notes (optional)
            </span>
            <textarea
              rows={3}
              value={form.notes}
              onChange={(e) => updateField("notes", e.target.value)}
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-3 text-base text-zinc-900 shadow-sm outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200"
              placeholder="Anything else we should know?"
            />
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
          >
            {submitting ? "Sending..." : "Submit request"}
          </button>
        </form>
      </div>
    </main>
  );
}






