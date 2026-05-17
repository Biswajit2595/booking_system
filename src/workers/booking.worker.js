import { parentPort, workerData } from "worker_threads";

const { email, eventTitle } = workerData;

console.log(
  `Booking confirmation email sent to ${email} for ${eventTitle}`
);

parentPort.postMessage("done");