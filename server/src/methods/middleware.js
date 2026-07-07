const SELF_IPS = new Set(["127.0.0.1", "::ffff:127.0.0.1", "::1"]);

export function requireJson(req, res, next) {
  const contentType = req.headers["content-type"] || "";
  if (!contentType.includes("application/json")) {
    return res.status(415).json({
      error: "application/json is required",
    });
  }

  next();
}

export function ignoreFromSelf(req, res, next) {
  if (SELF_IPS.has(req.ip)) {
    return res.sendStatus(204);
  }

  next();
}
