'use client';

import React, { useState, useEffect, useRef } from 'react';
import ProductCard from '@/components/products/ProductCard';
import { Product, Review } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Star, Heart, Share2, ShoppingCart, Plus, Minus, MessageSquare, Truck, ShieldCheck, RefreshCcw, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';
import StarRating from '@/components/products/StarRating';
import { useCartActions } from '@/hooks/use-cart-actions';

import { extractList, getApiErrorMessage } from '@/lib/api-helpers';
import { formatEtb } from '@/lib/format-currency';
import { getEffectiveUnitPrice } from '@/lib/product-price';
import { FREE_SHIPPING_MIN_ETB } from '@/lib/shipping';

interface ProductDetailClientProps {
  initialProduct: Product;
  initialReviews: Review[];
  initialRelated: Product[];
}

export default function ProductDetailClient({
  initialProduct,
  initialReviews,
  initialRelated,
}: ProductDetailClientProps) {
  const [product, setProduct] = useState<Product>(initialProduct);
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>(initialRelated);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const { addToCart } = useCartActions();

  // Review form state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewName, setReviewName] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const reviewFormRef = useRef<HTMLFormElement>(null);

  // Load user-specific data on mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        // Check if liked
        const likeRes = await api.get(`/store/products/${product.id}/is_liked/`);
        setIsLiked(likeRes.data.is_liked);
      } catch (error) {
        // Ignore errors for non-auth users
      }
    };
    loadUserData();
  }, [product.id]);

  const handleAddToCart = async () => {
    try {
      await addToCart(product, quantity);
      toast.success('Added to cart!');
    } catch (error) {
      toast.error('Failed to add to cart');
    }
  };

  const handleLike = async () => {
    if (isLikeLoading) return;
    setIsLikeLoading(true);
    try {
      if (isLiked) {
        await api.delete(`/store/products/${product.id}/like/`);
        setIsLiked(false);
        setProduct(prev => prev ? { ...prev, total_likes: prev.total_likes - 1 } : prev);
      } else {
        await api.post(`/store/products/${product.id}/like/`);
        setIsLiked(true);
        setProduct(prev => prev ? { ...prev, total_likes: prev.total_likes + 1 } : prev);
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to update like'));
    } finally {
      setIsLikeLoading(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingReview) return;
    setSubmittingReview(true);
    try {
      const res = await api.post(`/store/products/${product.id}/reviews/`, {
        name: reviewName,
        description: reviewText,
        rating: reviewRating,
      });
      setReviews(prev => [res.data, ...prev]);
      setShowReviewForm(false);
      setReviewName('');
      setReviewText('');
      setReviewRating(5);
      toast.success('Review submitted!');
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to submit review'));
    } finally {
      setSubmittingReview(false);
    }
  };

  const effectivePrice = getEffectiveUnitPrice(product);
  const isOnSale = product.is_on_sale && product.discounted_price;
  const hasFreeShipping = effectivePrice >= FREE_SHIPPING_MIN_ETB;

  const handleImageMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  const handleImageClick = () => {
    setIsZoomed(!isZoomed);
  };

  return (
    <main className="flex-grow container mx-auto px-4 py-8 pb-24 md:pb-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Images */}
        <div className="space-y-4">
          <div 
            className="aspect-square relative overflow-hidden rounded-3xl bg-cream cursor-zoom-in"
            onMouseMove={handleImageMouseMove}
            onClick={handleImageClick}
            style={isZoomed ? {
              cursor: 'zoom-out',
              transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
              transform: 'scale(2)',
            } : {}}
          >
            <Image
              src={product.images?.[selectedImage]?.image || 'https://picsum.photos/seed/product/600/600'}
              alt={product.title}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
          {product.images && product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((img, index) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                    selectedImage === index ? 'border-primary' : 'border-transparent'
                  }`}
                >
                  <Image
                    src={img.image}
                    alt={`${product.title} ${index + 1}`}
                    width={80}
                    height={80}
                    className="object-cover w-full h-full"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase mb-2">
              {product.title}
            </h1>
            <p className="text-muted-foreground text-lg">{product.description}</p>
          </div>

          {/* Price */}
          <div className="flex items-center gap-4">
            <div className="text-3xl font-black text-primary">
              {formatEtb(effectivePrice)}
            </div>
            {isOnSale && (
              <div className="text-xl text-muted-foreground line-through">
                {formatEtb(product.unit_price)}
              </div>
            )}
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            {isOnSale && <Badge variant="destructive">ON SALE</Badge>}
            {hasFreeShipping && <Badge variant="secondary">FREE SHIPPING</Badge>}
            {product.inventory > 0 ? (
              <Badge variant="outline" className="text-green-600 border-green-600">
                {product.inventory < 10 ? `Only ${product.inventory} left` : 'In Stock'}
              </Badge>
            ) : (
              <Badge variant="outline" className="text-red-600 border-red-600">
                Out of Stock
              </Badge>
            )}
          </div>

          {/* Quantity & Add to Cart */}
          <div className="flex items-center gap-4">
            <div className="flex items-center border rounded-lg">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="px-4 py-2 font-bold">{quantity}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setQuantity(quantity + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <Button onClick={handleAddToCart} className="flex-1 h-12">
              <ShoppingCart className="h-5 w-5 mr-2" />
              Add to Cart
            </Button>
          </div>

          {/* Mobile Sticky Add to Cart */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t p-4 z-50">
            <div className="flex items-center gap-4">
              <div className="flex items-center border rounded-lg">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="px-4 py-2 font-bold">{quantity}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <Button onClick={handleAddToCart} className="flex-1 h-12">
                <ShoppingCart className="h-5 w-5 mr-2" />
                Add to Cart - {formatEtb(effectivePrice * quantity)}
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleLike}
              disabled={isLikeLoading}
              className={isLiked ? 'text-red-500' : ''}
            >
              <Heart className={`h-5 w-5 mr-2 ${isLiked ? 'fill-current' : ''}`} />
              {product.total_likes}
            </Button>
            <Button variant="outline">
              <Share2 className="h-5 w-5 mr-2" />
              Share
            </Button>
          </div>

          {/* Shipping Info */}
          <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <Truck className="h-5 w-5 text-primary" />
              <span className="font-bold">
                {hasFreeShipping ? 'FREE Shipping' : `Shipping: ${formatEtb(150)}`}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <span>Secure Checkout & Returns</span>
            </div>
            <div className="flex items-center gap-3">
              <RefreshCcw className="h-5 w-5 text-primary" />
              <span>30-Day Return Policy</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="description" className="mt-16">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="description">Description</TabsTrigger>
          <TabsTrigger value="reviews">
            Reviews ({reviews.length})
          </TabsTrigger>
          <TabsTrigger value="related">Related Products</TabsTrigger>
        </TabsList>

        <TabsContent value="description" className="mt-8">
          <div className="prose max-w-none">
            <p>{product.description}</p>
          </div>
        </TabsContent>

        <TabsContent value="reviews" className="mt-8">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-bold">Customer Reviews</h3>
              <Button onClick={() => setShowReviewForm(!showReviewForm)}>
                <MessageSquare className="h-5 w-5 mr-2" />
                Write Review
              </Button>
            </div>

            {showReviewForm && (
              <form onSubmit={handleSubmitReview} className="p-6 border rounded-lg space-y-4" ref={reviewFormRef}>
                <div>
                  <label className="block font-bold mb-2">Name</label>
                  <Input
                    value={reviewName}
                    onChange={(e) => setReviewName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold mb-2">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className="focus:outline-none transition-transform active:scale-110"
                      >
                        <Star
                          className={`h-8 w-8 ${star <= reviewRating ? 'fill-primary text-primary' : 'text-muted-foreground/20 hover:text-primary/40'}`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block font-bold mb-2">Review</label>
                  <textarea
                    className="w-full p-3 border rounded-lg"
                    rows={4}
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" disabled={submittingReview}>
                  {submittingReview && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Submit Review
                </Button>
              </form>
            )}

            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-bold">{review.name}</div>
                      <StarRating rating={review.rating} />
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(review.data).toLocaleDateString()}
                    </div>
                  </div>
                  <p>{review.description}</p>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="related" className="mt-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {relatedProducts.map((relatedProduct) => (
              <ProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
}