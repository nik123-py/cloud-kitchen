import type { VercelRequest } from "@vercel/node";
import { getSupabaseAdmin } from "./supabase";

export interface AuthUser {
  id: string;
  email?: string;
}

/**
 * Extract and verify user from the Authorization header.
 * Returns the user object or null if invalid/missing.
 */
export async function getAuthUser(req: VercelRequest): Promise<AuthUser | null> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.replace("Bearer ", "");
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return null;

  return { id: data.user.id, email: data.user.email };
}

/**
 * Check if the authenticated user has the 'admin' role.
 */
export async function isAdmin(userId: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();

  return !error && !!data;
}
