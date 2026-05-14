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
  color: "",
  size: "",
  minPrice: "",
  maxPrice: "",
  sortBy: "featured",
};
