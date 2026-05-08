import { useCart } from '@/lib/store';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import { Product } from '@/lib/types';
import { useMutation } from './use-api';

export function useCartActions() {
  const cart = useCart((state) => state.cart);
  const addItemLocal = useCart((state) => state.addItem);
  const setCartId = useCart((state) => state.setCartId);

  const addToCartMutation = useMutation(
    async ({ product, quantity, cartId }: { product: Product; quantity: number; cartId: string }) => {
      return await api.post(`/store/carts/${cartId}/items/`, {
        product_id: product.id,
        quantity: quantity
      });
    },
    {
      onSuccess: () => {
        toast.success('Item added to cart successfully');
      },
      onError: (error) => {
        toast.error(`Failed to sync with server: ${error}`);
      }
    }
  );

  const addToCart = async (product: Product, quantity: number = 1) => {
    let currentCartId = cart?.id;

    try {
      // 1. Ensure we have a valid cart on the backend
      if (!currentCartId || currentCartId === 'temp-id' || currentCartId === '') {
        const cartRes = await api.post('/store/carts/');
        currentCartId = cartRes.data.id;
        if (currentCartId) {
          setCartId(currentCartId);
        }
      }

      if (!currentCartId) {
        throw new Error('Failed to initialize cart');
      }

      // 2. Optimistic update (local)
      addItemLocal(product, quantity);

      // 3. Sync with backend using mutation hook
      await addToCartMutation.mutate({ product, quantity, cartId: currentCartId });

      return true;
    } catch (error: any) {
      console.error('Failed to add item to cart:', error);
      // Item is already added locally, so we don't need to revert
      return false;
    }
  };

  return {
    addToCart,
    isAddingToCart: addToCartMutation.loading,
    addToCartError: addToCartMutation.error,
  };
}
