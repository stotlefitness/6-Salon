import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { findOrCreateCustomer, recordVisit } from "../helpers";

type MaybeSingleResponse<T> = { data: T | null; error: Error | null };

function createCustomersSupabaseMock(options: {
  lookup: MaybeSingleResponse<{ id: string }>;
  insert: MaybeSingleResponse<{ id: string }>;
}) {
  let capturedInsert: unknown = null;
  const supabase = {
    from(table: string) {
      assert.equal(table, "customers");
      return {
        select() {
          return {
            eq() {
              return this;
            },
            ilike() {
              return this;
            },
            limit() {
              return this;
            },
            maybeSingle: () => Promise.resolve(options.lookup),
          };
        },
        insert(payload: unknown) {
          capturedInsert = payload;
          return {
            select() {
              return {
                single: () => Promise.resolve(options.insert),
              };
            },
          };
        },
      };
    },
  };

  return { supabase, getInsertedPayload: () => capturedInsert };
}

function createVisitsSupabaseMock(options: {
  insert: MaybeSingleResponse<{ id: string; checked_in_at: string }>;
}) {
  let capturedInsert: unknown = null;
  const supabase = {
    from(table: string) {
      assert.equal(table, "visits");
      return {
        insert(payload: unknown) {
          capturedInsert = payload;
          return {
            select() {
              return {
                single: () => Promise.resolve(options.insert),
              };
            },
          };
        },
      };
    },
  };

  return { supabase, getInsertedPayload: () => capturedInsert };
}

describe("findOrCreateCustomer", () => {
  it("reuses an existing customer when found", async () => {
    const mock = createCustomersSupabaseMock({
      lookup: { data: { id: "cust-1" }, error: null },
      insert: { data: null, error: null },
    });

    const { customerId, error } = await findOrCreateCustomer({
      salonId: "salon-1",
      firstName: "Ada",
      lastName: "Lovelace",
      normalizedLastName: "lovelace",
      normalizedPhone: "+15550100100",
      supabase: mock.supabase as any,
    });

    assert.equal(customerId, "cust-1");
    assert.equal(error, null);
    assert.equal(mock.getInsertedPayload(), null);
  });

  it("creates a new customer when none exists", async () => {
    const mock = createCustomersSupabaseMock({
      lookup: { data: null, error: null },
      insert: { data: { id: "cust-new" }, error: null },
    });

    const { customerId, error } = await findOrCreateCustomer({
      salonId: "salon-1",
      firstName: "Ada",
      lastName: "Lovelace",
      normalizedLastName: "lovelace",
      normalizedPhone: "+15550100100",
      supabase: mock.supabase as any,
    });

    assert.equal(customerId, "cust-new");
    assert.equal(error, null);
    assert.deepEqual(mock.getInsertedPayload(), {
      salon_id: "salon-1",
      first_name: "Ada",
      last_name: "Lovelace",
      phone: "+15550100100",
      phone_normalized: "+15550100100",
    });
  });
});

describe("recordVisit", () => {
  it("stores a walk-in visit and returns id + timestamp", async () => {
    const mock = createVisitsSupabaseMock({
      insert: { data: { id: "visit-1", checked_in_at: "2025-01-01T00:00:00Z" }, error: null },
    });

    const { visit, error } = await recordVisit({
      salonId: "salon-1",
      customerId: "cust-1",
      supabase: mock.supabase as any,
    });

    assert.equal(visit?.id, "visit-1");
    assert.equal(visit?.checked_in_at, "2025-01-01T00:00:00Z");
    assert.equal(error, null);
    const inserted = mock.getInsertedPayload() as Record<string, unknown>;
    assert.equal(inserted.salon_id, "salon-1");
    assert.equal(inserted.booking_id, null);
    assert.equal(inserted.visit_source, "kiosk_walkin");
    assert.equal(inserted.customer_id, "cust-1");
    assert.equal(typeof inserted.checked_in_at, "string");
  });
});


