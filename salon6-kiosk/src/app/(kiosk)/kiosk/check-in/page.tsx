"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const SALON_ID =
  process.env.NEXT_PUBLIC_KIOSK_SALON_ID ??
  "00000000-0000-0000-0000-000000000001";
const FRONT_DESK_MESSAGE = "Something went wrong. Please see the front desk.";

type BookingSummary = {
  id: string;
  startTime: string;
  endTime: string | null;
  status: string;
  serviceName?: string;
  stylistName?: string | null;
};

type ApiResult =
  | { status: "NO_CUSTOMER" | "NO_BOOKING_TODAY"; message: string }
  | { status: "MULTIPLE"; bookings: BookingSummary[] }
  | { status: "CHECKED_IN"; booking: BookingSummary }
  | { error: string };

function formatTimeLabel(value?: string | null) {
  if (!value) return "";
  return new Date(value).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function CheckInPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [lastName, setLastName] = useState("");
  const [result, setResult] = useState<ApiResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (result && "status" in result && result.status === "CHECKED_IN") {
      const timer = setTimeout(() => router.push("/kiosk"), 5000);
      return () => clearTimeout(timer);
    }
    return;
  }, [result, router]);

  const multipleBookings =
    result && "status" in result && result.status === "MULTIPLE"
      ? result.bookings
      : null;

  const handleSubmit = async (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/kiosk/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ salonId: SALON_ID, phone, lastName }),
      });
      const json = (await res.json()) as ApiResult;
      if (!res.ok) {
        setError("error" in json ? json.error : FRONT_DESK_MESSAGE);
        return;
      }
      setResult(json);
    } catch (err) {
      setError(FRONT_DESK_MESSAGE);
    } finally {
      setLoading(false);
    }
  };

  const confirmBooking = async (bookingId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/kiosk/check-in/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ salonId: SALON_ID, bookingId }),
      });
      const json = (await res.json()) as ApiResult;
      if (!res.ok) {
        setError("error" in json ? json.error : FRONT_DESK_MESSAGE);
        return;
      }
      setResult(json);
    } catch (err) {
      setError(FRONT_DESK_MESSAGE);
    } finally {
      setLoading(false);
    }
  };

  const headline = useMemo(() => {
    if (result && "status" in result) {
      switch (result.status) {
        case "CHECKED_IN":
          return "You're checked in!";
        case "MULTIPLE":
          return "Select your appointment";
        case "NO_CUSTOMER":
        case "NO_BOOKING_TODAY":
          return "We couldn't find your booking";
        default:
          return "Find your booking";
      }
    }
    return "Find your booking";
  }, [result]);

  return (
    <main className="flex min-h-screen flex-col items-center bg-zinc-50 p-8 text-zinc-900">
      <div className="flex w-full max-w-xl flex-col gap-6">
        <div className="text-center">
          <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">
            Check in
          </p>
          <h1 className="text-3xl font-semibold">{headline}</h1>
          <p className="mt-2 text-sm text-zinc-600">
            Enter the phone number and last name on your booking.
          </p>
        </div>

        <form
          className="space-y-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm"
          onSubmit={handleSubmit}
        >
          <label className="block text-left text-sm font-medium text-zinc-700">
            Phone number
            <input
              type="tel"
              inputMode="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-2 w-full rounded-lg border border-zinc-300 bg-white p-3 text-base text-zinc-900 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-200"
              placeholder="(555) 010-0100"
            />
          </label>
          <label className="block text-left text-sm font-medium text-zinc-700">
            Last name
            <input
              type="text"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="mt-2 w-full rounded-lg border border-zinc-300 bg-white p-3 text-base text-zinc-900 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-200"
              placeholder="Last name"
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded-lg bg-zinc-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-50"
          >
            {loading ? "Searching..." : "Find my appointment"}
          </button>
        </form>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            {error}
          </div>
        )}

        {result && "status" in result && (
          <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
            {result.status === "NO_CUSTOMER" ||
            result.status === "NO_BOOKING_TODAY" ? (
              <div className="space-y-2 text-center">
                <p className="text-base font-semibold text-zinc-900">
                  {result.status === "NO_CUSTOMER"
                    ? "No matching profile"
                    : "No booking today"}
                </p>
                <p className="text-sm text-zinc-600">
                  {result.message ||
                    (result.status === "NO_CUSTOMER"
                      ? "We couldn't find your profile. Please see the front desk."
                      : "We couldn't find a booking for today. Please see the front desk.")}
                </p>
              </div>
            ) : null}

            {multipleBookings ? (
              <div className="space-y-3">
                <p className="text-sm font-medium text-zinc-900">
                  We found multiple bookings today. Pick the one you&apos;re here
                  for.
                </p>
                <div className="space-y-2">
                  {multipleBookings.map((booking) => (
                    <button
                      key={booking.id}
                      onClick={() => confirmBooking(booking.id)}
                      disabled={loading}
                      className="w-full rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-left shadow-sm transition hover:-translate-y-[1px] hover:bg-white"
                    >
                      <p className="text-base font-semibold text-zinc-900">
                        {formatTimeLabel(booking.startTime)} —{" "}
                        {booking.serviceName || "Service"}
                      </p>
                      <p className="text-sm text-zinc-600">
                        {booking.stylistName || "Any stylist"}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {result.status === "CHECKED_IN" && "booking" in result ? (
              <div className="space-y-2 text-center">
                <p className="text-base font-semibold text-zinc-900">
                  You&apos;re checked in
                </p>
                <p className="text-sm text-zinc-600">
                  {result.booking.serviceName || "Your service"} at{" "}
                  {formatTimeLabel(result.booking.startTime)}
                  {result.booking.stylistName
                    ? ` with ${result.booking.stylistName}`
                    : null}
                  .
                </p>
                <p className="text-xs text-zinc-500">
                  We&apos;ll bring you back shortly. Returning to home...
                </p>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </main>
  );
}