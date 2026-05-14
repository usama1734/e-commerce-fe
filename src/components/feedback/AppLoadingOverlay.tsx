import { Center, Spinner, Text, VStack } from "@chakra-ui/react";

type AppLoadingOverlayProps = {
  isVisible: boolean;
  label?: string;
};

export function AppLoadingOverlay({ isVisible, label = "Loading..." }: AppLoadingOverlayProps) {
  if (!isVisible) return null;

  return (
    <Center position="fixed" inset="0" zIndex="1400" bg="whiteAlpha.800" backdropFilter="blur(2px)">
      <VStack spacing="3">
        <Spinner size="xl" color="brand.600" thickness="4px" />
        <Text fontWeight="600" color="gray.700">
          {label}
        </Text>
      </VStack>
    </Center>
  );
}
