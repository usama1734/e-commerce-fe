import { lazy, StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ChakraProvider, Center, Spinner } from "@chakra-ui/react";
import "./index.css";
import { theme } from "@/theme";

const App = lazy(() => import("@/App"));

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <ChakraProvider theme={theme}>
      <BrowserRouter>
        <Suspense
          fallback={
            <Center minH="100vh">
              <Spinner size="xl" color="brand.400" />
            </Center>
          }
        >
          <App />
        </Suspense>
      </BrowserRouter>
    </ChakraProvider>
  </StrictMode>
);
