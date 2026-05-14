import { Badge, Box, Button, HStack, Input, Select, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import { FiFilter, FiSearch, FiSliders } from "react-icons/fi";
import type { Filters, SetFilters } from "@/types";

type FiltersPanelProps = {
  filters: Filters;
  setFilters: SetFilters;
  brands: string[];
  collections: string[];
  colors: string[];
  sizes: string[];
  onApply: () => void;
  onReset: () => void;
};

export function FiltersPanel({
  filters,
  setFilters,
  brands,
  collections,
  colors,
  sizes,
  onApply,
  onReset,
}: FiltersPanelProps) {
  return (
    <Box
      bg="rgba(255,255,255,0.9)"
      borderWidth="1px"
      borderColor="gray.200"
      borderRadius="2xl"
      p={{ base: "4", md: "5" }}
      mb="5"
      backdropFilter="blur(6px)"
      boxShadow="0 14px 30px rgba(15, 23, 42, 0.08)"
    >
      <HStack justify="space-between" align="center" mb="4" wrap="wrap">
        <HStack>
          <FiFilter />
          <Text fontWeight="700">Advanced Filters</Text>
        </HStack>
        <Badge colorScheme="purple" borderRadius="full" px="3" py="1">
          Modern Search
        </Badge>
      </HStack>
      <SimpleGrid columns={{ base: 1, md: 4, lg: 6 }} spacing="3.5">
        <VStack align="stretch" spacing="1">
          <Text fontSize="xs" color="gray.500" fontWeight="600">
            Search
          </Text>
          <Input
            placeholder="Search products..."
            value={filters.q}
            onChange={(e) => setFilters((p) => ({ ...p, q: e.target.value }))}
          />
        </VStack>
        <VStack align="stretch" spacing="1">
          <Text fontSize="xs" color="gray.500" fontWeight="600">
            Brand
          </Text>
          <Select value={filters.brand} onChange={(e) => setFilters((p) => ({ ...p, brand: e.target.value }))}>
            <option value="">All Brands</option>
            {brands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </Select>
        </VStack>
        <VStack align="stretch" spacing="1">
          <Text fontSize="xs" color="gray.500" fontWeight="600">
            Color
          </Text>
          <Select value={filters.color} onChange={(e) => setFilters((p) => ({ ...p, color: e.target.value }))}>
            <option value="">All Colors</option>
            {colors.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </VStack>
        <VStack align="stretch" spacing="1">
          <Text fontSize="xs" color="gray.500" fontWeight="600">
            Size
          </Text>
          <Select value={filters.size} onChange={(e) => setFilters((p) => ({ ...p, size: e.target.value }))}>
            <option value="">All Sizes</option>
            {sizes.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </VStack>
        <VStack align="stretch" spacing="1">
          <Text fontSize="xs" color="gray.500" fontWeight="600">
            Collection
          </Text>
          <Select
            value={filters.collection}
            onChange={(e) => setFilters((p) => ({ ...p, collection: e.target.value }))}
          >
            <option value="">All Collections</option>
            {collections.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
        </VStack>
        <VStack align="stretch" spacing="1">
          <Text fontSize="xs" color="gray.500" fontWeight="600">
            Price Min
          </Text>
          <Input
            placeholder="Min price"
            value={filters.minPrice}
            onChange={(e) => setFilters((p) => ({ ...p, minPrice: e.target.value }))}
          />
        </VStack>
        <VStack align="stretch" spacing="1">
          <Text fontSize="xs" color="gray.500" fontWeight="600">
            Price Max
          </Text>
          <Input
            placeholder="Max price"
            value={filters.maxPrice}
            onChange={(e) => setFilters((p) => ({ ...p, maxPrice: e.target.value }))}
          />
        </VStack>
        <VStack align="stretch" spacing="1">
          <Text fontSize="xs" color="gray.500" fontWeight="600">
            Sort
          </Text>
          <Select
            value={filters.sortBy}
            onChange={(e) =>
              setFilters((p) => ({
                ...p,
                sortBy: e.target.value as "featured" | "price_low" | "price_high" | "newest",
              }))
            }
          >
            <option value="featured">Featured</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
            <option value="newest">Newest</option>
          </Select>
        </VStack>
      </SimpleGrid>
      <HStack mt="5" justify="space-between" wrap="wrap" gap="3">
        <HStack color="gray.500" fontSize="sm">
          <FiSliders />
          <Text>Fine tune your product discovery</Text>
        </HStack>
        <HStack>
        <Button leftIcon={<FiSearch />} onClick={onApply}>
          Apply
        </Button>
        <Button variant="outline" onClick={onReset}>
          Reset
        </Button>
        </HStack>
      </HStack>
    </Box>
  );
}
