import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { Box, HStack, Text, useToast } from "@chakra-ui/react";
import { AppHeader } from "@/components/layout/AppHeader";
import { HomePage } from "@/pages/HomePage";
import { CartPage } from "@/pages/CartPage";
import { AuthPage } from "@/pages/AuthPage";
import { HERO_SLIDES, initialFilters } from "@/constants/ui";
import { calculateCartPricing } from "@/utils/cart";
import { api, AUTH_SESSION_EXPIRED_EVENT, AUTH_TOKENS_REFRESHED_EVENT } from "@/services/api";
import type { AuthState, CartItem, Product, Filters, CheckoutDetails, AddedMap } from "@/types";
import { CollectionsPage } from "@/pages/CollectionsPage";
import { CheckoutPage } from "@/pages/CheckoutPage";
import { OrderConfirmationPage } from "@/pages/OrderConfirmationPage";
import { OrdersPage } from "@/pages/OrdersPage";
import { OrderDetailPage } from "@/pages/OrderDetailPage";
import { AdminRouteLayout } from "@/pages/admin/AdminRouteLayout";
import { AdminDashboardPage } from "@/pages/admin/AdminDashboardPage";
import { AdminProductsPage } from "@/pages/admin/AdminProductsPage";
import { AdminProductFormPage } from "@/pages/admin/AdminProductFormPage";
import { AdminOrdersPage } from "@/pages/admin/AdminOrdersPage";
import { AdminRefundsPage } from "@/pages/admin/AdminRefundsPage";
import { ConfirmActionModal } from "@/components/feedback/ConfirmActionModal";
import { AppLoadingOverlay } from "@/components/feedback/AppLoadingOverlay";
import { CatalogRefreshContext } from "@/context/CatalogRefreshContext";

type AuthForm = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  addressLine: string;
  password: string;
  logo: File | null;
};

const AUTH_STORAGE_KEY = "auth_state";

