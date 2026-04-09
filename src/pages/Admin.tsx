import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck, UtensilsCrossed, Eye, EyeOff, X, Star, Loader2,
  Lock, Settings, Users, Plus, Pencil, Trash2,
  Clock, MapPin, LogOut, Check,
  Sparkles, BarChart3, Activity, QrCode, MessageCircle, ChefHat,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAdmin, type MenuItem, type DailySpecial } from "@/context/AdminContext";
import { useKitchenStatus } from "@/hooks/use-kitchen-status";

// ── Types ─────────────────────────────────────────────────────────
type Tab = "dashboard" | "menu" | "daily" | "settings";

const TODAY = (): string => new Date().toISOString().split("T")[0];

const CATEGORIES = [
  "Main Course", "Starters", "Beverages", "Desserts",
  "Snacks", "Thali", "Roti & Bread", "Rice", "Special",
];

// ── Admin Login ───────────────────────────────────────────────────
const AdminLogin = () => {
  const { login } = useAdmin();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    await new Promise((r) => setTimeout(r, 600));
    const ok = login(username, password);
    if (!ok) setError("Invalid username or password");
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4 shadow-lg">
            <ShieldCheck size={32} className="text-white" />
          </div>
          <h1 className="font-display text-2xl font-bold">Admin Panel</h1>
          <p className="text-muted-foreground text-sm mt-1">Soni Kitchen Management</p>
        </div>

        <form onSubmit={handleLogin} className="bg-card rounded-2xl p-6 shadow-card space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Username</label>
            <Input
              className="mt-1.5 h-11"
              placeholder="cloud kitchen"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Password</label>
            <Input
              className="mt-1.5 h-11"
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-destructive text-xs flex items-center gap-1"
              >
                <X size={12} /> {error}
              </motion.p>
            )}
          </AnimatePresence>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 gradient-primary text-white font-semibold gap-2"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Lock size={18} />}
            {loading ? "Verifying..." : "Sign In"}
          </Button>
        </form>
      </motion.div>
    </div>
  );
};

