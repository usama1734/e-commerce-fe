import { Badge, Box, Button, Center, Heading, HStack, SimpleGrid, Spinner, Text, VStack } from "@chakra-ui/react";
import { FiCheck } from "react-icons/fi";
import { LazyImage } from "@/components/media/LazyImage";
import type { AddedMap, Product } from "@/types";

type ProductGridProps = {
  loading: boolean;
  itemsPerPage: number;
  products: Product[];
  addedMap: AddedMap;
  onAddToCart: (product: Product) => void;
};

export function ProductGrid({ loading, itemsPerPage, products, addedMap, onAddToCart }: ProductGridProps) {
  return (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing="5">
      {loading
        ? Array.from({ length: itemsPerPage }).map((_, idx) => (
            <Center key={idx} h="320px" bg="white" borderRadius="2xl" borderWidth="1px" borderColor="gray.200">
              <Spinner />
            </Center>
          ))
        : products.map((product) => (
            <Box
              key={product.id}
              bg="white"
              borderWidth="1px"
              borderColor="gray.200"
              borderRadius="2xl"
              overflow="hidden"
              backdropFilter="blur(4px)"
              transition="all 0.25s ease"
              h="100%"
              boxShadow="0 8px 20px rgba(15, 23, 42, 0.06)"
              _hover={{ transform: "translateY(-6px)", boxShadow: "0 16px 34px rgba(15, 23, 42, 0.14)" }}
            >
              <LazyImage
                src={product.imageUrl}
                alt={product.name}
                h="240px"
                w="full"
                objectFit="cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              />
              <VStack p="4" align="stretch" spacing="2" minH="220px">
                <Heading size="sm">{product.name}</Heading>
                <Text color="gray.600" noOfLines={2} mt="1">
                  {product.description}
                </Text>
                <Text color="gray.500" fontSize="sm" mt="1">
                  {product.brand} | {product.category} | {product.color} | {product.size}
                </Text>
                <Text mt="2" fontWeight="700">
                  {product.compareAtPricePkr != null &&
                  product.compareAtPricePkr > product.pricePkr ? (
                    <>
                      <Text as="span" textDecoration="line-through" color="gray.400" fontWeight="500" mr={2}>
                        PKR {product.compareAtPricePkr.toLocaleString()}
                      </Text>
                      <Text as="span" color="purple.600">
                        PKR {product.pricePkr.toLocaleString()}
                      </Text>
                    </>
                  ) : (
                    <>PKR {product.pricePkr.toLocaleString()}</>
                  )}
                </Text>
                {product.discountPercent != null && product.discountPercent > 0 ? (
                  <Badge colorScheme="green" borderRadius="full" w="fit-content">
                    {product.discountPercent}% off
                  </Badge>
                ) : null}
                <HStack mt="auto" justify="space-between" align="center">
                  <Button size="sm" minW="116px" onClick={() => onAddToCart(product)}>
                    {addedMap[product.id] ? "Added" : "Add to Cart"}
                  </Button>
                  <Badge colorScheme={addedMap[product.id] ? "green" : "purple"} visibility="visible" borderRadius="full" px="2">
                    {addedMap[product.id] ? (
                      <>
                        <FiCheck /> In cart
                      </>
                    ) : (
                      "Ready"
                    )}
                  </Badge>
                </HStack>
              </VStack>
            </Box>
          ))}
    </SimpleGrid>
  );
}
