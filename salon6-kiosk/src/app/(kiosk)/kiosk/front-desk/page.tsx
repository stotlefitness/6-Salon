import Link from "next/link";

export default function FrontDeskHelpPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 p-8 text-zinc-900">
      <div className="w-full max-w-xl space-y-6 rounded-2xl bg-white p-6 text-center shadow-sm sm:p-8">
        <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
          Front desk
        </p>
        <h1 className="text-3xl font-semibold">We’ll be right with you</h1>
        <p className="text-sm text-zinc-600">
          Please let the front desk know you need assistance. A team member will come
          help shortly.
        </p>
        <div className="space-y-3">
          <Link
            href="/kiosk/check-in"
            className="flex w-full items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-semibold text-zinc-900 shadow-sm transition hover:bg-white"
          >
            Return to check in
          </Link>
          <Link
            href="/kiosk"
            className="flex w-full items-center justify-center rounded-xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800"
          >
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}

