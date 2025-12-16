export default function KioskHome() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-50 p-8 text-center text-zinc-900">
      <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">Kiosk</p>
      <h1 className="text-3xl font-semibold">Welcome to Salon 6</h1>
      <p className="max-w-lg text-sm text-zinc-600">
        Choose check-in for existing bookings or book a new appointment. Use
        checkout when services are completed.
      </p>
    </main>
  );
}


