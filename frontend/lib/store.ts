import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Cart, Product } from './types';
import { clearAuthCookies } from './auth';
import { getEffectiveUnitPrice } from './product-price';

interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      logout: () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        clearAuthCookies();
        set({ user: null });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);

interface CartState {
  cart: Cart | null;
  isLoading: boolean;
  setCart: (cart: Cart | null) => void;
  addItem: (product: Product, quantity: number) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  setCartId: (id: string) => void;
  clearCart: () => void;
  setLoading: (loading: boolean) => void;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      cart: null,
      isLoading: false,
      setCart: (cart) => set({ cart }),
      setLoading: (isLoading) => set({ isLoading }),
      setCartId: (id) => {
        const current = get().cart;
        if (current) {
          set({ cart: { ...current, id } });
        } else {
          set({ cart: { id, items: [], total_price: 0 } });
        }
      },

      addItem: (product, quantity) => {
        const currentCart = get().cart;
        const items = currentCart ? [...currentCart.items] : [];
        const existingItemIndex = items.findIndex((item) => item.product.id === product.id);

        const unit = getEffectiveUnitPrice(product);
        if (existingItemIndex > -1) {
          items[existingItemIndex].quantity += quantity;
          items[existingItemIndex].product = product;
          items[existingItemIndex].total_price = items[existingItemIndex].quantity * unit;
        } else {
          items.push({
            id: Date.now(), // Temporary local ID

            product,
            quantity,
            total_price: quantity * unit,
          });
        }

        const total_price = items.reduce((acc, item) => acc + item.total_price, 0);
        set({ cart: { id: currentCart?.id || '', items, total_price } });
      },

      removeItem: (productId) => {
        const currentCart = get().cart;
        if (!currentCart) return;
        const items = currentCart.items.filter((item) => item.product.id !== productId);
        const total_price = items.reduce((acc, item) => acc + item.total_price, 0);
        set({ cart: { ...currentCart, items, total_price } });
      },
      updateQuantity: (productId, quantity) => {
        const currentCart = get().cart;
        if (!currentCart) return;
        const items = currentCart.items.map((item) => {
          if (item.product.id === productId) {
            return {
              ...item,
              quantity,
              total_price: quantity * getEffectiveUnitPrice(item.product),
            };
          }
          return item;
        });
        const total_price = items.reduce((acc, item) => acc + item.total_price, 0);
        set({ cart: { ...currentCart, items, total_price } });
      },
      clearCart: () => set({ cart: null }),
      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'cart-storage',
    }
  )
);
