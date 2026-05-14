import { createContext, useContext } from "react";

export type CatalogRefreshContextValue = {
  /** Refetch storefront product list + facet meta after catalog changes (home, cart prices when listed). */
  refreshStorefrontCatalog: () => Promise<void>;
};

export const CatalogRefreshContext = createContext<CatalogRefreshContextValue | null>(null);

export function useCatalogRefresh(): CatalogRefreshContextValue {
  const ctx = useContext(CatalogRefreshContext);
  if (!ctx) {
    throw new Error("useCatalogRefresh must be used within CatalogRefreshContext.Provider");
  }
  return ctx;
}
