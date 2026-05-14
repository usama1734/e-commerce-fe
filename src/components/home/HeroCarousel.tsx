import { Badge, Box, Heading, HStack, IconButton, Text, VStack } from "@chakra-ui/react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import type { HeroSlide } from "@/types";

type HeroCarouselProps = {
  activeSlide: number;
  slides: HeroSlide[];
  onPrev: () => void;
  onNext: () => void;
};

export function HeroCarousel({ activeSlide, slides, onPrev, onNext }: HeroCarouselProps) {
  const current = slides[activeSlide] ?? slides[0];

  return (
    <Box
      bg="white"
      borderWidth="1px"
      borderColor="gray.200"
      borderRadius="3xl"
      p={{ base: "6", md: "10" }}
      mb="7"
      boxShadow="0 10px 24px rgba(15, 23, 42, 0.06)"
    >
      <HStack justify="space-between" align={{ base: "flex-start", md: "center" }} spacing="4" direction={{ base: "column", md: "row" }}>
        <VStack align="start" spacing="3" flex="1">
          <Badge colorScheme="purple" borderRadius="full" px="3" py="1" textTransform="uppercase" fontSize="0.65rem">
            Featured Collection
          </Badge>
          <Heading size="lg" mb="3">
            {current?.title || "Featured Products"}
          </Heading>
          <Text color="gray.600" maxW="560px" lineHeight="tall">
            {current?.subtitle || "Discover handpicked products for your style and season."}
          </Text>
        </VStack>
        <HStack alignSelf={{ base: "flex-start", md: "center" }}>
          <IconButton aria-label="previous slide" icon={<FiChevronLeft />} onClick={onPrev} variant="outline" />
          <IconButton aria-label="next slide" icon={<FiChevronRight />} onClick={onNext} variant="outline" />
        </HStack>
      </HStack>
    </Box>
  );
}
