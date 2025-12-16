export default function AdminDashboardPage() {
  return (
    <main className="flex min-h-screen flex-col gap-4 bg-white p-8 text-zinc-900">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Admin</p>
        <h1 className="text-3xl font-semibold">Dashboard</h1>
        <p className="text-sm text-zinc-600">
          Today view: upcoming bookings, check-ins, chair status, and completed
          appointments.
        </p>
      </div>
    </main>
  );
}


