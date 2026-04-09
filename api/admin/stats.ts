import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handleCors } from "../_lib/cors";
import { getAuthUser, isAdmin } from "../_lib/auth";
import { getSupabaseAdmin } from "../_lib/supabase";

/**
 * GET /api/admin/stats — admin only: dashboard statistics
 *
 * Returns: {
 *   totalMenuItems, availableMenuItems,
 *   totalOrders, pendingOrders, completedOrders,
 *   totalRevenue, todayOrders, todayRevenue
 * }
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

    // Menu item stats
    const { count: totalMenuItems } = await supabase
      .from("menu_items")
      .select("*", { count: "exact", head: true });

    const { count: availableMenuItems } = await supabase
      .from("menu_items")
      .select("*", { count: "exact", head: true })
      .eq("is_available", true);

    // Order stats
    const { count: totalOrders } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true });

    const { count: pendingOrders } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .in("status", ["pending", "approved"]);

    const { count: completedOrders } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("status", "completed");

    // Revenue
    const { data: allOrders } = await supabase
      .from("orders")
      .select("total, created_at, status")
      .in("status", ["approved", "ready", "completed"]);

    const totalRevenue = (allOrders || []).reduce((sum: number, o: any) => sum + (o.total || 0), 0);

    // Today's stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();

    const todayOrdersList = (allOrders || []).filter(
      (o: any) => new Date(o.created_at) >= today
    );
    const todayOrders = todayOrdersList.length;
    const todayRevenue = todayOrdersList.reduce((sum: number, o: any) => sum + (o.total || 0), 0);

    return res.status(200).json({
      totalMenuItems: totalMenuItems || 0,
      availableMenuItems: availableMenuItems || 0,
      totalOrders: totalOrders || 0,
      pendingOrders: pendingOrders || 0,
      completedOrders: completedOrders || 0,
      totalRevenue,
      todayOrders,
      todayRevenue,
    });
  } catch (err) {
    console.error("Admin stats handler error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
