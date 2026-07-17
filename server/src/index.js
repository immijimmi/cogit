import express from "express";
import cors from "cors";
import fs from "node:fs/promises";
import { PORT } from "./constants.js";
import { requireJson } from "./methods/middleware.js";
import RequestLogger from "./cls/requestLogger.js";

const METADATA_READ_COOLDOWN_MS = 1000 * 30; // 30 seconds

const app = express();
app.use(express.json());
// CORS is globally allowed - this server does not need to discriminate based on request origin
app.use(cors());
// In dev, ngrok + nginx = 2 hops. In prod, just nginx = 1 hop
app.set("trust proxy", process.env.NODE_ENV === "development" ? 2 : 1);

let metadata = null;
let lastMetadataReadMs = null;
app.get("/api/metadata", async (req, res) => {
  const nowMs = Date.now();
  const isReadRecently =
    lastMetadataReadMs !== null &&
    nowMs - lastMetadataReadMs < METADATA_READ_COOLDOWN_MS;

  if (isReadRecently) {
    return res.json({ ok: true, data: metadata });
  } else {
    try {
      const bytes = await fs.readFile("../metadata.json", "utf8");
      metadata = JSON.parse(bytes);
      lastMetadataReadMs = nowMs;

      return res.json({ ok: true, data: metadata });
    } catch (err) {
      console.log("Error processing GET /metadata request:", err);

      return res.status(500).json({
        error: "Unable to retrieve server metadata",
      });
    }
  }
});

app.post("/api/user-events", requireJson, (req, res) => {
  try {
    RequestLogger.log(req);
    return res.sendStatus(204);
  } catch (err) {
    console.log("Error processing POST /user-events request:", err);

    return res.status(400).json({
      error: "Unable to process request content",
    });
  }
});

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
