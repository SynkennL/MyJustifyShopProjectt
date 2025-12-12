<script setup lang="ts">
import Card from '../common/Card.vue';

interface Props {
  order: any;
  type: 'sold' | 'purchased';
  onStatusChange?: (orderId: number, status: string) => void;
}

const props = defineProps<Props>();

const statusBadges: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
};

const statusTexts: Record<string, string> = {
  pending: 'Beklemede',
  confirmed: 'Onaylandı',
  shipped: 'Kargoda',
  delivered: 'Teslim Edildi',
  cancelled: 'İptal Edildi'
};

const statusOptions = [
  { value: 'confirmed', label: '✅ Onayla' },
  { value: 'shipped', label: '🚚 Kargola' },
  { value: 'delivered', label: '✔️ Teslim Et' },
  { value: 'cancelled', label: '❌ İptal Et' }
];

function getFirstImage(imageUrl: string | null | undefined): string {
  if (!imageUrl) return 'https://via.placeholder.com/300';
  try {
    const parsed = JSON.parse(imageUrl);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed[0] : imageUrl;
  } catch {
    return imageUrl;
  }
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('tr-TR');
}

function getStatusBadge(status: string) {
  return statusBadges[status] || 'bg-gray-100 text-gray-800';
}

function getStatusText(status: string) {
  return statusTexts[status] || status;
}

function handleStatusChange(event: Event) {
  const value = (event.target as HTMLSelectElement).value;
  if (value && props.onStatusChange) {
    props.onStatusChange(props.order.id, value);
  }
}
</script>

<template>
  <Card padding="md" hover>
    <div class="flex items-start gap-5 space-y-4">
      <img :src="getFirstImage(order.image_url)" alt="Ürün" class="w-24 h-24 object-cover rounded-lg" />
      <div class="flex-1">
        <h3 class="font-semibold text-lg">{{ order.product_title }}</h3>
        <p class="text-gray-600 text-sm">
          {{ type === 'sold' ? 'Alıcı:' : 'Satıcı:' }} 
          {{ type === 'sold' ? order.buyer_email : order.seller_email }}
        </p>
        <p class="text-gray-600 text-sm">Adet: {{ order.quantity }}</p>
        <p v-if="order.sizes && order.sizes.length" class="text-gray-600 text-sm">
          Bedenler: {{ order.sizes.join(", ") }}
        </p>
        <p class="font-bold text-lg mt-1">{{ order.total_price }} TL</p>
        <p class="text-gray-500 text-xs mt-1">{{ formatDate(order.created_at) }}</p>
      </div>
      <div class="flex flex-col gap-2 min-w-[140px]">
        <span :class="['px-3 py-1 rounded-full text-sm font-medium text-center', getStatusBadge(order.status)]">
          {{ getStatusText(order.status) }}
        </span>
        <select 
          v-if="type === 'sold'"
          @change="handleStatusChange"
          class="text-sm border rounded px-2 py-1.5 bg-white cursor-pointer"
        >
          <option value="">Durum Değiştir</option>
          <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
        <div v-else class="text-xs text-gray-500 text-center mt-1 px-2">
          Satıcı tarafından yönetiliyor
        </div>
      </div>
    </div>
  </Card>
</template>