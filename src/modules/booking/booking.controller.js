import * as bookingService from "./booking.service.js";

export const createBooking = async (req, res, next) => {
  try {

    const idempotencyKey = req.headers["idempotency-key"];

    if (!idempotencyKey) {
      throw new Error("Idempotency-Key header required");
    }

    const booking = await bookingService.createBooking({
      eventId: req.body.eventId,
      quantity: req.body.quantity,
      customerId: req.user.id,
      idempotencyKey
    });

    res.status(201).json({
      success: true,
      data: booking
    });

  } catch (error) {
    next(error);
  }
};