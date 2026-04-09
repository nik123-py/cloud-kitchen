import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handleCors } from "../_lib/cors";
import { getAuthUser } from "../_lib/auth";
import { getSupabaseAdmin } from "../_lib/supabase";

/**
 * POST /api/orders/create — create a new order (auth required)
 *
 * Body: {
 *   items: [{ id, name, price, quantity }],
 *   subtotal: number,
 *   delivery_charge: number,
 *   total: number,
 *   order_type: "pickup" | "delivery",
 *   delivery_address?: string,
 *   payment_method: "cash" | "qr",
 *   customer_name?: string,
 *   customer_phone?: string,
 * }
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

    const {
      items,
      subtotal,
      delivery_charge,
      total,
      order_type,
      delivery_address,
      payment_method,
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Missing or empty items" });
    }

    if (!order_type || !["pickup", "delivery"].includes(order_type)) {
      return res.status(400).json({ error: "Invalid order_type" });
    }

    if (!payment_method || !["cash", "qr"].includes(payment_method)) {
      return res.status(400).json({ error: "Invalid payment_method" });
    }

    if (order_type === "delivery" && !delivery_address) {
      return res.status(400).json({ error: "Delivery address required for delivery orders" });
    }

    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        items,
        subtotal: Number(subtotal),
        delivery_charge: Number(delivery_charge),
        total: Number(total),
        order_type,
        delivery_address: delivery_address || null,
        payment_method,
        payment_status: payment_method === "qr" ? "pending" : "pending",
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      console.error("Order create error:", error);
      return res.status(500).json({ error: "Failed to create order" });
    }

    return res.status(201).json(data);
  } catch (err) {
    console.error("Order create handler error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
