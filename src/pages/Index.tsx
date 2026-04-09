import { Link } from "react-router-dom";
import { Clock, MapPin, Sparkles, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAdmin } from "@/context/AdminContext";
import { useKitchenStatus } from "@/hooks/use-kitchen-status";
import choleBhature from "@/assets/chole-bhature.jpg";

const TODAY = (): string => new Date().toISOString().split("T")[0];

const Index = () => {
  const { settings, dailySpecial } = useAdmin();
  const { isOpen, displayHours } = useKitchenStatus();

  const todaySpecial = dailySpecial && dailySpecial.date === TODAY() ? dailySpecial : null;

  return (
    <div className="pb-20 md:pb-8">
      {/* Hero */}
      <section className="relative overflow-hidden gradient-primary text-white">
        <div className="container px-4 py-8 md:py-16 flex flex-col md:flex-row items-center gap-6 md:gap-12">
          <motion.div
            className="flex-1 space-y-4 text-center md:text-left"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Open/Closed badge */}
            <div className="flex justify-center md:justify-start">
              <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${
                isOpen
                  ? "bg-green-500/25 text-green-100 border border-green-400/40"
                  : "bg-red-500/25 text-red-100 border border-red-400/40"
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isOpen ? "bg-green-400 animate-pulse" : "bg-red-400"}`} />
                {isOpen ? "Open Now" : "Currently Closed"}
                {" • "}
                {displayHours}
              </span>
            </div>

            <h1 className="font-display text-3xl md:text-5xl font-bold leading-tight">
              Soni Kitchen
            </h1>
            <p className="text-white/80 text-sm md:text-base font-medium">
              From Jaiswal &amp; Family — Homestyle flavors delivered with love
            </p>
            <Link to="/menu">
              <Button size="lg" className="mt-2 bg-white text-primary font-semibold hover:bg-white/90 gap-2">
                Explore Menu <ArrowRight size={18} />
              </Button>
            </Link>
          </motion.div>

          <motion.div
            className="w-48 h-48 md:w-72 md:h-72 rounded-full overflow-hidden border-4 border-white/30 shadow-2xl flex-shrink-0"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <img src={choleBhature} alt="Chole Bhature" className="w-full h-full object-cover" width={288} height={288} />
          </motion.div>
        </div>
      </section>

      {/* Info Cards */}
      <section className="container px-4 -mt-6 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            {
              icon: Clock,
              title: isOpen ? "Open Now" : "Closed",
              text: displayHours,
              color: isOpen ? "text-green-600" : "text-red-500",
              bg: isOpen ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200",
            },
            {
              icon: MapPin,
              title: "Location",
              text: settings.address,
              color: "text-primary",
              bg: "bg-card",
            },
          ].map((card, i) => (
            <motion.div
              key={card.title}
              className={`${card.bg} rounded-xl p-4 shadow-card flex items-center gap-3`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
            >
              <card.icon size={28} className={card.color} />
              <div>
                <p className="font-semibold text-sm">{card.title}</p>
                <p className="text-muted-foreground text-xs">{card.text}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Today's Special */}
      {todaySpecial && (
        <section className="container px-4 mt-8">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={18} className="text-secondary" />
            <h2 className="font-display text-xl font-bold">Today's Special</h2>
          </div>
          <motion.div
            className="relative rounded-2xl overflow-hidden shadow-card-hover cursor-pointer"
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {todaySpecial.custom_image_url ? (
              <img
                src={todaySpecial.custom_image_url}
                alt={todaySpecial.custom_name}
                className="w-full h-52 md:h-72 object-cover"
              />
            ) : (
              <div className="w-full h-52 md:h-72 gradient-primary" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 p-5 text-white">
              <span className="text-[11px] font-bold bg-secondary text-secondary-foreground px-2.5 py-1 rounded-full mb-2 inline-block">
                ✨ SPECIAL TODAY
              </span>
              <h3 className="font-display text-2xl font-bold mt-1">{todaySpecial.custom_name}</h3>
              {todaySpecial.custom_description && (
                <p className="text-white/80 text-sm mt-1">{todaySpecial.custom_description}</p>
              )}
              <div className="flex items-center gap-3 mt-3">
                {todaySpecial.custom_price > 0 && (
                  <span className="text-xl font-bold">₹{todaySpecial.custom_price}</span>
                )}
                <Link to="/menu">
                  <Button size="sm" className="gradient-primary text-white font-semibold">
                    Order Now
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </section>
      )}

      {/* Signature Dish (shown when no daily special) */}
      {!todaySpecial && (
        <section className="container px-4 mt-8">
          <h2 className="font-display text-xl font-bold mb-4">⭐ Our Signature Dish</h2>
          <motion.div
            className="relative rounded-2xl overflow-hidden shadow-card-hover"
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <img src={choleBhature} alt="Chole Bhature" className="w-full h-48 md:h-72 object-cover" loading="lazy" width={800} height={400} />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 to-transparent" />
            <div className="absolute bottom-0 left-0 p-5 text-white">
              <h3 className="font-display text-2xl font-bold">Chole Bhature</h3>
              <p className="text-white/80 text-sm mt-1">Fluffy fried bread with spicy chickpea curry</p>
              <div className="flex items-center gap-3 mt-3">
                <span className="text-xl font-bold">₹80</span>
                <Link to="/menu">
                  <Button size="sm" className="gradient-primary text-white font-semibold">
                    Order Now
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </section>
      )}

      {/* Kitchen Full Name Display */}
      <section className="container px-4 mt-8">
        <div className="bg-card rounded-xl p-4 shadow-card text-center">
          <p className="text-primary font-display font-bold text-lg">{settings.name}</p>
          <p className="text-muted-foreground text-sm mt-1 flex items-center justify-center gap-1.5">
            <MapPin size={13} /> {settings.address}
          </p>
        </div>
      </section>
    </div>
  );
};

export default Index;
