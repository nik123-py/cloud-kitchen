import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handleCors } from "../_lib/cors";
import { getSupabaseAdmin } from "../_lib/supabase";

/**
 * GET /api/menu — returns all menu items (public, no auth)
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const supabase = getSupabaseAdmin();

    const { category, available } = req.query;

    let query = supabase
      .from("menu_items")
      .select("*")
      .order("created_at", { ascending: false });

    if (category && typeof category === "string") {
      query = query.eq("category", category);
    }

    if (available === "true") {
      query = query.eq("is_available", true);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Menu fetch error:", error);
      return res.status(500).json({ error: "Failed to fetch menu items" });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error("Menu handler error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
