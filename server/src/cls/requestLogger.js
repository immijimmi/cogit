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
  static log(req) {
    switch (req.originalUrl) {
      case "/api/user-events":
        const received = new Date().toISOString();
        const { sessionId, events } = req.body;

        const lines = events.map(
          (event) => `${received},${sessionId},${event.type},${event.value}`
        );

        // Will need scaling up from CSV to DB if traffic increases
        fs.appendFileSync(EVENTS_LOG_PATH, lines.join("\n") + "\n", "utf8");
        break;
      default:
        throw new Error("unable to log request (unrecognised route)");
    }

    console.log(`${received} | Logged HTTP ${req.method} ${req.originalUrl}`);
  }
}

export default RequestLogger;
