import { Box, Button, Center, Heading, Text } from "@chakra-ui/react";

type ThankYouModalProps = {
  isOpen: boolean;
  onContinue: () => void;
};

export function ThankYouModal({ isOpen, onContinue }: ThankYouModalProps) {
  if (!isOpen) return null;

  return (
    <Center position="fixed" inset="0" bg="blackAlpha.700" zIndex="120" p="4">
      <Box
        bg="white"
        borderRadius="2xl"
        borderWidth="1px"
        borderColor="gray.200"
        p="6"
        w="full"
        maxW="520px"
        textAlign="center"
      >
        <Heading size="md" mb="2">
          Thank You!
        </Heading>
        <Text color="gray.600" mb="4">
          Your order has been placed successfully.
        </Text>
        <Button onClick={onContinue}>Continue Shopping</Button>
      </Box>
    </Center>
  );
}
