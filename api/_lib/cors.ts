import type { VercelRequest, VercelResponse } from "@vercel/node";

/**
 * Set CORS headers and handle OPTIONS preflight.
 * Returns true if this was a preflight request (caller should return early).
 *
 * In production: restricts to the VERCEL_URL / ALLOWED_ORIGIN env var.
 * In development: allows all localhost origins.
 */
export function handleCors(req: VercelRequest, res: VercelResponse): boolean {
  const origin = req.headers.origin || "";

  // Build allowed origins list from env
  const allowedOrigins: string[] = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:8080",
  ];

  // Accept the explicitly configured production origin
  if (process.env.FRONTEND_URL) {
    allowedOrigins.push(process.env.FRONTEND_URL);
  }

  // Also accept any *.vercel.app subdomain (covers preview deploys)
  const isAllowed =
    allowedOrigins.includes(origin) ||
    origin.endsWith(".vercel.app") ||
    origin.endsWith(".vercel.dev");

  res.setHeader("Access-Control-Allow-Origin", isAllowed ? origin : allowedOrigins[0]);
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Authorization, Content-Type, x-client-info, apikey, X-Requested-With"
  );
  res.setHeader("Access-Control-Max-Age", "86400");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return true;
  }

  return false;
}
