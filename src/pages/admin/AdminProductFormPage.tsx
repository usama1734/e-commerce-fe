import {
  Box,
  Button,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  IconButton,
  Input,
  Link,
  NumberInput,
  NumberInputField,
  SimpleGrid,
  Spinner,
  Text,
  Textarea,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { Link as RouterLink, useNavigate, useOutletContext, useParams } from "react-router-dom";
import { FiTrash2 } from "react-icons/fi";
import { api } from "@/services/api";
import { useCatalogRefresh } from "@/context/CatalogRefreshContext";
import type { AdminOutletContext } from "@/types";

type VariantForm = {
  id?: number;
  color: string;
  size: string;
  pricePkr: number;
  compareAtPricePkr: number | "";
  stripCompareAt?: boolean;
  stock: number;
};

const emptyVariant = (): VariantForm => ({
  color: "",
  size: "",
  pricePkr: 0,
  compareAtPricePkr: "",
  stripCompareAt: false,
  stock: 0,
});

type LoadedProduct = {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  brand: string;
  category: string;
  collection: string | null;
  variants: Array<{
    id: number;
    color: string;
    size: string;
    pricePkr: number;
    compareAtPricePkr?: number | null;
    stock: number;
    sku: string;
  }>;
};

export function AdminProductFormPage() {
  const { productId } = useParams<{ productId?: string }>();
  const isEdit = Boolean(productId && /^\d+$/.test(productId));
  const { accessToken } = useOutletContext<AdminOutletContext>();
  const { refreshStorefrontCatalog } = useCatalogRefresh();
  const navigate = useNavigate();
  const toast = useToast();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [brandName, setBrandName] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [collectionName, setCollectionName] = useState("");
  const [collectionDescription, setCollectionDescription] = useState("");
  const [variants, setVariants] = useState<VariantForm[]>([emptyVariant()]);
  const [removedVariantIds, setRemovedVariantIds] = useState<number[]>([]);
  const [metaLoading, setMetaLoading] = useState(false);
  const [productLoading, setProductLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [brands, setBrands] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    if (!accessToken) return;
    let cancelled = false;
    setMetaLoading(true);
    api
      .get<{ brands?: string[]; categories?: string[] }>("/admin/catalog/meta", {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .then((res) => {
        if (cancelled) return;
        setBrands(res.data.brands ?? []);
        setCategories(res.data.categories ?? []);
      })
      .catch(() => {
        if (cancelled) return;
        toast({ title: "Could not load catalog hints", status: "warning", duration: 3000 });
      })
      .finally(() => {
        if (!cancelled) setMetaLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [accessToken, toast]);

  useEffect(() => {
    if (!isEdit || !productId || !accessToken) {
      setProductLoading(false);
      return;
    }
    let cancelled = false;
    setProductLoading(true);
    setRemovedVariantIds([]);
    api
      .get<LoadedProduct>(`/admin/products/${productId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .then((res) => {
        if (cancelled) return;
        const p = res.data;
        setName(p.name);
        setDescription(p.description);
        setImageUrl(p.imageUrl);
        setBrandName(p.brand);
        setCategoryName(p.category);
        setCollectionName(p.collection ?? "");
        setCollectionDescription("");
        setVariants(
          p.variants.length
            ? p.variants.map((v) => ({
                id: v.id,
                color: v.color,
                size: v.size,
                pricePkr: v.pricePkr,
                compareAtPricePkr: v.compareAtPricePkr ?? "",
                stripCompareAt: false,
                stock: v.stock,
              }))
            : [emptyVariant()]
        );
      })
      .catch(() => {
        if (cancelled) return;
        toast({ title: "Product not found", status: "error", duration: 3000 });
        navigate("/admin/products");
      })
      .finally(() => {
        if (!cancelled) setProductLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isEdit, productId, accessToken, navigate, toast]);

  function updateVariant(index: number, patch: Partial<VariantForm>) {
    setVariants((prev) => prev.map((v, i) => (i === index ? { ...v, ...patch } : v)));
  }

  function addVariantRow() {
    setVariants((prev) => [...prev, emptyVariant()]);
  }

  function removeVariantRow(index: number) {
    const row = variants[index];
    if (row?.id) {
      setRemovedVariantIds((prev) => [...prev, row.id!]);
    }
    setVariants((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!accessToken) return;
    setSubmitting(true);
    try {
      if (isEdit && productId) {
        const withId = variants.filter((v) => v.id != null);
        const withoutId = variants.filter((v) => v.id == null);
        const patch: Record<string, unknown> = {
          name,
          description,
          imageUrl,
          brandName,
          categoryName,
        };
        if (collectionName.trim()) {
          patch.collectionName = collectionName.trim();
          if (collectionDescription.trim()) {
            patch.collectionDescription = collectionDescription.trim();
          }
        } else {
          patch.clearCollection = true;
        }
        if (removedVariantIds.length) {
          patch.removeVariantIds = removedVariantIds;
        }
        if (withId.length) {
          patch.updateVariants = withId.map((v) => {
            const row: Record<string, unknown> = {
              id: v.id,
              color: v.color.trim(),
              size: v.size.trim(),
              pricePkr: Number(v.pricePkr),
              stock: Number(v.stock),
            };
            if (v.stripCompareAt) row.compareAtPricePkr = null;
            else if (v.compareAtPricePkr !== "" && v.compareAtPricePkr != null) {
              row.compareAtPricePkr = Number(v.compareAtPricePkr);
            }
            return row;
          });
        }
        const newOnes = withoutId.filter((v) => v.color.trim() && v.size.trim());
        if (newOnes.length) {
          patch.addVariants = newOnes.map((v) => ({
            color: v.color.trim(),
            size: v.size.trim(),
            pricePkr: Number(v.pricePkr),
            stock: Number(v.stock),
            ...(v.compareAtPricePkr !== "" && v.compareAtPricePkr != null
              ? { compareAtPricePkr: Number(v.compareAtPricePkr) }
              : {}),
          }));
        }
        await api.patch(`/admin/products/${productId}`, patch, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        toast({ title: "Product updated", status: "success", duration: 2500 });
      } else {
        await api.post(
          "/admin/products",
          {
            name,
            description,
            imageUrl,
            brandName,
            categoryName,
            collectionName: collectionName.trim() || undefined,
            collectionDescription: collectionDescription.trim() || undefined,
            variants: variants.map((v) => ({
              color: v.color,
              size: v.size,
              pricePkr: Number(v.pricePkr),
              stock: Number(v.stock),
              ...(v.compareAtPricePkr !== "" && v.compareAtPricePkr != null
                ? { compareAtPricePkr: Number(v.compareAtPricePkr) }
                : {}),
            })),
          },
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        toast({ title: "Product created", status: "success", duration: 2500 });
      }
      try {
        await refreshStorefrontCatalog();
      } catch {
        /* storefront refresh is best-effort */
      }
      navigate("/admin/products");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (isEdit ? "Failed to update product" : "Failed to create product");
      toast({ title: "Error", description: msg, status: "error", duration: 4000 });
    } finally {
      setSubmitting(false);
    }
  }

  if (productLoading) {
    return (
      <Flex align="center" justify="center" minH="240px">
        <Spinner color="purple.500" size="lg" thickness="4px" />
      </Flex>
    );
  }

  return (
    <VStack align="stretch" spacing={8} as="form" onSubmit={handleSubmit}>
      <Box>
        <Heading size="lg" color="gray.800">
          {isEdit ? "Edit product" : "Add product"}
        </Heading>
        <Text color="gray.600" mt={2}>
          {isEdit
            ? "Changes are saved with PATCH. Variants with an ID are updated; new rows are added; removed rows are deleted if not on an order."
            : "Define the product, brand, and category, then add one or more variants (color, size, PKR price, stock)."}
        </Text>
      </Box>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
        <FormControl isRequired>
          <FormLabel>Name</FormLabel>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Embroidered lawn 3pc" />
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Image URL</FormLabel>
          <Input
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://…"
            type="url"
          />
        </FormControl>
        <FormControl isRequired gridColumn={{ md: "1 / -1" }}>
          <FormLabel>Description</FormLabel>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Fabric, fit, care…"
          />
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Brand</FormLabel>
          <Input
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            placeholder="Brand name"
            list="admin-brands"
          />
          <datalist id="admin-brands">
            {brands.map((b) => (
              <option key={b} value={b} />
            ))}
          </datalist>
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Category</FormLabel>
          <Input
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            placeholder="e.g. Lawn, Pret"
            list="admin-categories"
          />
          <datalist id="admin-categories">
            {categories.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </FormControl>
        <FormControl>
          <FormLabel>Collection name (optional)</FormLabel>
          <Input
            value={collectionName}
            onChange={(e) => setCollectionName(e.target.value)}
            placeholder="Leave blank to clear collection mapping"
          />
        </FormControl>
        <FormControl>
          <FormLabel>Collection description</FormLabel>
          <Input
            value={collectionDescription}
            onChange={(e) => setCollectionDescription(e.target.value)}
            placeholder="When creating a new named collection"
          />
        </FormControl>
      </SimpleGrid>

      <Box>
        <HStack justify="space-between" mb={4}>
          <Heading size="md" color="gray.800">
            Variants
          </Heading>
          <Button type="button" size="sm" variant="outline" onClick={addVariantRow}>
            Add variant
          </Button>
        </HStack>
        <VStack align="stretch" spacing={4}>
          {variants.map((v, index) => (
            <Box
              key={v.id != null ? `v-${v.id}` : `new-${index}`}
              borderWidth="1px"
              borderColor="gray.200"
              borderRadius="lg"
              p={4}
              bg="gray.50"
            >
              <HStack justify="space-between" mb={3}>
                <Text fontWeight="700" fontSize="sm" color="gray.600">
                  {v.id != null ? `Variant #${v.id}` : `New variant`}
                </Text>
                <IconButton
                  type="button"
                  aria-label="Remove variant"
                  icon={<FiTrash2 />}
                  size="sm"
                  variant="ghost"
                  colorScheme="red"
                  onClick={() => removeVariantRow(index)}
                  isDisabled={variants.length <= 1}
                />
              </HStack>
              <SimpleGrid columns={{ base: 1, sm: 2, md: 5 }} spacing={4}>
                <FormControl isRequired>
                  <FormLabel fontSize="xs">Color</FormLabel>
                  <Input value={v.color} onChange={(e) => updateVariant(index, { color: e.target.value })} />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel fontSize="xs">Size</FormLabel>
                  <Input value={v.size} onChange={(e) => updateVariant(index, { size: e.target.value })} />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel fontSize="xs">Sale price (PKR)</FormLabel>
                  <NumberInput
                    min={0}
                    value={v.pricePkr}
                    onChange={(_, n) => updateVariant(index, { pricePkr: Number.isNaN(n) ? 0 : n })}
                  >
                    <NumberInputField />
                  </NumberInput>
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="xs">List / compare-at (PKR)</FormLabel>
                  <NumberInput
                    min={0}
                    value={v.compareAtPricePkr === "" ? "" : v.compareAtPricePkr}
                    onChange={(_, n) =>
                      updateVariant(index, {
                        compareAtPricePkr: Number.isNaN(n) ? "" : n,
                        stripCompareAt: false,
                      })
                    }
                  >
                    <NumberInputField placeholder="Optional — shows discount badge" />
                  </NumberInput>
                </FormControl>
                <FormControl isRequired>
                  <FormLabel fontSize="xs">Stock</FormLabel>
                  <NumberInput
                    min={0}
                    value={v.stock}
                    onChange={(_, n) => updateVariant(index, { stock: Number.isNaN(n) ? 0 : n })}
                  >
                    <NumberInputField />
                  </NumberInput>
                </FormControl>
              </SimpleGrid>
              {v.id != null ? (
                <Button
                  type="button"
                  mt={2}
                  size="xs"
                  variant="link"
                  colorScheme="red"
                  onClick={() =>
                    updateVariant(index, {
                      stripCompareAt: true,
                      compareAtPricePkr: "",
                    })
                  }
                >
                  Remove list price (clear discount display)
                </Button>
              ) : null}
            </Box>
          ))}
        </VStack>
      </Box>

      <Divider />

      <HStack spacing={4} flexWrap="wrap">
        <Button type="submit" colorScheme="purple" isLoading={submitting} loadingText="Saving">
          {isEdit ? "Save changes" : "Publish product"}
        </Button>
        <Button type="button" variant="ghost" as={RouterLink} to="/admin/products">
          Cancel
        </Button>
        {metaLoading ? (
          <Text fontSize="sm" color="gray.500">
            Loading catalog hints…
          </Text>
        ) : null}
      </HStack>

      <Link as={RouterLink} to="/admin" fontSize="sm" color="purple.600" fontWeight="600">
        ← Admin home
      </Link>
    </VStack>
  );
}
