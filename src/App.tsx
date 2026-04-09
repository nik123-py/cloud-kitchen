import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/context/CartContext";
import { AdminProvider, useAdmin } from "@/context/AdminContext";
import Header from "@/components/Header";
import WhatsAppButton from "@/components/WhatsAppButton";
import Index from "./pages/Index";
import Menu from "./pages/Menu";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderTracking from "./pages/OrderTracking";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";
import { useEffect, useRef } from "react";

const queryClient = new QueryClient();

// Visitor tracking — fires once per session per path
const VisitorTracker = () => {
  const { recordVisit } = useAdmin();
  const location = useLocation();
  const tracked = useRef(new Set<string>());

  useEffect(() => {
    const key = `${location.pathname}`;
    if (!tracked.current.has(key)) {
      tracked.current.add(key);
      // Only count home, menu, and cart as meaningful visits
      if (["/", "/menu", "/cart"].includes(location.pathname)) {
        recordVisit();
      }
    }
  }, [location.pathname, recordVisit]);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AdminProvider>
        <CartProvider>
          <Toaster />
          <BrowserRouter>
            <VisitorTracker />
            <Header />
            <main className="min-h-screen">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/menu" element={<Menu />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/order-tracking" element={<OrderTracking />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <WhatsAppButton />
          </BrowserRouter>
        </CartProvider>
      </AdminProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