function App() {
  const confirmationSlides = [
    { title: "Need help with size?", subtitle: "Our style advisor can assist with exchanges and fit support." },
    { title: "Complete the look", subtitle: "Explore matching pieces picked for your recent order." },
    { title: "Exclusive member offers", subtitle: "Unlock limited seasonal drops and members-only promotions." },
  ];
  const [authState, setAuthState] = useState<AuthState>(() => {
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) return { user: null, accessToken: "", refreshToken: "" };
      const parsed = JSON.parse(raw) as AuthState;
      return {
        user: parsed.user ?? null,
        accessToken: parsed.accessToken ?? "",
        refreshToken: parsed.refreshToken ?? "",
      };
    } catch {
      return { user: null, accessToken: "", refreshToken: "" };
    }
  });
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const filtersRef = useRef(filters);
  filtersRef.current = filters;
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [collections, setCollections] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [sizes, setSizes] = useState<string[]>([]);
  const [activeSlide, setActiveSlide] = useState(0);
  const [cursorTrail, setCursorTrail] = useState<(string | null)[]>([null]);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const itemsPerPageRef = useRef(itemsPerPage);
  itemsPerPageRef.current = itemsPerPage;
  const [hasNextPage, setHasNextPage] = useState(false);
  const [lastFetchedNextCursor, setLastFetchedNextCursor] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const raw = localStorage.getItem("cart_items");
      return raw ? (JSON.parse(raw) as CartItem[]) : [];
    } catch {
      return [];
    }
  });
  const [cartPricing, setCartPricing] = useState(() => calculateCartPricing([]));
  const [addedMap, setAddedMap] = useState<AddedMap>({});
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [isPricingLoading, setIsPricingLoading] = useState(false);
  const [isSessionRestoring, setIsSessionRestoring] = useState(false);
  const [error, setError] = useState("");
  const [confirmationSlide, setConfirmationSlide] = useState(0);
  const [lastOrderTotal, setLastOrderTotal] = useState(0);
  const [checkoutDetails, setCheckoutDetails] = useState<CheckoutDetails>({
    firstName: "",
    lastName: "",
    phone: "",
    city: "",
    addressLine: "",
    paymentMethod: "cod",
  });
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmLabel: string;
    onConfirm: (() => void | Promise<void>) | null;
  }>({
    isOpen: false,
    title: "",
    description: "",
    confirmLabel: "Confirm",
    onConfirm: null,
  });
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const showAppToast = ({
    title,
    description,
    tone = "success",
  }: {
    title: string;
    description: string;
    tone?: "success" | "error" | "info";
  }) => {
    const palette =
      tone === "error"
        ? { bg: "red.50", border: "red.200", title: "red.700", text: "red.600" }
        : tone === "info"
          ? { bg: "blue.50", border: "blue.200", title: "blue.700", text: "blue.600" }
          : { bg: "green.50", border: "green.200", title: "green.700", text: "green.600" };

    toast.closeAll();
    toast({
      position: "bottom-right",
      duration: 2400,
      isClosable: true,
      render: () => (
        <Box bg={palette.bg} borderWidth="1px" borderColor={palette.border} borderRadius="xl" px="4" py="3" minW="280px">
          <HStack justify="space-between" align="start">
            <Box>
              <Text fontWeight="700" color={palette.title}>
                {title}
              </Text>
              <Text color={palette.text} fontSize="sm">
                {description}
              </Text>
            </Box>
          </HStack>
        </Box>
      ),
    });
  };

  const showAppToastRef = useRef(showAppToast);
  showAppToastRef.current = showAppToast;

  const openConfirm = ({
    title,
    description,
    confirmLabel,
    onConfirm,
  }: {
    title: string;
    description: string;
    confirmLabel: string;
    onConfirm: () => void | Promise<void>;
  }) => {
    setConfirmState({
      isOpen: true,
      title,
      description,
      confirmLabel,
      onConfirm,
    });
  };

  const authHeaders = useMemo(
    () => (authState.accessToken ? { Authorization: `Bearer ${authState.accessToken}` } : {}),
    [authState.accessToken]
  );

  const totalPagesFromCount = useMemo(
    () => Math.max(1, totalCount ? Math.ceil(totalCount / itemsPerPage) : 1),
    [totalCount, itemsPerPage]
  );

  const loadProductsAtTrail = useCallback(
    async (trail: (string | null)[], limit?: number, nextFilters?: Filters) => {
      const lim = limit ?? itemsPerPageRef.current;
      const nf = nextFilters ?? filtersRef.current;
      setLoading(true);
      setError("");
      const activeCursor = trail.length ? trail[trail.length - 1] ?? null : null;
      try {
        const response = await api.get("/products", {
          params: {
            limit: lim,
            ...nf,
            ...(activeCursor != null ? { cursor: String(activeCursor) } : {}),
          },
        });
        const items = (response.data.items ?? []) as Product[];
        setProducts(items);
        setCartItems((prev) =>
          prev.map((line) => {
            const match = items.find((p) => p.id === line.product.id);
            return match ? { ...line, product: match } : line;
          })
        );
        setCursorTrail(trail);
        setHasNextPage(Boolean(response.data.hasNext));
        setLastFetchedNextCursor(response.data.nextCursor ?? null);
        if (typeof response.data.totalCount === "number") {
          setTotalCount(response.data.totalCount);
        }
      } catch (loadError: unknown) {
        const msg =
          (loadError as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          "Failed to load products";
        setError(msg);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const refreshStorefrontCatalog = useCallback(async () => {
    try {
      const res = await api.get("/products/meta");
      setCategories(res.data.categories || []);
      setBrands(res.data.brands || []);
      setCollections(res.data.collections || []);
      setColors(res.data.colors || []);
      setSizes(res.data.sizes || []);
    } catch {
      /* non-fatal */
    }
    await loadProductsAtTrail([null], itemsPerPageRef.current, filtersRef.current);
  }, [loadProductsAtTrail]);

  const catalogRefreshValue = useMemo(
    () => ({ refreshStorefrontCatalog }),
    [refreshStorefrontCatalog]
  );

  async function refreshAccessToken(refreshTokenValue: string) {
    if (!refreshTokenValue) return false;
    try {
      const response = await api.post("/auth/refresh", { refreshToken: refreshTokenValue });
      setAuthState((prev) => ({ ...prev, ...response.data }));
      return true;
    } catch {
      setAuthState({ user: null, accessToken: "", refreshToken: "" });
      return false;
    }
  }

  useEffect(() => {
    api.get("/products/meta").then((res) => {
      setCategories(res.data.categories || []);
      setBrands(res.data.brands || []);
      setCollections(res.data.collections || []);
      setColors(res.data.colors || []);
      setSizes(res.data.sizes || []);
    });
    loadProductsAtTrail([null], itemsPerPageRef.current, filtersRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- initial catalog load only
  }, []);

  useEffect(() => {
    const persistable = {
      user: authState.user,
      accessToken: authState.accessToken,
      refreshToken: authState.refreshToken,
    };
    if (!persistable.refreshToken && !persistable.accessToken) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      return;
    }
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(persistable));
  }, [authState]);

  useEffect(() => {
    const onTokensRefreshed = (e: Event) => {
      const d = (e as CustomEvent<{ accessToken: string; refreshToken: string }>).detail;
      if (d?.accessToken && d?.refreshToken) {
        setAuthState((prev) => ({ ...prev, accessToken: d.accessToken, refreshToken: d.refreshToken }));
      }
    };
    const onAccessTokenInvalid = () => {
      setAuthState({ user: null, accessToken: "", refreshToken: "" });
      showAppToastRef.current({
        title: "Session ended",
        description: "Your access token expired. Please sign in again.",
        tone: "info",
      });
      navigate("/login", { replace: true });
    };
    document.addEventListener(AUTH_TOKENS_REFRESHED_EVENT, onTokensRefreshed);
    document.addEventListener(AUTH_SESSION_EXPIRED_EVENT, onAccessTokenInvalid);
    return () => {
      document.removeEventListener(AUTH_TOKENS_REFRESHED_EVENT, onTokensRefreshed);
      document.removeEventListener(AUTH_SESSION_EXPIRED_EVENT, onAccessTokenInvalid);
    };
  }, [navigate]);

  useEffect(() => {
    async function restoreAuthSession() {
      if (!authState.refreshToken) return;
      setIsSessionRestoring(true);
      try {
        const refreshRes = await api.post("/auth/refresh", { refreshToken: authState.refreshToken });
        const nextAccessToken = refreshRes.data.accessToken;
        const nextRefreshToken = refreshRes.data.refreshToken;
        const meRes = await api.get("/auth/me", {
          headers: { Authorization: `Bearer ${nextAccessToken}` },
        });
        setAuthState({
          user: meRes.data.user,
          accessToken: nextAccessToken,
          refreshToken: nextRefreshToken,
        });
      } catch {
        setAuthState({ user: null, accessToken: "", refreshToken: "" });
      } finally {
        setIsSessionRestoring(false);
      }
    }

    restoreAuthSession();
    // Run once on initial app load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const debounce = setTimeout(
      () => loadProductsAtTrail([null], itemsPerPageRef.current, filtersRef.current),
      350
    );
    return () => clearTimeout(debounce);
  }, [filters.q, loadProductsAtTrail]);

  useEffect(() => {
    localStorage.setItem("cart_items", JSON.stringify(cartItems));
    const subtotal = cartItems.reduce((sum, item) => sum + item.product.pricePkr * item.quantity, 0);
    setIsPricingLoading(true);
    api
      .post("/cart/calculate", { subtotal })
      .then((res) => {
        setCartPricing(res.data);
      })
      .catch(() => {
        setCartPricing(calculateCartPricing(cartItems));
      })
      .finally(() => {
        setIsPricingLoading(false);
      });
  }, [cartItems]);

  useEffect(() => {
    if (!authState.user) {
      setCheckoutDetails((prev) => ({
        ...prev,
        firstName: "",
        lastName: "",
        phone: "",
        city: "",
        addressLine: "",
      }));
      return;
    }

    const u = authState.user;
    setCheckoutDetails((prev) => ({
      ...prev,
      firstName: u.firstName || "",
      lastName: u.lastName || "",
      phone: u.phone || "",
      city: u.city || "",
      addressLine: u.addressLine || u.address || "",
    }));
  }, [authState.user]);

  const displayedProducts = useMemo(() => {
    let list = [...products];
    const min = Number(filters.minPrice || 0);
    const max = Number(filters.maxPrice || 0);

    if (filters.minPrice) {
      list = list.filter((p) => p.pricePkr >= min);
    }
    if (filters.maxPrice) {
      list = list.filter((p) => p.pricePkr <= max);
    }
    if (filters.sortBy === "price_low") {
      list.sort((a, b) => a.pricePkr - b.pricePkr);
    } else if (filters.sortBy === "price_high") {
      list.sort((a, b) => b.pricePkr - a.pricePkr);
    } else if (filters.sortBy === "newest") {
      list.sort((a, b) => b.id - a.id);
    }
    return list;
  }, [products, filters.minPrice, filters.maxPrice, filters.sortBy]);

  function addToCart(product: Product) {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: Math.min(item.quantity + 1, 10) } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setAddedMap((prev) => ({ ...prev, [product.id]: true }));
    showAppToast({
      title: "Added to cart",
      description: `${product.name} is ready in your cart.`,
      tone: "success",
    });
    setTimeout(() => setAddedMap((prev) => ({ ...prev, [product.id]: false })), 1200);
  }

  function updateCartQty(productId: number, nextQty: number) {
    if (nextQty <= 0) return removeFromCart(productId);
    setCartItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity: Math.min(nextQty, 10) } : item
      )
    );
  }

  function removeFromCart(productId: number) {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  }

  async function handleCheckout() {
    if (!authState.user) return navigate("/login", { state: { from: location.pathname, checkout: true } });
    if (!cartItems.length) return setError("Cart is empty");
    setIsCheckoutLoading(true);
    try {
      if (checkoutDetails.paymentMethod === "card") {
        const stripeResponse = await api.post(
          "/stripe/checkout-session",
          { items: cartItems.map((item) => ({ productId: Number(item.product.id), quantity: item.quantity })) },
          { headers: authHeaders }
        );
        if (stripeResponse.data?.url) {
          window.location.href = stripeResponse.data.url;
          return;
        }
      }

      const checkoutResponse = await api.post(
        "/orders/checkout",
        { items: cartItems.map((item) => ({ productId: Number(item.product.id), quantity: item.quantity })) },
        { headers: authHeaders }
      );
      const totalAmount = checkoutResponse.data?.bill?.grandTotal || cartPricing.grandTotal;
      const orderId = checkoutResponse.data?.orderId as number | undefined;
      setLastOrderTotal(totalAmount);
      setCartItems([]);
      setError("");
      showAppToast({
        title: "Checkout complete",
        description: "Your order has been confirmed successfully.",
        tone: "success",
      });
      navigate("/order-confirmation", { state: { total: totalAmount, orderId } });
    } catch (orderError: any) {
      if (orderError.response?.status === 401) {
        const ok = await refreshAccessToken(authState.refreshToken);
        if (ok) return handleCheckout();
      }
      setError(orderError.response?.data?.message || "Failed to place order");
      showAppToast({
        title: "Checkout failed",
        description: orderError.response?.data?.message || "Could not complete checkout.",
        tone: "error",
      });
    } finally {
      setIsCheckoutLoading(false);
    }
  }

  async function handleAuthSubmit(type: "login" | "signup", form: AuthForm) {
    setError("");
    setIsAuthLoading(true);
    try {
      let res;
      if (type === "signup") {
        const formData = new FormData();
        formData.append("firstName", form.firstName);
        formData.append("lastName", form.lastName);
        formData.append("email", form.email);
        formData.append("phone", form.phone);
        formData.append("city", form.city);
        formData.append("addressLine", form.addressLine);
        formData.append("password", form.password);
        if (form.logo) formData.append("logo", form.logo);
        res = await api.post("/auth/signup", formData);
      } else {
        res = await api.post("/auth/login", { email: form.email, password: form.password });
      }
      setAuthState(res.data);
      showAppToast({
        title: type === "signup" ? "Signup successful" : "Login successful",
        description: "Welcome to Sapphire Store.",
        tone: "success",
      });
      navigate("/");
    } catch (e: any) {
      setError(e.response?.data?.message || "Authentication failed");
      showAppToast({
        title: "Authentication failed",
        description: e.response?.data?.message || "Please check credentials and try again.",
        tone: "error",
      });
    } finally {
      setIsAuthLoading(false);
    }
  }

  async function handleLogout() {
    await api.post("/auth/logout", {}, { headers: authHeaders });
    setAuthState({ user: null, accessToken: "", refreshToken: "" });
    showAppToast({
      title: "Logged out",
      description: "Your session ended successfully.",
      tone: "info",
    });
  }

  const isAdminSection = location.pathname.startsWith("/admin");

  return (
    <CatalogRefreshContext.Provider value={catalogRefreshValue}>
    <Box
      maxW={isAdminSection ? "min(1600px, 100%)" : "1200px"}
      mx="auto"
      pt={isAdminSection ? { base: "112px", md: "122px" } : { base: "86px", md: "96px" }}
      px={{ base: "4", md: "5" }}
      pb={{ base: "12", md: "16" }}
    >
      <AppHeader
        authState={authState}
        cartItems={cartItems}
        onLogout={async () =>
          openConfirm({
            title: "Logout now?",
            description: "You can log back in anytime to continue shopping.",
            confirmLabel: "Logout",
            onConfirm: async () => {
              setConfirmState((prev) => ({ ...prev, isOpen: false }));
              await handleLogout();
            },
          })
        }
      />
      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              activeSlide={activeSlide}
              slides={HERO_SLIDES}
              onPrevSlide={() =>
                setActiveSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)
              }
              onNextSlide={() => setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length)}
              filters={filters}
              setFilters={setFilters}
              brands={brands}
              collections={collections}
              colors={colors}
              sizes={sizes}
              categories={categories}
              itemsPerPage={itemsPerPage}
              loading={loading}
              products={displayedProducts}
              addedMap={addedMap}
              currentPage={cursorTrail.length}
              totalPages={totalPagesFromCount}
              totalCount={totalCount}
              hasPrevPage={cursorTrail.length > 1}
              hasNextPage={hasNextPage && Boolean(lastFetchedNextCursor)}
              onApplyFilters={() => loadProductsAtTrail([null], itemsPerPage, filters)}
              onResetFilters={() => {
                setFilters(initialFilters);
                loadProductsAtTrail([null], itemsPerPage, initialFilters);
              }}
              onSelectCategory={(cat) => {
                const nextFilters = { ...filters, category: cat };
                setFilters(nextFilters);
                loadProductsAtTrail([null], itemsPerPage, nextFilters);
              }}
              onAddToCart={addToCart}
              onPageSizeChange={(next) => {
                setItemsPerPage(next);
                loadProductsAtTrail([null], next, filters);
              }}
              onPrevPage={() => {
                if (cursorTrail.length <= 1) return;
                void loadProductsAtTrail(cursorTrail.slice(0, -1), itemsPerPage, filters);
              }}
              onNextPage={() => {
                if (!hasNextPage || !lastFetchedNextCursor) return;
                void loadProductsAtTrail([...cursorTrail, lastFetchedNextCursor], itemsPerPage, filters);
              }}
            />
          }
        />
        <Route path="/products" element={<Navigate to="/" />} />
        <Route
          path="/cart"
          element={
            <CartPage
              cartItems={cartItems}
              cartPricing={cartPricing}
              isPricingLoading={isPricingLoading}
              onDecrease={(item) => updateCartQty(item.product.id, item.quantity - 1)}
              onIncrease={(item) => updateCartQty(item.product.id, item.quantity + 1)}
              onRemove={removeFromCart}
              onClearCart={() =>
                openConfirm({
                  title: "Clear cart?",
                  description: "This will remove all selected products from your cart.",
                  confirmLabel: "Yes, Clear",
                  onConfirm: () => {
                    setCartItems([]);
                    setConfirmState((prev) => ({ ...prev, isOpen: false }));
                    showAppToast({
                      title: "Cart cleared",
                      description: "All items have been removed.",
                      tone: "info",
                    });
                  },
                })
              }
              onContinueShopping={() => navigate("/")}
              onPlaceOrder={() => {
                if (!authState.user) {
                  navigate("/login", { state: { from: "/cart", checkout: true } });
                  return;
                }
                navigate("/checkout");
              }}
            />
          }
        />
        <Route
          path="/collections"
          element={
            <CollectionsPage
              collections={collections}
              onStartShopping={(collection) => {
                const nextFilters = { ...filters, collection: collection || "" };
                setFilters(nextFilters);
                loadProductsAtTrail([null], itemsPerPage, nextFilters);
                navigate("/");
              }}
            />
          }
        />
        <Route
          path="/checkout"
          element={
            !authState.user ? (
              <Navigate to="/login" />
            ) : (
              <CheckoutPage
                cartItems={cartItems}
                cartPricing={cartPricing}
                details={checkoutDetails}
                onChange={setCheckoutDetails}
                onBackToCart={() => navigate("/cart")}
                onPlaceOrder={async () =>
                  openConfirm({
                    title: "Confirm order?",
                    description:
                      checkoutDetails.paymentMethod === "card"
                        ? "You will be redirected to Stripe to complete payment."
                        : "Your order will be placed with cash on delivery.",
                    confirmLabel:
                      checkoutDetails.paymentMethod === "card" ? "Pay with Stripe" : "Place Order",
                    onConfirm: async () => {
                      setConfirmState((prev) => ({ ...prev, isOpen: false }));
                      await handleCheckout();
                    },
                  })
                }
                isSubmitting={isCheckoutLoading}
                isPricingLoading={isPricingLoading}
              />
            )
          }
        />
        <Route
          path="/order-confirmation"
          element={
            <OrderConfirmationPage
              codTotalFromNav={(location.state as { total?: number; orderId?: number } | null)?.total}
              codOrderIdFromNav={(location.state as { total?: number; orderId?: number } | null)?.orderId}
              lastOrderTotalFallback={lastOrderTotal}
              accessToken={authState.accessToken}
              onStripePaidVerified={({ total }) => {
                setCartItems([]);
                setLastOrderTotal(total);
              }}
              slides={confirmationSlides}
              activeSlide={confirmationSlide}
              onPrevSlide={() =>
                setConfirmationSlide((prev) => (prev - 1 + confirmationSlides.length) % confirmationSlides.length)
              }
              onNextSlide={() => setConfirmationSlide((prev) => (prev + 1) % confirmationSlides.length)}
              onContinueShopping={() => navigate("/")}
            />
          }
        />
        <Route
          path="/orders"
          element={
            !authState.user ? (
              <Navigate to="/login" replace state={{ from: "/orders" }} />
            ) : (
              <OrdersPage accessToken={authState.accessToken} />
            )
          }
        />
        <Route
          path="/orders/:orderId"
          element={
            !authState.user ? (
              <Navigate to="/login" replace state={{ from: location.pathname }} />
            ) : (
              <OrderDetailPage accessToken={authState.accessToken} />
            )
          }
        />
        <Route
          path="/login"
          element={
            authState.user ? (
              <Navigate to="/" />
            ) : (
              <AuthPage type="login" onSubmit={handleAuthSubmit} isAuthLoading={isAuthLoading} />
            )
          }
        />
        <Route
          path="/signup"
          element={
            authState.user ? (
              <Navigate to="/" />
            ) : (
              <AuthPage type="signup" onSubmit={handleAuthSubmit} isAuthLoading={isAuthLoading} />
            )
          }
        />
        <Route path="/admin" element={<AdminRouteLayout authState={authState} />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="refunds" element={<AdminRefundsPage />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="products/new" element={<AdminProductFormPage />} />
          <Route path="products/:productId/edit" element={<AdminProductFormPage />} />
        </Route>
      </Routes>

      {error ? (
        <Box mt="4" color="red.300" fontWeight="600">
          {error}
        </Box>
      ) : null}

      <ConfirmActionModal
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        description={confirmState.description}
        confirmLabel={confirmState.confirmLabel}
        isConfirmLoading={isCheckoutLoading}
        onCancel={() => setConfirmState((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={async () => {
          if (!confirmState.onConfirm) return;
          await confirmState.onConfirm();
        }}
      />
      <AppLoadingOverlay isVisible={isSessionRestoring} label="Restoring your session..." />

    </Box>
    </CatalogRefreshContext.Provider>
  );
}

export default App;
