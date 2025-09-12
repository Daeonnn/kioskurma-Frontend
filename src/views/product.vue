<template>
  <div class="bg-gray-50 min-h-screen">
    
    <div class="p-6">
      <!-- Existing modals and toasts remain the same... -->
      <div v-if="showConfirmDialog" class="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4" @click="cancelDelete">
        <div class="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 transform transition-all animate-scale-in" @click.stop>
          <div class="p-6">
            <div class="flex items-center mb-4">
              <div class="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                <svg class="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-gray-900">Konfirmasi Hapus</h3>
            </div>
            
            <div class="mb-6">
              <p class="text-base text-gray-600 mb-2">
                Apakah Anda yakin ingin menghapus produk ini?
              </p>
              <div class="bg-gray-50 p-3 rounded-lg">
                <p class="font-medium text-gray-900">{{ selectedProduct?.name }}</p>
                <p class="text-sm text-gray-500">Kode: {{ selectedProduct?.kode_barang }}</p>
              </div>
              <p class="text-sm text-red-600 mt-2 font-medium">
                Tindakan ini tidak dapat dibatalkan!
              </p>
            </div>
            
            <div class="flex gap-3">
              <button
                @click="cancelDelete"
                class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                Batal
              </button>
              <button
                @click="confirmDelete"
                :disabled="loading"
                class="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                {{ loading ? 'Menghapus...' : 'Hapus' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Toast notifications remain the same... -->
      <div class="fixed top-4 right-4 z-50 space-y-2 max-w-md">
        <div 
          v-for="toast in toasts" 
          :key="toast.id"
          :class="[
            'transform transition-all duration-300 ease-in-out',
            'bg-white rounded-lg shadow-lg border-l-4 p-4 w-full',
            toast.type === 'success' ? 'border-green-500' : 'border-red-500',
            'animate-slide-in-right'
          ]"
        >
          <div class="flex items-start">
            <div v-if="toast.type === 'success'" class="flex-shrink-0">
              <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                </svg>
              </div>
            </div>
            
            <div v-else class="flex-shrink-0">
              <div class="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <svg class="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
                </svg>
              </div>
            </div>
            
            <div class="ml-3 flex-1 min-w-0">
              <p :class="[
                'text-sm font-medium',
                toast.type === 'success' ? 'text-green-800' : 'text-red-800'
              ]">
                {{ toast.title }}
              </p>
              <p v-if="toast.message" :class="[
                'text-sm mt-1',
                toast.type === 'success' ? 'text-green-600' : 'text-red-600'
              ]">
                {{ toast.message }}
              </p>
            </div>
            
            <div class="ml-4 flex-shrink-0">
              <button
                @click="removeToast(toast.id)"
                class="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors p-1"
              >
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Breadcrumb and header remain the same... -->
      <nav aria-label="breadcrumb" class="mb-6">
        <ol class="flex text-gray-600 text-sm space-x-2">
          <li>
            <router-link to="/admin/dashboard" class="hover:text-indigo-600 transition-colors">Home</router-link>
          </li>
          <li>/</li>
          <li class="text-indigo-600 font-semibold">Data Produk</li>
        </ol>
      </nav>

      <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div class="flex justify-between items-center">
          <h2 class="text-2xl font-bold text-gray-800">Data Produk</h2>
          <div class="flex gap-3">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Cari produk..."
              class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
            <button 
              @click="showForm = !showForm"
              class="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2"
            >
              <svg v-if="!showForm" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
              </svg>
              <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
              {{ showForm ? 'Batal' : 'Tambah Produk' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Product table with updated action buttons -->
      <div class="bg-white rounded-lg shadow-sm overflow-hidden">
        <div class="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-800">Daftar Produk</h3>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors" @click="sortBy('kode_barang')">
                  <div class="flex items-center">
                    Kode Produk
                    <svg v-if="sortField === 'kode_barang'" :class="sortDirection === 'asc' ? 'transform rotate-180' : ''" class="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                    </svg>
                  </div>
                </th>
                <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Foto</th>
                <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors" @click="sortBy('name')">
                  <div class="flex items-center">
                    Nama Produk
                    <svg v-if="sortField === 'name'" :class="sortDirection === 'asc' ? 'transform rotate-180' : ''" class="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                    </svg>
                  </div>
                </th>
                <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors" @click="sortBy('jenis')">
                  <div class="flex items-center">
                    Jenis
                    <svg v-if="sortField === 'jenis'" :class="sortDirection === 'asc' ? 'transform rotate-180' : ''" class="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                    </svg>
                  </div>
                </th>
                <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors" @click="sortBy('satuan')">
                  <div class="flex items-center">
                    Satuan
                    <svg v-if="sortField === 'satuan'" :class="sortDirection === 'asc' ? 'transform rotate-180' : ''" class="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                    </svg>
                  </div>
                </th>
                <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors" @click="sortBy('distributor')">
                  <div class="flex items-center">
                    Distributor
                    <svg v-if="sortField === 'distributor'" :class="sortDirection === 'asc' ? 'transform rotate-180' : ''" class="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                    </svg>
                  </div>
                </th>
                <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors" @click="sortBy('created_at')">
                  <div class="flex items-center">
                    Tanggal Masuk
                    <svg v-if="sortField === 'created_at'" :class="sortDirection === 'asc' ? 'transform rotate-180' : ''" class="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                    </svg>
                  </div>
                </th>
                <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors" @click="sortBy('selling_price')">
                  <div class="flex items-center">
                    Harga Satuan
                    <svg v-if="sortField === 'selling_price'" :class="sortDirection === 'asc' ? 'transform rotate-180' : ''" class="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                    </svg>
                  </div>
                </th>
                <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors" @click="sortBy('stock')">
                  <div class="flex items-center">
                    Stok
                    <svg v-if="sortField === 'stock'" :class="sortDirection === 'asc' ? 'transform rotate-180' : ''" class="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                    </svg>
                  </div>
                </th>
                <th class="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-56">Aksi</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="product in paginatedProducts" :key="product.id" class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                    {{ product.kode_barang }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <img 
                      v-if="product.photo_url" 
                      :src="product.photo_url" 
                      :alt="product.name"
                      class="h-12 w-12 rounded-lg object-cover border border-gray-200"
                      @error="handleImageError"
                    >
                    <div 
                      v-else 
                      class="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200"
                    >
                      <svg class="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ product.name }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ product.jenis?.name || '-' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ product.satuan?.name || '-' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ product.distributor?.name || '-' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(product.created_at) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Rp {{ formatCurrency(product.selling_price) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <span :class="getStockClass(product.stock)" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                    {{ product.stock }}
                  </span>
                </td>
                <!-- UPDATED ACTION BUTTONS -->
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div class="flex gap-1">
                    <!-- Edit Button -->
                    <button 
                      @click="editProduct(product)"
                      class="inline-flex items-center px-2 py-1 border border-transparent text-xs leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                      title="Ubah Produk"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                      </svg>
                    </button>
                    
                    <!-- Add Stock Button -->
                    <button 
                      @click="openAddStockModal(product)"
                      class="inline-flex items-center px-2 py-1 border border-transparent text-xs leading-4 font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                      title="Tambah Stok"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                      </svg>
                    </button>
                    
                    <!-- Stock History Button -->
                    <button 
                      @click="openStockHistoryModal(product)"
                      class="inline-flex items-center px-2 py-1 border border-transparent text-xs leading-4 font-medium rounded-md text-purple-700 bg-purple-100 hover:bg-purple-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200"
                      title="Riwayat Stok"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                      </svg>
                    </button>
                    
                    <!-- Delete Button -->
                    <button 
                      @click="deleteProduct(product)"
                      class="inline-flex items-center px-2 py-1 border border-transparent text-xs leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                      title="Hapus Produk"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Empty state and pagination remain the same... -->
        <div v-if="paginatedProducts.length === 0" class="text-center py-12 px-4">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m0 0V9a2 2 0 012-2h2m0 0V6a2 2 0 012-2h2.09M4 13v4a2 2 0 002 2h2m0 0h2.09"></path>
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">Belum ada data produk</h3>
          <p class="mt-1 text-sm text-gray-500">Mulai dengan menambahkan produk pertama Anda.</p>
        </div>

        <div v-if="filteredProducts.length > 0" class="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div class="flex items-center justify-between">
            <div class="flex items-center text-sm text-gray-700">
              <span>Menampilkan {{ startIndex + 1 }} - {{ endIndex }} dari {{ filteredProducts.length }} produk</span>
            </div>
            
            <div class="flex items-center space-x-2">
              <button 
                @click="previousPage"
                :disabled="currentPage === 1"
                class="relative inline-flex items-center px-3 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                </svg>
                Previous
              </button>

              <div class="hidden md:flex items-center space-x-1">
                <button
                  v-for="page in visiblePages"
                  :key="page"
                  @click="goToPage(page)"
                  :class="[
                    'relative inline-flex items-center px-3 py-2 rounded-md border text-sm font-medium transition-colors',
                    page === currentPage 
                      ? 'bg-indigo-600 text-white border-indigo-600' 
                      : 'bg-white text-gray-500 border-gray-300 hover:bg-gray-50'
                  ]"
                >
                  {{ page }}
                </button>
              </div>

              <div class="md:hidden flex items-center">
                <span class="text-sm text-gray-700">
                  {{ currentPage }} / {{ totalPages }}
                </span>
              </div>

              <button 
                @click="nextPage"
                :disabled="currentPage === totalPages"
                class="relative inline-flex items-center px-3 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Existing form modal remains the same... -->
    <div v-if="showForm" class="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4" @click="closeForm">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 transform transition-all max-h-[90vh] overflow-y-auto" @click.stop>
        <div class="p-6">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-xl font-semibold text-gray-800">
              {{ isEditMode ? 'Ubah Produk' : 'Tambah Produk Baru' }}
            </h3>
            <button @click="closeForm" class="text-gray-400 hover:text-gray-600 transition-colors p-1">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <form @submit.prevent="isEditMode ? updateProduct() : addProduct()" enctype="multipart/form-data">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="md:col-span-2">
                <label for="name" class="block text-sm font-medium text-gray-700 mb-2">Nama Produk</label>
                <input
                  v-model="form.name"
                  id="name"
                  type="text"
                  placeholder="Masukkan nama produk"
                  class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  required
                />
              </div>

              <div class="md:col-span-2">
                <label for="photo" class="block text-sm font-medium text-gray-700 mb-2">Foto Produk</label>
                
                <div v-if="photoPreview || (isEditMode && currentPhotoUrl)" class="mb-4">
                  <div class="relative inline-block">
                    <img 
                      :src="photoPreview || currentPhotoUrl" 
                      alt="Preview foto produk"
                      class="h-32 w-32 rounded-lg object-cover border border-gray-200"
                    >
                    <button
                      type="button"
                      @click="removePhoto"
                      class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                    </button>
                  </div>
                </div>

                <input
                  ref="photoInput"
                  id="photo"
                  type="file"
                  accept="image/*"
                  @change="handlePhotoUpload"
                  class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
                <p class="text-xs text-gray-500 mt-1">
                  Format yang didukung: JPG, PNG, GIF. Maksimal 2MB.
                </p>
              </div>

              <div>
                <label for="jenis_id" class="block text-sm font-medium text-gray-700 mb-2">Jenis</label>
                <select
                  v-model="form.jenis_id"
                  id="jenis_id"
                  class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  required
                >
                  <option value="">Pilih Jenis</option>
                  <option v-for="jenis in jenisOptions" :key="jenis.id" :value="jenis.id">
                    {{ jenis.name }}
                  </option>
                </select>
              </div>

              <div>
                <label for="satuan_id" class="block text-sm font-medium text-gray-700 mb-2">Satuan</label>
                <select
                  v-model="form.satuan_id"
                  id="satuan_id"
                  class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  required
                >
                  <option value="">Pilih Satuan</option>
                  <option v-for="satuan in satuanOptions" :key="satuan.id" :value="satuan.id">
                    {{ satuan.name }}
                  </option>
                </select>
              </div>

              <div>
                <label for="distributor_id" class="block text-sm font-medium text-gray-700 mb-2">Distributor</label>
                <select
                  v-model="form.distributor_id"
                  id="distributor_id"
                  class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  required
                >
                  <option value="">Pilih Distributor</option>
                  <option v-for="distributor in distributorOptions" :key="distributor.id" :value="distributor.id">
                    {{ distributor.name }}
                  </option>
                </select>
              </div>

              <!-- STOK - READ ONLY untuk Edit, Input biasa untuk Create -->
              <div>
                <label for="stock" class="block text-sm font-medium text-gray-700 mb-2">
                  Stok {{ isEditMode ? '(Current)' : '' }}
                </label>
                
                <!-- Mode CREATE: Input normal -->
                <input
                  v-if="!isEditMode"
                  v-model.number="form.stock"
                  id="stock"
                  type="number"
                  min="0"
                  placeholder="Masukkan jumlah stok awal"
                  class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  required
                />
                
                <!-- Mode EDIT: Read-only display -->
                <div
                  v-else
                  class="w-full p-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 flex items-center justify-between"
                >
                  <span class="font-medium">{{ form.stock }} {{ selectedProduct?.satuan?.name }}</span>
                </div>
                
                <!-- Info text untuk mode edit -->
                <p v-if="isEditMode" class="text-xs text-gray-500 mt-1">
                  Stok tidak dapat diedit langsung. Gunakan tombol "Tambah Stok" untuk menambah stok dari distributor.
                </p>
              </div>

              <!-- Harga Jual -->
              <div class="md:col-span-2">
                <label for="selling_price" class="block text-sm font-medium text-gray-700 mb-2">Harga Jual</label>
                <input
                  v-model.number="form.selling_price"
                  id="selling_price"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="Masukkan harga jual"
                  class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  required
                />
              </div>
            </div>

            <div class="flex gap-3 mt-6">
              <button 
                type="submit"
                :disabled="loading"
                class="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white px-4 py-3 rounded-lg font-medium transition-colors duration-200"
              >
                {{ loading ? 'Menyimpan...' : (isEditMode ? 'Simpan Perubahan' : 'Simpan Produk') }}
              </button>
              <button
                type="button"
                @click="closeForm"
                class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-lg font-medium transition-colors duration-200"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Enhanced Add Stock Modal -->
    <div v-if="showAddStockModal" class="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4" @click="closeAddStockModal">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 transform transition-all" @click.stop>
        <div class="p-6">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-xl font-semibold text-gray-800">Tambah Stok Produk</h3>
            <button @click="closeAddStockModal" class="text-gray-400 hover:text-gray-600 transition-colors p-1">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <div class="mb-6 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
            <p class="text-sm text-gray-600 mb-1">Produk:</p>
            <p class="font-medium text-gray-900 text-lg">{{ selectedProduct?.name }}</p>
            <p class="text-sm text-gray-500">Kode: {{ selectedProduct?.kode_barang }}</p>
            <p class="text-sm text-indigo-600 font-medium mt-2">
              Stok Saat Ini: {{ selectedProduct?.stock }} {{ selectedProduct?.satuan?.name }}
            </p>
          </div>

          <form @submit.prevent="addStockWithTracking">
            <div class="mb-4">
              <label for="distributor_id" class="block text-sm font-medium text-gray-700 mb-2">
                Dari Distributor <span class="text-red-500">*</span>
              </label>
              <select
                v-model="stockForm.distributor_id"
                id="distributor_id"
                class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                required
              >
                <option value="">Pilih Distributor</option>
                <option v-for="distributor in distributorOptions" :key="distributor.id" :value="distributor.id">
                  {{ distributor.name }}
                </option>
              </select>
            </div>

            <div class="mb-4">
              <label for="quantity" class="block text-sm font-medium text-gray-700 mb-2">
                Jumlah Masuk <span class="text-red-500">*</span>
              </label>
              <input
                v-model.number="stockForm.quantity"
                id="quantity"
                type="number"
                min="1"
                placeholder="Masukkan jumlah stok yang masuk"
                class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                required
              />
              <p class="text-xs text-gray-500 mt-2">
                Stok akan menjadi: <span class="font-medium text-indigo-600">{{ (selectedProduct?.stock || 0) + (stockForm.quantity || 0) }} {{ selectedProduct?.satuan?.name }}</span>
              </p>
            </div>

            <div class="mb-6">
              <label for="notes" class="block text-sm font-medium text-gray-700 mb-2">
                Catatan
              </label>
              <textarea
                v-model="stockForm.notes"
                id="notes"
                rows="3"
                placeholder="Catatan tambahan (opsional)"
                class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none"
              ></textarea>
            </div>

            <div class="flex gap-3">
              <button 
                type="submit"
                :disabled="loading || !stockForm.quantity || !stockForm.distributor_id"
                class="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white px-4 py-3 rounded-lg font-medium transition-colors duration-200"
              >
                {{ loading ? 'Menyimpan...' : 'Simpan Stok Masuk' }}
              </button>
              <button
                type="button"
                @click="closeAddStockModal"
                class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-lg font-medium transition-colors duration-200"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

      <!-- ========== REVISED STOCK HISTORY MODAL ========== -->
<div v-if="showStockHistoryModal" class="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4" @click="closeStockHistoryModal">
  <div class="bg-white rounded-xl shadow-2xl w-full max-w-5xl mx-4 transform transition-all h-[90vh] flex flex-col" @click.stop>
    
    <!-- Header - Fixed -->
    <div class="p-6 border-b border-gray-200 flex-shrink-0">
      <div class="flex justify-between items-center mb-4">
        <div>
          <h3 class="text-xl font-semibold text-gray-800">Riwayat Stok</h3>
          <p class="text-sm text-gray-600 mt-1">{{ selectedProduct?.name }} [{{ selectedProduct?.kode_barang }}]</p>
        </div>
        <button @click="closeStockHistoryModal" class="text-gray-400 hover:text-gray-600 transition-colors p-1">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <!-- Product Summary -->
      <div class="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
        <div class="text-center">
          <p class="text-sm text-gray-600">Stok Saat Ini</p>
          <p class="text-lg font-bold text-indigo-600">{{ selectedProduct?.stock }}</p>
          <p class="text-xs text-gray-500">{{ selectedProduct?.satuan?.name }}</p>
        </div>
        <div class="text-center">
          <p class="text-sm text-gray-600">Total Masuk</p>
          <p class="text-lg font-bold text-green-600">{{ stockSummary.totalIn }}</p>
          <p class="text-xs text-gray-500">{{ selectedProduct?.satuan?.name }}</p>
        </div>
        <div class="text-center">
          <p class="text-sm text-gray-600">Total Keluar</p>
          <p class="text-lg font-bold text-red-600">{{ stockSummary.totalOut }}</p>
          <p class="text-xs text-gray-500">{{ selectedProduct?.satuan?.name }}</p>
        </div>
      </div>

      <!-- Filters and Controls -->
      <div class="flex flex-wrap gap-4 mt-4">
        <!-- Type Filter -->
        <select 
          v-model="historyFilters.type"
          class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="">Semua Jenis</option>
          <option value="in">Stok Masuk</option>
          <option value="out">Stok Keluar</option>
        </select>

        <!-- Per Page Selection -->
        <select 
          v-model="historyPagination.perPage"
          @change="onPerPageChange"
          class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="10">10 per halaman</option>
          <option value="25">25 per halaman</option>
          <option value="50">50 per halaman</option>
          <option value="100">100 per halaman</option>
          <option value="all">Tampilkan Semua</option>
        </select>

        <!-- Search -->
        <input
          v-model="historyFilters.search"
          type="text"
          placeholder="Cari catatan atau distributor..."
          class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-w-[200px]"
        >

        <!-- Reset Filters -->
        <button
          @click="resetHistoryFilters"
          class="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
        >
          Reset Filter
        </button>

        <!-- Refresh Data -->
        <button
          @click="refreshStockHistory"
          :disabled="loadingHistory"
          class="px-3 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
        >
          <svg v-if="loadingHistory" class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          <span v-else>Refresh</span>
        </button>
      </div>
    </div>

    <!-- Content Area - Scrollable -->
    <div class="flex-1 overflow-hidden flex flex-col">
      <!-- Loading State -->
      <div v-if="loadingHistory" class="flex items-center justify-center h-64">
        <div class="text-center">
          <svg class="animate-spin h-8 w-8 text-indigo-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          <p class="text-gray-600">Memuat riwayat stok...</p>
        </div>
      </div>

      <!-- Stock Movements Table -->
      <div v-else-if="filteredStockMovements.length > 0" class="flex-1 overflow-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" @click="sortHistoryBy('created_at')">
                <div class="flex items-center">
                  Tanggal & Waktu
                  <svg v-if="historySortField === 'created_at'" :class="historySortDirection === 'asc' ? 'transform rotate-180' : ''" class="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                  </svg>
                </div>
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" @click="sortHistoryBy('type')">
                <div class="flex items-center">
                  Jenis
                  <svg v-if="historySortField === 'type'" :class="historySortDirection === 'asc' ? 'transform rotate-180' : ''" class="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                  </svg>
                </div>
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" @click="sortHistoryBy('quantity')">
                <div class="flex items-center">
                  Jumlah
                  <svg v-if="historySortField === 'quantity'" :class="historySortDirection === 'asc' ? 'transform rotate-180' : ''" class="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                  </svg>
                </div>
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Distributor</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Catatan</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="movement in paginatedStockMovements" :key="movement.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                <div>
                  <div class="font-medium">{{ formatDate(movement.created_at) }}</div>
                  <div class="text-xs text-gray-500">{{ formatTime(movement.created_at) }}</div>
                </div>
              </td>
              <td class="px-4 py-3 whitespace-nowrap text-sm">
                <span :class="movement.type === 'in' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'" 
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                  <svg v-if="movement.type === 'in'" class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clip-rule="evenodd"></path>
                  </svg>
                  <svg v-else class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zM6.293 13.293a1 1 0 010 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 14.586V11a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 00-1.414 0z" clip-rule="evenodd"></path>
                  </svg>
                  {{ movement.type_label }}
                </span>
              </td>
              <td class="px-4 py-3 whitespace-nowrap text-sm font-medium">
                <span :class="movement.type === 'in' ? 'text-green-600' : 'text-red-600'" class="font-bold">
                  {{ movement.type === 'in' ? '+' : '-' }}{{ movement.quantity }}
                </span>
                <span class="text-gray-400 ml-1 text-xs">{{ selectedProduct?.satuan?.name }}</span>
              </td>
              <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                <div v-if="movement.distributor" class="flex items-center">
                  <div class="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  {{ movement.distributor.name }}
                </div>
                <span v-else class="text-gray-400">-</span>
              </td>
              <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                <div v-if="movement.user">
                  {{ movement.user.name }}
                </div>
                <span v-else class="text-gray-400">-</span>
              </td>
              <td class="px-4 py-3 text-sm text-gray-500 max-w-xs">
                <div v-if="movement.notes" class="truncate" :title="movement.notes">
                  {{ movement.notes }}
                </div>
                <span v-else class="text-gray-400">-</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty State -->
      <div v-else class="flex items-center justify-center h-64">
        <div class="text-center">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">
            {{ historyFilters.type || historyFilters.search 
               ? 'Tidak ada data sesuai filter' : 'Belum ada riwayat stok' }}
          </h3>
          <p class="mt-1 text-sm text-gray-500">
            {{ historyFilters.type || historyFilters.search 
               ? 'Coba ubah filter pencarian Anda' : 'Riwayat pergerakan stok akan tampil di sini.' }}
          </p>
        </div>
      </div>
    </div>

    <!-- Footer with Pagination - Fixed -->
    <div v-if="!loadingHistory && filteredStockMovements.length > 0" class="border-t border-gray-200 bg-gray-50 px-6 py-4 flex-shrink-0">
      <!-- Pagination Info -->
      <div class="flex items-center justify-between">
        <div class="flex items-center text-sm text-gray-700 space-x-4">
          <span>
            Menampilkan {{ historyStartIndex + 1 }} - {{ historyEndIndex }} dari {{ filteredStockMovements.length }} riwayat
          </span>
          <span class="text-gray-500">|</span>
          <span>Total: {{ stockMovements.length }} riwayat</span>
        </div>
        
        <!-- Pagination Controls -->
        <div v-if="historyPagination.perPage !== 'all'" class="flex items-center space-x-2">
          <button 
            @click="previousHistoryPage"
            :disabled="historyPagination.currentPage === 1"
            class="relative inline-flex items-center px-3 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            Previous
          </button>

          <div class="hidden md:flex items-center space-x-1">
            <button
              v-for="page in historyVisiblePages"
              :key="page"
              @click="goToHistoryPage(page)"
              :class="[
                'relative inline-flex items-center px-3 py-2 rounded-md border text-sm font-medium transition-colors',
                page === historyPagination.currentPage 
                  ? 'bg-indigo-600 text-white border-indigo-600' 
                  : 'bg-white text-gray-500 border-gray-300 hover:bg-gray-50'
              ]"
            >
              {{ page }}
            </button>
          </div>

          <div class="md:hidden flex items-center">
            <span class="text-sm text-gray-700">
              {{ historyPagination.currentPage }} / {{ historyTotalPages }}
            </span>
          </div>

          <button 
            @click="nextHistoryPage"
            :disabled="historyPagination.currentPage === historyTotalPages"
            class="relative inline-flex items-center px-3 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
            <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Action Buttons - Fixed -->
    <div class="border-t border-gray-200 px-6 py-4 flex justify-end items-center flex-shrink-0">
      <button
        @click="closeStockHistoryModal"
        class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
      >
        Tutup
      </button>
    </div>
  </div>
</div>
<div v-if="showStockHistoryModal" class="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4" @click="closeStockHistoryModal">
  <div class="bg-white rounded-xl shadow-2xl w-full max-w-5xl mx-4 transform transition-all h-[90vh] flex flex-col" @click.stop>
    
    <!-- Header - Fixed -->
    <div class="p-6 border-b border-gray-200 flex-shrink-0">
      <div class="flex justify-between items-center mb-4">
        <div>
          <h3 class="text-xl font-semibold text-gray-800">Riwayat Stok</h3>
          <p class="text-sm text-gray-600 mt-1">{{ selectedProduct?.name }} [{{ selectedProduct?.kode_barang }}]</p>
        </div>
        <button @click="closeStockHistoryModal" class="text-gray-400 hover:text-gray-600 transition-colors p-1">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <!-- Product Summary -->
      <div class="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
        <div class="text-center">
          <p class="text-sm text-gray-600">Stok Saat Ini</p>
          <p class="text-lg font-bold text-indigo-600">{{ selectedProduct?.stock }}</p>
          <p class="text-xs text-gray-500">{{ selectedProduct?.satuan?.name }}</p>
        </div>
        <div class="text-center">
          <p class="text-sm text-gray-600">Total Masuk</p>
          <p class="text-lg font-bold text-green-600">{{ stockSummary.totalIn }}</p>
          <p class="text-xs text-gray-500">{{ selectedProduct?.satuan?.name }}</p>
        </div>
        <div class="text-center">
          <p class="text-sm text-gray-600">Total Keluar</p>
          <p class="text-lg font-bold text-red-600">{{ stockSummary.totalOut }}</p>
          <p class="text-xs text-gray-500">{{ selectedProduct?.satuan?.name }}</p>
        </div>
      </div>

      <!-- Filters and Controls -->
      <div class="flex flex-wrap gap-4 mt-4">
        <!-- Type Filter -->
        <select 
          v-model="historyFilters.type"
          class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="">Semua Jenis</option>
          <option value="in">Stok Masuk</option>
          <option value="out">Stok Keluar</option>
        </select>

        <!-- Per Page Selection -->
        <select 
          v-model="historyPagination.perPage"
          @change="onPerPageChange"
          class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="10">10 per halaman</option>
          <option value="25">25 per halaman</option>
          <option value="50">50 per halaman</option>
          <option value="100">100 per halaman</option>
          <option value="all">Tampilkan Semua</option>
        </select>

        <!-- Search -->
        <input
          v-model="historyFilters.search"
          type="text"
          placeholder="Cari catatan atau distributor..."
          class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-w-[200px]"
        >

        <!-- Reset Filters -->
        <button
          @click="resetHistoryFilters"
          class="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
        >
          Reset Filter
        </button>

        <!-- Refresh Data -->
        <button
          @click="refreshStockHistory"
          :disabled="loadingHistory"
          class="px-3 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
        >
          <svg v-if="loadingHistory" class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          <span v-else>Refresh</span>
        </button>
      </div>
    </div>

    <!-- Content Area - Scrollable -->
    <div class="flex-1 overflow-hidden flex flex-col">
      <!-- Loading State -->
      <div v-if="loadingHistory" class="flex items-center justify-center h-64">
        <div class="text-center">
          <svg class="animate-spin h-8 w-8 text-indigo-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          <p class="text-gray-600">Memuat riwayat stok...</p>
        </div>
      </div>

      <!-- Stock Movements Table -->
      <div v-else-if="filteredStockMovements.length > 0" class="flex-1 overflow-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" @click="sortHistoryBy('created_at')">
                <div class="flex items-center">
                  Tanggal & Waktu
                  <svg v-if="historySortField === 'created_at'" :class="historySortDirection === 'asc' ? 'transform rotate-180' : ''" class="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                  </svg>
                </div>
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" @click="sortHistoryBy('type')">
                <div class="flex items-center">
                  Jenis
                  <svg v-if="historySortField === 'type'" :class="historySortDirection === 'asc' ? 'transform rotate-180' : ''" class="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                  </svg>
                </div>
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" @click="sortHistoryBy('quantity')">
                <div class="flex items-center">
                  Jumlah
                  <svg v-if="historySortField === 'quantity'" :class="historySortDirection === 'asc' ? 'transform rotate-180' : ''" class="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                  </svg>
                </div>
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Distributor</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Catatan</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="movement in paginatedStockMovements" :key="movement.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                <div>
                  <div class="font-medium">{{ formatDate(movement.created_at) }}</div>
                  <div class="text-xs text-gray-500">{{ formatTime(movement.created_at) }}</div>
                </div>
              </td>
              <td class="px-4 py-3 whitespace-nowrap text-sm">
                <span :class="movement.type === 'in' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'" 
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                  <svg v-if="movement.type === 'in'" class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clip-rule="evenodd"></path>
                  </svg>
                  <svg v-else class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zM6.293 13.293a1 1 0 010 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 14.586V11a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 00-1.414 0z" clip-rule="evenodd"></path>
                  </svg>
                  {{ movement.type_label }}
                </span>
              </td>
              <td class="px-4 py-3 whitespace-nowrap text-sm font-medium">
                <span :class="movement.type === 'in' ? 'text-green-600' : 'text-red-600'" class="font-bold">
                  {{ movement.type === 'in' ? '+' : '-' }}{{ movement.quantity }}
                </span>
                <span class="text-gray-400 ml-1 text-xs">{{ selectedProduct?.satuan?.name }}</span>
              </td>
              <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                <div v-if="movement.distributor" class="flex items-center">
                  <div class="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  {{ movement.distributor.name }}
                </div>
                <span v-else class="text-gray-400">-</span>
              </td>
              <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                <div v-if="movement.user">
                  {{ movement.user.name }}
                </div>
                <span v-else class="text-gray-400">-</span>
              </td>
              <td class="px-4 py-3 text-sm text-gray-500 max-w-xs">
                <div v-if="movement.notes" class="truncate" :title="movement.notes">
                  {{ movement.notes }}
                </div>
                <span v-else class="text-gray-400">-</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty State -->
      <div v-else class="flex items-center justify-center h-64">
        <div class="text-center">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">
            {{ historyFilters.type || historyFilters.search 
               ? 'Tidak ada data sesuai filter' : 'Belum ada riwayat stok' }}
          </h3>
          <p class="mt-1 text-sm text-gray-500">
            {{ historyFilters.type || historyFilters.search 
               ? 'Coba ubah filter pencarian Anda' : 'Riwayat pergerakan stok akan tampil di sini.' }}
          </p>
        </div>
      </div>
    </div>

    <!-- Footer with Pagination - Fixed -->
    <div v-if="!loadingHistory && filteredStockMovements.length > 0" class="border-t border-gray-200 bg-gray-50 px-6 py-4 flex-shrink-0">
      <!-- Pagination Info -->
      <div class="flex items-center justify-between">
        <div class="flex items-center text-sm text-gray-700 space-x-4">
          <span>
            Menampilkan {{ historyStartIndex + 1 }} - {{ historyEndIndex }} dari {{ filteredStockMovements.length }} riwayat
          </span>
          <span class="text-gray-500">|</span>
          <span>Total: {{ stockMovements.length }} riwayat</span>
        </div>
        
        <!-- Pagination Controls -->
        <div v-if="historyPagination.perPage !== 'all'" class="flex items-center space-x-2">
          <button 
            @click="previousHistoryPage"
            :disabled="historyPagination.currentPage === 1"
            class="relative inline-flex items-center px-3 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            Previous
          </button>

          <div class="hidden md:flex items-center space-x-1">
            <button
              v-for="page in historyVisiblePages"
              :key="page"
              @click="goToHistoryPage(page)"
              :class="[
                'relative inline-flex items-center px-3 py-2 rounded-md border text-sm font-medium transition-colors',
                page === historyPagination.currentPage 
                  ? 'bg-indigo-600 text-white border-indigo-600' 
                  : 'bg-white text-gray-500 border-gray-300 hover:bg-gray-50'
              ]"
            >
              {{ page }}
            </button>
          </div>

          <div class="md:hidden flex items-center">
            <span class="text-sm text-gray-700">
              {{ historyPagination.currentPage }} / {{ historyTotalPages }}
            </span>
          </div>

          <button 
            @click="nextHistoryPage"
            :disabled="historyPagination.currentPage === historyTotalPages"
            class="relative inline-flex items-center px-3 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
            <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Action Buttons - Fixed -->
    <div class="border-t border-gray-200 px-6 py-4 flex justify-end items-center flex-shrink-0">
      <button
        @click="closeStockHistoryModal"
        class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
      >
        Tutup
      </button>
    </div>
  </div>
