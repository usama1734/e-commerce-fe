import { Link, useLocation } from "react-router-dom";
import {
  Avatar,
  Badge,
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  Heading,
  HStack,
  IconButton,
  Stack,
  Text,
  Tooltip,
  useDisclosure,
} from "@chakra-ui/react";
import { FiMenu, FiShoppingCart, FiUser } from "react-icons/fi";
import type { AuthState, CartItem } from "@/types";

type AppHeaderProps = {
  authState: AuthState;
  cartItems: CartItem[];
  onLogout: () => Promise<void>;
};

export function AppHeader({ authState, cartItems, onLogout }: AppHeaderProps) {
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const location = useLocation();
  const isActiveRoute = (path: string) => location.pathname === path;
  const getNavTextProps = (path: string) => ({
    color: isActiveRoute(path) ? "purple.600" : "gray.700",
    fontWeight: isActiveRoute(path) ? "700" : "500",
  });

  const navLinks = (
    <>
      <Link to="/" onClick={onClose}>
        <Text {...getNavTextProps("/")}>Home</Text>
      </Link>
      {authState.user ? (
        <Link to="/orders" onClick={onClose}>
          <Text
            color={location.pathname.startsWith("/orders") ? "purple.600" : "gray.700"}
            fontWeight={location.pathname.startsWith("/orders") ? "700" : "500"}
          >
            My orders
          </Text>
        </Link>
      ) : null}
      {authState.user?.role === "admin" ? (
        <Link to="/admin" onClick={onClose}>
          <Text
            color={location.pathname.startsWith("/admin") ? "purple.600" : "gray.700"}
            fontWeight={location.pathname.startsWith("/admin") ? "700" : "500"}
          >
            Admin
          </Text>
        </Link>
      ) : null}
      <Link to="/checkout" onClick={onClose}>
        <Text {...getNavTextProps("/checkout")}>Checkout</Text>
      </Link>
      {!authState.user ? (
        <Link to="/login" onClick={onClose}>
          <Text {...getNavTextProps("/login")}>Login</Text>
        </Link>
      ) : null}
      {!authState.user ? (
        <Link to="/signup" onClick={onClose}>
          <Text {...getNavTextProps("/signup")}>Signup</Text>
        </Link>
      ) : null}
    </>
  );
  const logoUrl = authState.user?.logoUrl
    ? authState.user.logoUrl.startsWith("http")
      ? authState.user.logoUrl
      : `${window.location.origin}${authState.user.logoUrl}`
    : "";

  return (
    <Box>
      <Flex
        pos="fixed"
        top="3"
        left="50%"
        transform="translateX(-50%)"
        w="min(1200px, calc(100% - 16px))"
        zIndex="100"
        bg="rgba(255, 255, 255, 0.92)"
        border="1px solid"
        borderColor="gray.200"
        borderRadius="2xl"
        px={{ base: "3", md: "5" }}
        py={{ base: "3", md: "3" }}
        align="center"
        justify="space-between"
        backdropFilter="blur(12px)"
        boxShadow="0 15px 35px rgba(15, 23, 42, 0.12)"
      >
        <HStack spacing="3">
          <IconButton
            display={{ base: "inline-flex", md: "none" }}
            aria-label="Open menu"
            icon={<FiMenu />}
            variant="outline"
            onClick={onOpen}
          />
          <Link to="/">
            <Heading
              size={{ base: "sm", md: "md" }}
              bgGradient="linear(to-r, gray.800, brand.600)"
              bgClip="text"
              letterSpacing="wide"
            >
              SAPPHIRE STORE
            </Heading>
          </Link>
        </HStack>

        <HStack spacing="4" display={{ base: "none", md: "flex" }}>
          {navLinks}
        </HStack>

        <HStack spacing="2">
          <Link to="/cart">
            <HStack
              bg={isActiveRoute("/cart") ? "purple.50" : "white"}
              color={isActiveRoute("/cart") ? "purple.600" : "black"}
              borderWidth="1px"
              borderColor={isActiveRoute("/cart") ? "purple.200" : "transparent"}
              px={{ base: "2", md: "3" }}
              py="2"
              borderRadius="full"
              spacing="2.5"
            >
              <Box position="relative" lineHeight="1">
                <FiShoppingCart />
                {cartCount > 0 ? (
                  <Badge
                    position="absolute"
                    top="-8px"
                    right="-10px"
                    bg="red.500"
                    color="white"
                    borderRadius="full"
                    minW="18px"
                    h="18px"
                    px="1"
                    display="inline-flex"
                    alignItems="center"
                    justifyContent="center"
                    fontSize="0.65rem"
                    fontWeight="700"
                    lineHeight="1"
                    boxShadow="0 2px 8px rgba(229, 62, 62, 0.35)"
                  >
                    {cartCount > 99 ? "99+" : cartCount}
                  </Badge>
                ) : null}
              </Box>
              <Text fontWeight="700" display={{ base: "none", sm: "inline" }}>
                Cart
              </Text>
            </HStack>
          </Link>
          {authState.user ? (
            logoUrl ? (
              <Tooltip label="Hover logo and click to download" hasArrow openDelay={200}>
                <Box
                  as="a"
                  href={logoUrl}
                  download
                  borderWidth="2px"
                  borderColor="gray.200"
                  borderRadius="full"
                  overflow="hidden"
                  h="40px"
                  w="40px"
                  display="inline-flex"
                  alignItems="center"
                  justifyContent="center"
                  transition="all 0.2s ease"
                  _hover={{
                    transform: "translateY(-1px) scale(1.06)",
                    borderColor: "purple.400",
                    boxShadow: "0 10px 20px rgba(109, 40, 217, 0.22)",
                  }}
                >
                  <Box
                    as="img"
                    src={logoUrl}
                    alt="User logo"
                    h="100%"
                    w="100%"
                    objectFit="cover"
                  />
                </Box>
              </Tooltip>
            ) : (
              <Avatar
                size="sm"
                icon={<FiUser />}
                name={authState.user.fullName || `${authState.user.firstName || ""} ${authState.user.lastName || ""}`.trim()}
              />
            )
          ) : null}
          {authState.user ? (
            <Button
              size="sm"
              variant="outline"
              borderColor="gray.300"
              onClick={onLogout}
              display={{ base: "none", md: "inline-flex" }}
            >
              Logout
            </Button>
          ) : null}
        </HStack>
      </Flex>

      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">Menu</DrawerHeader>
          <DrawerBody>
            <Stack spacing="4" mt="4">
              {navLinks}
              {authState.user ? (
                <Button size="sm" variant="outline" onClick={onLogout}>
                  Logout
                </Button>
              ) : null}
            </Stack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
}
