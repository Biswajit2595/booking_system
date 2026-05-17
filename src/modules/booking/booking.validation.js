import { z } from "zod";

export const bookingSchema = z.object({
  body: z.object({
    eventId: z.string().cuid(),
    quantity: z.number().positive()
  })
});