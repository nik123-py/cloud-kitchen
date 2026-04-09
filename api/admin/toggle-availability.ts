import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handleCors } from "../_lib/cors";
import { getAuthUser, isAdmin } from "../_lib/auth";
import { getSupabaseAdmin } from "../_lib/supabase";

/**
 * POST /api/admin/toggle-availability — admin only
 *
 * Body: { id: string, is_available: boolean }
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;

  if (req.method !== "POST") {
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

    const { id, is_available } = req.body;

    if (!id || is_available === undefined) {
      return res.status(400).json({ error: "Missing required fields: id, is_available" });
    }

    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("menu_items")
      .update({ is_available: Boolean(is_available) })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Toggle availability error:", error);
      return res.status(500).json({ error: "Failed to update availability" });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error("Toggle availability handler error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