</div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { productService, utils, masterDataService } from '../../services/api'

export default {
  name: 'ProductTable',
  setup() {
    // ===== EXISTING DATA (yang sudah ada sebelumnya) =====
    const products = ref([])
    const searchQuery = ref('')
    const loading = ref(false)
    const loadingHistory = ref(false)
    
    // Modal states
    const showStockModal = ref(false)
    const showAddStockModal = ref(false)
    const showStockHistoryModal = ref(false)
    const showForm = ref(false)
    const showConfirmDialog = ref(false)
    
    const isEditMode = ref(false)
    const selectedProduct = ref(null)
    const additionalStock = ref(null)
    const toasts = ref([])
    const toastId = ref(0)

    const photoPreview = ref(null)
    const currentPhotoUrl = ref(null)
    const photoFile = ref(null)

    const sortField = ref('kode_barang')
    const sortDirection = ref('asc')
    const currentPage = ref(1)
    const itemsPerPage = ref(10)

    const form = ref({
      id: null,
      name: '',
      jenis_id: '',
      satuan_id: '',
      distributor_id: '',
      stock: 0,
      selling_price: 0
    })

    const stockForm = ref({
      quantity: null,
      distributor_id: '',
      notes: ''
    })

    const jenisOptions = ref([])
    const satuanOptions = ref([])
    const distributorOptions = ref([])

    // ===== NEW: STOCK HISTORY ENHANCEMENT =====
    
    // State untuk history
    const stockMovements = ref([])
    const stockSummary = ref({
      totalIn: 0,
      totalOut: 0
    })

    // State untuk filtering dan pagination history
    const historyFilters = ref({
      type: '',
      search: ''
    })

    const historyPagination = ref({
      currentPage: 1,
      perPage: 25
    })

    const historySortField = ref('created_at')
    const historySortDirection = ref('desc') // Terbaru dulu

    // Computed untuk filtering stock movements
    const filteredStockMovements = computed(() => {
      let result = [...stockMovements.value]

      // Filter berdasarkan tipe
      if (historyFilters.value.type) {
        result = result.filter(movement => movement.type === historyFilters.value.type)
      }

      // Filter berdasarkan pencarian
      if (historyFilters.value.search) {
        const search = historyFilters.value.search.toLowerCase()
        result = result.filter(movement => {
          return (
            (movement.notes && movement.notes.toLowerCase().includes(search)) ||
            (movement.distributor?.name && movement.distributor.name.toLowerCase().includes(search)) ||
            (movement.user?.name && movement.user.name.toLowerCase().includes(search)) ||
            (movement.type_label && movement.type_label.toLowerCase().includes(search))
          )
        })
      }

      // Sorting
      result.sort((a, b) => {
        let aValue, bValue

        switch (historySortField.value) {
          case 'created_at':
            aValue = new Date(a.created_at)
            bValue = new Date(b.created_at)
            break
          case 'type':
            aValue = a.type
            bValue = b.type
            break
          case 'quantity':
            aValue = parseInt(a.quantity)
            bValue = parseInt(b.quantity)
            break
          default:
            aValue = new Date(a.created_at)
            bValue = new Date(b.created_at)
        }

        if (aValue < bValue) return historySortDirection.value === 'asc' ? -1 : 1
        if (aValue > bValue) return historySortDirection.value === 'asc' ? 1 : -1
        return 0
      })

      return result
    })

    // Computed untuk pagination history
    const historyTotalPages = computed(() => {
      if (historyPagination.value.perPage === 'all') return 1
      return Math.ceil(filteredStockMovements.value.length / parseInt(historyPagination.value.perPage))
    })

    const paginatedStockMovements = computed(() => {
      if (historyPagination.value.perPage === 'all') {
        return filteredStockMovements.value
      }

      const start = (historyPagination.value.currentPage - 1) * parseInt(historyPagination.value.perPage)
      const end = start + parseInt(historyPagination.value.perPage)
      return filteredStockMovements.value.slice(start, end)
    })

    const historyStartIndex = computed(() => {
      if (historyPagination.value.perPage === 'all') return 0
      return (historyPagination.value.currentPage - 1) * parseInt(historyPagination.value.perPage)
    })

    const historyEndIndex = computed(() => {
      if (historyPagination.value.perPage === 'all') {
        return filteredStockMovements.value.length
      }
      const end = historyPagination.value.currentPage * parseInt(historyPagination.value.perPage)
      return Math.min(end, filteredStockMovements.value.length)
    })

    const historyVisiblePages = computed(() => {
      const pages = []
      const total = historyTotalPages.value
      const current = historyPagination.value.currentPage
      
      if (total <= 7) {
        for (let i = 1; i <= total; i++) {
          pages.push(i)
        }
      } else {
        if (current <= 4) {
          for (let i = 1; i <= 5; i++) {
            pages.push(i)
          }
          pages.push('...', total)
        } else if (current >= total - 3) {
          pages.push(1, '...')
          for (let i = total - 4; i <= total; i++) {
            pages.push(i)
          }
        } else {
          pages.push(1, '...')
          for (let i = current - 1; i <= current + 1; i++) {
            pages.push(i)
          }
          pages.push('...', total)
        }
      }
      
      return pages.filter(page => page !== '...' || pages.indexOf(page) === pages.lastIndexOf(page))
    })

    // ===== EXISTING COMPUTED PROPERTIES =====
    const filteredProducts = computed(() => {
      let result = products.value

      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        result = result.filter(product => 
          product.name.toLowerCase().includes(query) ||
          product.kode_barang.toLowerCase().includes(query)
        )
      }

      result = [...result].sort((a, b) => {
        let aValue, bValue

        switch (sortField.value) {
          case 'kode_barang':
            aValue = a.kode_barang
            bValue = b.kode_barang
            break
          case 'name':
            aValue = a.name.toLowerCase()
            bValue = b.name.toLowerCase()
            break
          case 'jenis':
            aValue = (a.jenis?.name || '').toLowerCase()
            bValue = (b.jenis?.name || '').toLowerCase()
            break
          case 'satuan':
            aValue = (a.satuan?.name || '').toLowerCase()
            bValue = (b.satuan?.name || '').toLowerCase()
            break
          case 'distributor':
            aValue = (a.distributor?.name || '').toLowerCase()
            bValue = (b.distributor?.name || '').toLowerCase()
            break
          case 'created_at':
            aValue = new Date(a.created_at)
            bValue = new Date(b.created_at)
            break
          case 'selling_price':
            aValue = parseFloat(a.selling_price)
            bValue = parseFloat(b.selling_price)
            break
          case 'stock':
            aValue = parseInt(a.stock)
            bValue = parseInt(b.stock)
            break
          default:
            aValue = a.kode_barang
            bValue = b.kode_barang
        }

        if (aValue < bValue) return sortDirection.value === 'asc' ? -1 : 1
        if (aValue > bValue) return sortDirection.value === 'asc' ? 1 : -1
        return 0
      })

      return result
    })

    const totalPages = computed(() => {
      return Math.ceil(filteredProducts.value.length / itemsPerPage.value)
    })

    const paginatedProducts = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value
      const end = start + itemsPerPage.value
      return filteredProducts.value.slice(start, end)
    })

    const startIndex = computed(() => {
      return (currentPage.value - 1) * itemsPerPage.value
    })

    const endIndex = computed(() => {
      const end = currentPage.value * itemsPerPage.value
      return Math.min(end, filteredProducts.value.length)
    })

    const visiblePages = computed(() => {
      const pages = []
      const total = totalPages.value
      const current = currentPage.value
      
      if (total <= 7) {
        for (let i = 1; i <= total; i++) {
          pages.push(i)
        }
      } else {
        if (current <= 4) {
          for (let i = 1; i <= 5; i++) {
            pages.push(i)
          }
          pages.push('...', total)
        } else if (current >= total - 3) {
          pages.push(1, '...')
          for (let i = total - 4; i <= total; i++) {
            pages.push(i)
          }
        } else {
          pages.push(1, '...')
          for (let i = current - 1; i <= current + 1; i++) {
            pages.push(i)
          }
          pages.push('...', total)
        }
      }
      
      return pages.filter(page => page !== '...' || pages.indexOf(page) === pages.lastIndexOf(page))
    })

    // ===== NEW: HISTORY FUNCTIONS =====

    // History sorting function
    const sortHistoryBy = (field) => {
      if (historySortField.value === field) {
        historySortDirection.value = historySortDirection.value === 'asc' ? 'desc' : 'asc'
      } else {
        historySortField.value = field
        historySortDirection.value = 'desc'
      }
      historyPagination.value.currentPage = 1
    }

    // History pagination functions
    const goToHistoryPage = (page) => {
      if (page >= 1 && page <= historyTotalPages.value) {
        historyPagination.value.currentPage = page
      }
    }

    const nextHistoryPage = () => {
      if (historyPagination.value.currentPage < historyTotalPages.value) {
        historyPagination.value.currentPage++
      }
    }

    const previousHistoryPage = () => {
      if (historyPagination.value.currentPage > 1) {
        historyPagination.value.currentPage--
      }
    }

    const onPerPageChange = () => {
      historyPagination.value.currentPage = 1
    }

    // Reset filters
    const resetHistoryFilters = () => {
      historyFilters.value = {
        type: '',
        search: ''
      }
      historyPagination.value.currentPage = 1
      console.log('🔄 History filters reset')
    }

    // Refresh history data
    const refreshStockHistory = () => {
      if (selectedProduct.value) {
        console.log('🔄 Refreshing stock history for product:', selectedProduct.value.id)
        fetchStockHistory(selectedProduct.value.id)
      } else {
        console.log('⚠️ No selected product for refresh')
      }
    }

    // ✅ FIXED: Enhanced stock history fetching dengan multiple fallback strategies
    const fetchStockHistory = async (productId) => {
      try {
        loadingHistory.value = true
        console.log('🔍 Fetching complete stock history for product:', productId)
        
        // ✅ STRATEGY 1: Try main stock history endpoint
        let response = null
        let movements = []
        
        try {
          console.log('🔍 Strategy 1: Trying primary stock history endpoint...')
          response = await productService.getStockHistory(productId, { 
            per_page: 1000,  // ✅ FIXED: Use large number instead of 'all'
            sort: 'created_at',
            order: 'desc'
          })
          
          console.log('✅ Strategy 1 success:', response)
          
        } catch (primaryError) {
          console.log('❌ Strategy 1 failed:', primaryError.response?.status, primaryError.response?.data?.message)
          
          try {
            // ✅ STRATEGY 2: Try alternative stock movements endpoint
            console.log('🔍 Strategy 2: Trying stock movements endpoint...')
            response = await productService.getStockMovements(productId, {
              per_page: 1000,
              sort: 'created_at',
              order: 'desc'
            })
            
            console.log('✅ Strategy 2 success:', response)
            
          } catch (secondaryError) {
            console.log('❌ Strategy 2 failed:', secondaryError.response?.status, secondaryError.response?.data?.message)
            
            try {
              // ✅ STRATEGY 3: Try direct API call with different structure
              console.log('🔍 Strategy 3: Trying direct product API...')
              const directResponse = await productService.getProductById(productId)
              
              if (directResponse.success && directResponse.data) {
                // ✅ CREATE: Mock empty structure if product exists but no stock history
                console.log('✅ Strategy 3: Product exists, creating empty stock history')
                response = {
                  success: true,
                  data: {
                    movements: [],
                    product: directResponse.data,
                    meta: {
                      total: 0,
                      per_page: 1000,
                      current_page: 1,
                      last_page: 1
                    }
                  },
                  message: 'Product found but no stock history available yet'
                }
              }
              
            } catch (tertiaryError) {
              console.log('❌ Strategy 3 failed - Product verification failed:', tertiaryError.response?.status)
              
              // ✅ FINAL FALLBACK: Return safe empty structure
              console.log('🔄 Final fallback: Creating safe empty stock history structure')
              response = {
                success: true,
                data: {
                  movements: [],
                  meta: {
                    total: 0,
                    per_page: 1000,
                    current_page: 1,
                    last_page: 1
                  }
                },
                message: 'Stock history feature is not available yet'
              }
            }
          }
        }
        
        // ✅ PROCESS RESPONSE: Handle different response structures
        if (response && response.success) {
          console.log('📊 Processing stock history response...')
          
          // ✅ EXTRACT movements from different possible structures
          if (response.data.movements) {
            if (Array.isArray(response.data.movements)) {
              // Direct array structure
              movements = response.data.movements
              console.log('📊 Found direct array movements:', movements.length, 'items')
            } else if (response.data.movements.data) {
              // Laravel pagination structure
              movements = response.data.movements.data
              console.log('📊 Found paginated movements:', movements.length, 'items')
            } else {
              console.log('⚠️ Unexpected movements structure:', typeof response.data.movements)
              movements = []
            }
          } else if (Array.isArray(response.data)) {
            // Response.data is directly an array
            movements = response.data
            console.log('📊 Found movements as direct response data:', movements.length, 'items')
          } else {
            console.log('⚠️ No movements found in response structure')
            movements = []
          }
          
          // ✅ PROCESS each movement and add type_label if missing
          stockMovements.value = movements.map(movement => ({
            ...movement,
            type_label: movement.type_label || (movement.type === 'in' ? 'Stok Masuk' : 'Stok Keluar'),
            // ✅ ENSURE required fields have defaults
            quantity: movement.quantity || 0,
            created_at: movement.created_at || new Date().toISOString(),
            type: movement.type || 'in',
            notes: movement.notes || '',
            user: movement.user || null,
            distributor: movement.distributor || null,
            stock_after: movement.stock_after || null
          }))
          
          // ✅ CALCULATE summary from processed movements
          stockSummary.value = {
            totalIn: movements.filter(m => m.type === 'in').reduce((sum, m) => sum + parseInt(m.quantity || 0), 0),
            totalOut: movements.filter(m => m.type === 'out').reduce((sum, m) => sum + parseInt(m.quantity || 0), 0)
          }
          
          console.log('✅ Stock movements processed successfully:', {
            total_movements: stockMovements.value.length,
            total_in: stockSummary.value.totalIn,
            total_out: stockSummary.value.totalOut
          })
          
          // ✅ SAMPLE LOG: Show first movement if available
          if (stockMovements.value.length > 0) {
            console.log('📝 Sample movement:', stockMovements.value[0])
          }
          
          // ✅ RESET pagination to first page
          historyPagination.value.currentPage = 1
          
        } else {
          console.log('❌ All strategies failed, using empty fallback')
          stockMovements.value = []
          stockSummary.value = { totalIn: 0, totalOut: 0 }
        }
        
      } catch (error) {
        console.error('❌ Critical error in fetchStockHistory:', error)
        
        // ✅ ULTIMATE SAFETY: Always provide safe fallback
        stockMovements.value = []
        stockSummary.value = { totalIn: 0, totalOut: 0 }
        
        // ✅ SHOW user-friendly error message
        const errorMessage = error.response?.status === 500 
          ? 'Server error - Fitur riwayat stok mungkin belum tersedia'
          : error.response?.status === 404
            ? 'Endpoint riwayat stok tidak ditemukan'
            : 'Gagal memuat riwayat stok'
        
        showToast('error', 'Gagal memuat riwayat stok', errorMessage)
        
      } finally {
        loadingHistory.value = false
      }
    }

    // ===== EXISTING FUNCTIONS (yang sudah ada) =====

    // Sorting and pagination functions
    const sortBy = (field) => {
      if (sortField.value === field) {
        sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
      } else {
        sortField.value = field
        sortDirection.value = 'asc'
      }
      currentPage.value = 1
    }

    const goToPage = (page) => {
      if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page
      }
    }

    const nextPage = () => {
      if (currentPage.value < totalPages.value) {
        currentPage.value++
      }
    }

    const previousPage = () => {
      if (currentPage.value > 1) {
        currentPage.value--
      }
    }

    // Data fetching functions
    const fetchProducts = async () => {
      try {
        loading.value = true
        console.log('📦 Fetching products...')
        
        const response = await productService.getProducts()
        if (response.success) {
          products.value = response.data
          console.log('✅ Products fetched:', products.value.length, 'items')
        }
      } catch (error) {
        console.error('❌ Error fetching products:', error)
        showToast('error', 'Gagal memuat data produk', error.message)
      } finally {
        loading.value = false
      }
    }

    const fetchMasterData = async () => {
      try {
        const jenisResponse = await masterDataService.getJenis()
        if (jenisResponse.success) {
          jenisOptions.value = jenisResponse.data
        }

        const satuanResponse = await masterDataService.getSatuan()
        if (satuanResponse.success) {
          satuanOptions.value = satuanResponse.data
        }

        const distributorResponse = await masterDataService.getDistributor()
        if (distributorResponse.success) {
          distributorOptions.value = distributorResponse.data
        }
      } catch (error) {
        console.error('❌ Error fetching master data:', error)
        showToast('error', 'Gagal memuat data master', error.message)
      }
    }

    // ✅ ENHANCED: Toast functions with better error handling
    const showToast = (type, title, message = null, duration = 4000) => {
      const id = ++toastId.value
      const toast = {
        id,
        type,
        title,
        message
      }

      toasts.value.push(toast)

      // ✅ AUTO REMOVE toast after duration
      setTimeout(() => {
        removeToast(id)
      }, duration)

      return id
    }

    const removeToast = (id) => {
      const index = toasts.value.findIndex(toast => toast.id === id)
      if (index > -1) {
        toasts.value.splice(index, 1)
      }
    }

    // Utility functions
    const formatCurrency = utils.formatCurrency

    const formatDate = (dateString) => {
      if (!dateString) return '-'
      const date = new Date(dateString)
      return date.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }

    const formatTime = (dateString) => {
      if (!dateString) return '-'
      const date = new Date(dateString)
      return date.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    }

    const formatDateTime = (dateString) => {
      if (!dateString) return '-'
      const date = new Date(dateString)
      return date.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const getStockClass = (stock) => {
      if (stock === 0) return 'bg-red-100 text-red-800'
      if (stock <= 10) return 'bg-yellow-100 text-yellow-800'
      return 'bg-green-100 text-green-800'
    }

    // Photo handling functions
    const handlePhotoUpload = (event) => {
      const file = event.target.files[0]
      if (file) {
        console.log('📷 Photo selected:', {
          name: file.name,
          size: file.size,
          type: file.type
        })

        if (file.size > 2 * 1024 * 1024) {
          showToast('error', 'File terlalu besar', 'Maksimal ukuran file adalah 2MB')
          event.target.value = ''
          return
        }

        if (!['image/jpeg', 'image/png', 'image/jpg', 'image/gif'].includes(file.type)) {
          showToast('error', 'Format file tidak didukung', 'Hanya mendukung JPG, PNG, dan GIF')
          event.target.value = ''
          return
        }

        photoFile.value = file

        const reader = new FileReader()
        reader.onload = (e) => {
          photoPreview.value = e.target.result
          console.log('📷 Photo preview created')
        }
        reader.readAsDataURL(file)
      }
    }

    const removePhoto = () => {
      photoPreview.value = null
      currentPhotoUrl.value = null
      photoFile.value = null
      
      const photoInput = document.getElementById('photo')
      if (photoInput) {
        photoInput.value = ''
      }
      
      console.log('📷 Photo removed')
    }

    const handleImageError = (event) => {
      console.error('❌ Image load failed:', {
        src: event.target.src,
        error: 'Failed to load image'
      })
      
      event.target.style.display = 'none'
      
      const parent = event.target.parentElement
      if (parent && !parent.querySelector('.image-placeholder')) {
        const placeholder = document.createElement('div')
        placeholder.className = 'h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200 image-placeholder'
        placeholder.innerHTML = `
          <svg class="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
        `
        parent.appendChild(placeholder)
      }
    }

    // Product management functions
    const editProduct = (product) => {
      console.log('📝 Editing product:', product)
      
      selectedProduct.value = product
      
      form.value.id = product.id
      form.value.name = product.name
      form.value.jenis_id = product.jenis_id
      form.value.satuan_id = product.satuan_id
      form.value.distributor_id = product.distributor_id
      form.value.stock = product.stock
      form.value.selling_price = product.selling_price
      
      currentPhotoUrl.value = product.photo_url
      photoPreview.value = null
      photoFile.value = null
      
      isEditMode.value = true
      showForm.value = true
    }

    const resetForm = () => {
      form.value = {
        id: null,
        name: '',
        jenis_id: '',
        satuan_id: '',
        distributor_id: '',
        stock: 0,
        selling_price: 0
      }
      
      photoPreview.value = null
      currentPhotoUrl.value = null
      photoFile.value = null
      
      const photoInput = document.getElementById('photo')
      if (photoInput) {
        photoInput.value = ''
      }
      
      console.log('📝 Form reset')
    }

    const resetStockForm = () => {
      stockForm.value = {
        quantity: null,
        distributor_id: '',
        notes: ''
      }
    }

    const closeForm = () => {
      showForm.value = false
      isEditMode.value = false
      selectedProduct.value = null
      resetForm()
    }

    const validateForm = () => {
      if (!form.value.name.trim()) {
        showToast('error', 'Validasi Error', 'Nama produk harus diisi!')
        return false
      }
      if (!form.value.jenis_id) {
        showToast('error', 'Validasi Error', 'Jenis harus dipilih!')
        return false
      }
      if (!form.value.satuan_id) {
        showToast('error', 'Validasi Error', 'Satuan harus dipilih!')
        return false
      }
      if (!form.value.distributor_id) {
        showToast('error', 'Validasi Error', 'Distributor harus dipilih!')
        return false
      }
      if (form.value.selling_price <= 0) {
        showToast('error', 'Validasi Error', 'Harga jual harus lebih dari 0!')
        return false
      }

      if (!isEditMode.value) {
        if (form.value.stock < 0) {
          showToast('error', 'Validasi Error', 'Stok tidak boleh negatif!')
          return false
        }
      }

      return true
    }

    const addProduct = async () => {
      if (!validateForm()) return

      loading.value = true

      try {
        console.log('📝 Form data before submit:', {
          name: form.value.name,
          jenis_id: form.value.jenis_id,
          satuan_id: form.value.satuan_id,
          distributor_id: form.value.distributor_id,
          stock: form.value.stock,
          selling_price: form.value.selling_price,
          hasPhoto: !!photoFile.value
        })

        const formData = new FormData()
        formData.append('name', form.value.name)
        formData.append('jenis_id', form.value.jenis_id)
        formData.append('satuan_id', form.value.satuan_id)
        formData.append('distributor_id', form.value.distributor_id)
        formData.append('stock', form.value.stock)
        formData.append('selling_price', form.value.selling_price)
        
        if (photoFile.value) {
          formData.append('photo', photoFile.value)
          console.log('📷 Photo added to FormData')
        }

        const response = await productService.createProductWithPhoto(formData)

        if (response.success) {
          console.log('✅ Created product response:', response.data)
          
          resetForm()
          closeForm()
          showToast('success', 'Berhasil!', 'Produk berhasil ditambahkan')
          
          setTimeout(() => {
            fetchProducts()
          }, 500)
        } else {
          throw new Error(response.message || 'Gagal menambah produk')
        }
      } catch (error) {
        console.error('❌ Error adding product:', error)
        
        if (error.response?.data?.errors) {
          const firstError = Object.values(error.response.data.errors)[0]
          if (firstError && firstError[0]) {
            showToast('error', 'Validation Error', firstError[0])
            return
          }
        }
        
        showToast('error', 'Gagal Menambah Produk', error.response?.data?.message || error.message)
      } finally {
        loading.value = false
      }
    }

    const updateProduct = async () => {
      if (!validateForm()) return

      loading.value = true

      try {
        console.log('📝 Update form data:', {
          id: form.value.id,
          name: form.value.name,
          jenis_id: form.value.jenis_id,
          satuan_id: form.value.satuan_id,
          distributor_id: form.value.distributor_id,
          selling_price: form.value.selling_price,
          hasPhoto: !!photoFile.value
        })

        const formData = new FormData()
        formData.append('name', form.value.name)
        formData.append('jenis_id', form.value.jenis_id)
        formData.append('satuan_id', form.value.satuan_id)
        formData.append('distributor_id', form.value.distributor_id)
        formData.append('selling_price', form.value.selling_price)
        formData.append('_method', 'PUT')

        if (photoFile.value) {
          formData.append('photo', photoFile.value)
          console.log('📷 Photo added to update FormData')
        }

        const response = await productService.updateProductWithPhoto(form.value.id, formData)

        if (response.success) {
          console.log('✅ Updated product response:', response.data)
          
          const index = products.value.findIndex(p => p.id === form.value.id)
          if (index !== -1) {
            products.value[index] = response.data
            console.log('📝 Product updated in list:', products.value[index])
          }
          
          resetForm()
          closeForm()
          showToast('success', 'Berhasil!', 'Produk berhasil diperbarui')
          
          setTimeout(() => {
            fetchProducts()
          }, 500)
        } else {
          throw new Error(response.message || 'Gagal update produk')
        }
      } catch (error) {
        console.error('❌ Error updating product:', error)
        
        if (error.response?.data?.errors) {
          const firstError = Object.values(error.response.data.errors)[0]
          if (firstError && firstError[0]) {
            showToast('error', 'Validation Error', firstError[0])
            return
          }
        }
        
        showToast('error', 'Gagal Update Produk', error.response?.data?.message || error.message)
      } finally {
        loading.value = false
      }
    }

    // Stock modal functions
    const openStockModal = (product) => {
      selectedProduct.value = product
      additionalStock.value = null
      showStockModal.value = true
    }

    const closeStockModal = () => {
      showStockModal.value = false
      selectedProduct.value = null
      additionalStock.value = null
    }

    const openAddStockModal = (product) => {
      selectedProduct.value = product
      resetStockForm()
      showAddStockModal.value = true
    }

    const closeAddStockModal = () => {
      showAddStockModal.value = false
      selectedProduct.value = null
      resetStockForm()
    }

    // ✅ ENHANCED: Stock history modal functions with better error handling
    const openStockHistoryModal = (product) => {
      console.log('📊 Opening stock history for product:', product)
      
      // ✅ VALIDATION: Ensure product has required fields
      if (!product || !product.id) {
        console.error('❌ Invalid product data for stock history:', product)
        showToast('error', 'Error', 'Data produk tidak valid')
        return
      }
      
      selectedProduct.value = product
      showStockHistoryModal.value = true
      
      // ✅ RESET filters and pagination before fetching
      resetHistoryFilters()
      
      // ✅ FETCH stock history with error handling
      fetchStockHistory(product.id)
    }

    // ✅ ENHANCED: Close stock history modal with cleanup
    const closeStockHistoryModal = () => {
      console.log('🔒 Closing stock history modal')
      
      showStockHistoryModal.value = false
      selectedProduct.value = null
      stockMovements.value = []
      stockSummary.value = { totalIn: 0, totalOut: 0 }
      resetHistoryFilters()
      
      // ✅ CLEAR any loading states
      loadingHistory.value = false
    }

    const updateStock = async () => {
      if (!additionalStock.value || additionalStock.value <= 0) {
        showToast('error', 'Validasi Error', 'Masukkan jumlah stok yang valid!')
        return
      }

      loading.value = true

      try {
        const response = await productService.addStock(selectedProduct.value.id, additionalStock.value)

        if (response.success) {
          console.log('✅ Updated stock response:', response.data)
          
          const index = products.value.findIndex(p => p.id === selectedProduct.value.id)
          if (index !== -1) {
            products.value[index] = response.data
            console.log('📝 Stock updated in list:', products.value[index])
          }

          showToast('success', 'Berhasil!', `Stok berhasil ditambah +${additionalStock.value}`)
          closeStockModal()
          
          setTimeout(() => {
            fetchProducts()
          }, 500)
        } else {
          throw new Error(response.message || 'Gagal update stok')
        }
      } catch (error) {
        console.error('❌ Error updating stock:', error)
        showToast('error', 'Gagal Update Stok', error.response?.data?.message || error.message)
      } finally {
        loading.value = false
      }
    }

    const addStockWithTracking = async () => {
      if (!stockForm.value.quantity || stockForm.value.quantity <= 0) {
        showToast('error', 'Validasi Error', 'Masukkan jumlah stok yang valid!')
        return
      }

      if (!stockForm.value.distributor_id) {
        showToast('error', 'Validasi Error', 'Pilih distributor!')
        return
      }

      loading.value = true

      try {
        console.log('📦 Adding stock with tracking:', {
          productId: selectedProduct.value.id,
          quantity: stockForm.value.quantity,
          distributor_id: stockForm.value.distributor_id,
          notes: stockForm.value.notes
        })

        const response = await productService.addStockWithTracking(selectedProduct.value.id, {
          quantity: stockForm.value.quantity,
          distributor_id: stockForm.value.distributor_id,
          notes: stockForm.value.notes
        })

        if (response.success) {
          console.log('✅ Added stock with tracking response:', response.data)
          
          const index = products.value.findIndex(p => p.id === selectedProduct.value.id)
          if (index !== -1) {
            products.value[index] = response.data.product
            console.log('📝 Stock updated in list:', products.value[index])
          }

          if (selectedProduct.value) {
            selectedProduct.value.stock = response.data.product.stock
          }

          showToast('success', 'Berhasil!', `Stok berhasil ditambah +${stockForm.value.quantity}`)
          closeAddStockModal()
          
          setTimeout(() => {
            fetchProducts()
          }, 500)
        } else {
          throw new Error(response.message || 'Gagal menambah stok')
        }
      } catch (error) {
        console.error('❌ Error adding stock with tracking:', error)
        showToast('error', 'Gagal Menambah Stok', error.response?.data?.message || error.message)
      } finally {
        loading.value = false
      }
    }

    // Delete functions
    const deleteProduct = async (product) => {
      selectedProduct.value = product
      showConfirmDialog.value = true
    }

    const confirmDelete = async () => {
      try {
        loading.value = true
        const response = await productService.deleteProduct(selectedProduct.value.id)

        if (response.success) {
          products.value = products.value.filter(p => p.id !== selectedProduct.value.id)
          showToast('success', 'Berhasil!', 'Produk berhasil dihapus')
          
          setTimeout(() => {
            fetchProducts()
          }, 500)
        } else {
          throw new Error(response.message || 'Gagal hapus produk')
        }
      } catch (error) {
        console.error('❌ Error deleting product:', error)
        showToast('error', 'Gagal Hapus Produk', error.response?.data?.message || error.message)
      } finally {
        loading.value = false
        cancelDelete()
      }
    }

    const cancelDelete = () => {
      showConfirmDialog.value = false
      selectedProduct.value = null
    }

    // Initialize component
    onMounted(() => {
      console.log('🚀 ProductTable component mounted')
      fetchProducts()
      fetchMasterData()
    })

    return {
      // Data
      products,
      filteredProducts,
      paginatedProducts,
      searchQuery,
      loading,
      loadingHistory,
      
      // Modal states
      showStockModal,
      showAddStockModal,
      showStockHistoryModal,
      showForm,
      showConfirmDialog,
      
      isEditMode,
      selectedProduct,
      additionalStock,
      toasts,
      form,
      stockForm,
      jenisOptions,
      satuanOptions,
      distributorOptions,

      // Photo
      photoPreview,
      currentPhotoUrl,
      photoFile,

      // Pagination
      sortField,
      sortDirection,
      currentPage,
      totalPages,
      startIndex,
      endIndex,
      visiblePages,

      // ✅ ENHANCED: Stock History Data
      stockMovements,
      stockSummary,
      filteredStockMovements,
      paginatedStockMovements,
      historyFilters,
      historyPagination,
      historySortField,
      historySortDirection,
      historyTotalPages,
      historyStartIndex,
      historyEndIndex,
      historyVisiblePages,

      // Functions
      sortBy,
      goToPage,
      nextPage,
      previousPage,
      editProduct,
      addProduct,
      updateProduct,
      resetForm,
      closeForm,
      
      // Stock functions
      openStockModal,
      closeStockModal,
      openAddStockModal,
      closeAddStockModal,
      openStockHistoryModal,
      closeStockHistoryModal,
      updateStock,
      addStockWithTracking,
      
      // ✅ ENHANCED: History functions
      sortHistoryBy,
      goToHistoryPage,
      nextHistoryPage,
      previousHistoryPage,
      onPerPageChange,
      resetHistoryFilters,
      refreshStockHistory,
      fetchStockHistory,
      
      deleteProduct,
      confirmDelete,
      cancelDelete,
      getStockClass,
      formatCurrency,
      formatDate,
      formatTime,
      formatDateTime,
      removeToast,

      handlePhotoUpload,
      removePhoto,
      handleImageError
    }
  }
}
</script>

