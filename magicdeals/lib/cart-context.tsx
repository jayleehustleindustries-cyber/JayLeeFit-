"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Product } from "./types";

export type CartItem = {
  sku: string;
  slug: string;
  name: string;
  brand: string;
  size: string;
  price: number;
  image: string | null;
};

type CartContextValue = {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (product: Product) => void;
  removeItem: (sku: string) => void;
  clear: () => void;
  subtotal: number;
  count: number;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "magicdeals_hand";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      // One-time read on mount to pick up a hand saved in a previous
      // session — localStorage isn't available during SSR, so this can't
      // be a lazy useState initializer.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // ignore corrupt storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  // Every item is a one-of-one — no quantity stepper, adding an
  // already-held card just surfaces the drawer.
  const addItem = useCallback((product: Product) => {
    setItems((prev) => {
      if (prev.some((i) => i.sku === product.sku)) return prev;
      return [
        ...prev,
        {
          sku: product.sku,
          slug: product.slug,
          name: product.name,
          brand: product.brand,
          size: product.size,
          price: product.price,
          image: product.images[0] ?? null,
        },
      ];
    });
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((sku: string) => {
    setItems((prev) => prev.filter((i) => i.sku !== sku));
  }, []);

  const clear = useCallback(() => setItems([]), []);
  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.price, 0),
    [items]
  );

  const value: CartContextValue = {
    items,
    isOpen,
    openCart,
    closeCart,
    addItem,
    removeItem,
    clear,
    subtotal,
    count: items.length,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
