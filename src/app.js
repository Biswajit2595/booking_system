import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import authRoutes from "./modules/auth/auth.routes.js";
import eventRoutes from "./modules/events/event.routes.js";
import bookingRoutes from "./modules/booking/booking.routes.js";
import healthRoutes from "./modules/health/health.routes.js";

import { errorHandler } from "./middlewares/error.middleware.js";

const app = express();

app.use(express.json());
app.use(cors({ origin: "*" }));
app.use(helmet());
app.use(morgan("dev"));

app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/health", healthRoutes);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Event Booking API Running"
  });
});

app.use(errorHandler);

export default app;