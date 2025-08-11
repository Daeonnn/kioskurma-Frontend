<template>
  <div class="bg-gray-50 min-h-screen">
    
    <div class="p-6">
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
                    Kode Barang
                    <svg v-if="sortField === 'kode_barang'" :class="sortDirection === 'asc' ? 'transform rotate-180' : ''" class="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                    </svg>
                  </div>
                </th>
                <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Foto</th>
                <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors" @click="sortBy('name')">
                  <div class="flex items-center">
                    Nama Barang
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
                <th class="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-44">Aksi</th>
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
                      @load="() => console.log('✓ Image loaded:', product.name)"
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
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div class="flex gap-2">
                    <button 
                      @click="editProduct(product)"
                      class="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                    >
                      <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                      </svg>
                      Ubah
                    </button>
                    
                    <button 
                      @click="openStockModal(product)"
                      class="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                    >
                      Tambah Stok
                    </button>
                    
                    <button 
                      @click="deleteProduct(product)"
                      class="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                    >
                      <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                      Hapus
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
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

              <div>
                <label for="stock" class="block text-sm font-medium text-gray-700 mb-2">Stok</label>
                <input
                  v-model.number="form.stock"
                  id="stock"
                  type="number"
                  min="0"
                  placeholder="Masukkan jumlah stok"
                  class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  required
                />
              </div>

              <div class="md:col-span-2">
                <label for="selling_price" class="block text-sm font-medium text-gray-700 mb-2">Harga Jual</label>
                <input
                  v-model.number="form.selling_price"
                  id="selling_price"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="Masukkan harga jual (contoh: 500, 10500, 34300)"
                  class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  required
                />
                <p class="text-xs text-gray-500 mt-1">
                  Harga dalam rupiah (tanpa desimal, contoh: 500, 10500, 34300, 45799)
                </p>
              </div>
            </div>

            <div class="flex gap-3 mt-6">
              <button 
                type="submit"
                :disabled="loading"
                class="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white px-4 py-3 rounded-lg font-medium transition-colors duration-200"
              >
                {{ loading ? 'Menyimpan...' : (isEditMode ? 'Simpan' : 'Simpan') }}
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

    <div v-if="showStockModal" class="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4" @click="closeStockModal">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 transform transition-all" @click.stop>
        <div class="p-6">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-xl font-semibold text-gray-800">Tambah Stok</h3>
            <button @click="closeStockModal" class="text-gray-400 hover:text-gray-600 transition-colors p-1">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <div class="mb-6 p-4 bg-indigo-50 rounded-lg">
            <p class="text-sm text-gray-600 mb-1">Produk:</p>
            <p class="font-medium text-gray-900 text-lg">{{ selectedProduct?.name }}</p>
            <p class="text-sm text-gray-500">Kode: {{ selectedProduct?.kode_barang }}</p>
            <p class="text-sm text-indigo-600 font-medium mt-2">
              Stok Saat Ini: {{ selectedProduct?.stock }}
            </p>
          </div>

          <form @submit.prevent="updateStock">
            <div class="mb-6">
              <label for="additionalStock" class="block text-sm font-medium text-gray-700 mb-2">
                Jumlah Tambahan Stok
              </label>
              <input
                v-model.number="additionalStock"
                id="additionalStock"
                type="number"
                min="1"
                placeholder="Masukkan jumlah stok yang ingin ditambah"
                class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                required
              />
              <p class="text-xs text-gray-500 mt-2">
                Stok akan menjadi: <span class="font-medium text-indigo-600">{{ (selectedProduct?.stock || 0) + (additionalStock || 0) }}</span>
              </p>
            </div>

            <div class="flex gap-3">
              <button 
                type="submit"
                :disabled="loading || !additionalStock"
                class="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white px-4 py-3 rounded-lg font-medium transition-colors duration-200"
              >
                {{ loading ? 'Menyimpan...' : 'Tambah' }}
              </button>
              <button
                type="button"
                @click="closeStockModal"
                class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-lg font-medium transition-colors duration-200"
              >
                Batal
              </button>
            </div>
          </form>
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
    const products = ref([])
    const searchQuery = ref('')
    const loading = ref(false)
    const showStockModal = ref(false)
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

    const jenisOptions = ref([])
    const satuanOptions = ref([])
    const distributorOptions = ref([])

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

    const fetchProducts = async () => {
      try {
        loading.value = true
        console.log('Fetching products...')
        
        const response = await productService.getProducts()
        if (response.success) {
          products.value = response.data
          console.log('Products fetched:', products.value.length, 'items')
          
          products.value.forEach((product, index) => {
            console.log(`Product ${index + 1}:`, {
              id: product.id,
              name: product.name,
              photo: product.photo,
              photo_url: product.photo_url
            })
          })
        }
      } catch (error) {
        console.error('Error fetching products:', error)
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
        console.error('Error fetching master data:', error)
        showToast('error', 'Gagal memuat data master', error.message)
      }
    }

    const showToast = (type, title, message = null, duration = 4000) => {
      const id = ++toastId.value
      const toast = {
        id,
        type,
        title,
        message
      }

      toasts.value.push(toast)

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

    const formatCurrency = utils.formatCurrency

    const handlePhotoUpload = (event) => {
      const file = event.target.files[0]
      if (file) {
        console.log('Photo selected:', {
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
          console.log('Photo preview created')
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
      
      console.log('Photo removed')
    }

    const handleImageError = (event) => {
      console.error('Image load failed:', {
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

    const editProduct = (product) => {
      console.log('Editing product:', product)
      
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

    const addProduct = async () => {
      if (!validateForm()) return

      loading.value = true

      try {
        console.log('Form data before submit:', {
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
          console.log('Photo added to FormData')
        }

        console.log('FormData contents:')
        for (let pair of formData.entries()) {
          console.log(pair[0] + ':', pair[1])
        }

        const response = await productService.createProductWithPhoto(formData)

        if (response.success) {
          console.log('Created product response:', response.data)
          
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
        console.error('Error adding product:', error)
        
        if (error.response) {
          console.error('Error Response:', {
            status: error.response.status,
            data: error.response.data,
            headers: error.response.headers
          })
          
          if (error.response.data && error.response.data.errors) {
            console.error('Validation Errors:', error.response.data.errors)
            
            const firstError = Object.values(error.response.data.errors)[0]
            if (firstError && firstError[0]) {
              showToast('error', 'Validation Error', firstError[0])
              return
            }
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
        console.log('Update form data:', {
          id: form.value.id,
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
        formData.append('_method', 'PUT')

        if (photoFile.value) {
          formData.append('photo', photoFile.value)
          console.log('Photo added to update FormData')
        }

        const response = await productService.updateProductWithPhoto(form.value.id, formData)

        if (response.success) {
          console.log('Updated product response:', response.data)
          
          const index = products.value.findIndex(p => p.id === form.value.id)
          if (index !== -1) {
            products.value[index] = response.data
            console.log('Product updated in list:', products.value[index])
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
        console.error('Error updating product:', error)
        
        if (error.response) {
          console.error('Error Response:', {
            status: error.response.status,
            data: error.response.data
          })
          
          if (error.response.data && error.response.data.errors) {
            console.error('Validation Errors:', error.response.data.errors)
            
            const firstError = Object.values(error.response.data.errors)[0]
            if (firstError && firstError[0]) {
              showToast('error', 'Validation Error', firstError[0])
              return
            }
          }
        }
        
        showToast('error', 'Gagal Update Produk', error.response?.data?.message || error.message)
      } finally {
        loading.value = false
      }
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
      if (form.value.stock < 0) {
        showToast('error', 'Validasi Error', 'Stok tidak boleh negatif!')
        return false
      }
      if (form.value.selling_price <= 0) {
        showToast('error', 'Validasi Error', 'Harga jual harus lebih dari 0!')
        return false
      }
      return true
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
      
      console.log('Form reset')
    }

    const closeForm = () => {
      showForm.value = false
      isEditMode.value = false
      resetForm()
    }

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

    const updateStock = async () => {
      if (!additionalStock.value || additionalStock.value <= 0) {
        showToast('error', 'Validasi Error', 'Masukkan jumlah stok yang valid!')
        return
      }

      loading.value = true

      try {
        const response = await productService.addStock(selectedProduct.value.id, additionalStock.value)

        if (response.success) {
          console.log('Updated stock response:', response.data)
          
          const index = products.value.findIndex(p => p.id === selectedProduct.value.id)
          if (index !== -1) {
            products.value[index] = response.data
            console.log('Stock updated in list:', products.value[index])
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
        console.error('Error updating stock:', error)
        showToast('error', 'Gagal Update Stok', error.response?.data?.message || error.message || 'Terjadi kesalahan saat mengupdate stok')
      } finally {
        loading.value = false
      }
    }

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
        console.error('Error deleting product:', error)
        showToast('error', 'Gagal Hapus Produk', error.response?.data?.message || error.message || 'Terjadi kesalahan saat menghapus produk')
      } finally {
        loading.value = false
        cancelDelete()
      }
    }

    const cancelDelete = () => {
      showConfirmDialog.value = false
      selectedProduct.value = null
    }

    const getStockClass = (stock) => {
      if (stock === 0) return 'bg-red-100 text-red-800'
      if (stock <= 10) return 'bg-yellow-100 text-yellow-800'
      return 'bg-green-100 text-green-800'
    }

    const formatDate = (dateString) => {
      if (!dateString) return '-'
      const date = new Date(dateString)
      return date.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }

    onMounted(() => {
      console.log('ProductTable component mounted')
      fetchProducts()
      fetchMasterData()
    })

    return {
      products,
      filteredProducts,
      paginatedProducts,
      searchQuery,
      loading,
      showStockModal,
      showForm,
      showConfirmDialog,
      isEditMode,
      selectedProduct,
      additionalStock,
      toasts,
      form,
      jenisOptions,
      satuanOptions,
      distributorOptions,

      photoPreview,
      currentPhotoUrl,
      photoFile,

      sortField,
      sortDirection,
      currentPage,
      totalPages,
      startIndex,
      endIndex,
      visiblePages,

      sortBy,
      goToPage,
      nextPage,
      previousPage,
      editProduct,
      addProduct,
      updateProduct,
      resetForm,
      closeForm,
      openStockModal,
      closeStockModal,
      updateStock,
      deleteProduct,
      confirmDelete,
      cancelDelete,
      getStockClass,
      formatCurrency,
      formatDate,
      removeToast,

      handlePhotoUpload,
      removePhoto,
      handleImageError
    }
  }
}
</script>

<style scoped>
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

.animate-slide-in-right {
  animation: slide-in-right 0.3s ease-out;
}
</style>