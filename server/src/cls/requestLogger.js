import fs from "node:fs";
import path from "node:path";

const LOGS_FOLDER_PATH = "logs";

const EVENTS_LOG_PATH = path.join(LOGS_FOLDER_PATH, "user-events.csv");
const EVENTS_LOG_HEADER = "Received,Session ID,Event Type,Value";

// Create logs folder and log file with headers if they do not already exist
fs.mkdirSync("logs", { recursive: true });
if (!fs.existsSync(EVENTS_LOG_PATH)) {
  fs.writeFileSync(EVENTS_LOG_PATH, EVENTS_LOG_HEADER + "\n", "utf8");
}

class RequestLogger {
  // Queue for async tasks to be completed sequentially (no overlapping with each other)
  static asyncQueueTail = Promise.resolve();

  static log(req) {
    // Deferring setting received value for performance
    let received;

    switch (req.originalUrl) {
      case "/api/user-events":
        const { sessionId, events } = req.body;
        received = new Date().toISOString();

        const rows = events.map(
          (event) => `${received},${sessionId},${event.type},${event.value}`
        );

        RequestLogger.asyncQueueTail = RequestLogger.asyncQueueTail
          .then(async () => {
            await fs.promises.appendFile(
              EVENTS_LOG_PATH,
              rows.join("\n") + "\n",
              "utf8"
            );

            console.log(
              `${received} | Logged HTTP ${req.method} ${req.originalUrl}`
            );
          })
          .catch((err) => console.log("Failed to append to log file:", err));

        break;
      default:
        throw new Error("unable to log request (unrecognised route)");
    }
  }
}

export default RequestLogger;
