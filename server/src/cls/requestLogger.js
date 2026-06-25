import fs from "node:fs";
import path from "node:path";

const LOGS_FOLDER_PATH = "logs";
const REQUESTS_FILENAME = "requests.csv";
const REQUESTS_HEADER =
  "Received,Method,Original URL,IP,Remote Address,User Agent,Origin,Referrer";

class RequestLogger {
  static log(req) {
    const received = new Date().toISOString();
    const logData = `${received},${req.method},${req.originalUrl},${req.ip},${
      req.socket.remoteAddress
    },${req.get("user-agent")},${req.get("origin")},${req.get("referer")}`;

    fs.mkdirSync("logs", { recursive: true });

    const filePath = path.join(LOGS_FOLDER_PATH, REQUESTS_FILENAME);

    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, REQUESTS_HEADER + "\n", "utf8");
    }
    fs.appendFileSync(filePath, logData + "\n", "utf8"); // Will need scaling up from CSV to DB if traffic increases

    console.log(
      `${received} | Logged HTTP ${req.method} ${req.originalUrl} (Remote Address: ${req.socket.remoteAddress})`
    );
  }
}

export default RequestLogger;
