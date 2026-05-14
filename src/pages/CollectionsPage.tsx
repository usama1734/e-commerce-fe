import { Box, Button, Heading, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import { COLLECTION_SHOWCASE } from "@/constants/ui";

type CollectionsPageProps = {
  collections: string[];
  onStartShopping: (collection?: string) => void;
};

export function CollectionsPage({ collections, onStartShopping }: CollectionsPageProps) {
  const items = collections.length
    ? collections.map((name) => ({
        title: name,
        subtitle: "Curated edit from your catalog collections table.",
      }))
    : COLLECTION_SHOWCASE;

  return (
    <VStack spacing="5" align="stretch">
      <Box bg="white" borderWidth="1px" borderColor="gray.200" borderRadius="2xl" p="8">
        <Text color="brand.600" fontWeight="700" textTransform="uppercase" letterSpacing="widest" fontSize="xs">
          Curated Collections
        </Text>
        <Heading mt="2">Shopify-style Collection Landing</Heading>
        <Text mt="2" color="gray.600">
          Explore handpicked edits designed for modern Pakistani fashion shoppers.
        </Text>
      </Box>
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing="4">
        {items.map((item) => (
          <Box key={item.title} bg="white" borderWidth="1px" borderColor="gray.200" borderRadius="2xl" p="6">
            <Heading size="md">{item.title}</Heading>
            <Text mt="2" color="gray.600">
              {item.subtitle}
            </Text>
            <Button mt="4" onClick={() => onStartShopping(item.title)}>
              View Products
            </Button>
          </Box>
        ))}
      </SimpleGrid>
    </VStack>
  );
}
