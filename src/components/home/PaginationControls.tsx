import { Button, Flex, HStack, Select, Text } from "@chakra-ui/react";

type PaginationControlsProps = {
  totalCount: number;
  itemsPerPage: number;
  /** Current page index (1-based) when using cursor trail */
  currentPage: number;
  totalPages: number;
  hasPrev: boolean;
  hasNext: boolean;
  loading: boolean;
  pageSizeOptions: number[];
  onPageSizeChange: (value: number) => void;
  onPrev: () => void;
  onNext: () => void;
};

export function PaginationControls({
  totalCount,
  itemsPerPage,
  currentPage,
  totalPages,
  hasPrev,
  hasNext,
  loading,
  pageSizeOptions,
  onPageSizeChange,
  onPrev,
  onNext,
}: PaginationControlsProps) {
  return (
    <Flex
      mt="6"
      justify="space-between"
      align="center"
      wrap="wrap"
      gap="3"
      bg="rgba(255,255,255,0.85)"
      borderWidth="1px"
      borderColor="gray.200"
      borderRadius="2xl"
      px={{ base: "3", md: "4" }}
      py="3"
      backdropFilter="blur(6px)"
    >
      <HStack>
        <Text fontWeight="600">{totalCount} products</Text>
        <Select w="110px" value={itemsPerPage} onChange={(e) => onPageSizeChange(Number(e.target.value))}>
          {pageSizeOptions.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </Select>
      </HStack>
      <HStack>
        <Button variant="outline" isDisabled={!hasPrev || loading} onClick={onPrev}>
          Prev
        </Button>
        <Text fontWeight="600" color="gray.600">
          Page {currentPage} / {totalPages}
        </Text>
        <Button isDisabled={!hasNext || loading} onClick={onNext}>
          Next
        </Button>
      </HStack>
    </Flex>
  );
}
