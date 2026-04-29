import { useCart } from '@/lib/store';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import { Product } from '@/lib/types';

export function useCartActions() {
  const cart = useCart((state) => state.cart);
  const addItemLocal = useCart((state) => state.addItem);
  const setCartId = useCart((state) => state.setCartId);

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

      // 3. Sync with backend
      await api.post(`/store/carts/${currentCartId}/items/`, {
        product_id: product.id,
        quantity: quantity
      });

      toast.success(`Added ${product.title} to cart`);
      return true;
    } catch (error: any) {
      console.error('Failed to sync cart with backend:', error);
      toast.error('Could not sync cart with server, but item is added locally.');
      return false;
    }
  };

  return { addToCart };
}
