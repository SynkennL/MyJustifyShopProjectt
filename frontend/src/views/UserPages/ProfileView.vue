<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { toast } from "vue3-toastify";
import Button from "../../components/Button.vue";
import Input from "../../components/Input.vue";
import Card from "../../components/Card.vue";
import PageHeader from "../../components/PageHeader.vue";

const router = useRouter();
const user = ref<any>(null);
const isEditing = ref(false);
const isLoading = ref(false);

const editForm = ref({
  name: "",
  email: "",
  currentPassword: "",
  newPassword: "",
  confirmPassword: ""
});

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000/api";

onMounted(() => {
  const userStr = localStorage.getItem("user");
  if (!userStr) {
    toast.error("Lütfen giriş yapın!");
    router.push("/login");
    return;
  }

  user.value = JSON.parse(userStr);
  editForm.value.name = user.value.name || "";
  editForm.value.email = user.value.email || "";
});

function startEditing() {
  isEditing.value = true;
  editForm.value.name = user.value.name || "";
  editForm.value.email = user.value.email || "";
  editForm.value.currentPassword = "";
  editForm.value.newPassword = "";
  editForm.value.confirmPassword = "";
}

function cancelEditing() {
  isEditing.value = false;
  editForm.value.currentPassword = "";
  editForm.value.newPassword = "";
  editForm.value.confirmPassword = "";
}

async function saveProfile() {
  if (!editForm.value.name || !editForm.value.email) {
    toast.error("İsim ve email alanları zorunludur!");
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(editForm.value.email)) {
    toast.error("Geçerli bir email adresi giriniz!");
    return;
  }

  const isPasswordChange = editForm.value.currentPassword || editForm.value.newPassword || editForm.value.confirmPassword;

  if (isPasswordChange) {
    if (!editForm.value.currentPassword || !editForm.value.newPassword || !editForm.value.confirmPassword) {
      toast.error("Şifre değiştirmek için tüm şifre alanlarını doldurun!");
      return;
    }

    if (editForm.value.newPassword !== editForm.value.confirmPassword) {
      toast.error("Yeni şifreler eşleşmiyor!");
      return;
    }

    if (editForm.value.newPassword.length < 6) {
      toast.error("Yeni şifre en az 6 karakter olmalıdır!");
      return;
    }

    if (editForm.value.currentPassword === editForm.value.newPassword) {
      toast.error("Yeni şifre mevcut şifrenizle aynı olamaz!");
      return;
    }
  }

  isLoading.value = true;

  try {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Oturum süreniz dolmuş, lütfen tekrar giriş yapın!");
      router.push("/login");
      return;
    }

    const updateData: any = {
      name: editForm.value.name,
      email: editForm.value.email
    };

    if (isPasswordChange) {
      updateData.currentPassword = editForm.value.currentPassword;
      updateData.newPassword = editForm.value.newPassword;
    }

    const response = await fetch(`${API_BASE}/auth/update-profile`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(updateData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Profil güncellenirken bir hata oluştu!");
    }

    const updatedUser = {
      ...user.value,
      name: data.user.name,
      email: data.user.email
    };

    localStorage.setItem("user", JSON.stringify(updatedUser));
    user.value = updatedUser;

    toast.success(isPasswordChange ? "Profil ve şifre başarıyla güncellendi!" : "Profil başarıyla güncellendi!");
    isEditing.value = false;
    editForm.value.currentPassword = "";
    editForm.value.newPassword = "";
    editForm.value.confirmPassword = "";
  } catch (error: any) {
    console.error("Profil güncelleme hatası:", error);
    toast.error(error.message || "Profil güncellenirken bir hata oluştu!");
  } finally {
    isLoading.value = false;
  }
}

function getRoleText(role: string) {
  return role === 'admin' ? 'Yönetici' : 'Müşteri';
}
</script>

<template>
  <div class="max-w-3xl mx-auto p-6">
    <PageHeader title="Profilim" show-back />

    <!-- Profil Bilgileri -->
    <Card padding="lg" class="mb-4">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-semibold text-slate-900">Hesap Bilgileri</h2>
        <Button v-if="!isEditing" @click="startEditing">
          Düzenle
        </Button>
      </div>

      <!-- Görüntüleme Modu -->
      <div v-if="!isEditing" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-600 mb-1">İsim Soyisim</label>
          <p class="text-gray-900">{{ user?.name || '-' }}</p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-600 mb-1">E-posta Adresi</label>
          <p class="text-gray-900">{{ user?.email }}</p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-600 mb-1">Hesap Türü</label>
          <p class="text-gray-900">{{ getRoleText(user?.role) }}</p>
        </div>
      </div>

      <!-- Düzenleme Modu -->
      <form v-else @submit.prevent="saveProfile" class="space-y-4">
        <Input v-model="editForm.name" label="İsim Soyisim" placeholder="Adınızı ve soyadınızı girin" required />
        <Input v-model="editForm.email" type="email" label="E-posta Adresi" placeholder="email@example.com" required />

        <div class="pt-4 border-t border-gray-200">
          <h3 class="text-sm font-semibold text-gray-900 mb-3">Şifre Değiştir (İsteğe Bağlı)</h3>
          <div class="space-y-3">
            <Input v-model="editForm.currentPassword" type="password" label="Mevcut Şifre" placeholder="Mevcut şifreniz" />
            <Input v-model="editForm.newPassword" type="password" label="Yeni Şifre" placeholder="En az 6 karakter" />
            <Input v-model="editForm.confirmPassword" type="password" label="Yeni Şifre (Tekrar)" placeholder="Yeni şifrenizi tekrar girin" />
          </div>
        </div>

        <div class="flex gap-2 pt-4">
          <Button type="submit" variant="primary" size="lg" flex :loading="isLoading">
            Kaydet
          </Button>
          <Button type="button" variant="secondary" @click="cancelEditing" :disabled="isLoading">
            İptal
          </Button>
        </div>
      </form>
    </Card>

    <!-- Hızlı Erişim -->
    <Card padding="lg">
      <h2 class="text-lg font-semibold text-slate-900 mb-4">Hızlı Erişim</h2>
      <div class="space-y-2">
        <RouterLink to="/customer-panel" class="flex items-center gap-2 p-3 rounded hover:bg-gray-50 transition text-gray-700">
          <span class="text-sm font-medium">Kullanıcı Paneli</span>
        </RouterLink>
        <RouterLink v-if="user?.role === 'admin'" to="/admin" class="flex items-center gap-2 p-3 rounded hover:bg-gray-50 transition text-gray-700">
          <span class="text-sm font-medium">Admin Paneli</span>
        </RouterLink>
        <RouterLink to="/favorilerim" class="flex items-center gap-2 p-3 rounded hover:bg-gray-50 transition text-gray-700">
          <span class="text-sm font-medium">Favorilerim</span>
        </RouterLink>
      </div>
    </Card>
  </div>
</template>