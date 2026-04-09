import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handleCors } from "../_lib/cors";
import { getAuthUser, isAdmin } from "../_lib/auth";
import { getSupabaseAdmin } from "../_lib/supabase";

/**
 * POST /api/menu/create — admin only: create a new menu item
 *
 * Body: { name, price, category, description?, image_url?, is_available?, is_bestseller? }
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

    const { name, price, category, description, image_url, is_available, is_bestseller } = req.body;

    if (!name || price === undefined || !category) {
      return res.status(400).json({ error: "Missing required fields: name, price, category" });
    }

    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("menu_items")
      .insert({
        name,
        price: Number(price),
        category,
        description: description || null,
        image_url: image_url || null,
        is_available: is_available !== undefined ? is_available : true,
        is_bestseller: is_bestseller !== undefined ? is_bestseller : false,
      })
      .select()
      .single();

    if (error) {
      console.error("Menu create error:", error);
      return res.status(500).json({ error: "Failed to create menu item" });
    }

    return res.status(201).json(data);
  } catch (err) {
    console.error("Menu create handler error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
