import { Box, Heading, Link, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";

export function AdminDashboardPage() {
  return (
    <VStack align="stretch" spacing={8}>
      <Box>
        <Heading size="lg" color="gray.800" letterSpacing="tight">
          Overview
        </Heading>
        <Text color="gray.600" mt={2} maxW="lg">
          Manage the storefront catalog. Only accounts with the administrator role can access this area or
          create products through the API.
        </Text>
      </Box>
      <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
        <Box
          as={RouterLink}
          to="/admin/products"
          p={6}
          borderRadius="xl"
          borderWidth="1px"
          borderColor="gray.200"
          bg="white"
          boxShadow="sm"
          transition="all 0.2s"
          _hover={{ borderColor: "purple.300", boxShadow: "md", transform: "translateY(-2px)" }}
        >
          <Heading size="sm" color="gray.800">
            Product catalog
          </Heading>
          <Text fontSize="sm" color="gray.600" mt={2}>
            Review listings, variant counts, and price floors at a glance.
          </Text>
        </Box>
        <Box
          as={RouterLink}
          to="/admin/products/new"
          p={6}
          borderRadius="xl"
          borderWidth="1px"
          borderColor="purple.100"
          bg="purple.50"
          boxShadow="sm"
          transition="all 0.2s"
          _hover={{ borderColor: "purple.300", boxShadow: "md", transform: "translateY(-2px)" }}
        >
          <Heading size="sm" color="purple.800">
            Add a product
          </Heading>
          <Text fontSize="sm" color="purple.700" mt={2}>
            Create a product with one or more size and color variants, pricing in PKR, and stock.
          </Text>
        </Box>
      </SimpleGrid>
      <Box borderWidth="1px" borderColor="gray.200" borderRadius="xl" p={5} bg="gray.50">
        <Text fontSize="sm" fontWeight="600" color="gray.700">
          Role model
        </Text>
        <Text fontSize="sm" color="gray.600" mt={2}>
          Shoppers use the default <strong>user</strong> role. Promote trusted accounts to{" "}
          <strong>admin</strong> in the database (
          <Text as="code" fontSize="xs" bg="gray.100" px={1} borderRadius="md">
            {`UPDATE users SET role = 'admin' WHERE email = 'you@example.com';`}
          </Text>
          ) then sign in again so a fresh token includes admin claims.
        </Text>
        <Link as={RouterLink} to="/" fontSize="sm" color="purple.600" fontWeight="600" mt={3} display="inline-block">
          ← Back to storefront
        </Link>
      </Box>
    </VStack>
  );
}
