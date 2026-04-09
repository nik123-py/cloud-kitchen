import { MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

const WA_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || "919999999999";

const WhatsAppButton = () => (
  <motion.a
    href={`https://wa.me/${WA_NUMBER}?text=Hi%20Soni%20Kitchen!`}
    target="_blank"
    rel="noopener noreferrer"
    className="fixed bottom-20 md:bottom-6 right-4 z-40 w-14 h-14 rounded-full bg-accent text-accent-foreground flex items-center justify-center shadow-lg"
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    transition={{ delay: 1, type: "spring" }}
  >
    <MessageCircle size={26} />
  </motion.a>
);

export default WhatsAppButton;
