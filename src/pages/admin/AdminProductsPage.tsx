import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Link,
  Select,
  Spinner,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  VStack,
} from '@chakra-ui/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link as RouterLink, useOutletContext } from 'react-router-dom';
import { FiEdit2, FiSearch, FiTrash2 } from 'react-icons/fi';
import { api } from '@/services/api';
import { useCatalogRefresh } from '@/context/CatalogRefreshContext';
import type { AdminOutletContext } from '@/types';
import { ConfirmActionModal } from '@/components/feedback/ConfirmActionModal';

type AdminProductRow = {
  id: number;
  name: string;
  brand: string;
  category: string;
  collection: string | null;
  variantCount: number;
  minPricePkr: number;
  imageUrl: string;
};

type CatalogMeta = {
  brands: string[];
  categories: string[];
  collections: string[];
  colors: string[];
  sizes: string[];
};

const PAGE_SIZE = 20;

const emptyFilters = {
  q: '',
  brand: '',
  category: '',
  collection: '',
  color: '',
  size: '',
  minPricePkr: '' as string | number,
  maxPricePkr: '' as string | number,
};

function buildListParams(
  filters: typeof emptyFilters,
  debouncedQ: string,
  cursor: string | null,
  limit: number,
): Record<string, string | number> {
  const p: Record<string, string | number> = { limit };
  const q = debouncedQ.trim();
  if (q) p.q = q;
  if (filters.brand) p.brand = filters.brand;
  if (filters.category) p.category = filters.category;
  if (filters.collection) p.collection = filters.collection;
  if (filters.color) p.color = filters.color;
  if (filters.size) p.size = filters.size;
  const minP = filters.minPricePkr === '' ? '' : Number(filters.minPricePkr);
  const maxP = filters.maxPricePkr === '' ? '' : Number(filters.maxPricePkr);
  if (minP !== '' && !Number.isNaN(minP) && minP >= 0) p.minPricePkr = minP;
  if (maxP !== '' && !Number.isNaN(maxP) && maxP >= 0) p.maxPricePkr = maxP;
  if (cursor) p.cursor = cursor;
  return p;
}

