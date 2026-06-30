import fs from "node:fs";
import path from "node:path";

const LOGS_FOLDER_PATH = "logs";
const LOG_FILENAME = "requests.csv";
const LOG_HEADER = "Received,Method,Original URL";

class RequestLogger {
  static log(req, additionalData) {
    const received = new Date().toISOString();
    const logData = `${received},${req.method},${req.originalUrl}${
      additionalData ? "," + ",".join(additionalData) : ""
    }`;

    fs.mkdirSync("logs", { recursive: true });

    const filePath = path.join(LOGS_FOLDER_PATH, LOG_FILENAME);

    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, LOG_HEADER + "\n", "utf8");
    }
    fs.appendFileSync(filePath, logData + "\n", "utf8"); // Will need scaling up from CSV to DB if traffic increases

    console.log(`${received} | Logged HTTP ${req.method} ${req.originalUrl}`);
  }
}

export default RequestLogger;
