export interface RecentlyViewedProduct {
  id: number;
  title: string;
  category: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  image: string;
  brand: string;
  rating?: number;
}

const STORAGE_KEY = 'recently_viewed_products_v1';
const MAX_ITEMS = 10;

export function getRecentlyViewed(): RecentlyViewedProduct[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to read recently viewed products:', e);
    return [];
  }
}

export function addRecentlyViewed(product: RecentlyViewedProduct): RecentlyViewedProduct[] {
  if (!product || !product.id) return getRecentlyViewed();

  try {
    const current = getRecentlyViewed();
    // Filter out duplicate if present
    const filtered = current.filter(item => item.id !== product.id);
    // Add new product to top
    const updated = [product, ...filtered].slice(0, MAX_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to save recently viewed product:', e);
    return getRecentlyViewed();
  }
}

export function clearRecentlyViewed(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear recently viewed products:', e);
  }
}