// ── Main Admin Panel ──────────────────────────────────────────────
const Admin = () => {
  const {
    isLoggedIn, logout,
    menuItems, addMenuItem, updateMenuItem, deleteMenuItem, toggleAvailability,
    dailySpecial, setDailySpecial, clearDailySpecial,
    settings, updateSettings,
    visitorStats,
  } = useAdmin();
  const { isOpen, displayHours } = useKitchenStatus();

  const [activeTab, setActiveTab] = useState<Tab>("dashboard");

  // Menu form
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState({
    name: "", price: "", category: CATEGORIES[0],
    description: "", image_url: "", is_bestseller: false,
  });

  // Daily Special form
  const [specialForm, setSpecialForm] = useState({
    custom_name: "", custom_description: "", custom_price: "", custom_image_url: "", item_id: "",
  });

  // Settings form
  const [settingsForm, setSettingsForm] = useState({ ...settings });
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Sync settings form when settings context changes
  useEffect(() => { setSettingsForm({ ...settings }); }, [settings]);

  // Sync daily special form
  useEffect(() => {
    if (dailySpecial && dailySpecial.date === TODAY()) {
      setSpecialForm({
        custom_name: dailySpecial.custom_name,
        custom_description: dailySpecial.custom_description,
        custom_price: String(dailySpecial.custom_price),
        custom_image_url: dailySpecial.custom_image_url,
        item_id: dailySpecial.item_id || "",
      });
    }
  }, [dailySpecial]);

  if (!isLoggedIn) return <AdminLogin />;

  // ── Visitor chart data ─────────────────────────────────────
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().split("T")[0];
    return {
      label: d.toLocaleDateString("en-IN", { weekday: "short" }),
      count: visitorStats.daily[key] || 0,
      key,
    };
  });
  const maxVisits = Math.max(...last7Days.map((d) => d.count), 1);

  // ── Menu form handlers ─────────────────────────────────────
  const resetForm = () => {
    setFormData({ name: "", price: "", category: CATEGORIES[0], description: "", image_url: "", is_bestseller: false });
    setEditingItem(null);
    setShowForm(false);
  };

  const openEditForm = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name, price: String(item.price), category: item.category,
      description: item.description, image_url: item.image_url, is_bestseller: item.is_bestseller,
    });
    setShowForm(true);
  };

  const handleSaveItem = () => {
    if (!formData.name.trim() || !formData.price || !formData.category) return;
    const payload = {
      name: formData.name.trim(),
      price: Number(formData.price),
      category: formData.category,
      description: formData.description.trim(),
      image_url: formData.image_url.trim(),
      is_bestseller: formData.is_bestseller,
      is_available: editingItem ? editingItem.is_available : true,
    };
    if (editingItem) { updateMenuItem(editingItem.id, payload); }
    else { addMenuItem(payload); }
    resetForm();
  };

  // ── Daily special save ─────────────────────────────────────
  const handleSaveSpecial = () => {
    if (!specialForm.custom_name.trim() && !specialForm.item_id) return;
    const selectedItem = specialForm.item_id
      ? menuItems.find((m) => m.id === specialForm.item_id)
      : null;
    setDailySpecial({
      date: TODAY(),
      item_id: specialForm.item_id || null,
      custom_name: specialForm.custom_name.trim() || selectedItem?.name || "",
      custom_description: specialForm.custom_description.trim() || selectedItem?.description || "",
      custom_price: specialForm.custom_price ? Number(specialForm.custom_price) : selectedItem?.price || 0,
      custom_image_url: specialForm.custom_image_url.trim() || selectedItem?.image_url || "",
    });
  };

  // ── Settings save ──────────────────────────────────────────
  const handleSaveSettings = () => {
    updateSettings(settingsForm);
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2000);
  };

  // ── Stats ──────────────────────────────────────────────────
  const availableCount = menuItems.filter((m) => m.is_available).length;
  const totalItems = menuItems.length;

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <div className="gradient-primary text-white">
        <div className="container px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShieldCheck size={26} />
              <div>
                <h1 className="font-display text-lg font-bold">Admin Panel</h1>
                <p className="text-white/70 text-xs">Soni Kitchen Management</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                isOpen ? "bg-green-500/30 text-green-100" : "bg-red-500/30 text-red-100"
              }`}>
                {isOpen ? "● OPEN" : "● CLOSED"}
              </span>
              <button onClick={logout} className="text-white/80 hover:text-white p-1.5" title="Logout">
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="container px-4 mt-4">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { key: "dashboard" as Tab, label: "Dashboard", icon: BarChart3 },
            { key: "menu" as Tab, label: "Menu", icon: UtensilsCrossed },
            { key: "daily" as Tab, label: "Daily Special", icon: Sparkles },
            { key: "settings" as Tab, label: "Settings", icon: Settings },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.key
                  ? "gradient-primary text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              <tab.icon size={15} /> {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="container px-4 mt-4">

        {/* ═══ DASHBOARD ═══ */}
        {activeTab === "dashboard" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">

            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Total Items", value: totalItems, icon: UtensilsCrossed, color: "text-primary" },
                { label: "Available", value: availableCount, icon: Eye, color: "text-green-500" },
                { label: "Today Visitors", value: visitorStats.today, icon: Users, color: "text-blue-500" },
                { label: "Total Visitors", value: visitorStats.total, icon: Activity, color: "text-purple-500" },
              ].map((stat) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card rounded-xl p-4 shadow-card"
                >
                  <stat.icon size={20} className={stat.color} />
                  <p className="font-bold text-2xl mt-2">{stat.value}</p>
                  <p className="text-muted-foreground text-xs">{stat.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Visitor Bar Chart */}
            <div className="bg-card rounded-xl p-4 shadow-card">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 size={16} className="text-primary" />
                <h3 className="font-semibold text-sm">Visitors – Last 7 Days</h3>
              </div>
              <div className="flex items-end gap-2 h-24">
                {last7Days.map((day) => (
                  <div key={day.key} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] font-semibold text-muted-foreground">{day.count}</span>
                    <div
                      className={`w-full rounded-t-sm transition-all ${
                        day.key === TODAY() ? "gradient-primary" : "bg-primary/20"
                      }`}
                      style={{ height: `${Math.max((day.count / maxVisits) * 72, 4)}px` }}
                    />
                    <span className="text-[10px] text-muted-foreground">{day.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Kitchen Status + Daily Special */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-card rounded-xl p-4 shadow-card">
                <Clock size={16} className="text-primary mb-2" />
                <p className="text-xs text-muted-foreground">Kitchen Hours</p>
                <p className="font-bold text-sm mt-0.5">{displayHours}</p>
                <span className={`mt-2 inline-block text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  isOpen ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                }`}>
                  {isOpen ? "Currently Open" : "Currently Closed"}
                </span>
              </div>
              <div className="bg-card rounded-xl p-4 shadow-card">
                <Sparkles size={16} className="text-secondary mb-2" />
                <p className="text-xs text-muted-foreground">Today's Special</p>
                {dailySpecial && dailySpecial.date === TODAY() ? (
                  <>
                    <p className="font-bold text-sm mt-0.5 truncate">{dailySpecial.custom_name}</p>
                    <p className="text-primary font-semibold text-sm">₹{dailySpecial.custom_price}</p>
                  </>
                ) : (
                  <p className="text-muted-foreground text-sm mt-0.5">Not set today</p>
                )}
              </div>
            </div>

            {/* Kitchen Info Summary */}
            <div className="bg-card rounded-xl p-4 shadow-card space-y-2">
              <h3 className="font-semibold text-sm mb-3">Kitchen Info</h3>
              <div className="flex items-center gap-2 text-sm">
                <UtensilsCrossed size={14} className="text-muted-foreground flex-shrink-0" />
                <span className="truncate">{settings.name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin size={14} className="text-muted-foreground flex-shrink-0" />
                <span>{settings.address}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MessageCircle size={14} className="text-muted-foreground flex-shrink-0" />
                <span>+{settings.whatsapp_number}</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* ═══ MENU MANAGEMENT ═══ */}
        {activeTab === "menu" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-lg">Menu Items ({totalItems})</h2>
              <Button
                size="sm"
                className="gradient-primary text-white gap-1"
                onClick={() => { resetForm(); setShowForm(true); }}
              >
                <Plus size={15} /> Add Item
              </Button>
            </div>

            {/* Add / Edit Form */}
            <AnimatePresence>
              {showForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-card rounded-xl p-4 shadow-card space-y-3 overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm">{editingItem ? "Edit Item" : "New Item"}</h3>
                    <button onClick={resetForm} className="text-muted-foreground hover:text-foreground">
                      <X size={18} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input
                      placeholder="Item name *"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                    <Input
                      placeholder="Price (₹) *"
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    />
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    >
                      {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <Input
                      placeholder="Image URL (optional)"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    />
                  </div>
                  <Input
                    placeholder="Description (optional)"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.is_bestseller}
                        onChange={(e) => setFormData({ ...formData, is_bestseller: e.target.checked })}
                        className="rounded"
                      />
                      <Star size={13} className="text-yellow-500" /> Mark as Bestseller
                    </label>
                    <div className="flex-1" />
                    <Button variant="outline" size="sm" onClick={resetForm}>Cancel</Button>
                    <Button size="sm" className="gradient-primary text-white" onClick={handleSaveItem}>
                      {editingItem ? "Update" : "Add"} Item
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Items List */}
            {menuItems.length === 0 ? (
              <div className="bg-card rounded-xl p-10 shadow-card text-center">
                <UtensilsCrossed size={36} className="mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground text-sm">No menu items yet. Add your first item!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {menuItems.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    className={`bg-card rounded-xl p-3 shadow-card flex items-center gap-3 ${!item.is_available ? "opacity-50" : ""}`}
                  >
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 text-2xl">🍽️</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-sm truncate">{item.name}</h4>
                        {item.is_bestseller && (
                          <span className="text-[10px] font-bold bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded">★ BEST</span>
                        )}
                      </div>
                      <p className="text-muted-foreground text-xs">{item.category} • ₹{item.price}</p>
                      {item.description && (
                        <p className="text-muted-foreground text-[11px] truncate">{item.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => toggleAvailability(item.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          item.is_available ? "text-green-500 hover:bg-green-50" : "text-muted-foreground hover:bg-muted"
                        }`}
                        title={item.is_available ? "Mark unavailable" : "Mark available"}
                      >
                        {item.is_available ? <Eye size={15} /> : <EyeOff size={15} />}
                      </button>
                      <button onClick={() => openEditForm(item)} className="p-2 rounded-lg text-primary hover:bg-primary/10">
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => { if (confirm("Delete this item?")) deleteMenuItem(item.id); }}
                        className="p-2 rounded-lg text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* ═══ DAILY SPECIAL ═══ */}
        {activeTab === "daily" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-lg">Today's Special</h2>
                <p className="text-muted-foreground text-xs">
                  {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
                </p>
              </div>
              {dailySpecial && dailySpecial.date === TODAY() && (
                <Button size="sm" variant="outline" className="text-destructive border-destructive/30 text-xs" onClick={clearDailySpecial}>
                  <X size={13} className="mr-1" /> Clear
                </Button>
              )}
            </div>

            {/* Current special preview */}
            {dailySpecial && dailySpecial.date === TODAY() && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative rounded-2xl overflow-hidden bg-card shadow-card"
              >
                {dailySpecial.custom_image_url ? (
                  <img
                    src={dailySpecial.custom_image_url}
                    alt={dailySpecial.custom_name}
                    className="w-full h-40 object-cover"
                  />
                ) : (
                  <div className="w-full h-40 gradient-primary flex items-center justify-center">
                    <ChefHat size={56} className="text-white/30" />
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles size={14} className="text-secondary" />
                    <span className="text-xs font-bold text-secondary uppercase tracking-wider">Today's Special ✓ Active</span>
                  </div>
                  <h3 className="font-display text-xl font-bold">{dailySpecial.custom_name}</h3>
                  <p className="text-muted-foreground text-sm mt-1">{dailySpecial.custom_description}</p>
                  <p className="text-primary font-bold text-lg mt-2">₹{dailySpecial.custom_price}</p>
                </div>
              </motion.div>
            )}

            {/* Special Form */}
            <div className="bg-card rounded-xl p-4 shadow-card space-y-3">
              <h3 className="font-semibold text-sm">
                {dailySpecial && dailySpecial.date === TODAY() ? "Update Special" : "Set Today's Special"}
              </h3>

              {menuItems.length > 0 && (
                <div>
                  <label className="text-xs text-muted-foreground">Pick from existing menu (auto-fills fields)</label>
                  <select
                    value={specialForm.item_id}
                    onChange={(e) => {
                      const item = menuItems.find((m) => m.id === e.target.value);
                      setSpecialForm({
                        item_id: e.target.value,
                        custom_name: item?.name || "",
                        custom_description: item?.description || "",
                        custom_price: item ? String(item.price) : "",
                        custom_image_url: item?.image_url || "",
                      });
                    }}
                    className="mt-1 flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="">-- Or type a custom item below --</option>
                    {menuItems.filter((m) => m.is_available).map((item) => (
                      <option key={item.id} value={item.id}>{item.name} — ₹{item.price}</option>
                    ))}
                  </select>
                </div>
              )}

              <Input
                placeholder="Special dish name *"
                value={specialForm.custom_name}
                onChange={(e) => setSpecialForm({ ...specialForm, custom_name: e.target.value })}
              />
              <Input
                placeholder="Description (what makes it special)"
                value={specialForm.custom_description}
                onChange={(e) => setSpecialForm({ ...specialForm, custom_description: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  placeholder="Price (₹)"
                  type="number"
                  value={specialForm.custom_price}
                  onChange={(e) => setSpecialForm({ ...specialForm, custom_price: e.target.value })}
                />
                <Input
                  placeholder="Image URL (optional)"
                  value={specialForm.custom_image_url}
                  onChange={(e) => setSpecialForm({ ...specialForm, custom_image_url: e.target.value })}
                />
              </div>

              <Button
                className="w-full gradient-primary text-white gap-2"
                onClick={handleSaveSpecial}
                disabled={!specialForm.custom_name.trim() && !specialForm.item_id}
              >
                <Sparkles size={16} />
                {dailySpecial && dailySpecial.date === TODAY() ? "Update Special" : "Set Today's Special"}
              </Button>
            </div>
          </motion.div>
        )}

        {/* ═══ SETTINGS ═══ */}
        {activeTab === "settings" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <h2 className="font-semibold text-lg">Kitchen Settings</h2>

            {/* Kitchen Info */}
            <div className="bg-card rounded-xl p-4 shadow-card space-y-3">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <UtensilsCrossed size={14} /> Kitchen Info
              </h3>
              <Input
                placeholder="Kitchen name"
                value={settingsForm.name}
                onChange={(e) => setSettingsForm({ ...settingsForm, name: e.target.value })}
              />
              <Input
                placeholder="Address"
                value={settingsForm.address}
                onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
              />
            </div>

            {/* Timings */}
            <div className="bg-card rounded-xl p-4 shadow-card space-y-3">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Clock size={14} /> Kitchen Timings (IST)
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground">Opening Time</label>
                  <Input
                    type="time"
                    value={settingsForm.open_time}
                    onChange={(e) => setSettingsForm({ ...settingsForm, open_time: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Closing Time</label>
                  <Input
                    type="time"
                    value={settingsForm.close_time}
                    onChange={(e) => setSettingsForm({ ...settingsForm, close_time: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {/* WhatsApp */}
            <div className="bg-card rounded-xl p-4 shadow-card space-y-3">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <MessageCircle size={14} /> Order Notifications
              </h3>
              <div>
                <label className="text-xs text-muted-foreground">WhatsApp Number (with country code, no +)</label>
                <Input
                  placeholder="919999999999"
                  value={settingsForm.whatsapp_number}
                  onChange={(e) => setSettingsForm({ ...settingsForm, whatsapp_number: e.target.value })}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">Example: 919876543210 (for +91 98765 43210)</p>
              </div>
            </div>

            {/* Payment */}
            <div className="bg-card rounded-xl p-4 shadow-card space-y-3">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <QrCode size={14} /> Payment Settings
              </h3>
              <div>
                <label className="text-xs text-muted-foreground">QR Code Image URL</label>
                <Input
                  placeholder="https://your-qr-image-url.png"
                  value={settingsForm.qr_code_url}
                  onChange={(e) => setSettingsForm({ ...settingsForm, qr_code_url: e.target.value })}
                  className="mt-1"
                />
                {settingsForm.qr_code_url && (
                  <div className="mt-2 bg-white rounded-lg p-3 inline-block shadow">
                    <img
                      src={settingsForm.qr_code_url}
                      alt="QR Preview"
                      className="w-28 h-28 object-contain"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                    <p className="text-xs text-muted-foreground text-center mt-1">Preview</p>
                  </div>
                )}
              </div>
              <div>
                <label className="text-xs text-muted-foreground">UPI ID</label>
                <Input
                  placeholder="yourname@upi"
                  value={settingsForm.upi_id}
                  onChange={(e) => setSettingsForm({ ...settingsForm, upi_id: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>

            <Button
              className={`w-full h-11 font-semibold gap-2 transition-colors ${
                settingsSaved ? "bg-green-500 text-white" : "gradient-primary text-white"
              }`}
              onClick={handleSaveSettings}
            >
              {settingsSaved ? <><Check size={16} /> Saved!</> : <><Settings size={16} /> Save Settings</>}
            </Button>
          </motion.div>
        )}

      </div>
    </div>
  );
};

export default Admin;
