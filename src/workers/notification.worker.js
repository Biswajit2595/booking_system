import { parentPort, workerData } from "worker_threads";

const { users, eventTitle } = workerData;

users.forEach((user) => {
  console.log(
    `Event update notification sent to ${user.email} for ${eventTitle}`
  );
});

parentPort.postMessage("done");