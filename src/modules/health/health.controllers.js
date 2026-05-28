import prisma from "../../config/prisma.js";

export const healthCheck = async (req, res) => {
  res.status(200).json({
    status: "ok"
  });
};

export const readinessCheck = async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      status: "ready"
    });
  } catch (error) {

    console.error(error);
  
    res.status(500).json({
      status: "not_ready",
      error: error.message
    });
  }
};


export const cicdCheck = async (req, res) => {
  try {

    res.status(200).json({
      status: "testing CI/CD Pipeline with GitHub Actions working"
    });
  } catch (error) {

    console.error(error);
  
    res.status(500).json({
      status: "not_working",
      error: error.message
    });
  }
};