<style scoped>
/* ===== ANIMATIONS ===== */
@keyframes slide-in-right {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes scale-in {
  from {
    transform: scale(0.95);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* ===== ANIMATION CLASSES ===== */
.animate-slide-in-right {
  animation: slide-in-right 0.3s ease-out;
}

.animate-scale-in {
  animation: scale-in 0.2s ease-out;
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}

/* ===== CUSTOM SCROLLBAR ===== */
.overflow-auto::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.overflow-auto::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 10px;
}

.overflow-auto::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}

.overflow-auto::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* ===== TABLE IMPROVEMENTS ===== */
.sticky {
  position: -webkit-sticky;
  position: sticky;
  top: 0;
  z-index: 10;
}

/* ===== HOVER EFFECTS ===== */
.hover\:bg-gray-50:hover {
  background-color: #f9fafb;
}

.hover\:bg-gray-100:hover {
  background-color: #f3f4f6;
}

.hover\:bg-gray-200:hover {
  background-color: #e5e7eb;
}

/* ===== BUTTON IMPROVEMENTS ===== */
.transition-colors {
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

/* ===== FOCUS STATES ===== */
.focus\:ring-2:focus {
  --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);
  --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color);
  box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000);
}

.focus\:ring-indigo-500:focus {
  --tw-ring-color: #6366f1;
}

