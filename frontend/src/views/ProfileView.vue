<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { toast } from "vue3-toastify";

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

function getToken() {
    return localStorage.getItem("token");
}

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

    const isPasswordChangeAttempt = editForm.value.currentPassword ||
        editForm.value.newPassword ||
        editForm.value.confirmPassword;

    if (isPasswordChangeAttempt) {
        if (!editForm.value.currentPassword) {
            toast.error("Şifre değiştirmek için mevcut şifrenizi girmelisiniz!");
            return;
        }

        if (!editForm.value.newPassword) {
            toast.error("Şifre değiştirmek için yeni şifrenizi girmelisiniz!");
            return;
        }

        if (!editForm.value.confirmPassword) {
            toast.error("Yeni şifrenizi tekrar girmelisiniz!");
            return;
        }

        // Yeni şifreler eşleşmeli
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
        const token = getToken();
        if (!token) {
            toast.error("Oturum süreniz dolmuş, lütfen tekrar giriş yapın!");
            router.push("/login");
            return;
        }

        const updateData: any = {
            name: editForm.value.name,
            email: editForm.value.email
        };

        if (isPasswordChangeAttempt) {
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

        if (isPasswordChangeAttempt) {
            toast.success("Profil ve şifre başarıyla güncellendi!");
        } else {
            toast.success("Profil başarıyla güncellendi!");
        }

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
    <div class="p-6 max-w-3xl mx-auto">
        <div class="mb-6">
            <button @click="router.back()"
                class="text-gray-600 hover:text-gray-900 mb-4 text-sm flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Geri
            </button>
            <h1 class="text-3xl font-bold text-slate-900">Profilim</h1>
        </div>

        <!-- Profil Bilgileri -->
        <div class="bg-white rounded-lg border border-gray-200 p-6 mb-4">
            <div class="flex items-center justify-between mb-6">
                <h2 class="text-xl font-semibold text-slate-900">Hesap Bilgileri</h2>
                <button v-if="!isEditing" @click="startEditing"
                    class="px-4 py-2 bg-slate-900 text-white text-sm rounded hover:bg-slate-800 transition">
                    Düzenle
                </button>
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
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">İsim Soyisim</label>
                    <input v-model="editForm.name" type="text" placeholder="Adınızı ve soyadınızı girin"
                        class="w-full px-4 py-2 border border-gray-300 rounded focus:border-slate-900 focus:outline-none"
                        required />
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">E-posta Adresi</label>
                    <input v-model="editForm.email" type="email" placeholder="email@example.com"
                        class="w-full px-4 py-2 border border-gray-300 rounded focus:border-slate-900 focus:outline-none"
                        required />
                </div>

                <div class="pt-4 border-t border-gray-200">
                    <h3 class="text-sm font-semibold text-gray-900 mb-3">Şifre Değiştir (İsteğe Bağlı)</h3>
                    <div class="space-y-3">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">
                                Mevcut Şifre
                                <span v-if="editForm.newPassword || editForm.confirmPassword"
                                    class="text-red-600">*</span>
                            </label>
                            <input v-model="editForm.currentPassword" type="password" placeholder="Mevcut şifreniz"
                                :class="[
                                    'w-full px-4 py-2 border rounded focus:outline-none transition',
                                    (editForm.newPassword || editForm.confirmPassword) && !editForm.currentPassword
                                        ? 'border-red-300 focus:border-red-500'
                                        : 'border-gray-300 focus:border-slate-900'
                                ]" />
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">
                                Yeni Şifre
                                <span v-if="editForm.currentPassword || editForm.confirmPassword"
                                    class="text-red-600">*</span>
                            </label>
                            <input v-model="editForm.newPassword" type="password" placeholder="En az 6 karakter" :class="[
                                'w-full px-4 py-2 border rounded focus:outline-none transition',
                                (editForm.currentPassword || editForm.confirmPassword) && !editForm.newPassword
                                    ? 'border-red-300 focus:border-red-500'
                                    : 'border-gray-300 focus:border-slate-900'
                            ]" />
                            <p v-if="editForm.newPassword && editForm.newPassword.length < 6"
                                class="text-xs text-red-600 mt-1">
                                Şifre en az 6 karakter olmalıdır
                            </p>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">
                                Yeni Şifre (Tekrar)
                                <span v-if="editForm.currentPassword || editForm.newPassword"
                                    class="text-red-600">*</span>
                            </label>
                            <input v-model="editForm.confirmPassword" type="password"
                                placeholder="Yeni şifrenizi tekrar girin" :class="[
                                    'w-full px-4 py-2 border rounded focus:outline-none transition',
                                    (editForm.currentPassword || editForm.newPassword) && !editForm.confirmPassword
                                        ? 'border-red-300 focus:border-red-500'
                                        : editForm.confirmPassword && editForm.newPassword !== editForm.confirmPassword
                                            ? 'border-red-300 focus:border-red-500'
                                            : 'border-gray-300 focus:border-slate-900'
                                ]" />
                            <p v-if="editForm.confirmPassword && editForm.newPassword !== editForm.confirmPassword"
                                class="text-xs text-red-600 mt-1">
                                Şifreler eşleşmiyor
                            </p>
                        </div>
                    </div>
                </div>

                <div class="flex gap-2 pt-4">
                    <button type="submit" :disabled="isLoading" :class="[
                        'flex-1 px-4 py-2 rounded transition font-medium flex items-center justify-center gap-2',
                        isLoading
                            ? 'bg-gray-400 cursor-not-allowed text-white'
                            : 'bg-slate-900 text-white hover:bg-slate-800'
                    ]">
                        <svg v-if="isLoading" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4">
                            </circle>
                            <path class="opacity-75" fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                            </path>
                        </svg>
                        {{ isLoading ? 'Kaydediliyor...' : 'Kaydet' }}
                    </button>
                    <button type="button" @click="cancelEditing" :disabled="isLoading"
                        class="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition font-medium disabled:opacity-50">
                        İptal
                    </button>
                </div>
            </form>
        </div>

        <!-- Hızlı Erişim -->
        <div class="bg-white rounded-lg border border-gray-200 p-6">
            <h2 class="text-lg font-semibold text-slate-900 mb-4">Hızlı Erişim</h2>
            <div class="space-y-2">
                <RouterLink to="/customer-panel"
                    class="flex items-center gap-2 p-3 rounded hover:bg-gray-50 transition text-gray-700">
                    <span class="text-sm font-medium">Kullanıcı Paneli</span>
                </RouterLink>

                <RouterLink v-if="user?.role === 'admin'" to="/admin"
                    class="flex items-center gap-2 p-3 rounded hover:bg-gray-50 transition text-gray-700">
                    <span class="text-sm font-medium">Admin Paneli</span>
                </RouterLink>

                <RouterLink to="/favorilerim"
                    class="flex items-center gap-2 p-3 rounded hover:bg-gray-50 transition text-gray-700">
                    <span class="text-sm font-medium">Favorilerim</span>
                </RouterLink>
            </div>
        </div>
    </div>
</template>

<style scoped></style>