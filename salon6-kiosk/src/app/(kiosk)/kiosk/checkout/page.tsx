export default function CheckoutPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-50 p-8 text-center text-zinc-900">
      <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">
        Checkout
      </p>
      <h1 className="text-3xl font-semibold">Review services and pay</h1>
      <p className="max-w-md text-sm text-zinc-600">
        Select performed services and any products, calculate totals, and pay
        via Stripe directly on the iPad.
      </p>
    </main>
  );
}





