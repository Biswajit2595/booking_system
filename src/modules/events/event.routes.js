import express from "express";

import * as eventController from "./event.controller.js";

import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorizeRoles } from "../../middlewares/role.middleware.js";

const router = express.Router();

router.get("/", eventController.getEvents);

router.post(
  "/",
  authenticate,
  authorizeRoles("ORGANIZER"),
  eventController.createEvent
);

router.put(
  "/:id",
  authenticate,
  authorizeRoles("ORGANIZER"),
  eventController.updateEvent
);

export default router;