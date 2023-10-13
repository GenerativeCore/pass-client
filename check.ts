import fs from "fs";
import { delay, checkTask } from "./utils";

const TASK_ID = "a7d4c521-c8ac-4190-90a7-ca5b5798ecf0";

(async () => {
  let task;
  let attempts = 0;
  const id = TASK_ID;
  do {
    await delay(500);
    task = await await checkTask(id);
    console.log(attempts, task.status);
    if (attempts++ > 100) {
      throw new Error("Timeout");
    }
  } while (task.status === "pending" || task.status === "processing");
  if (task.status === "completed") {
    const image = task.results.data.image;
    let buffer = Buffer.from(image, "base64");
    fs.writeFileSync(`images/${id}.png`, buffer);
  } else {
    console.log("task failed", task);
  }
})();
