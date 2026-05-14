import { extendTheme, type ThemeConfig } from "@chakra-ui/react";

const config: ThemeConfig = {
  initialColorMode: "light",
  useSystemColorMode: false,
};

export const theme = extendTheme({
  config,
  radii: {
    xl: "14px",
    "2xl": "20px",
    "3xl": "28px",
  },
  fonts: {
    heading: "'Poppins', sans-serif",
    body: "'Poppins', sans-serif",
  },
  styles: {
    global: {
      body: {
        bg: "#f5f7fb",
        bgGradient: "radial(circle at top right, rgba(109,93,246,0.12), transparent 45%)",
        color: "gray.800",
        minHeight: "100vh",
      },
    },
  },
  colors: {
    brand: {
      50: "#eeebff",
      100: "#d3ccff",
      200: "#b7adff",
      300: "#9c8dff",
      400: "#826fff",
      500: "#6D5DF6",
      600: "#5948d6",
      700: "#4534b5",
      800: "#322193",
      900: "#201072",
    },
  },
  components: {
    Button: {
      baseStyle: {
        borderRadius: "xl",
        fontWeight: "700",
        transition: "all 0.2s ease",
      },
      variants: {
        solid: {
          bgGradient: "linear(to-r, brand.500, purple.500)",
          color: "white",
          _hover: {
            bgGradient: "linear(to-r, brand.600, purple.600)",
            transform: "translateY(-1px)",
          },
        },
        outline: {
          borderColor: "gray.300",
          color: "gray.700",
          _hover: { bg: "gray.100", borderColor: "gray.400" },
        },
      },
    },
    Input: {
      variants: {
        outline: {
          field: {
            bg: "white",
            borderColor: "gray.300",
            color: "gray.800",
            _placeholder: { color: "gray.500" },
            _focusVisible: {
              borderColor: "brand.400",
              boxShadow: "0 0 0 1px var(--chakra-colors-brand-400)",
            },
          },
        },
      },
    },
    Select: {
      variants: {
        outline: {
          field: {
            bg: "white",
            borderColor: "gray.300",
            color: "gray.800",
            _focusVisible: {
              borderColor: "brand.400",
              boxShadow: "0 0 0 1px var(--chakra-colors-brand-400)",
            },
          },
        },
      },
    },
    Card: {
      baseStyle: {
        container: {
          bg: "white",
          borderWidth: "1px",
          borderColor: "gray.200",
          borderRadius: "2xl",
          backdropFilter: "blur(8px)",
        },
      },
    },
  },
});
