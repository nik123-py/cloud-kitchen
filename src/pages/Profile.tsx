import { User, Clock, Star, LogIn, LogOut, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

const Profile = () => {
  const { user, loading, signInWithGoogle, signOut } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      // Fetch orders via API with auth header
      const fetchOrders = async () => {
        try {
          const { data: sessionData } = await supabase.auth.getSession();
          const token = sessionData.session?.access_token;

          const res = await fetch("/api/orders", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (res.ok) {
            const data = await res.json();
            setOrders(data);
          } else {
            // Fallback to direct Supabase query
            const { data } = await supabase
              .from("orders")
              .select("*")
              .eq("user_id", user.id)
              .order("created_at", { ascending: false });
            if (data) setOrders(data);
          }
        } catch {
          // Fallback to direct Supabase query
          const { data } = await supabase
            .from("orders")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });
          if (data) setOrders(data);
        }
      };
      fetchOrders();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="pb-24 md:pb-8">
        <div className="container px-4 py-6 max-w-lg mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl p-6 shadow-card text-center"
          >
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <User size={36} className="text-primary" />
            </div>
            <h2 className="font-display text-xl font-bold mt-4">Welcome, Guest!</h2>
            <p className="text-muted-foreground text-sm mt-2">Sign in to track orders and get exclusive offers</p>
            <Button onClick={signInWithGoogle} className="mt-4 gradient-primary text-primary-foreground font-semibold gap-2 w-full">
              <LogIn size={18} /> Sign in with Google
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24 md:pb-8">
      <div className="container px-4 py-6 max-w-lg mx-auto">
        {/* User info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl p-6 shadow-card flex items-center gap-4"
        >
          {user.user_metadata?.avatar_url ? (
            <img
              src={user.user_metadata.avatar_url}
              alt="Avatar"
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <User size={28} className="text-primary" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h2 className="font-display text-lg font-bold truncate">
              {user.user_metadata?.full_name || user.email}
            </h2>
            <p className="text-muted-foreground text-sm truncate">{user.email}</p>
          </div>
        </motion.div>

        {/* Order History */}
        <h3 className="font-semibold text-sm mt-6 mb-3 flex items-center gap-2">
          <ShoppingBag size={16} /> Order History
        </h3>
        {orders.length === 0 ? (
          <div className="bg-card rounded-xl p-6 shadow-card text-center">
            <p className="text-muted-foreground text-sm">No orders yet. Start ordering!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-xl p-4 shadow-card"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-sm">₹{order.total}</p>
                    <p className="text-muted-foreground text-xs">
                      {new Date(order.created_at).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric"
                      })}
                    </p>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    order.status === "ready" ? "bg-accent/20 text-accent" :
                    order.status === "approved" ? "bg-secondary/30 text-secondary-foreground" :
                    order.status === "completed" ? "bg-accent/20 text-accent" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {(order.items as any[]).map((i: any) => `${i.name} x${i.quantity}`).join(", ")}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Payment: {order.payment_method === "qr" ? "UPI/QR" : "Cash"} • {order.payment_status}
                </p>
              </motion.div>
            ))}
          </div>
        )}

        {/* Quick links */}
        <div className="mt-6 space-y-3">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-xl p-4 shadow-card flex items-center gap-3 cursor-pointer hover:shadow-card-hover transition-shadow"
          >
            <Star size={22} className="text-primary" />
            <div>
              <p className="font-semibold text-sm">Ratings & Reviews</p>
              <p className="text-muted-foreground text-xs">Rate your experience</p>
            </div>
          </motion.div>
        </div>

        <Button
          variant="outline"
          onClick={signOut}
          className="w-full mt-6 gap-2 text-destructive border-destructive/30"
        >
          <LogOut size={16} /> Sign Out
        </Button>
      </div>
    </div>
  );
};

export default Profile;
