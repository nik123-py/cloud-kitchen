import { useMemo } from "react";
import { useAdmin } from "@/context/AdminContext";

/**
 * Returns whether the kitchen is currently open based on
 * the configured open_time and close_time in settings.
 * Times are in "HH:MM" 24-hour format (IST).
 */
export function useKitchenStatus() {
  const { settings } = useAdmin();

  const isOpen = useMemo(() => {
    try {
      const now = new Date();
      // Get IST time (UTC+5:30)
      const istOffset = 5.5 * 60 * 60 * 1000;
      const ist = new Date(now.getTime() + (now.getTimezoneOffset() * 60 * 1000) + istOffset);

      const [openHour, openMin] = settings.open_time.split(":").map(Number);
      const [closeHour, closeMin] = settings.close_time.split(":").map(Number);

      const currentMinutes = ist.getHours() * 60 + ist.getMinutes();
      const openMinutes = openHour * 60 + openMin;
      const closeMinutes = closeHour * 60 + closeMin;

      return currentMinutes >= openMinutes && currentMinutes < closeMinutes;
    } catch {
      return false;
    }
  }, [settings.open_time, settings.close_time]);

  const displayHours = useMemo(() => {
    const formatTime = (time: string) => {
      const [h, m] = time.split(":").map(Number);
      const period = h >= 12 ? "PM" : "AM";
      const hour = h > 12 ? h - 12 : h === 0 ? 12 : h;
      const min = m > 0 ? `:${m.toString().padStart(2, "0")}` : "";
      return `${hour}${min} ${period}`;
    };
    return `${formatTime(settings.open_time)} – ${formatTime(settings.close_time)}`;
  }, [settings.open_time, settings.close_time]);

  return { isOpen, displayHours };
}
