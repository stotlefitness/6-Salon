import { z } from "zod";

const lineItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number().nonnegative(),
  quantity: z.number().int().positive(),
});

export const checkoutSchema = z.object({
  bookingId: z.string(),
  services: z.array(lineItemSchema),
  products: z.array(lineItemSchema).default([]),
  tip: z.number().nonnegative().default(0),
  paymentIntentId: z.string().optional(),
});

export type CheckoutPayload = z.infer<typeof checkoutSchema>;


