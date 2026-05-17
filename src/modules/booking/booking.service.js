import prisma from "../../config/prisma.js";
import { runWorker } from "../../workers/worker.helper.js";

export const createBooking = async ({
  eventId,
  quantity,
  customerId,
  idempotencyKey
}) => {

  const existingKey = await prisma.idempotencyKey.findUnique({
    where: {
      key: idempotencyKey
    }
  });

  if (existingKey) {
    return existingKey.response;
  }

  const booking = await prisma.$transaction(async (tx) => {

    const event = await tx.event.findUnique({
      where: { id: eventId }
    });

    if (!event) {
      throw new Error("Event not found");
    }

    if (event.availableTickets < quantity) {
      throw new Error("Insufficient tickets");
    }

    await tx.event.update({
      where: { id: eventId },
      data: {
        availableTickets: {
          decrement: quantity
        }
      }
    });

    const createdBooking = await tx.booking.create({
      data: {
        quantity,
        customerId,
        eventId
      }
    });

    await tx.idempotencyKey.create({
      data: {
        key: idempotencyKey,
        response: createdBooking
      }
    });

    return createdBooking;
  });

  const customer = await prisma.user.findUnique({
    where: { id: customerId }
  });

  const event = await prisma.event.findUnique({
    where: { id: eventId }
  });

  runWorker("booking.worker.js", {
    email: customer.email,
    eventTitle: event.title
  });

  return booking;
};