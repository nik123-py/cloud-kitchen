import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Package, Truck, MessageCircle, QrCode, Copy, Check, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAdmin } from "@/context/AdminContext";

const Checkout = () => {
  const [orderType, setOrderType] = useState<"pickup" | "delivery">("pickup");
  const [address, setAddress] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "qr">("cash");
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [copiedUPI, setCopiedUPI] = useState(false);
  const { total, freeDesert, clearCart, items, subtotal, deliveryCharge } = useCart();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { settings } = useAdmin();

  const finalTotal = freeDesert ? total - 40 : total;

  if (items.length === 0 && !orderPlaced) {
    navigate("/menu");
    return null;
  }

  const buildWhatsAppMessage = () => {
    const itemLines = items
      .map((i) => `  • ${i.name} x${i.quantity} — ₹${i.price * i.quantity}`)
      .join("\n");

    const message = `🍽️ *New Order — Soni Kitchen*
━━━━━━━━━━━━━━━━━━━━

📋 *Order Items:*
${itemLines}

━━━━━━━━━━━━━━━━━━━━
💰 Subtotal: ₹${subtotal}
🚚 Delivery: ₹${deliveryCharge}${freeDesert ? "\n🎁 Free Dessert: -₹40" : ""}
💵 *TOTAL PAID: ₹${finalTotal}*

━━━━━━━━━━━━━━━━━━━━
📦 Order Type: ${orderType === "pickup" ? "🏠 Self Pickup" : "🚚 Home Delivery"}${
      orderType === "delivery" ? `\n📍 Delivery Address: ${address.trim() || "Not provided"}` : ""
    }
💳 Payment: ${paymentMethod === "cash" ? "💵 Cash on ${orderType === 'pickup' ? 'Pickup' : 'Delivery'}" : "📱 UPI / QR Code"}

━━━━━━━━━━━━━━━━━━━━
👤 Name: ${name.trim() || "Customer"}${phone.trim() ? `\n📞 Phone: ${phone.trim()}` : ""}`;

    return encodeURIComponent(message);
  };

  const handlePlaceOrder = async () => {
    if (orderType === "delivery" && !address.trim()) {
      toast({ title: "Please enter your delivery address", variant: "destructive" });
      return;
    }

    setIsProcessing(true);
    try {
      await new Promise((r) => setTimeout(r, 600));

      const whatsappUrl = `https://wa.me/${settings.whatsapp_number}?text=${buildWhatsAppMessage()}`;
      window.open(whatsappUrl, "_blank");

      toast({ title: "🎉 Order Sent!", description: "Your order details have been sent to WhatsApp." });

      setOrderPlaced(true);
      clearCart();
      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      console.error(err);
      toast({ title: "Failed to place order. Please try again.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyUPI = () => {
    navigator.clipboard.writeText(settings.upi_id).then(() => {
      setCopiedUPI(true);
      setTimeout(() => setCopiedUPI(false), 2000);
      toast({ title: "UPI ID copied!" });
    });
  };

  return (
    <div className="pb-24 md:pb-8">
      <div className="container px-4 py-4 max-w-lg mx-auto">
        <h1 className="font-display text-2xl font-bold mb-4">Checkout</h1>

        {/* Customer Info */}
        <div className="space-y-3 mb-5">
          <h3 className="font-semibold text-sm">Your Details <span className="text-muted-foreground font-normal">(optional)</span></h3>
          <div className="grid grid-cols-2 gap-3">
            <Input
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-11"
            />
            <Input
              placeholder="Phone number"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-11"
            />
          </div>
        </div>

        {/* Order Type */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm">Order Type</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { type: "pickup" as const, icon: Package, label: "Self Pickup", desc: "Collect from kitchen" },
              { type: "delivery" as const, icon: Truck, label: "Home Delivery", desc: "+₹10 delivery charge" },
            ].map((opt) => (
              <motion.button
                key={opt.type}
                whileTap={{ scale: 0.97 }}
                onClick={() => setOrderType(opt.type)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  orderType === opt.type ? "border-primary bg-primary/5" : "border-border bg-card"
                }`}
              >
                <opt.icon size={24} className={orderType === opt.type ? "text-primary" : "text-muted-foreground"} />
                <p className="font-semibold text-sm mt-2">{opt.label}</p>
                <p className="text-muted-foreground text-xs">{opt.desc}</p>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Delivery Address — always shown for delivery */}
        <AnimatePresence>
          {orderType === "delivery" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4"
            >
              <h3 className="font-semibold text-sm mb-2 flex items-center gap-1.5">
                <MapPin size={14} className="text-primary" /> Delivery Address *
              </h3>
              <textarea
                placeholder="Enter your full delivery address..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={3}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Payment Method */}
        <div className="mt-6 space-y-3">
          <h3 className="font-semibold text-sm">Payment Method</h3>
          {[
            { method: "cash" as const, icon: "💵", label: "Cash on Pickup/Delivery", desc: "Pay when you collect" },
            { method: "qr" as const, icon: "📱", label: "UPI / QR Code", desc: "Scan QR and pay online" },
          ].map((opt) => (
            <button
              key={opt.method}
              onClick={() => setPaymentMethod(opt.method)}
              className={`w-full p-3 rounded-xl border-2 text-left transition-all flex items-center gap-3 ${
                paymentMethod === opt.method ? "border-primary bg-primary/5" : "border-border bg-card"
              }`}
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                paymentMethod === opt.method ? "border-primary" : "border-muted-foreground"
              }`}>
                {paymentMethod === opt.method && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
              </div>
              <span className="text-lg">{opt.icon}</span>
              <div>
                <p className="font-semibold text-sm">{opt.label}</p>
                <p className="text-muted-foreground text-xs">{opt.desc}</p>
              </div>
            </button>
          ))}
        </div>

        {/* QR Code Payment Section */}
        <AnimatePresence>
          {paymentMethod === "qr" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-4 bg-card rounded-xl p-4 shadow-card text-center space-y-3"
            >
              <h3 className="font-semibold text-sm flex items-center justify-center gap-2">
                <QrCode size={18} className="text-primary" /> Scan to Pay — ₹{finalTotal}
              </h3>

              <div className="bg-white rounded-xl p-4 inline-block mx-auto shadow">
                {settings.qr_code_url ? (
                  <img
                    src={settings.qr_code_url}
                    alt="Payment QR Code"
                    className="w-52 h-52 object-contain"
                  />
                ) : (
                  <div className="w-52 h-52 flex flex-col items-center justify-center text-muted-foreground bg-muted rounded-lg">
                    <QrCode size={64} className="mb-2 text-primary/40" />
                    <p className="text-xs text-center">QR code not configured.<br />Set it in Admin → Settings</p>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Or pay via UPI ID:</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="font-mono text-sm bg-muted px-3 py-1.5 rounded-lg">{settings.upi_id}</span>
                  <button onClick={handleCopyUPI} className="text-primary hover:text-primary/80 p-1.5 bg-primary/10 rounded">
                    {copiedUPI ? <Check size={15} /> : <Copy size={15} />}
                  </button>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-left">
                <p className="text-xs text-amber-800 font-medium">💡 Payment Instructions:</p>
                <ol className="text-xs text-amber-700 mt-1 space-y-0.5 list-decimal list-inside">
                  <li>Scan the QR code or use UPI ID above</li>
                  <li>Pay ₹{finalTotal} and take a screenshot</li>
                  <li>Click "Place Order" — your order goes via WhatsApp</li>
                  <li>Share payment screenshot on WhatsApp</li>
                </ol>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Order Summary */}
        <div className="mt-6 bg-card rounded-xl p-4 shadow-card space-y-2">
          <h3 className="font-semibold text-sm mb-3">Order Summary</h3>
          {items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-muted-foreground">{item.name} × {item.quantity}</span>
              <span className="font-medium">₹{item.price * item.quantity}</span>
            </div>
          ))}
          <div className="border-t border-border pt-2 mt-2 space-y-1.5">
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
        </div>

        {/* Place Order Button */}
        <Button
          onClick={handlePlaceOrder}
          disabled={isProcessing}
          className="w-full mt-5 gradient-primary text-white font-semibold h-14 text-base gap-2 rounded-xl shadow-lg"
        >
          {isProcessing ? (
            "Sending Order..."
          ) : (
            <>
              <MessageCircle size={20} /> Order via WhatsApp — ₹{finalTotal}
            </>
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center mt-3 leading-relaxed">
          📲 Your order details will be sent directly to<br />
          <strong>Soni Kitchen</strong> via WhatsApp
        </p>
      </div>
    </div>
  );
};

export default Checkout;
