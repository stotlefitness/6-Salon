"use client";

import { useEffect, useMemo, useState } from "react";

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
  const [countdown, setCountdown] = useState<number | null>(null);
  const [lastInteraction, setLastInteraction] = useState<number>(Date.now());

  const idleMs = 45_000;
  const successResetMs = 8_000;

  const resetForm = () => {
    setForm({
      name: "",
      phone: "",
      email: "",
      serviceInterest: "",
      preferredWindow: "",
      notes: "",
    });
    setError(null);
    setSuccess(false);
    setCountdown(null);
  };

  const touchTargets = useMemo(
    () => ({
      input:
        "w-full rounded-lg border border-zinc-200 bg-white px-3 py-3 text-lg text-zinc-900 shadow-sm outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200",
      textarea:
        "w-full rounded-lg border border-zinc-200 bg-white px-3 py-3 text-lg text-zinc-900 shadow-sm outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200",
      buttonPrimary:
        "flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-4 text-lg font-semibold text-white shadow-sm transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400",
      buttonGhost:
        "flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-4 text-lg font-semibold text-zinc-900 shadow-sm transition hover:border-zinc-300",
    }),
    []
  );

  const markInteraction = () => setLastInteraction(Date.now());

  const updateField = (key: keyof FormState, value: string) => {
    markInteraction();
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    markInteraction();
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
      setCountdown(Math.floor(successResetMs / 1000));
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

  // Idle reset to home (clear form + dismiss banners)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (Date.now() - lastInteraction >= idleMs) {
        resetForm();
      }
    }, 1_000);
    return () => clearTimeout(timer);
  }, [lastInteraction, idleMs]);

  // Success countdown back to home
  useEffect(() => {
    if (!success || countdown === null) return;
    if (countdown <= 0) {
      resetForm();
      return;
    }
    const t = setTimeout(() => setCountdown((c) => (c ?? 1) - 1), 1_000);
    return () => clearTimeout(t);
  }, [success, countdown]);

  return (
    <main
      className="flex min-h-screen flex-col items-center bg-zinc-50 p-6 text-zinc-900"
      onClick={markInteraction}
      onKeyDown={markInteraction}
    >
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
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-base text-emerald-900">
            Request received! We&apos;ll confirm shortly.
            {countdown !== null && (
              <span className="ml-2 text-sm text-emerald-800">
                Returning to home in {countdown}s
              </span>
            )}
          </div>
        )}
        {error && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-base text-amber-900">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1">
              <span className="text-sm font-medium text-zinc-800">Name</span>
              <input
                required
                autoFocus
                autoComplete="name"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                className={touchTargets.input}
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
                className={touchTargets.input}
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
                className={touchTargets.input}
                placeholder="you@example.com"
              />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium text-zinc-800">Preferred time</span>
              <input
                required
                value={form.preferredWindow}
                onChange={(e) => updateField("preferredWindow", e.target.value)}
                className={touchTargets.input}
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
              className={touchTargets.input}
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
              className={touchTargets.textarea}
              placeholder="Anything else we should know?"
            />
          </label>

          <div className="space-y-3">
            <button type="submit" disabled={submitting} className={touchTargets.buttonPrimary}>
              {submitting ? "Sending..." : "Submit request"}
            </button>
            <button
              type="button"
              className={touchTargets.buttonGhost}
              onClick={() => {
                setError(null);
                setSuccess(false);
              }}
            >
              Talk to front desk
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}






