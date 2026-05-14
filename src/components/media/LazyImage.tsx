import { Box, Image, Skeleton } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import type { ImageProps } from "@chakra-ui/react";

export type LazyImageProps = ImageProps & {
  /** IntersectionObserver rootMargin — load slightly before the image enters the viewport */
  rootMargin?: string;
};

/**
 * Defers loading until the image is near the viewport (Intersection Observer + native lazy decode).
 */
export function LazyImage({ rootMargin = "200px", src, alt, ...rest }: LazyImageProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(false);

  const { h, w, height, width, boxSize, minH, borderRadius, display, ...imageRest } = rest;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return undefined;

    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setActive(true);
          io.disconnect();
        }
      },
      { rootMargin, threshold: 0.01 }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin]);

  return (
    <Box
      ref={containerRef}
      position="relative"
      overflow="hidden"
      h={h}
      w={w}
      height={height}
      width={width}
      boxSize={boxSize}
      minH={minH}
      borderRadius={borderRadius}
      display={display}
    >
      {!active ? (
        <Skeleton h="full" w="full" borderRadius={borderRadius} startColor="gray.100" endColor="gray.200" />
      ) : (
        <Image
          src={src}
          alt={alt}
          h="full"
          w="full"
          loading="lazy"
          decoding="async"
          fetchPriority="low"
          draggable={false}
          {...imageRest}
        />
      )}
    </Box>
  );
}
