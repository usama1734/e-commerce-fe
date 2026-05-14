import { Box, Flex, Heading, Stack, Text, VStack } from "@chakra-ui/react";
import { FiHome, FiPackage, FiRotateCcw, FiShoppingBag } from "react-icons/fi";
import { NavLink, Navigate, Outlet } from "react-router-dom";
import type { AuthState } from "@/types";
import type { AdminOutletContext } from "@/types";

const navItemSx = (isActive: boolean) => ({
  display: "flex",
  alignItems: "center",
  gap: 3,
  px: 4,
  py: 3,
  borderRadius: "lg",
  fontWeight: 600,
  fontSize: "sm",
  transition: "background 0.15s ease, color 0.15s ease",
  bg: isActive ? "whiteAlpha.200" : "transparent",
  color: "white",
  borderWidth: "1px",
  borderColor: isActive ? "whiteAlpha.300" : "transparent",
  _hover: { bg: "whiteAlpha.100", textDecoration: "none" },
});

type AdminRouteLayoutProps = {
  authState: AuthState;
};

export function AdminRouteLayout({ authState }: AdminRouteLayoutProps) {
  if (!authState.user) {
    return <Navigate to="/login" replace state={{ from: "/admin" }} />;
  }
  if (authState.user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  const outletContext: AdminOutletContext = {
    accessToken: authState.accessToken,
  };

  return (
    <Flex
      direction={{ base: "column", md: "row" }}
      align="stretch"
      gap={{ base: 4, md: 8 }}
      w="100%"
      minH={{ md: "calc(100vh - 160px)" }}
    >
      <Box
        flexShrink={0}
        w={{ base: "100%", md: "260px" }}
        position={{ md: "sticky" }}
        top={{ md: "116px" }}
        alignSelf={{ md: "flex-start" }}
        maxH={{ md: "calc(100vh - 140px)" }}
        overflowY={{ md: "auto" }}
        bg="linear-gradient(180deg, #1e1b4b 0%, #312e81 55%, #1e1b4b 100%)"
        borderRadius={{ base: "xl", md: "2xl" }}
        p={{ base: 4, md: 5 }}
        color="white"
        boxShadow="0 20px 50px rgba(30, 27, 75, 0.35)"
      >
        <Heading size="sm" letterSpacing="wider" opacity={0.9} mb={1}>
          CONTROL CENTER
        </Heading>
        <Text fontSize="xs" color="whiteAlpha.700" mb={6}>
          Catalog & inventory
        </Text>
        <VStack align="stretch" spacing={2}>
          <NavLink to="/admin" end>
            {({ isActive }) => (
              <Box as="span" sx={navItemSx(isActive)}>
                <FiHome size={18} />
                Overview
              </Box>
            )}
          </NavLink>
          <NavLink to="/admin/products">
            {({ isActive }) => (
              <Box as="span" sx={navItemSx(isActive)}>
                <FiPackage size={18} />
                Products
              </Box>
            )}
          </NavLink>
          <NavLink to="/admin/orders">
            {({ isActive }) => (
              <Box as="span" sx={navItemSx(isActive)}>
                <FiShoppingBag size={18} />
                Orders
              </Box>
            )}
          </NavLink>
          <NavLink to="/admin/refunds">
            {({ isActive }) => (
              <Box as="span" sx={navItemSx(isActive)}>
                <FiRotateCcw size={18} />
                Refunds
              </Box>
            )}
          </NavLink>
        </VStack>
        <Stack mt={8} pt={6} borderTopWidth="1px" borderColor="whiteAlpha.200" spacing={1}>
          <Text fontSize="xs" color="whiteAlpha.600">
            Signed in
          </Text>
          <Text fontSize="sm" fontWeight="600" noOfLines={1}>
            {authState.user.email}
          </Text>
          <Text fontSize="xs" color="purple.200">
            Administrator
          </Text>
        </Stack>
      </Box>
      <Box flex="1" minW={0} pl={{ base: 0, md: 0 }} py={{ base: 0, md: 0 }}>
        <Outlet context={outletContext} />
      </Box>
    </Flex>
  );
}
