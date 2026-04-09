import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handleCors } from "../_lib/cors";
import { getAuthUser, isAdmin } from "../_lib/auth";
import { getSupabaseAdmin } from "../_lib/supabase";

/**
 * /api/orders/[id]
 *
 * GET — auth required: get single order (own order or admin)
 * PUT — admin only: update order status
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;

  const { id } = req.query;
  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Missing order id" });
  }

  const user = await getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const supabase = getSupabaseAdmin();

  if (req.method === "GET") {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Only allow own orders or admin
    const admin = await isAdmin(user.id);
    if (data.user_id !== user.id && !admin) {
      return res.status(403).json({ error: "Forbidden" });
    }

    return res.status(200).json(data);
  }

  if (req.method === "PUT") {
    const admin = await isAdmin(user.id);
    if (!admin) {
      return res.status(403).json({ error: "Forbidden: admin access required" });
    }

    const { status, payment_status } = req.body;

    const updates: Record<string, any> = {};
    if (status) {
      const validStatuses = ["pending", "approved", "ready", "completed", "cancelled"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }
      updates.status = status;
    }
    if (payment_status) {
      const validPaymentStatuses = ["pending", "paid", "failed"];
      if (!validPaymentStatuses.includes(payment_status)) {
        return res.status(400).json({ error: "Invalid payment_status" });
      }
      updates.payment_status = payment_status;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No update fields provided" });
    }

    const { data, error } = await supabase
      .from("orders")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Order update error:", error);
      return res.status(500).json({ error: "Failed to update order" });
    }

    return res.status(200).json(data);
  }

  return res.status(405).json({ error: "Method not allowed" });
}
