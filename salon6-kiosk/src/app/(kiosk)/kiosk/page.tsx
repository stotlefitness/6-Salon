"use client";

import Link from "next/link";

const tiles = [
  {
    title: "Check in",
    href: "/kiosk/check-in",
    description: "Let us know you’re here and we’ll get you seated.",
  },
  {
    title: "Book a visit",
    href: "/kiosk/book",
    description: "Request a time if you still need an appointment.",
  },
  {
    title: "Talk to front desk",
    href: "/kiosk/front-desk",
    description: "Need help right now? We’ll come assist you.",
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
            Choose check-in if you’re here, book a visit if you still need an appointment,
            or talk to the front desk for help.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tiles.map((tile) => (
            <Link
              key={tile.href}
              href={tile.href}
              className="rounded-xl border border-zinc-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-[1px] hover:shadow"
            >
              <h2 className="text-lg font-semibold">{tile.title}</h2>
              <p className="mt-2 text-sm text-zinc-600">{tile.description}</p>
              <p className="mt-4 text-xs uppercase tracking-[0.15em] text-zinc-500">
                Start
              </p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}


