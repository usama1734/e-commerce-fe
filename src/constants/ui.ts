import type { Filters, HeroSlide } from "@/types";

export const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

export const HERO_SLIDES: HeroSlide[] = [
  {
    title: "Timeless Black & White Edit",
    subtitle: "Modern silhouettes, elevated textures, and clean lines.",
  },
  {
    title: "Luxury Festive Collection",
    subtitle: "Refined embroidery and statement formal wear.",
  },
  {
    title: "Everyday Chic Essentials",
    subtitle: "Comfort-first looks with premium styling.",
  },
];

export const initialFilters: Filters = {
  q: "",
  brand: "",
  category: "",
  collection: "",
  color: "",
  size: "",
  minPrice: "",
  maxPrice: "",
  sortBy: "featured",
};

export const COLLECTION_SHOWCASE = [
  {
    title: "Summer Lawn 26",
    subtitle: "Breathable fabrics with elegant cuts for everyday luxury.",
  },
  {
    title: "Luxury Pret",
    subtitle: "Premium festive silhouettes crafted for modern style.",
  },
  {
    title: "Ready to Wear",
    subtitle: "Shop curated essentials with timeless and polished tones.",
  },
];
