import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handleCors } from "../_lib/cors";
import { getAuthUser } from "../_lib/auth";
import { getSupabaseAdmin } from "../_lib/supabase";

/**
 * GET /api/orders — returns authenticated user's orders
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

    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Orders fetch error:", error);
      return res.status(500).json({ error: "Failed to fetch orders" });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error("Orders handler error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
