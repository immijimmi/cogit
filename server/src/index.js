import express from "express";
import cors from "cors";
import fs from "node:fs/promises";
import { PORT } from "./constants.js";
import RequestLogger from "./cls/requestLogger.js";

const METADATA_READ_COOLDOWN_MS = 1000 * 30; // 30 seconds

const app = express();
app.use(express.json());
// CORS is globally allowed - this server does not need to discriminate based on request origin
app.use(cors());

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
      return res.status(500).json({
        error: "Internal Server Error",
        message: "Unable to retrieve server metadata",
      });
    }
  }
});

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
