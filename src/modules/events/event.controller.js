import * as eventService from "./event.service.js";
import prisma from "../../config/prisma.js";

export const createEvent = async (req, res, next) => {
  try {

    const event = await prisma.event.create({
      data: {
        ...req.body,
        availableTickets: req.body.totalTickets,
        organizerId: req.user.id
      }
    });

    res.status(201).json({
      success: true,
      data: event
    });

  } catch (error) {
    next(error);
  }
};

export const updateEvent = async (req, res, next) => {
  try {

    const event = await eventService.updateEvent(
      req.params.id,
      req.body,
      req.user.id
    );

    res.json({
      success: true,
      data: event
    });

  } catch (error) {
    next(error);
  }
};

export const getEvents = async (req, res, next) => {
  try {

    const events = await prisma.event.findMany();

    res.json({
      success: true,
      data: events
    });

  } catch (error) {
    next(error);
  }
};