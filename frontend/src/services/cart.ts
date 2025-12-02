import { ref } from "vue";

interface CartItem {
  id: number;
  title: string;
  price: number;
  image?: string;
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
  const existing = cart.value.find(item => item.id === product.id);
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

loadCart();

export { cart, addToCart, clearCart };
