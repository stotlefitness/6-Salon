"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const SALON_ID =
  process.env.NEXT_PUBLIC_KIOSK_SALON_ID ??
  "00000000-0000-0000-0000-000000000001";
const FRONT_DESK_MESSAGE = "Something went wrong. Please see the front desk.";
const SUCCESS_RESET_MS = 8_000;

type CheckInSuccess = {
  success: true;
  visitId: string;
  checkedInAt: string;
};

type CheckInError = { error: string };

type FormState = {
  firstName: string;
  lastName: string;
  phone: string;
};

type FormErrors = Partial<FormState> & { general?: string };

function countDigits(value: string) {
  return value.replace(/\D/g, "").length;
}

export default function CheckInPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({
    firstName: "",
    lastName: "",
    phone: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<CheckInSuccess | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);

  const validate = (): boolean => {
    const nextErrors: FormErrors = {};
    if (!form.firstName.trim()) {
      nextErrors.firstName = "First name is required.";
    }
    if (!form.lastName.trim()) {
      nextErrors.lastName = "Last name is required.";
    }
    if (!form.phone.trim()) {
      nextErrors.phone = "Phone number is required.";
    } else if (countDigits(form.phone) < 10) {
      nextErrors.phone = "Enter at least 10 digits.";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const resetForm = () => {
    setForm({ firstName: "", lastName: "", phone: "" });
    setErrors({});
    setSuccess(null);
    setCountdown(null);
  };

  const handleSubmit = async (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setErrors({});

    try {
      const res = await fetch("/api/kiosk/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          salonId: SALON_ID,
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          phone: form.phone.trim(),
        }),
      });

      const json = (await res.json().catch(() => ({}))) as
        | CheckInSuccess
        | CheckInError
        | Record<string, unknown>;

      if (!res.ok || !("success" in json)) {
        setErrors({
          general:
            "error" in json && typeof json.error === "string"
              ? json.error
              : FRONT_DESK_MESSAGE,
        });
        return;
      }

      setSuccess(json);
      setCountdown(Math.floor(SUCCESS_RESET_MS / 1000));
    } catch {
      setErrors({ general: FRONT_DESK_MESSAGE });
    } finally {
      setSubmitting(false);
    }
  };

  // Success countdown back to kiosk home
  useEffect(() => {
    if (!success || countdown === null) return;
    if (countdown <= 0) {
      resetForm();
      router.push("/kiosk");
      return;
    }
    const t = setTimeout(() => setCountdown((c) => (c ?? 1) - 1), 1_000);
    return () => clearTimeout(t);
  }, [countdown, success, router]);

  const headline = success ? "You’re checked in." : "Check in";
  const subtext = success
    ? "Please have a seat—front desk will call you shortly."
    : "Let us know you’re here and we’ll get you checked in.";

  const inputClasses =
    "mt-2 w-full rounded-lg border border-zinc-300 bg-white p-3 text-base text-zinc-900 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-200";

  return (
    <main className="flex min-h-screen flex-col items-center bg-zinc-50 p-8 text-zinc-900">
      <div className="flex w-full max-w-xl flex-col gap-6">
        <div className="text-center">
          <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">
            Check in
          </p>
          <h1 className="text-3xl font-semibold">{headline}</h1>
          <p className="mt-2 text-sm text-zinc-600">{subtext}</p>
          {success && countdown !== null ? (
            <p className="mt-1 text-xs text-zinc-500">
              Returning to home in {countdown}s
            </p>
          ) : null}
        </div>

        {!success && (
          <form
            className="space-y-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm"
            onSubmit={handleSubmit}
            noValidate
          >
            <label className="block text-left text-sm font-medium text-zinc-700">
              First name
              <input
                type="text"
                autoComplete="given-name"
                value={form.firstName}
                onChange={(e) => setForm((prev) => ({ ...prev, firstName: e.target.value }))}
                className={inputClasses}
                placeholder="First name"
              />
              {errors.firstName && (
                <p className="mt-1 text-xs text-red-600">{errors.firstName}</p>
              )}
            </label>
            <label className="block text-left text-sm font-medium text-zinc-700">
              Last name
              <input
                type="text"
                autoComplete="family-name"
                value={form.lastName}
                onChange={(e) => setForm((prev) => ({ ...prev, lastName: e.target.value }))}
                className={inputClasses}
                placeholder="Last name"
              />
              {errors.lastName && (
                <p className="mt-1 text-xs text-red-600">{errors.lastName}</p>
              )}
            </label>
            <label className="block text-left text-sm font-medium text-zinc-700">
              Phone number
              <input
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                value={form.phone}
                onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                className={inputClasses}
                placeholder="(555) 010-0100"
              />
              {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
            </label>
            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center rounded-lg bg-zinc-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-50"
            >
              {submitting ? "Checking in..." : "Check in"}
            </button>
          </form>
        )}

        {errors.general && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            {errors.general}
          </div>
        )}

        {success && (
          <div className="space-y-3 rounded-xl border border-zinc-200 bg-white p-5 text-center shadow-sm">
            <p className="text-base font-semibold text-zinc-900">You’re checked in.</p>
            <p className="text-sm text-zinc-600">
              Please have a seat—front desk will call you shortly.
            </p>
            <div className="flex flex-col gap-3">
              <Link
                href="/kiosk/front-desk"
                className="flex w-full items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-semibold text-zinc-900 shadow-sm transition hover:bg-white"
              >
                Need help? Talk to front desk
              </Link>
              <button
                type="button"
                className="flex w-full items-center justify-center rounded-lg bg-zinc-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
                onClick={() => {
                  resetForm();
                  router.push("/kiosk");
                }}
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}


