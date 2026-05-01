// Cart utility — localStorage for guests, syncs to backend on login

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  image?: string;
  quantity: number;
  vendorId: string;
}

export const getCart = (): CartItem[] => {
  if (typeof window === 'undefined') return [];
  return JSON.parse(localStorage.getItem('cart') || '[]');
};

export const saveCart = (cart: CartItem[]) => {
  localStorage.setItem('cart', JSON.stringify(cart));
  window.dispatchEvent(new Event('cartUpdated'));
};

export const addToCart = (item: CartItem) => {
  const cart = getCart();
  const existing = cart.find(i => i.productId === item.productId);
  if (existing) {
    existing.quantity += item.quantity;
  } else {
    cart.push(item);
  }
  saveCart(cart);
};

export const clearCart = () => {
  localStorage.removeItem('cart');
  window.dispatchEvent(new Event('cartUpdated'));
};

export const getCartCount = (): number =>
  getCart().reduce((s, i) => s + i.quantity, 0);
