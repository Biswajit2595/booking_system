import express from "express";

import {
  healthCheck,
  cicdCheck,
  readinessCheck
} from "./health.controllers.js";

const router = express.Router();

router.get("/", healthCheck);
router.get("/cicd", cicdCheck);
router.get("/ready", readinessCheck);

export default router;