import { ref } from "vue";

interface CompareProduct {
  id: number;
  title: string;
  price: number;
  image_url: string;
  category_name: string;
  features?: any;
  description?: string;
}

const compareList = ref<CompareProduct[]>([]);
const MAX_COMPARE = 3;

const loadCompareList = () => {
  const stored = localStorage.getItem("compareList");
  if (stored) {
    compareList.value = JSON.parse(stored);
  }
};

const saveCompareList = () => {
  localStorage.setItem("compareList", JSON.stringify(compareList.value));
};

const addToCompare = (product: CompareProduct): boolean => {
  if (compareList.value.length >= MAX_COMPARE) {
    return false;
  }

  const exists = compareList.value.find(p => p.id === product.id);
  if (exists) {
    return false;
  }

  compareList.value.push(product);
  saveCompareList();
  return true;
};

const removeFromCompare = (productId: number) => {
  compareList.value = compareList.value.filter(p => p.id !== productId);
  saveCompareList();
};

const clearCompare = () => {
  compareList.value = [];
  localStorage.removeItem("compareList");
};

const isInCompare = (productId: number): boolean => {
  return compareList.value.some(p => p.id === productId);
};

loadCompareList();

export {
  compareList,
  addToCompare,
  removeFromCompare,
  clearCompare,
  isInCompare,
  MAX_COMPARE,
};