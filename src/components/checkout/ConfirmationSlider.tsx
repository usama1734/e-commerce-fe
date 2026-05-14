import { Box, Heading, HStack, IconButton, Text, VStack } from "@chakra-ui/react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

type Slide = {
  title: string;
  subtitle: string;
};

type ConfirmationSliderProps = {
  slides: Slide[];
  activeIndex: number;
  onPrev: () => void;
  onNext: () => void;
};

export function ConfirmationSlider({ slides, activeIndex, onPrev, onNext }: ConfirmationSliderProps) {
  const current = slides[activeIndex];

  return (
    <Box bg="white" borderWidth="1px" borderColor="gray.200" borderRadius="2xl" p={{ base: "5", md: "6" }}>
      <HStack justify="space-between" align="start" direction={{ base: "column", md: "row" }} spacing="4">
        <VStack align="start" spacing="2">
          <Text fontSize="xs" textTransform="uppercase" color="brand.600" letterSpacing="widest">
            Recommended For You
          </Text>
          <Heading size="md">{current.title}</Heading>
          <Text color="gray.600">{current.subtitle}</Text>
        </VStack>
        <HStack alignSelf={{ base: "flex-end", md: "auto" }}>
          <IconButton aria-label="Previous" icon={<FiChevronLeft />} onClick={onPrev} />
          <IconButton aria-label="Next" icon={<FiChevronRight />} onClick={onNext} />
        </HStack>
      </HStack>
    </Box>
  );
}
