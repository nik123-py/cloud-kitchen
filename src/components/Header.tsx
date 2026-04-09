import { Link, useLocation } from "react-router-dom";
import { ShoppingCart, Home, UtensilsCrossed, Info } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useKitchenStatus } from "@/hooks/use-kitchen-status";
import { motion } from "framer-motion";

const Header = () => {
  const { totalItems } = useCart();
  const location = useLocation();
  const { isOpen } = useKitchenStatus();

  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/menu", icon: UtensilsCrossed, label: "Menu" },
    { path: "/cart", icon: ShoppingCart, label: "Cart", badge: totalItems },
  ];

  return (
    <>
      {/* Top header */}
      <header className="sticky top-0 z-50 bg-card/90 backdrop-blur-lg border-b border-border">
        <div className="container flex items-center justify-between h-14 px-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-lg font-display font-bold text-primary">Soni Kitchen</span>
            <span className={`hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
              isOpen
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isOpen ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
              {isOpen ? "Open" : "Closed"}
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`relative flex items-center gap-1.5 text-sm font-medium transition-colors ${
                  location.pathname === item.path ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <item.icon size={18} />
                {item.label}
                {item.badge ? (
                  <span className="absolute -top-2 -right-4 bg-primary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-semibold">
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            ))}
          </div>
        </div>
      </header>

      {/* Bottom nav - mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} className="relative flex flex-col items-center gap-0.5 py-1 flex-1">
                <motion.div whileTap={{ scale: 0.9 }}>
                  <item.icon size={22} className={isActive ? "text-primary" : "text-muted-foreground"} />
                </motion.div>
                <span className={`text-[10px] font-medium ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                  {item.label}
                </span>
                {item.badge ? (
                  <span className="absolute top-0.5 right-5 bg-primary text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default Header;
