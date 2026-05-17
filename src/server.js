import app from "./app.js";
import prisma from "./config/prisma.js";
import logger from "./config/logger.js";
import "dotenv/config";

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

const shutdown = async () => {
  logger.info("Graceful shutdown initiated");

  server.close(async () => {
    logger.info("HTTP server closed");

    await prisma.$disconnect();

    logger.info("Database disconnected");

    process.exit(0);
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);