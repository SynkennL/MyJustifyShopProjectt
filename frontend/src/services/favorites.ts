import { ref } from "vue";
import { apiGet, apiPost, apiDelete } from "./api";

const favoriteIds = ref<Set<number>>(new Set());

const loadFavoriteIds = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      favoriteIds.value = new Set();
      return;
    }

    const data = await apiGet<{ favoriteIds: number[] }>("/favorites/ids");
    favoriteIds.value = new Set(data.favoriteIds || []);
  } catch (err) {
    console.error("Favoriler yüklenemedi:", err);
    favoriteIds.value = new Set();
  }
};

const addToFavorites = async (productId: number) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Giriş yapmalısınız");
    }

    await apiPost("/favorites", { product_id: productId });
    favoriteIds.value.add(productId);
    return true;
  } catch (err: any) {
    console.error("Favoriye eklenemedi:", err);
    throw err;
  }
};

const removeFromFavorites = async (productId: number) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Giriş yapmalısınız");
    }

    await apiDelete(`/favorites/${productId}`);
    favoriteIds.value.delete(productId);
    return true;
  } catch (err) {
    console.error("Favoriden çıkarılamadı:", err);
    throw err;
  }
};

const isFavorite = (productId: number): boolean => {
  return favoriteIds.value.has(productId);
};

const toggleFavorite = async (productId: number) => {
  if (isFavorite(productId)) {
    await removeFromFavorites(productId);
    return false;
  } else {
    await addToFavorites(productId);
    return true;
  }
};

const clearFavorites = () => {
  favoriteIds.value = new Set();
};

export {
  favoriteIds,
  loadFavoriteIds,
  addToFavorites,
  removeFromFavorites,
  isFavorite,
  toggleFavorite,
  clearFavorites,
};