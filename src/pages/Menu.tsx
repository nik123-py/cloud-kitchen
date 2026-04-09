import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { menuItems as staticMenuItems } from "@/data/menuItems";
import MenuItemCard from "@/components/MenuItemCard";
import { useCart } from "@/context/CartContext";
import { useAdmin } from "@/context/AdminContext";
import { useKitchenStatus } from "@/hooks/use-kitchen-status";
import { Link } from "react-router-dom";
import { ShoppingCart, Sparkles, Clock, MapPin, ChefHat } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { MenuItem } from "@/context/CartContext";

const TODAY = (): string => new Date().toISOString().split("T")[0];

const Menu = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [apiMenuItems, setApiMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { totalItems, subtotal } = useCart();
  const { menuItems: localMenuItems, dailySpecial, settings } = useAdmin();
  const { isOpen, displayHours } = useKitchenStatus();

  // Merge: prefer API → localStorage → static
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await fetch("/api/menu");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            const mapped: MenuItem[] = data.map((item: any) => ({
              id: item.id,
              name: item.name,
              price: item.price,
              image: item.image_url || "",
              category: item.category,
              description: item.description || "",
              isAvailable: item.is_available,
              isBestseller: item.is_bestseller,
            }));
            setApiMenuItems(mapped);
            setLoading(false);
            return;
          }
        }
      } catch { /* fall through */ }

      // Use localStorage items if available
      if (localMenuItems.length > 0) {
        const mapped: MenuItem[] = localMenuItems.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          image: item.image_url || "",
          category: item.category,
          description: item.description || "",
          isAvailable: item.is_available,
          isBestseller: item.is_bestseller,
        }));
        setApiMenuItems(mapped);
      } else {
        // Use static fallback
        setApiMenuItems(staticMenuItems);
      }
      setLoading(false);
    };

    fetchMenu();
  }, [localMenuItems]);

  const menuItems = apiMenuItems.length > 0 ? apiMenuItems : staticMenuItems;
  const categories = ["All", ...Array.from(new Set(menuItems.map((i) => i.category)))];
  const filtered = activeCategory === "All" ? menuItems : menuItems.filter((i) => i.category === activeCategory);
  const availableItems = filtered.filter((i) => i.isAvailable);
  const unavailableItems = filtered.filter((i) => !i.isAvailable);

  const todaySpecial = dailySpecial && dailySpecial.date === TODAY() ? dailySpecial : null;

  return (
    <div className="pb-28 md:pb-8">
      {/* Kitchen Status Banner */}
      <div className={`${isOpen ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"} border-b px-4 py-2.5`}>
        <div className="container flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isOpen ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
            <span className={`text-xs font-semibold ${isOpen ? "text-green-700" : "text-red-700"}`}>
              {isOpen ? "We're Open!" : "Currently Closed"}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Clock size={11} /> {displayHours}</span>
            <span className="flex items-center gap-1"><MapPin size={11} /> {settings.address}</span>
          </div>
        </div>
      </div>

      <div className="container px-4 py-4">
        <h1 className="font-display text-2xl font-bold">Our Menu</h1>

        {/* Today's Special Card */}
        {todaySpecial && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 relative rounded-2xl overflow-hidden shadow-card-hover"
          >
            {todaySpecial.custom_image_url ? (
              <img
                src={todaySpecial.custom_image_url}
                alt={todaySpecial.custom_name}
                className="w-full h-44 object-cover"
              />
            ) : (
              <div className="w-full h-44 gradient-primary flex items-center justify-center">
                <ChefHat size={64} className="text-white/40" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute top-3 left-3">
              <span className="bg-secondary text-secondary-foreground text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                <Sparkles size={11} /> TODAY'S SPECIAL
              </span>
            </div>
            <div className="absolute bottom-0 left-0 p-4 text-white">
              <h3 className="font-display text-xl font-bold">{todaySpecial.custom_name}</h3>
              {todaySpecial.custom_description && (
                <p className="text-white/80 text-xs mt-1 line-clamp-2">{todaySpecial.custom_description}</p>
              )}
              {todaySpecial.custom_price > 0 && (
                <p className="font-bold text-lg mt-2">₹{todaySpecial.custom_price}</p>
              )}
            </div>
          </motion.div>
        )}

        {/* Category Tabs */}
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? "gradient-primary text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Available Items */}
        {!loading && (
          <div className="mt-4 space-y-3">
            {availableItems.length === 0 && activeCategory !== "All" && (
              <div className="text-center py-10 text-muted-foreground text-sm">
                No items in this category right now
              </div>
            )}
            {availableItems.map((item) => (
              <MenuItemCard key={item.id} item={item} />
            ))}
          </div>
        )}

        {/* Unavailable Items */}
        {!loading && unavailableItems.length > 0 && (
          <div className="mt-6">
            <p className="text-sm font-semibold text-muted-foreground mb-2">Currently Unavailable</p>
            <div className="space-y-3 opacity-50">
              {unavailableItems.map((item) => (
                <MenuItemCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sticky Cart Bar */}
      {totalItems > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-16 md:bottom-0 left-0 right-0 z-40"
        >
          <div className="container px-4">
            <Link
              to="/cart"
              className="flex items-center justify-between gradient-primary text-white rounded-xl px-5 py-3.5 shadow-xl mb-2 md:mb-4"
            >
              <div className="flex items-center gap-2">
                <ShoppingCart size={20} />
                <span className="font-semibold text-sm">{totalItems} item{totalItems > 1 ? "s" : ""}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-lg">₹{subtotal}</span>
                <span className="text-xs bg-white/20 px-2.5 py-1 rounded-lg font-medium">View Cart →</span>
              </div>
            </Link>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Menu;
