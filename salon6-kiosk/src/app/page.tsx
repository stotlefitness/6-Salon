export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-zinc-50 p-8 text-zinc-900">
      <div className="text-center">
        <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">
          Salon 6
        </p>
        <h1 className="mt-2 text-3xl font-semibold">Select a surface</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Kiosk is iPad-only. Admin is internal use.
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <a
          className="rounded-lg border border-zinc-200 bg-white px-6 py-4 text-center text-base font-medium shadow-sm transition hover:border-zinc-300 hover:shadow"
          href="/kiosk"
        >
          Open kiosk
        </a>
        <a
          className="rounded-lg border border-zinc-200 bg-white px-6 py-4 text-center text-base font-medium shadow-sm transition hover:border-zinc-300 hover:shadow"
          href="/admin/dashboard"
        >
          Open admin
        </a>
      </div>
    </main>
  );
}
