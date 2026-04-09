import { Plus, Minus } from "lucide-react";
import { motion } from "framer-motion";
import type { MenuItem } from "@/context/CartContext";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";

const MenuItemCard = ({ item }: { item: MenuItem }) => {
  const { items, addToCart, updateQuantity } = useCart();
  const cartItem = items.find((i) => i.id === item.id);
  const qty = cartItem?.quantity || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-lg shadow-card overflow-hidden flex gap-3 p-3 relative"
    >
      <img
        src={item.image}
        alt={item.name}
        loading="lazy"
        width={112}
        height={112}
        className="w-28 h-28 rounded-lg object-cover flex-shrink-0"
      />
      <div className="flex flex-col flex-1 min-w-0 justify-between">
        <div>
          <div className="flex items-start gap-1">
            <h3 className="font-semibold text-sm leading-tight truncate">{item.name}</h3>
            {item.isBestseller && (
              <span className="flex-shrink-0 text-[10px] font-bold bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded">
                ★ BEST
              </span>
            )}
          </div>
          <p className="text-muted-foreground text-xs mt-1 line-clamp-2">{item.description}</p>
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="font-bold text-base">₹{item.price}</span>
          {qty === 0 ? (
            <Button
              size="sm"
              className="h-8 px-5 text-xs font-semibold gradient-primary text-primary-foreground rounded-lg"
              onClick={() => addToCart(item)}
            >
              ADD
            </Button>
          ) : (
            <div className="flex items-center gap-2 bg-primary/10 rounded-lg px-1">
              <button
                onClick={() => updateQuantity(item.id, qty - 1)}
                className="w-7 h-7 flex items-center justify-center text-primary"
              >
                <Minus size={16} />
              </button>
              <span className="font-bold text-sm text-primary w-4 text-center">{qty}</span>
              <button
                onClick={() => updateQuantity(item.id, qty + 1)}
                className="w-7 h-7 flex items-center justify-center text-primary"
              >
                <Plus size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default MenuItemCard;
