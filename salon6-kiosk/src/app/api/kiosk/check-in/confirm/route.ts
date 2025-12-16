import { NextResponse } from "next/server";
import {
  DEFAULT_TIMEZONE,
  confirmCheckInSchema,
  getTodayRange,
} from "@/lib/validation/bookings";
import { createSupabaseServiceRoleClient } from "@/lib/supabase-server";

export async function POST(request: Request) {
  const supabase = createSupabaseServiceRoleClient();
  const rawBody = await request.json().catch(() => null);
  const parsed = confirmCheckInSchema.safeParse(rawBody);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { salonId, bookingId } = parsed.data;

  const { start, end } = getTodayRange(DEFAULT_TIMEZONE);
  const { data: booking, error } = await supabase
    .from("bookings")
    .select(
      "id, salon_id, customer_id, stylist_id, service_id, start_time, end_time, status, checked_in_at"
    )
    .eq("id", bookingId)
    .eq("salon_id", salonId)
    .in("status", ["scheduled", "checked_in"])
    .gte("start_time", start.toISOString())
    .lte("start_time", end.toISOString())
    .single();

  if (error || !booking) {
    return NextResponse.json(
      { error: "Booking not found or not eligible" },
      { status: 404 }
    );
  }

  const { data: updated, error: updateError } = await supabase
    .from("bookings")
    .update({
      status: "checked_in",
      checked_in_at: new Date().toISOString(),
    })
    .eq("id", booking.id)
    .select(
      "id, service_id, stylist_id, start_time, end_time, status, checked_in_at"
    )
    .single();

  if (updateError || !updated) {
    return NextResponse.json(
      { error: "Failed to check in" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    status: "CHECKED_IN",
    booking: {
      id: updated.id,
      startTime: updated.start_time,
      endTime: updated.end_time,
      status: updated.status,
      checkedInAt: updated.checked_in_at,
      serviceId: updated.service_id,
      stylistId: updated.stylist_id,
    },
  });
}
