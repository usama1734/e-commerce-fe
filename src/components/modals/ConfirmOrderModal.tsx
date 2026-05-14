import { Box, Button, Center, Heading, HStack, Spinner, Text } from "@chakra-ui/react";

type ConfirmOrderModalProps = {
  isOpen: boolean;
  grandTotal: number;
  isCheckoutLoading: boolean;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
};

export function ConfirmOrderModal({
  isOpen,
  grandTotal,
  isCheckoutLoading,
  onCancel,
  onConfirm,
}: ConfirmOrderModalProps) {
  if (!isOpen) return null;

  return (
    <Center position="fixed" inset="0" bg="blackAlpha.700" zIndex="120" p="4">
      <Box bg="white" borderRadius="2xl" borderWidth="1px" borderColor="gray.200" p="5" w="full" maxW="520px">
        <Heading size="md" mb="3">
          Confirm Order
        </Heading>
        <Text mb="4">Place this order for PKR {grandTotal.toLocaleString()}?</Text>
        <HStack justify="end">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onConfirm} isDisabled={isCheckoutLoading}>
            {isCheckoutLoading ? <Spinner size="sm" /> : "Yes, Place Order"}
          </Button>
        </HStack>
      </Box>
    </Center>
  );
}
