import express from "express";

import * as bookingController from "./booking.controller.js";

import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorizeRoles } from "../../middlewares/role.middleware.js";

const router = express.Router();

router.post(
  "/",
  authenticate,
  authorizeRoles("CUSTOMER"),
  bookingController.createBooking
);

export default router;