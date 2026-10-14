import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { CartItem, Product } from '../types';

const STORAGE_KEY = 'mini-cart-items-v1';

type CartContextValue = {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  increaseQuantity: (productId: number) => void;
  decreaseQuantity: (productId: number) => void;
  removeFromCart: (productId: number) => void;
  clearCart: () => void;
  isInCart: (productId: number) => boolean;
  getItemQuantity: (productId: number) => number;
  totalItems: number;
  totalPrice: number;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load persisted cart on startup
  useEffect(() => {
    const loadCart = async () => {
      try {
        const storedItems = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedItems) {
          setCartItems(JSON.parse(storedItems));
        }
      } catch (err) {
        console.warn('Failed to load cart from storage', err);
      } finally {
        setIsLoaded(true);
      }
    };

    loadCart();
  }, []);

  // Save cart changes to AsyncStorage
  useEffect(() => {
    if (!isLoaded) {
      return;
    }
    const persistCart = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
      } catch (err) {
        console.warn('Failed to persist cart', err);
      }
    };

    persistCart();
  }, [cartItems, isLoaded]);

  const addToCart = useCallback((product: Product, quantity = 1) => {
    setCartItems(current => {
      const existingIndex = current.findIndex(item => item.product.id === product.id);
      if (existingIndex >= 0) {
        return current.map((item, index) =>
          index === existingIndex
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        );
      }
      return [...current, { product, quantity }];
    });
  }, []);

  const increaseQuantity = useCallback((productId: number) => {
    setCartItems(current =>
      current.map(item =>
        item.product.id === productId
          ? { ...item, quantity: item.quantity + 1 }
          : item,
      ),
    );
  }, []);

  // Requirement: Prevent quantity from going below 1
  const decreaseQuantity = useCallback((productId: number) => {
    setCartItems(current =>
      current.map(item => {
        if (item.product.id === productId) {
          const nextQty = Math.max(1, item.quantity - 1);
          return { ...item, quantity: nextQty };
        }
        return item;
      }),
    );
  }, []);

  const removeFromCart = useCallback((productId: number) => {
    setCartItems(current => current.filter(item => item.product.id !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const isInCart = useCallback(
    (productId: number) => cartItems.some(item => item.product.id === productId),
    [cartItems],
  );

  const getItemQuantity = useCallback(
    (productId: number) => {
      const found = cartItems.find(item => item.product.id === productId);
      return found ? found.quantity : 0;
    },
    [cartItems],
  );

  const totalItems = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems],
  );

  const totalPrice = useMemo(
    () =>
      cartItems.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0,
      ),
    [cartItems],
  );

  const value = useMemo<CartContextValue>(
    () => ({
      cartItems,
      addToCart,
      increaseQuantity,
      decreaseQuantity,
      removeFromCart,
      clearCart,
      isInCart,
      getItemQuantity,
      totalItems,
      totalPrice,
    }),
    [
      addToCart,
      cartItems,
      clearCart,
      decreaseQuantity,
      getItemQuantity,
      increaseQuantity,
      isInCart,
      removeFromCart,
      totalItems,
      totalPrice,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
