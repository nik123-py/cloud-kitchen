import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handleCors } from "../_lib/cors";
import { getAuthUser, isAdmin } from "../_lib/auth";
import { getSupabaseAdmin } from "../_lib/supabase";

/**
 * GET /api/orders/admin — admin only: returns all orders with optional filters
 *
 * Query params:
 *   status: filter by order status
 *   limit: number of orders (default 50)
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const user = await getAuthUser(req);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const admin = await isAdmin(user.id);
    if (!admin) {
      return res.status(403).json({ error: "Forbidden: admin access required" });
    }

    const supabase = getSupabaseAdmin();

    const { status, limit } = req.query;
    const limitNum = limit ? parseInt(limit as string, 10) : 50;

    let query = supabase
      .from("orders")
      .select("*, profiles!inner(display_name, email)")
      .order("created_at", { ascending: false })
      .limit(limitNum);

    if (status && typeof status === "string") {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Admin orders fetch error:", error);
      // Fallback without join if profiles join fails
      const { data: fallbackData, error: fallbackError } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limitNum);

      if (fallbackError) {
        return res.status(500).json({ error: "Failed to fetch orders" });
      }
      return res.status(200).json(fallbackData);
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error("Admin orders handler error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
