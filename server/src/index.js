import express from "express";
import cors from "cors";
import fs from "node:fs/promises";
import { PORT } from "./constants.js";
import RequestLogger from "./cls/requestLogger.js";

const app = express();
app.use(express.json());
// CORS is globally allowed - this server does not need to discriminate based on request origin
app.use(cors());

// Request handlers
app.get("/api/metadata", async (req, res) => {
  RequestLogger.log(req);

  try {
    const bytes = await fs.readFile("../metadata.json", "utf8");
    const data = JSON.parse(bytes);

    res.json({ ok: true, data: data });
  } catch (err) {
    res.status(500).json("Unable to retrieve server metadata");
  }
});

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
