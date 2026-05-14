import { HeroCarousel } from "@/components/home/HeroCarousel";
import { FiltersPanel } from "@/components/home/FiltersPanel";
import { CategoryChips } from "@/components/home/CategoryChips";
import { ProductGrid } from "@/components/home/ProductGrid";
import { PaginationControls } from "@/components/home/PaginationControls";
import { PAGE_SIZE_OPTIONS } from "@/constants/ui";
import type { AddedMap, Filters, HeroSlide, Product, SetFilters } from "@/types";

type HomePageProps = {
  activeSlide: number;
  slides: HeroSlide[];
  onPrevSlide: () => void;
  onNextSlide: () => void;
  filters: Filters;
  setFilters: SetFilters;
  brands: string[];
  collections: string[];
  colors: string[];
  sizes: string[];
  categories: string[];
  itemsPerPage: number;
  loading: boolean;
  products: Product[];
  addedMap: AddedMap;
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  onApplyFilters: () => void;
  onResetFilters: () => void;
  onSelectCategory: (category: string) => void;
  onAddToCart: (product: Product) => void;
  onPageSizeChange: (value: number) => void;
  onPrevPage: () => void;
  onNextPage: () => void;
};

export function HomePage(props: HomePageProps) {
  const {
    activeSlide,
    slides,
    onPrevSlide,
    onNextSlide,
    filters,
    setFilters,
    brands,
    collections,
    colors,
    sizes,
    categories,
    itemsPerPage,
    loading,
    products,
    addedMap,
    currentPage,
    totalPages,
    totalCount,
    hasPrevPage,
    hasNextPage,
    onApplyFilters,
    onResetFilters,
    onSelectCategory,
    onAddToCart,
    onPageSizeChange,
    onPrevPage,
    onNextPage,
  } = props;

  return (
    <>
      <HeroCarousel activeSlide={activeSlide} slides={slides} onPrev={onPrevSlide} onNext={onNextSlide} />
      <FiltersPanel
        filters={filters}
        setFilters={setFilters}
        brands={brands}
        collections={collections}
        colors={colors}
        sizes={sizes}
        onApply={onApplyFilters}
        onReset={onResetFilters}
      />
      <CategoryChips categories={categories} activeCategory={filters.category} onSelect={onSelectCategory} />
      <ProductGrid
        loading={loading}
        itemsPerPage={itemsPerPage}
        products={products}
        addedMap={addedMap}
        onAddToCart={onAddToCart}
      />
      <PaginationControls
        totalCount={totalCount}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        totalPages={totalPages}
        hasPrev={hasPrevPage}
        hasNext={hasNextPage}
        loading={loading}
        pageSizeOptions={PAGE_SIZE_OPTIONS}
        onPageSizeChange={onPageSizeChange}
        onPrev={onPrevPage}
        onNext={onNextPage}
      />
    </>
  );
}
