import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handleCors } from "../_lib/cors";
import { getSupabaseAdmin } from "../_lib/supabase";

/**
 * GET /api/reviews — public: returns all reviews with profile info
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("reviews")
      .select(`
        *,
        profiles!inner(display_name, avatar_url)
      `)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Reviews fetch error:", error);
      // Fallback without join
      const { data: fallback, error: fbErr } = await supabase
        .from("reviews")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (fbErr) {
        return res.status(500).json({ error: "Failed to fetch reviews" });
      }
      return res.status(200).json(fallback);
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error("Reviews handler error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
