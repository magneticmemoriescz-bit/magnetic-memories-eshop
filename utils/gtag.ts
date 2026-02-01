
export const trackEvent = (eventName: string, params?: any) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params);
  }
};

export const trackAddToCart = (product: any, variant: any, quantity: number, price: number) => {
  trackEvent('add_to_cart', {
    currency: 'CZK',
    value: price * quantity,
    items: [{
      item_id: product.id,
      item_name: product.name,
      item_variant: variant?.name,
      price: price,
      quantity: quantity
    }]
  });
};

export const trackBeginCheckout = (items: any[], total: number) => {
  trackEvent('begin_checkout', {
    currency: 'CZK',
    value: total,
    items: items.map(item => ({
      item_id: item.product.id,
      item_name: item.product.name,
      price: item.price,
      quantity: item.quantity
    }))
  });
};
