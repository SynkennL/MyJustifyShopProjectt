import { ref } from "vue";
import { apiGet } from "./api";

interface CartItem {
  id: number;
  title: string;
  price: number;
  image?: string;
  sizes?: string[] | null;
  seller_id?: number | null;
  quantity: number;
}

const cart = ref<CartItem[]>([]);

// LocalStorage'dan yükle
const loadCart = () => {
  const c = localStorage.getItem("cart");
  if (c) cart.value = JSON.parse(c);
};

// Sepeti kaydet
const saveCart = () => {
  localStorage.setItem("cart", JSON.stringify(cart.value));
};

// Sepete ekle
const addToCart = (product: Omit<CartItem, "quantity">) => {
  const productSizes = (product as any).sizes || [];
  const sizeKey = Array.isArray(productSizes) ? productSizes.sort().join('|') : '';
  
  const existing = cart.value.find(item => {
    const existingSizes = (item.sizes || []).sort().join('|');
    return item.id === product.id && existingSizes === sizeKey;
  });
  
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.value.push({ ...product, quantity: 1 });
  }
  saveCart();
};

// Sepeti temizle
const clearCart = () => {
  cart.value = [];
  saveCart();
};

const clearGuestCart = () => {
  cart.value = [];
  localStorage.removeItem("cart");
};

// Oturum açan kullanıcının sahibi olduğu ürünleri sepetten sil
const removeOwnedProductsFromCart = async (userId: number) => {
  if (userId == null) return;

  // İlk olarak seller bilgisi olanları filtrele
  let remaining = cart.value.filter(item => {
    const seller = (item as any).seller_id ?? (item as any).sellerId ?? null;
    return seller !== userId;
  });

  // Eğer bazı öğelerde seller bilgisi yoksa, backend'den ürünleri çekip eksik bilgiyi tamamla
  const missing = remaining.filter(i => (i as any).seller_id == null && (i as any).sellerId == null);
  if (missing.length > 0) {
    try {
      const products: any[] = await apiGet(`/products`);
      const map = new Map<number, any>();
      products.forEach(p => map.set(p.id, p));

      remaining = remaining.filter(item => {
        const seller = (item as any).seller_id ?? (item as any).sellerId ?? null;
        if (seller != null) return seller !== userId;
        const prod = map.get(item.id);
        if (!prod) return true; // ürün bulunamazsa koru
        return prod.seller_id !== userId;
      });
    } catch (err) {
      // Eğer ürünleri çekemezsek, mevcut davranışı koru (silme yapma)
      console.error("removeOwnedProductsFromCart: ürün bilgisi alınamadı", err);
    }
  }

  cart.value = remaining;
  saveCart();
};

loadCart();

export { cart, addToCart, clearCart, clearGuestCart, removeOwnedProductsFromCart };