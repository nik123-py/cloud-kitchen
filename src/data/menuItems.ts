import type { MenuItem } from "@/context/CartContext";
import choleBhature from "@/assets/chole-bhature.jpg";
import gulabJamun from "@/assets/gulab-jamun.jpg";
import samosa from "@/assets/samosa.jpg";
import lassi from "@/assets/lassi.jpg";
import paneerTikka from "@/assets/paneer-tikka.jpg";
import alooParatha from "@/assets/aloo-paratha.jpg";

export const menuItems: MenuItem[] = [
  {
    id: "1",
    name: "Chole Bhature",
    price: 80,
    image: choleBhature,
    category: "Main Course",
    description: "Fluffy fried bread with spicy chickpea curry, served with onions & chutney",
    isAvailable: true,
    isBestseller: true,
  },
  {
    id: "2",
    name: "Paneer Tikka",
    price: 120,
    image: paneerTikka,
    category: "Starters",
    description: "Smoky grilled cottage cheese with bell peppers and mint chutney",
    isAvailable: true,
  },
  {
    id: "3",
    name: "Samosa (2 pcs)",
    price: 30,
    image: samosa,
    category: "Starters",
    description: "Crispy pastry filled with spiced potatoes and green chutney",
    isAvailable: true,
  },
  {
    id: "4",
    name: "Aloo Paratha",
    price: 50,
    image: alooParatha,
    category: "Main Course",
    description: "Stuffed potato flatbread with butter and pickle",
    isAvailable: true,
  },
  {
    id: "5",
    name: "Mango Lassi",
    price: 40,
    image: lassi,
    category: "Beverages",
    description: "Creamy yogurt drink blended with mango pulp",
    isAvailable: true,
  },
  {
    id: "6",
    name: "Gulab Jamun (2 pcs)",
    price: 40,
    image: gulabJamun,
    category: "Desserts",
    description: "Golden fried dumplings soaked in sweet sugar syrup",
    isAvailable: true,
  },
];
