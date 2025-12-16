export default function BookPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-50 p-8 text-center text-zinc-900">
      <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">Book</p>
      <h1 className="text-3xl font-semibold">Create a new appointment</h1>
      <p className="max-w-md text-sm text-zinc-600">
        Select service, date/time, and stylist (or no preference). We will
        enforce availability and capture contact info.
      </p>
    </main>
  );
}



