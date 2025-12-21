import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { transitionToCheckedIn } from "../helpers";
import type { SupabaseClient } from "@supabase/supabase-js";

type SupabaseResponse = { data: unknown; error: Error | null };

function chainUpdate(response: SupabaseResponse) {
  return {
    eq() {
      return this;
    },
    select() {
      return Promise.resolve(response);
    },
  };
}

function chainSelect(response: SupabaseResponse) {
  return {
    eq() {
      return this;
    },
    single() {
      return Promise.resolve(response);
    },
  };
}

function createSupabaseMock({
  update,
  latest,
}: {
  update: SupabaseResponse;
  latest: SupabaseResponse;
}) {
  return {
    from(table: string) {
      assert.equal(table, "bookings");
      return {
        update() {
          return chainUpdate(update);
        },
        select() {
          return chainSelect(latest);
        },
      };
    },
  } as unknown as SupabaseClient;
}

const baseBooking = {
  id: "booking-1",
  service_id: "svc",
  stylist_id: null,
  start_time: "2025-01-01T10:00:00Z",
  end_time: "2025-01-01T11:00:00Z",
  status: "scheduled",
  checked_in_at: null,
};

describe("transitionToCheckedIn", () => {
  it("returns updated booking when scheduled", async () => {
    const updated = { ...baseBooking, status: "checked_in", checked_in_at: "2025-01-01T10:05:00Z" };
    const supabase = createSupabaseMock({
      update: { data: [updated], error: null },
      latest: { data: null, error: null },
    });

    const result = await transitionToCheckedIn(
      baseBooking.id,
      supabase as unknown as ReturnType<typeof createSupabaseMock>
    );
    assert.equal(result.booking?.status, "checked_in");
    assert.equal(result.booking?.checked_in_at, updated.checked_in_at);
    assert.equal(result.error, null);
  });

  it("is idempotent when already checked in", async () => {
    const already = { ...baseBooking, status: "checked_in", checked_in_at: "2025-01-01T10:05:00Z" };
    const supabase = createSupabaseMock({
      update: { data: [] as typeof baseBooking[], error: null },
      latest: { data: already, error: null },
    });

    const result = await transitionToCheckedIn(
      baseBooking.id,
      supabase as unknown as ReturnType<typeof createSupabaseMock>
    );
    assert.equal(result.booking?.status, "checked_in");
    assert.equal(result.error, null);
  });

  it("surfaces failure when nothing is updated or found", async () => {
    const supabase = createSupabaseMock({
      update: { data: [] as typeof baseBooking[], error: null },
      latest: { data: null, error: new Error("not found") },
    });

    const result = await transitionToCheckedIn(
      baseBooking.id,
      supabase as unknown as ReturnType<typeof createSupabaseMock>
    );
    assert.equal(result.booking, null);
  });
});

