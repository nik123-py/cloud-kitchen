import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

// ── Types ──────────────────────────────────────────────────────────
export interface MenuItem {
  id: string;
  name: string;
  price: number;
  image_url: string;
  category: string;
  description: string;
  is_available: boolean;
  is_bestseller: boolean;
  created_at: string;
}

export interface DailySpecial {
  date: string; // YYYY-MM-DD
  item_id: string | null;
  custom_name: string;
  custom_description: string;
  custom_price: number;
  custom_image_url: string;
}

export interface KitchenSettings {
  name: string;
  address: string;
  open_time: string;   // "10:00"
  close_time: string;  // "19:00"
  whatsapp_number: string;
  qr_code_url: string;
  upi_id: string;
  currency: string;
}

export interface VisitorStats {
  total: number;
  today: number;
  lastUpdated: string;
  daily: Record<string, number>; // "YYYY-MM-DD" -> count
}

// ── Constants ─────────────────────────────────────────────────────
// Credentials are read from .env (VITE_ADMIN_USERNAME / VITE_ADMIN_PASSWORD).
// VITE_ vars are bundled into the JS build — keep .env out of public repos.
const ADMIN_USERNAME = import.meta.env.VITE_ADMIN_USERNAME as string;
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD as string;

const STORAGE_KEYS = {
  admin_token: "sk_admin_token",
  menu_items: "sk_menu_items",
  daily_special: "sk_daily_special",
  settings: "sk_settings",
  visitor_stats: "sk_visitor_stats",
};

const DEFAULT_SETTINGS: KitchenSettings = {
  name: "Soni Kitchen – From Jaiswal & Family",
  address: "103, A3, Tulip Yellow",
  open_time: "10:00",
  close_time: "19:00",
  whatsapp_number: (import.meta.env.VITE_WHATSAPP_NUMBER as string) || "919999999999",
  qr_code_url: "",
  upi_id: (import.meta.env.VITE_UPI_ID as string) || "sonikitchen@upi",
  currency: "₹",
};

const TODAY = (): string => new Date().toISOString().split("T")[0];

// ── Helpers ────────────────────────────────────────────────────────
function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch { /* ignore */ }
}

// ── Context ────────────────────────────────────────────────────────
interface AdminContextType {
  // Auth
  isLoggedIn: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;

  // Menu
  menuItems: MenuItem[];
  addMenuItem: (item: Omit<MenuItem, "id" | "created_at">) => void;
  updateMenuItem: (id: string, updates: Partial<MenuItem>) => void;
  deleteMenuItem: (id: string) => void;
  toggleAvailability: (id: string) => void;

  // Daily Special
  dailySpecial: DailySpecial | null;
  setDailySpecial: (special: DailySpecial) => void;
  clearDailySpecial: () => void;

  // Settings
  settings: KitchenSettings;
  updateSettings: (updates: Partial<KitchenSettings>) => void;

  // Visitor Stats
  visitorStats: VisitorStats;
  recordVisit: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const useAdmin = () => {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used within AdminProvider");
  return ctx;
};

// ── Provider ───────────────────────────────────────────────────────
export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(() =>
    localStorage.getItem(STORAGE_KEYS.admin_token) === "authenticated"
  );

  const [menuItems, setMenuItems] = useState<MenuItem[]>(() =>
    loadFromStorage<MenuItem[]>(STORAGE_KEYS.menu_items, [])
  );

  const [dailySpecial, setDailySpecialState] = useState<DailySpecial | null>(() => {
    const saved = loadFromStorage<DailySpecial | null>(STORAGE_KEYS.daily_special, null);
    // Only use if it's today's special
    return saved && saved.date === TODAY() ? saved : null;
  });

  const [settings, setSettings] = useState<KitchenSettings>(() => {
    const saved = loadFromStorage<KitchenSettings>(STORAGE_KEYS.settings, DEFAULT_SETTINGS);
    // Always apply current env vars — overrides stale localStorage values
    const envWA = (import.meta.env.VITE_WHATSAPP_NUMBER as string) || "";
    const envUPI = (import.meta.env.VITE_UPI_ID as string) || "";
    return {
      ...saved,
      ...(envWA ? { whatsapp_number: envWA } : {}),
      ...(envUPI ? { upi_id: envUPI } : {}),
    };
  });

  const [visitorStats, setVisitorStats] = useState<VisitorStats>(() =>
    loadFromStorage<VisitorStats>(STORAGE_KEYS.visitor_stats, {
      total: 0, today: 0, lastUpdated: TODAY(), daily: {},
    })
  );

  // ── Auth ─────────────────────────────────────────────────────────
  const login = useCallback((username: string, password: string): boolean => {
    if (username.toLowerCase() === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      localStorage.setItem(STORAGE_KEYS.admin_token, "authenticated");
      setIsLoggedIn(true);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.admin_token);
    setIsLoggedIn(false);
  }, []);

  // ── Menu CRUD ─────────────────────────────────────────────────────
  const addMenuItem = useCallback((item: Omit<MenuItem, "id" | "created_at">) => {
    const newItem: MenuItem = {
      ...item,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };
    setMenuItems((prev) => {
      const updated = [newItem, ...prev];
      saveToStorage(STORAGE_KEYS.menu_items, updated);
      return updated;
    });
  }, []);

  const updateMenuItem = useCallback((id: string, updates: Partial<MenuItem>) => {
    setMenuItems((prev) => {
      const updated = prev.map((item) => (item.id === id ? { ...item, ...updates } : item));
      saveToStorage(STORAGE_KEYS.menu_items, updated);
      return updated;
    });
  }, []);

  const deleteMenuItem = useCallback((id: string) => {
    setMenuItems((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      saveToStorage(STORAGE_KEYS.menu_items, updated);
      return updated;
    });
  }, []);

  const toggleAvailability = useCallback((id: string) => {
    setMenuItems((prev) => {
      const updated = prev.map((item) =>
        item.id === id ? { ...item, is_available: !item.is_available } : item
      );
      saveToStorage(STORAGE_KEYS.menu_items, updated);
      return updated;
    });
  }, []);

  // ── Daily Special ─────────────────────────────────────────────────
  const setDailySpecial = useCallback((special: DailySpecial) => {
    setDailySpecialState(special);
    saveToStorage(STORAGE_KEYS.daily_special, special);
  }, []);

  const clearDailySpecial = useCallback(() => {
    setDailySpecialState(null);
    localStorage.removeItem(STORAGE_KEYS.daily_special);
  }, []);

  // ── Settings ──────────────────────────────────────────────────────
  const updateSettings = useCallback((updates: Partial<KitchenSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...updates };
      saveToStorage(STORAGE_KEYS.settings, updated);
      return updated;
    });
  }, []);

  // ── Visitor Tracking ──────────────────────────────────────────────
  const recordVisit = useCallback(() => {
    setVisitorStats((prev) => {
      const today = TODAY();
      const dailyCount = (prev.daily[today] || 0) + 1;
      const isNewDay = prev.lastUpdated !== today;
      const updated: VisitorStats = {
        total: prev.total + 1,
        today: isNewDay ? 1 : prev.today + 1,
        lastUpdated: today,
        daily: { ...prev.daily, [today]: dailyCount },
      };
      saveToStorage(STORAGE_KEYS.visitor_stats, updated);
      return updated;
    });
  }, []);

  return (
    <AdminContext.Provider
      value={{
        isLoggedIn, login, logout,
        menuItems, addMenuItem, updateMenuItem, deleteMenuItem, toggleAvailability,
        dailySpecial, setDailySpecial, clearDailySpecial,
        settings, updateSettings,
        visitorStats, recordVisit,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};
