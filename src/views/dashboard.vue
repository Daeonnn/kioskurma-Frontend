<template>
  <div class="bg-gray-50 min-h-screen">
    <div class="p-6">
      <nav aria-label="breadcrumb" class="mb-6">
        <ol class="flex text-gray-600 text-sm space-x-2">
          <li>
            <router-link to="/" class="hover:text-indigo-600">Home</router-link>
          </li>
          <li>/</li>
          <li class="text-indigo-600 font-semibold">Dashboard</li>
        </ol>
      </nav>

      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-800">
          Selamat Datang, <span class="text-indigo-600">{{ currentUserName }}</span>
        </h1>
      </div>

      <div class="flex flex-wrap gap-4 mb-8">
        <div class="bg-white rounded-lg shadow-sm p-4 flex items-center min-w-[200px] border-l-4 border-blue-500">
          <div class="p-3 bg-blue-100 rounded-lg mr-4">
            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
            </svg>
          </div>
          <div>
            <p class="text-sm text-gray-600">Total Produk</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.totalProducts }}</p>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm p-4 flex items-center min-w-[200px] border-l-4 border-green-500">
          <div class="p-3 bg-green-100 rounded-lg mr-4">
            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <div>
            <p class="text-sm text-gray-600">Stok Tersedia</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.availableStock }}</p>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm p-4 flex items-center min-w-[200px] border-l-4 border-yellow-500">
          <div class="p-3 bg-yellow-100 rounded-lg mr-4">
            <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 13.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
          </div>
          <div>
            <p class="text-sm text-gray-600">Stok Rendah</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.lowStock }}</p>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm p-4 flex items-center min-w-[200px] border-l-4 border-red-500">
          <div class="p-3 bg-red-100 rounded-lg mr-4">
            <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <div>
            <p class="text-sm text-gray-600">Stok Habis</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.outOfStock }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <h5 class="text-lg font-semibold mb-4 text-yellow-700">Peringatan Stok Rendah</h5>
        <div class="space-y-3">
          <div v-if="lowStockProducts.length === 0" class="text-gray-500 text-center py-4">
            <svg class="w-12 h-12 mx-auto mb-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <p>Semua produk memiliki stok yang cukup!</p>
          </div>
          <div v-for="product in lowStockProducts" :key="product.id" class="flex justify-between items-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <div>
              <p class="font-medium text-gray-800">{{ product.name }}</p>
              <p class="text-sm text-gray-600">{{ product.kode_barang }}</p>
            </div>
            <div class="text-right">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                {{ product.stock }} tersisa
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '../../services/api'; 

export default {
  data() {
    return {
      stats: {
        totalProducts: 0,
        availableStock: 0,
        lowStock: 0,
        outOfStock: 0
      },
      lowStockProducts: [],
      currentUserName: ''
    };
  },

  methods: {
    // Ambil data produk untuk dashboard
    async fetchDashboardData() {
      try {
        const response = await api.get('/products'); // Otomatis bawa token
        const products = response.data.data || [];

        this.calculateStats(products);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Bisa tambah toast error jika perlu
      }
    },

    // Hitung statistik
    calculateStats(products) {
      this.stats.totalProducts = products.length;

      this.stats.availableStock = products.filter(p => p.stock > 10).length;
      this.stats.lowStock = products.filter(p => p.stock > 0 && p.stock <= 10).length;
      this.stats.outOfStock = products.filter(p => p.stock === 0).length;

      this.lowStockProducts = products
        .filter(p => p.stock > 0 && p.stock <= 10)
        .sort((a, b) => a.stock - b.stock)
        .slice(0, 5);
    },

    // Ambil nama user
    async fetchUserName() {
      try {
        const response = await api.get('/user');
        const userData = response.data.data || response.data;
        this.currentUserName = userData.name || 'Pengguna';
      } catch (error) {
        console.error('Gagal mengambil data user:', error);
        this.currentUserName = 'Pengguna';
      }
    }
  },

  async mounted() {
    // Jalankan kedua async function secara paralel untuk lebih cepat
    await Promise.all([
      this.fetchDashboardData(),
      this.fetchUserName()
    ]);
  }
};
</script>

<style scoped>
canvas {
  max-height: 100% !important;
}
</style>
