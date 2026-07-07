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
