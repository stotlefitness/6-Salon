"use client";

import Link from "next/link";

const tiles = [
  {
    title: "I'm here for my appointment",
    href: "/kiosk/check-in",
    description: "Find your booking and check in.",
  },
  {
    title: "Book a visit",
    href: "/kiosk/book",
    description: "Create a new appointment.",
    disabled: true,
  },
  {
    title: "Checkout",
    href: "/kiosk/checkout",
    description: "Pay and wrap up your visit.",
    disabled: true,
  },
];

export default function KioskHome() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 p-8 text-center text-zinc-900">
      <div className="flex max-w-3xl flex-col gap-8">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">
            Kiosk
          </p>
          <h1 className="text-3xl font-semibold">Welcome to Salon 6</h1>
          <p className="max-w-xl text-sm text-zinc-600">
            Choose check-in for existing bookings or book a new appointment.
            Checkout is for after your service.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tiles.map((tile) => (
            <Link
              key={tile.href}
              href={tile.disabled ? "#" : tile.href}
              aria-disabled={tile.disabled}
              className={`rounded-xl border border-zinc-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-[1px] hover:shadow ${
                tile.disabled ? "pointer-events-none opacity-50" : ""
              }`}
            >
              <h2 className="text-lg font-semibold">{tile.title}</h2>
              <p className="mt-2 text-sm text-zinc-600">{tile.description}</p>
              <p className="mt-4 text-xs uppercase tracking-[0.15em] text-zinc-500">
                {tile.disabled ? "Coming soon" : "Start"}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}

