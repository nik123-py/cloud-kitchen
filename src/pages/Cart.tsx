import { Link } from "react-router-dom";
import { Minus, Plus, Trash2, Gift } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";

const Cart = () => {
  const { items, updateQuantity, removeFromCart, subtotal, deliveryCharge, total, freeDesert, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <p className="text-6xl mb-4">🛒</p>
        <h2 className="font-display text-xl font-bold">Your cart is empty</h2>
        <p className="text-muted-foreground text-sm mt-2">Add delicious items from our menu!</p>
        <Link to="/menu">
          <Button className="mt-4 gradient-primary text-white">Browse Menu</Button>
        </Link>
      </div>
    );
  }

  const finalTotal = freeDesert ? total - 40 : total;

  return (
    <div className="pb-24 md:pb-8">
      <div className="container px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="font-display text-2xl font-bold">Your Cart</h1>
          <button onClick={clearCart} className="text-destructive text-xs font-medium flex items-center gap-1">
            <Trash2 size={14} /> Clear All
          </button>
        </div>

        <AnimatePresence>
          {items.map((item) => (
            <motion.div
              key={item.id}
              layout
              exit={{ opacity: 0, x: -100 }}
              className="bg-card rounded-xl p-3 shadow-card flex items-center gap-3 mb-3"
            >
              {item.image ? (
                <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center text-2xl flex-shrink-0">🍽️</div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm truncate">{item.name}</h3>
                <p className="text-muted-foreground text-xs">₹{item.price} each</p>
              </div>
              <div className="flex items-center gap-1.5 bg-primary/10 rounded-lg px-1">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="w-7 h-7 flex items-center justify-center text-primary"
                >
                  <Minus size={14} />
                </button>
                <span className="font-bold text-sm text-primary w-5 text-center">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="w-7 h-7 flex items-center justify-center text-primary"
                >
                  <Plus size={14} />
                </button>
              </div>
              <span className="font-bold text-sm w-14 text-right">₹{item.price * item.quantity}</span>
            </motion.div>
          ))}
        </AnimatePresence>

        {freeDesert && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-3 mt-2"
          >
            <Gift size={20} className="text-green-600" />
            <div>
              <p className="font-semibold text-sm text-green-700">Free Gulab Jamun! 🎉</p>
              <p className="text-muted-foreground text-xs">First order offer — dessert on us!</p>
            </div>
          </motion.div>
        )}

        {/* Bill Summary */}
        <div className="bg-card rounded-xl p-4 shadow-card mt-4 space-y-2">
          <h3 className="font-semibold text-sm mb-2">Bill Details</h3>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>₹{subtotal}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Delivery Charge</span>
            <span>₹{deliveryCharge}</span>
          </div>
          {freeDesert && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Free Dessert 🎁</span>
              <span>-₹40</span>
            </div>
          )}
          <div className="border-t border-border pt-2 flex justify-between font-bold text-lg">
            <span>Total</span>
            <span className="text-primary">₹{finalTotal}</span>
          </div>
        </div>

        <Link to="/checkout" className="block mt-4">
          <Button className="w-full gradient-primary text-white font-semibold h-13 text-base rounded-xl">
            Proceed to Checkout — ₹{finalTotal}
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Cart;
