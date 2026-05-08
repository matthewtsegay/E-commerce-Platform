declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

export const trackPageView = (page_path: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', process.env.NEXT_PUBLIC_GA_ID || 'GA_MEASUREMENT_ID', {
      page_path,
    });
  }
};

export const trackAddToCart = (productId: string, productName: string, price: number) => {
  trackEvent('add_to_cart', 'ecommerce', productName, price);
};

export const trackProductClick = (productId: string, productName: string) => {
  trackEvent('product_click', 'ecommerce', productName);
};