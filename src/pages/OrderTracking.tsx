import { CheckCircle2, Clock, ChefHat } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const steps = [
  { icon: Clock, label: "Order Placed", desc: "We've received your order", done: true },
  { icon: ChefHat, label: "Preparing", desc: "Your food is being prepared", done: false },
  { icon: CheckCircle2, label: "Ready", desc: "Ready for pickup/delivery", done: false },
];

const OrderTracking = () => {
  return (
    <div className="pb-24 md:pb-8">
      <div className="container px-4 py-8 max-w-lg mx-auto text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
          <p className="text-6xl mb-4">🎉</p>
        </motion.div>
        <h1 className="font-display text-2xl font-bold">Order Confirmed!</h1>
        <p className="text-muted-foreground text-sm mt-2">Estimated time: 20-30 minutes</p>

        <div className="mt-8 space-y-0">
          {steps.map((step, i) => (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.2 }}
              className="flex items-start gap-4 text-left"
            >
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step.done ? "gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}>
                  <step.icon size={20} />
                </div>
                {i < steps.length - 1 && (
                  <div className={`w-0.5 h-10 ${step.done ? "bg-primary" : "bg-muted"}`} />
                )}
              </div>
              <div className="pt-2">
                <p className={`font-semibold text-sm ${step.done ? "" : "text-muted-foreground"}`}>{step.label}</p>
                <p className="text-muted-foreground text-xs">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <Link to="/" className="block mt-8">
          <Button variant="outline" className="w-full">Back to Home</Button>
        </Link>
      </div>
    </div>
  );
};

export default OrderTracking;
