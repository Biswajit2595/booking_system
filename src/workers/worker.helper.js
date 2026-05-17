import { Worker } from "worker_threads";
import path from "path";

export const runWorker = (workerFile, data) => {
  return new Promise((resolve, reject) => {
    const worker = new Worker(
      path.resolve(`src/workers/${workerFile}`),
      {
        workerData: data
      }
    );

    worker.on("message", resolve);

    worker.on("error", reject);

    worker.on("exit", (code) => {
      if (code !== 0) {
        reject(new Error(`Worker stopped with code ${code}`));
      }
    });
  });
};