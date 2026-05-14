import { Button, HStack } from "@chakra-ui/react";

type CategoryChipsProps = {
  categories: string[];
  activeCategory: string;
  onSelect: (category: string) => void;
};

export function CategoryChips({ categories, activeCategory, onSelect }: CategoryChipsProps) {
  return (
    <HStack spacing="2" mb="5" wrap="wrap">
      {categories.map((cat) => (
        <Button
          key={cat}
          size="sm"
          variant={activeCategory === cat ? "solid" : "outline"}
          borderRadius="full"
          onClick={() => onSelect(cat)}
        >
          {cat}
        </Button>
      ))}
    </HStack>
  );
}
