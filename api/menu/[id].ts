import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handleCors } from "../_lib/cors";
import { getAuthUser, isAdmin } from "../_lib/auth";
import { getSupabaseAdmin } from "../_lib/supabase";

/**
 * /api/menu/[id]
 *
 * GET    — public: get single menu item
 * PUT    — admin only: update a menu item
 * DELETE — admin only: delete a menu item
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;

  const { id } = req.query;
  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Missing menu item id" });
  }

  const supabase = getSupabaseAdmin();

  // GET — public
  if (req.method === "GET") {
    const { data, error } = await supabase
      .from("menu_items")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: "Menu item not found" });
    }
    return res.status(200).json(data);
  }

  // PUT / DELETE — admin only
  if (req.method === "PUT" || req.method === "DELETE") {
    const user = await getAuthUser(req);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const admin = await isAdmin(user.id);
    if (!admin) {
      return res.status(403).json({ error: "Forbidden: admin access required" });
    }

    if (req.method === "PUT") {
      const updates = req.body;
      if (!updates || Object.keys(updates).length === 0) {
        return res.status(400).json({ error: "No update fields provided" });
      }

      // Only allow safe fields
      const allowed = ["name", "price", "category", "description", "image_url", "is_available", "is_bestseller"];
      const safeUpdates: Record<string, any> = {};
      for (const key of allowed) {
        if (updates[key] !== undefined) {
          safeUpdates[key] = updates[key];
        }
      }

      const { data, error } = await supabase
        .from("menu_items")
        .update(safeUpdates)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Menu update error:", error);
        return res.status(500).json({ error: "Failed to update menu item" });
      }

      return res.status(200).json(data);
    }

    if (req.method === "DELETE") {
      const { error } = await supabase
        .from("menu_items")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Menu delete error:", error);
        return res.status(500).json({ error: "Failed to delete menu item" });
      }

      return res.status(200).json({ success: true, message: "Menu item deleted" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