.focus\:border-indigo-500:focus {
  border-color: #6366f1;
}

/* ===== DISABLED STATES ===== */
.disabled\:opacity-50:disabled {
  opacity: 0.5;
}

.disabled\:cursor-not-allowed:disabled {
  cursor: not-allowed;
}

.disabled\:bg-gray-400:disabled {
  background-color: #9ca3af;
}

/* ===== RESPONSIVE IMPROVEMENTS ===== */
@media (max-width: 768px) {
  .max-w-6xl {
    max-width: 95vw;
  }
  
  .overflow-x-auto {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
  
  .min-w-full {
    min-width: 100%;
  }
  
  .px-4 {
    padding-left: 1rem;
    padding-right: 1rem;
  }
  
  .py-3 {
    padding-top: 0.75rem;
    padding-bottom: 0.75rem;
  }
}

/* ===== MODAL BACKDROP ===== */
.backdrop-blur-sm {
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  background-color: rgba(0, 0, 0, 0.25);
}

/* ===== LOADING SPINNER ===== */
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* ===== SHADOWS ===== */
.shadow-2xl {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.shadow-lg {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.shadow-sm {
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

/* ===== BORDER RADIUS ===== */
.rounded-xl {
  border-radius: 0.75rem;
}

.rounded-lg {
  border-radius: 0.5rem;
}

.rounded-md {
  border-radius: 0.375rem;
}

.rounded-full {
  border-radius: 9999px;
}

/* ===== GRID IMPROVEMENTS ===== */
.grid-cols-2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.grid-cols-4 {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

@media (min-width: 768px) {
  .md\:grid-cols-4 {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
  
  .md\:col-span-2 {
    grid-column: span 2 / span 2;
  }
}

/* ===== TEXT TRUNCATION ===== */
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ===== FLEX IMPROVEMENTS ===== */
.flex-shrink-0 {
  flex-shrink: 0;
}

.flex-1 {
  flex: 1 1 0%;
}

/* ===== POSITIONING ===== */
.fixed {
  position: fixed;
}

.absolute {
  position: absolute;
}

.relative {
  position: relative;
}

.inset-0 {
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}

/* ===== Z-INDEX ===== */
.z-50 {
  z-index: 50;
}

.z-10 {
  z-index: 10;
}

/* ===== OVERFLOW ===== */
.overflow-hidden {
  overflow: hidden;
}

.overflow-y-auto {
  overflow-y: auto;
}

.overflow-x-auto {
  overflow-x: auto;
}

/* ===== MAX HEIGHT ===== */
.max-h-\[90vh\] {
  max-height: 90vh;
}

.max-h-\[95vh\] {
  max-height: 95vh;
}

/* ===== PERFORMANCE OPTIMIZATIONS ===== */
.transform {
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}

.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

/* ===== UTILITY CLASSES ===== */
.resize-none {
  resize: none;
}

.cursor-pointer {
  cursor: pointer;
}

.cursor-not-allowed {
  cursor: not-allowed;
}

.select-none {
  user-select: none;
}

/* ===== PRINT STYLES ===== */
@media print {
  .no-print {
    display: none !important;
  }
  
  .print-full-width {
    width: 100% !important;
    max-width: none !important;
  }
}
</style>