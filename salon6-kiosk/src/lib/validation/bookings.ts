import { z } from "zod";

export const checkInSchema = z.object({
  phone: z.string().min(7, "Phone is required"),
  lastName: z.string().optional(),
  code: z.string().optional(),
});

export const bookingRequestSchema = z.object({
  serviceId: z.string(),
  stylistId: z.string().optional(),
  noPreference: z.boolean().optional(),
  startAt: z.string(), // ISO datetime
  durationMinutes: z.number().int().positive(),
  customer: z.object({
    firstName: z.string(),
    lastName: z.string(),
    phone: z.string(),
    email: z.string().email().optional(),
  }),
});

export type CheckInPayload = z.infer<typeof checkInSchema>;
export type BookingRequestPayload = z.infer<typeof bookingRequestSchema>;


