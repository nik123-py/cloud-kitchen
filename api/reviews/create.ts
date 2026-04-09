import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handleCors } from "../_lib/cors";
import { getAuthUser } from "../_lib/auth";
import { getSupabaseAdmin } from "../_lib/supabase";

/**
 * POST /api/reviews/create — auth required: create a review
 *
 * Body: { order_id: string, rating: number (1-5), comment?: string }
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

    const { order_id, rating, comment } = req.body;

    if (!order_id || !rating) {
      return res.status(400).json({ error: "Missing required fields: order_id, rating" });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    const supabase = getSupabaseAdmin();

    // Verify the order belongs to this user and is completed
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, user_id, status")
      .eq("id", order_id)
      .single();

    if (orderError || !order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.user_id !== user.id) {
      return res.status(403).json({ error: "Cannot review an order that isn't yours" });
    }

    // Check for existing review
    const { data: existing } = await supabase
      .from("reviews")
      .select("id")
      .eq("order_id", order_id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (existing) {
      return res.status(409).json({ error: "You already reviewed this order" });
    }

    const { data, error } = await supabase
      .from("reviews")
      .insert({
        user_id: user.id,
        order_id,
        rating: Number(rating),
        comment: comment || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Review create error:", error);
      return res.status(500).json({ error: "Failed to create review" });
    }

    return res.status(201).json(data);
  } catch (err) {
    console.error("Review create handler error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