export function AdminProductsPage() {
  const { accessToken } = useOutletContext<AdminOutletContext>();
  const { refreshStorefrontCatalog } = useCatalogRefresh();
  const [filters, setFilters] = useState(emptyFilters);
  const [debouncedQ, setDebouncedQ] = useState('');
  const [meta, setMeta] = useState<CatalogMeta>({
    brands: [],
    categories: [],
    collections: [],
    colors: [],
    sizes: [],
  });
  const [metaLoading, setMetaLoading] = useState(true);

  const [items, setItems] = useState<AdminProductRow[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasNext, setHasNext] = useState(false);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [reloadNonce, setReloadNonce] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<AdminProductRow | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedQ(filters.q), 420);
    return () => window.clearTimeout(t);
  }, [filters.q]);

  const requestSignature = useMemo(
    () =>
      JSON.stringify({
        q: debouncedQ,
        brand: filters.brand,
        category: filters.category,
        collection: filters.collection,
        color: filters.color,
        size: filters.size,
        minPricePkr: filters.minPricePkr,
        maxPricePkr: filters.maxPricePkr,
        reloadNonce,
      }),
    [
      debouncedQ,
      filters.brand,
      filters.category,
      filters.collection,
      filters.color,
      filters.size,
      filters.minPricePkr,
      filters.maxPricePkr,
      reloadNonce,
    ],
  );

  const fetchPage = useCallback(
    async (cursor: string | null) => {
      if (!accessToken) return null;
      const res = await api.get<{
        items: AdminProductRow[];
        hasNext: boolean;
        nextCursor: string | null;
        totalCount?: number;
      }>('/admin/products', {
        params: buildListParams(filters, debouncedQ, cursor, PAGE_SIZE),
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const batch = res.data.items ?? [];
      return {
        batch,
        hasNext: Boolean(res.data.hasNext),
        next: res.data.hasNext ? res.data.nextCursor ?? null : null,
        totalCount: typeof res.data.totalCount === 'number' ? res.data.totalCount : undefined,
      };
    },
    [accessToken, filters, debouncedQ],
  );

  useEffect(() => {
    if (!accessToken) return;
    let cancelled = false;
    setLoading(true);
    setError('');
    setItems([]);
    setNextCursor(null);
    setHasNext(false);
    setTotalCount(null);

    fetchPage(null)
      .then((page) => {
        if (cancelled || !page) return;
        setItems(page.batch);
        setHasNext(page.hasNext);
        setNextCursor(page.next);
        if (page.totalCount != null) setTotalCount(page.totalCount);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        const msg =
          (e as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'Could not load products';
        setError(msg);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [accessToken, requestSignature, fetchPage]);

  useEffect(() => {
    if (!accessToken) return;
    let cancelled = false;
    setMetaLoading(true);
    api
      .get<CatalogMeta>('/admin/catalog/meta', {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .then((res) => {
        if (cancelled) return;
        setMeta({
          brands: res.data.brands ?? [],
          categories: res.data.categories ?? [],
          collections: res.data.collections ?? [],
          colors: res.data.colors ?? [],
          sizes: res.data.sizes ?? [],
        });
      })
      .catch(() => {
        if (!cancelled)
          setMeta({ brands: [], categories: [], collections: [], colors: [], sizes: [] });
      })
      .finally(() => {
        if (!cancelled) setMetaLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  async function confirmDelete() {
    if (!deleteTarget || !accessToken) return;
    setDeleteLoading(true);
    setError('');
    try {
      await api.delete(`/admin/products/${deleteTarget.id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setDeleteTarget(null);
      setReloadNonce((n) => n + 1);
      try {
        await refreshStorefrontCatalog();
      } catch {
        /* storefront refresh is best-effort */
      }
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Could not delete product';
      setError(msg);
    } finally {
      setDeleteLoading(false);
    }
  }

  async function loadMore() {
    if (!nextCursor || !accessToken) return;
    setLoadingMore(true);
    setError('');
    try {
      const page = await fetchPage(nextCursor);
      if (!page) return;
      setItems((prev) => [...prev, ...page.batch]);
      setHasNext(page.hasNext);
      setNextCursor(page.next);
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Could not load more';
      setError(msg);
    } finally {
      setLoadingMore(false);
    }
  }

  function resetFilters() {
    setFilters({ ...emptyFilters });
    setDebouncedQ('');
  }

  return (
    <VStack align='stretch' spacing={5} h='100%' minH='0'>
      <Box
        flexShrink={0}
        borderRadius='2xl'
        borderWidth='1px'
        borderColor='gray.200'
        bg='white'
        p={{ base: 4, md: 6 }}
        boxShadow='0 4px 24px rgba(15, 23, 42, 0.06)'
      >
        <HStack justify='space-between' align='flex-start' flexWrap='wrap' gap={4} mb={5}>
          <Box>
            <Heading size='lg' color='gray.800' letterSpacing='tight'>
              Product catalog
            </Heading>
            <Text color='gray.600' fontSize='sm' mt={1}>
              Search, filter, and browse with cursor-based pagination. Minimum PKR filters use the
              lowest variant price per product.
            </Text>
          </Box>
          <Button
            as={RouterLink}
            to='/admin/products/new'
            colorScheme='purple'
            size='md'
            borderRadius='xl'
          >
            Add product
          </Button>
        </HStack>

        <VStack align='stretch' spacing={4}>
          <FormControl>
            <FormLabel
              fontSize='xs'
              fontWeight='700'
              color='gray.600'
              textTransform='uppercase'
              mb={1}
            >
              Search
            </FormLabel>
            <InputGroup size='md'>
              <InputLeftElement pointerEvents='none' color='gray.400'>
                <FiSearch />
              </InputLeftElement>
              <Input
                pl={10}
                borderRadius='xl'
                bg='gray.50'
                placeholder='Name, description, or tag…'
                value={filters.q}
                onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
              />
            </InputGroup>
          </FormControl>

          <Box
            display='grid'
            gridTemplateColumns={{ base: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }}
            gap={4}
          >
            <FormControl>
              <FormLabel fontSize='xs' fontWeight='700' color='gray.600'>
                Brand
              </FormLabel>
              <Select
                borderRadius='lg'
                placeholder='All brands'
                value={filters.brand}
                onChange={(e) => setFilters((f) => ({ ...f, brand: e.target.value }))}
              >
                {meta.brands.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel fontSize='xs' fontWeight='700' color='gray.600'>
                Category
              </FormLabel>
              <Select
                borderRadius='lg'
                placeholder='All categories'
                value={filters.category}
                onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))}
              >
                {meta.categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel fontSize='xs' fontWeight='700' color='gray.600'>
                Collection
              </FormLabel>
              <Select
                borderRadius='lg'
                placeholder='All collections'
                value={filters.collection}
                onChange={(e) => setFilters((f) => ({ ...f, collection: e.target.value }))}
              >
                {meta.collections.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel fontSize='xs' fontWeight='700' color='gray.600'>
                Color (variant)
              </FormLabel>
              <Select
                borderRadius='lg'
                placeholder='Any color'
                value={filters.color}
                onChange={(e) => setFilters((f) => ({ ...f, color: e.target.value }))}
              >
                {meta.colors.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel fontSize='xs' fontWeight='700' color='gray.600'>
                Size (variant)
              </FormLabel>
              <Select
                borderRadius='lg'
                placeholder='Any size'
                value={filters.size}
                onChange={(e) => setFilters((f) => ({ ...f, size: e.target.value }))}
              >
                {meta.sizes.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </FormControl>
            <HStack spacing={3} align='flex-end'>
              <FormControl>
                <FormLabel fontSize='xs' fontWeight='700' color='gray.600'>
                  Min PKR
                </FormLabel>
                <Input
                  borderRadius='lg'
                  type='number'
                  min={0}
                  placeholder='0'
                  value={filters.minPricePkr}
                  onChange={(e) => setFilters((f) => ({ ...f, minPricePkr: e.target.value }))}
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize='xs' fontWeight='700' color='gray.600'>
                  Max PKR
                </FormLabel>
                <Input
                  borderRadius='lg'
                  type='number'
                  min={0}
                  placeholder='Any'
                  value={filters.maxPricePkr}
                  onChange={(e) => setFilters((f) => ({ ...f, maxPricePkr: e.target.value }))}
                />
              </FormControl>
            </HStack>
          </Box>

          <HStack flexWrap='wrap' spacing={3}>
            <Button size='sm' variant='outline' borderRadius='lg' onClick={resetFilters}>
              Reset filters
            </Button>
            {metaLoading ? (
              <Text fontSize='xs' color='gray.500'>
                Loading filter options…
              </Text>
            ) : null}
          </HStack>
        </VStack>
      </Box>

      {error ? (
        <Text color='red.600' fontWeight='600' fontSize='sm'>
          {error}
        </Text>
      ) : null}

      <Box
        flex='1'
        minH='0'
        display='flex'
        flexDirection='column'
        borderRadius='2xl'
        borderWidth='1px'
        borderColor='gray.200'
        bg='white'
        boxShadow='sm'
        overflow='hidden'
      >
        <HStack
          px={4}
          py={3}
          borderBottomWidth='1px'
          borderColor='gray.100'
          bg='gray.50'
          justify='space-between'
          flexWrap='wrap'
          gap={2}
        >
          <Text fontSize='sm' color='gray.600'>
            {loading ? (
              'Loading…'
            ) : (
              <>
                Showing <strong>{items.length}</strong>
                {totalCount != null ? (
                  <>
                    {' '}
                    of <strong>{totalCount}</strong>
                  </>
                ) : null}{' '}
                products
                {hasNext ? ' · more available' : ''}
              </>
            )}
          </Text>
          <Text fontSize='xs' color='gray.500'>
            Cursor · {PAGE_SIZE} per page
          </Text>
        </HStack>

        {loading ? (
          <Flex align='center' justify='center' py={16}>
            <Spinner color='purple.500' thickness='4px' speed='0.7s' size='lg' />
          </Flex>
        ) : (
          <TableContainer
            flex='1'
            minH='0'
            maxH={{ base: '55vh', md: 'calc(100vh - 420px)' }}
            overflowY='auto'
          >
            <Table size='sm' variant='simple' layout='fixed'>
              <Thead
                position='sticky'
                top={0}
                zIndex={2}
                bg='gray.100'
                boxShadow='0 1px 0 rgba(0,0,0,0.06)'
              >
                <Tr>
                  <Th
                    w='64px'
                    color='gray.700'
                    fontSize='xs'
                    textTransform='uppercase'
                    letterSpacing='wider'
                  >
                    ID
                  </Th>
                  <Th
                    color='gray.700'
                    fontSize='xs'
                    textTransform='uppercase'
                    letterSpacing='wider'
                  >
                    Product
                  </Th>
                  <Th
                    w='110px'
                    color='gray.700'
                    fontSize='xs'
                    textTransform='uppercase'
                    letterSpacing='wider'
                  >
                    Brand
                  </Th>
                  <Th
                    w='110px'
                    color='gray.700'
                    fontSize='xs'
                    textTransform='uppercase'
                    letterSpacing='wider'
                  >
                    Category
                  </Th>
                  <Th
                    w='88px'
                    isNumeric
                    color='gray.700'
                    fontSize='xs'
                    textTransform='uppercase'
                    letterSpacing='wider'
                  >
                    Variants
                  </Th>
                  <Th
                    w='100px'
                    isNumeric
                    color='gray.700'
                    fontSize='xs'
                    textTransform='uppercase'
                    letterSpacing='wider'
                  >
                    From PKR
                  </Th>
                  <Th
                    w='108px'
                    color='gray.700'
                    fontSize='xs'
                    textTransform='uppercase'
                    letterSpacing='wider'
                  >
                    Actions
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {items.length === 0 ? (
                  <Tr>
                    <Td colSpan={7} py={12} textAlign='center' color='gray.500'>
                      No products match these filters.
                    </Td>
                  </Tr>
                ) : (
                  items.map((row) => (
                    <Tr key={row.id} _hover={{ bg: 'purple.50' }}>
                      <Td fontWeight='700' color='gray.700' fontFamily='mono' fontSize='sm'>
                        {row.id}
                      </Td>
                      <Td borderLeftWidth='0'>
                        <Text fontWeight='600' color='gray.800' noOfLines={2}>
                          {row.name}
                        </Text>
                        <Text fontSize='xs' color='gray.500' noOfLines={1}>
                          {row.collection ?? '—'}
                        </Text>
                      </Td>
                      <Td fontSize='sm' color='gray.700'>
                        {row.brand}
                      </Td>
                      <Td fontSize='sm' color='gray.700'>
                        {row.category}
                      </Td>
                      <Td isNumeric fontWeight='600'>
                        {row.variantCount}
                      </Td>
                      <Td isNumeric fontWeight='700' color='gray.800'>
                        {row.minPricePkr.toLocaleString()}
                      </Td>
                      <Td>
                        <HStack spacing={1}>
                          <IconButton
                            as={RouterLink}
                            to={`/admin/products/${row.id}/edit`}
                            aria-label='Edit product'
                            icon={<FiEdit2 />}
                            size='sm'
                            variant='ghost'
                            colorScheme='purple'
                          />
                          <IconButton
                            aria-label='Delete product'
                            icon={<FiTrash2 />}
                            size='sm'
                            variant='ghost'
                            colorScheme='red'
                            onClick={() => setDeleteTarget(row)}
                          />
                        </HStack>
                      </Td>
                    </Tr>
                  ))
                )}
              </Tbody>
            </Table>
          </TableContainer>
        )}

        {!loading && hasNext && nextCursor ? (
          <Box px={4} py={3} borderTopWidth='1px' borderColor='gray.100' bg='gray.50'>
            <Button
              w='100%'
              variant='outline'
              borderRadius='xl'
              borderColor='purple.200'
              color='purple.700'
              _hover={{ bg: 'purple.50' }}
              isLoading={loadingMore}
              onClick={() => void loadMore()}
            >
              Load next page
            </Button>
          </Box>
        ) : null}
      </Box>

      <ConfirmActionModal
        isOpen={Boolean(deleteTarget)}
        title='Delete this product?'
        description={
          deleteTarget
            ? `“${deleteTarget.name}” will be hidden from the store (soft delete). This is blocked if any variant appears on an order.`
            : ''
        }
        confirmLabel='Delete'
        isConfirmLoading={deleteLoading}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => void confirmDelete()}
      />

      <Link as={RouterLink} to='/admin' fontSize='sm' color='purple.600' fontWeight='600'>
        ← Admin home
      </Link>
    </VStack>
  );
}
