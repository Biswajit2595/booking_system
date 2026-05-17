import prisma from "../../config/prisma.js";
import { runWorker } from "../../workers/worker.helper.js";

export const updateEvent = async (eventId, data, organizerId) => {

  const existingEvent = await prisma.event.findFirst({
    where: {
      id: eventId,
      organizerId
    }
  });

  if (!existingEvent) {
    throw new Error("Event not found");
  }

  const updatedEvent = await prisma.event.update({
    where: { id: eventId },
    data
  });

  const bookings = await prisma.booking.findMany({
    where: { eventId },
    include: {
      customer: true
    }
  });

  const users = bookings.map((b) => ({
    email: b.customer.email
  }));

  runWorker("notification.worker.js", {
    users,
    eventTitle: updatedEvent.title
  });

  return updatedEvent;
};