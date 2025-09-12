<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <nav class="mb-6">
      <ol class="flex text-gray-600 text-sm space-x-2">
        <li>
          <router-link to="/admin/dashboard" class="hover:text-indigo-600 transition-colors">Home</router-link>
        </li>
        <li>/</li>
        <li class="text-indigo-600 font-semibold">Laporan Transaksi</li>
      </ol>
    </nav>

    <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div class="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <h2 class="text-2xl font-bold text-gray-800">Laporan Transaksi</h2>
        
        <div class="flex flex-col sm:flex-row gap-3">
          <div class="relative">
            <button 
              @click="showFilterDropdown = !showFilterDropdown"
              class="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-w-[200px] justify-between"
            >
              <div class="flex items-center gap-2">
                <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z"></path>
                </svg>
                <span class="text-sm">{{ getFilterButtonText() }}</span>
              </div>
              <svg class="w-4 h-4 text-gray-500" :class="{ 'rotate-180': showFilterDropdown }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>
            
            <div v-if="showFilterDropdown" class="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              <div class="p-4 space-y-4">
                <div class="flex items-center justify-between pb-2 border-b border-gray-200">
                  <h3 class="font-medium text-gray-900">Filter Data</h3>
                  <button @click="showFilterDropdown = false" class="text-gray-400 hover:text-gray-600">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>
                
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-gray-700">Periode Tanggal</label>
                  <div class="grid grid-cols-2 gap-2">
                    <input
                      v-model="filters.start_date"
                      type="date"
                      class="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      placeholder="Dari"
                    >
                    <input
                      v-model="filters.end_date"
                      type="date"
                      class="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      placeholder="Sampai"
                    >
                  </div>
                </div>
                
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-gray-700">Metode Pembayaran</label>
                  <select
                    v-model="filters.payment_method"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  >
                    <option value="">Semua Metode</option>
                    <option value="tunai">Tunai</option>
                    <option value="qris">QRIS</option>
                  </select>
                </div>
                
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-gray-700">Filter Diskon</label>
                  <select
                    v-model="filters.discount_filter"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  >
                    <option value="">Semua Transaksi</option>
                    <option value="with_discount">Dengan Diskon</option>
                    <option value="without_discount">Tanpa Diskon</option>
                  </select>
                </div>
                
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-gray-700">Cari Transaksi</label>
                  <input
                    v-model="searchTerm"
                    type="text"
                    placeholder="TR atau nama kasir..."
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  >
                </div>
                
                <div class="flex gap-2 pt-2 border-t border-gray-200">
                  <button 
                    @click="applyFilters"
                    class="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-md font-medium transition-colors flex items-center justify-center gap-2 text-sm"
                    :disabled="loading"
                  >
                    <svg v-if="loading" class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                    </svg>
                    {{ loading ? 'Loading...' : 'Terapkan' }}
                  </button>
                  
                  <button 
                    @click="clearFilters"
                    class="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md font-medium transition-colors text-sm"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <button 
            @click="printReport"
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
            </svg>
            <span>Cetak Laporan</span>
            <svg class="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          
            </svg>
          </button>

          <div v-if="showPrintMenu" class="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            <div class="py-1">
              <button 
                @click="printReport('a4')"
                class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                Format A4 (Lengkap)
              </button>
              <button 
                @click="printReport('compact')"
                class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                Format Ringkas
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div v-if="filterApplied" class="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z"></path>
            </svg>
            <span class="text-sm font-medium text-blue-800">Filter Aktif:</span>
            <span class="text-sm text-blue-700">{{ getFilterDescription() }}</span>
          </div>
          <button 
            @click="clearFilters" 
            class="text-xs text-blue-600 hover:text-blue-800 underline"
          >
            Hapus Filter
          </button>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <div class="bg-white rounded-lg shadow-sm p-6">
        <div class="flex items-center">
          <div class="p-2 bg-blue-100 rounded-lg">
            <svg class="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Total Transaksi</p>
            <p class="text-2xl font-bold text-gray-900">{{ formatNumber(reportData.total_transactions) }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm p-6">
        <div class="flex items-center">
          <div class="p-2 bg-green-100 rounded-lg">
            <svg class="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clip-rule="evenodd"/>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Total Pendapatan</p>
            <p class="text-2xl font-bold text-gray-900">Rp {{ formatCurrency(reportData.total_revenue) }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm p-6">
        <div class="flex items-center">
          <div class="p-2 bg-purple-100 rounded-lg">
            <svg class="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 2L3 7v11a1 1 0 001 1h5v-6h2v6h5a1 1 0 001-1V7l-7-5z" clip-rule="evenodd"/>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Items Terjual</p>
            <p class="text-2xl font-bold text-gray-900">{{ formatNumber(reportData.total_items_sold) }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow-sm overflow-hidden">
      <div class="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h3 class="text-lg font-semibold text-gray-800">Daftar Transaksi</h3>
        <div class="text-sm text-gray-600">
          Menampilkan {{ currentPageData.length }} dari {{ filteredTransactions.length }} transaksi
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kode Transaksi</th>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Penjual</th>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah Beli</th>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diskon</th>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Harga</th>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal Cetak</th>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Metode</th>
              <th class="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="transaction in currentPageData" :key="transaction.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                  {{ transaction.transaction_code || transaction.invoice_number }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ transaction.user?.name || 'Pembeli' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ transaction.details ? transaction.details.reduce((total, detail) => total + detail.quantity, 0) : 1 }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                Rp {{ formatCurrency(getSubtotalAmount(transaction)) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <div v-if="hasDiscount(transaction)" class="flex flex-col">
                  <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    {{ formatDiscountDisplay(transaction) }}
                  </span>
                  <span class="text-xs text-orange-600 mt-1">
                    -Rp {{ formatCurrency(transaction.discount_amount || 0) }}
                  </span>
                </div>
                <span v-else class="text-gray-400 text-xs">Tidak ada</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                Rp {{ formatCurrency(transaction.total_price) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ formatDate(transaction.date) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span 
                  :class="getPaymentMethodClass(transaction.payment_method)"
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                >
                  {{ transaction.payment_method?.toUpperCase() || 'TUNAI' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex gap-2">
                  <button 
                    @click="viewTransactionDetail(transaction)" 
                    class="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                  >
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                    Detail
                  </button>
                  
                  <button 
                    @click="printReceipt(transaction)" 
                    class="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                  >
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
                    </svg>
                    Print
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="filteredTransactions.length > itemsPerPage" class="bg-white px-6 py-4 border-t border-gray-200">
        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-700">
            Menampilkan {{ ((currentPage - 1) * itemsPerPage) + 1 }} sampai {{ Math.min(currentPage * itemsPerPage, filteredTransactions.length) }} dari {{ filteredTransactions.length }} hasil
          </div>
          <div class="flex gap-2">
            <button 
              @click="currentPage = Math.max(1, currentPage - 1)"
              :disabled="currentPage === 1"
              class="px-3 py-1 bg-gray-100 text-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
            >
              Sebelumnya
            </button>
            
            <div class="flex gap-1">
              <button 
                v-for="page in visiblePages" 
                :key="page"
                @click="currentPage = page"
                :class="[
                  'px-3 py-1 rounded-md text-sm font-medium',
                  currentPage === page 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                ]"
              >
                {{ page }}
              </button>
            </div>
            
            <button 
              @click="currentPage = Math.min(totalPages, currentPage + 1)"
              :disabled="currentPage === totalPages"
              class="px-3 py-1 bg-gray-100 text-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      </div>
      
      <div v-if="filteredTransactions.length === 0 && !loading" class="text-center py-12 px-4">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">Tidak ada transaksi ditemukan</h3>
        <p class="mt-1 text-sm text-gray-500">Coba ubah filter atau periode tanggal.</p>
      </div>

      <div v-if="loading" class="text-center py-12 px-4">
        <div class="inline-flex items-center">
          <svg class="animate-spin h-8 w-8 text-indigo-600 mr-3" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span class="text-lg text-gray-600">Memuat data transaksi...</span>
        </div>
      </div>
    </div>

    <div v-if="showDetailModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="closeDetailModal"></div>
      
      <div class="relative flex items-center justify-center min-h-screen p-4">
        <div class="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
          <div class="flex justify-between items-center p-6 border-b border-gray-200">
            <h3 class="text-xl font-semibold text-gray-900">Detail Transaksi</h3>
            <button @click="closeDetailModal" class="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <div v-if="selectedTransaction" class="p-6 overflow-y-auto max-h-[70vh]">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Kode Transaksi</label>
                  <p class="mt-1 text-sm text-gray-900 font-mono bg-gray-50 px-3 py-2 rounded">
                    {{ selectedTransaction.transaction_code || selectedTransaction.invoice_number }}
                  </p>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700">Tanggal Transaksi</label>
                  <p class="mt-1 text-sm text-gray-900">{{ formatDateNice(selectedTransaction.date) }}</p>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700">Metode Pembayaran</label>
                  <span 
                    :class="getPaymentMethodClass(selectedTransaction.payment_method)"
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1"
                  >
                    {{ selectedTransaction.payment_method?.toUpperCase() || 'TUNAI' }}
                  </span>
                </div>
              </div>
              
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Kasir</label>
                  <p class="mt-1 text-sm text-gray-900">{{ selectedTransaction.user?.name || 'Kasir' }}</p>
                </div>
                
                <div v-if="selectedTransaction.payment_method === 'tunai' && selectedTransaction.cash_received">
                  <label class="block text-sm font-medium text-gray-700">Detail Pembayaran</label>
                  <div class="mt-1 space-y-1 text-sm text-gray-900">
                    <div class="flex justify-between">
                      <span>Uang Diterima:</span>
                      <span>Rp {{ formatCurrency(selectedTransaction.cash_received) }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span>Kembalian:</span>
                      <span>Rp {{ formatCurrency(selectedTransaction.change_amount || 0) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h4 class="text-lg font-semibold text-gray-900 mb-4">Detail Barang</h4>
              
              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Barang</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Harga</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-for="detail in selectedTransaction.details" :key="detail.id">
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {{ detail.product?.name || 'Produk' }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        Rp {{ formatCurrency(detail.selling_price) }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {{ detail.quantity }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Rp {{ formatCurrency(detail.subtotal) }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div class="mt-6 bg-gray-50 p-4 rounded-lg">
                <div class="space-y-2">
                  <div class="flex justify-between text-sm">
                    <span class="text-gray-600">Subtotal:</span>
                    <span class="font-medium">Rp {{ formatCurrency(getSubtotalAmount(selectedTransaction)) }}</span>
                  </div>
                  
                  <div v-if="hasDiscount(selectedTransaction)" class="flex justify-between text-sm text-orange-600 bg-orange-50 px-2 py-1 rounded">
                    <span class="flex items-center gap-2">
                      Diskon {{ formatDiscountDisplay(selectedTransaction) }}
                      <span class="text-xs bg-orange-100 px-1.5 py-0.5 rounded text-orange-700">
                        {{ selectedTransaction.discount_type === 'percentage' ? 'Persentase' : 'Nominal' }}
                      </span>
                    </span>
                    <span class="font-bold">-Rp {{ formatCurrency(selectedTransaction.discount_amount || 0) }}</span>
                  </div>
                  
                  <div class="border-t border-gray-200 pt-2">
                    <div class="flex justify-between text-lg font-semibold">
                      <span>Total Bayar:</span>
                      <span class="text-indigo-600">Rp {{ formatCurrency(selectedTransaction.total_price) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showToast" 
        :class="toastType === 'success' ? 'bg-green-500' : 'bg-red-500'"
        class="fixed top-4 right-4 text-white px-6 py-3 rounded-lg shadow-lg z-50">
      <div class="flex items-center">
        <svg v-if="toastType === 'success'" class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
        </svg>
        <svg v-else class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
        </svg>
        <span>{{ toastMessage }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed, watch, onUnmounted } from 'vue'
import { transactionService, utils, discountHelpers, printHelpers } from '../../services/api'

export default {
  name: 'LaporanTransaksi',
  setup() {
    const transactions = ref([])
    const reportData = ref({
      total_revenue: 0,
      total_transactions: 0,
      total_items_sold: 0,
      total_discount: 0,
      sales: []
    })
    const filters = ref({
      start_date: '',
      end_date: '',
      payment_method: '',
      discount_filter: ''
    })
    const searchTerm = ref('')
    const showDetailModal = ref(false)
    const selectedTransaction = ref(null)
    const showToast = ref(false)
    const toastMessage = ref('')
    const toastType = ref('success')
    const loading = ref(false)
    const showFilterDropdown = ref(false)
    const showPrintMenu = ref(false)
    
    const filterApplied = ref(false)
    const lastAppliedFilters = ref({})
    
    const currentPage = ref(1)
    const itemsPerPage = ref(10)

    const handleClickOutside = (event) => {
      if (!event.target.closest('.relative')) {
        showFilterDropdown.value = false
        showPrintMenu.value = false
      }
    }

    onMounted(() => {
      document.addEventListener('click', handleClickOutside)
      fetchReportData()
    })

    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside)
    })

    const filteredTransactions = computed(() => {
      let transactions = reportData.value.sales || []
      
      if (filters.value.payment_method) {
        transactions = transactions.filter(transaction => 
          transaction.payment_method === filters.value.payment_method
        )
      }
      
      if (filters.value.discount_filter) {
        if (filters.value.discount_filter === 'with_discount') {
          transactions = transactions.filter(transaction => hasDiscount(transaction))
        } else if (filters.value.discount_filter === 'without_discount') {
          transactions = transactions.filter(transaction => !hasDiscount(transaction))
        }
      }
      
      if (searchTerm.value.trim()) {
        const term = searchTerm.value.toLowerCase().trim()
        
        const rangeMatch = term.match(/^(\w+\d+)\s*-\s*(\w+\d+)$/)
        
        if (rangeMatch) {
          const [, startCode, endCode] = rangeMatch
          
          transactions = transactions.filter(transaction => {
            const transactionCode = (transaction.transaction_code || transaction.invoice_number || '').toLowerCase()
            
            const extractNumber = (code) => {
              const match = code.match(/(\d+)$/)
              return match ? parseInt(match[1]) : 0
            }
            
            const extractPrefix = (code) => {
              const match = code.match(/^([a-z]+)/i)
              return match ? match[1].toLowerCase() : ''
            }
            
            const transactionNumber = extractNumber(transactionCode)
            const transactionPrefix = extractPrefix(transactionCode)
            
            const startNumber = extractNumber(startCode)
            const endNumber = extractNumber(endCode)
            const searchPrefix = extractPrefix(startCode)
            
            return transactionPrefix === searchPrefix && 
                   transactionNumber >= startNumber && 
                   transactionNumber <= endNumber
          })
        } else {
          transactions = transactions.filter(transaction => {
            const transactionCode = (transaction.transaction_code || transaction.invoice_number || '').toLowerCase()
            const userName = transaction.user?.name?.toLowerCase() || ''
            
            return transactionCode.includes(term) || userName.includes(term)
          })
        }
      }
        
      return transactions
    })

    const totalPages = computed(() => {
      return Math.ceil(filteredTransactions.value.length / itemsPerPage.value)
    })

    const currentPageData = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value
      const end = start + itemsPerPage.value
      return filteredTransactions.value.slice(start, end)
    })

    const visiblePages = computed(() => {
      const pages = []
      const maxVisible = 5
      let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
      let end = Math.min(totalPages.value, start + maxVisible - 1)
      
      if (end - start + 1 < maxVisible) {
        start = Math.max(1, end - maxVisible + 1)
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      
      return pages
    })

    watch(searchTerm, () => {
      currentPage.value = 1
    })

    const formatCurrency = utils.formatCurrency
    const formatNumber = (num) => new Intl.NumberFormat('id-ID').format(num)
    const formatDate = (dateString) => utils.formatDate(dateString)
    const formatDateNice = (dateString) => utils.formatDateNice(dateString)

    const getPaymentMethodClass = (paymentMethod) => {
      if (paymentMethod === 'qris') {
        return 'bg-blue-100 text-blue-800'
      }
      return 'bg-green-100 text-green-800'
    }

    const hasDiscount = (transaction) => {
      return transaction.discount_amount && parseFloat(transaction.discount_amount) > 0
    }

    const formatDiscountDisplay = (transaction) => {
      if (!hasDiscount(transaction)) return '-'
      
      const discountType = transaction.discount_type
      const discountValue = transaction.discount_value
      
      if (discountType === 'percentage') {
        return `${discountValue}%`
      } else {
        return `Rp ${formatCurrency(discountValue)}`
      }
    }

    const getSubtotalAmount = (transaction) => {
      if (transaction.details && transaction.details.length > 0) {
        return transaction.details.reduce((sum, detail) => sum + parseFloat(detail.subtotal || 0), 0)
      }
      
      const total = parseFloat(transaction.total_price || 0)
      const discount = parseFloat(transaction.discount_amount || 0)
      return total + discount
    }

    const getFilterButtonText = () => {
      const activeFilters = []
      
      if (filters.value.start_date || filters.value.end_date) activeFilters.push('Tanggal')
      if (filters.value.payment_method) activeFilters.push('Metode')
      if (filters.value.discount_filter) activeFilters.push('Diskon')
      if (searchTerm.value) {
        const rangeMatch = searchTerm.value.match(/^\w+\d+\s*-\s*\w+\d+$/)
        activeFilters.push(rangeMatch ? 'Range' : 'Pencarian')
      }
      
      if (activeFilters.length === 0) {
        return 'Filter & Cari Data'
      } else if (activeFilters.length === 1) {
        return `Filter: ${activeFilters[0]}`
      } else {
        return `Filter: ${activeFilters.length} aktif`
      }
    }

    const getFilterDescription = () => {
      const descriptions = []
      
      if (lastAppliedFilters.value.start_date && lastAppliedFilters.value.end_date) {
        descriptions.push(`Periode: ${formatDate(lastAppliedFilters.value.start_date)} - ${formatDate(lastAppliedFilters.value.end_date)}`)
      } else if (lastAppliedFilters.value.start_date) {
        descriptions.push(`Dari: ${formatDate(lastAppliedFilters.value.start_date)}`)
      } else if (lastAppliedFilters.value.end_date) {
        descriptions.push(`Sampai: ${formatDate(lastAppliedFilters.value.end_date)}`)
      }
      
      if (lastAppliedFilters.value.payment_method) {
        descriptions.push(`Metode: ${lastAppliedFilters.value.payment_method.toUpperCase()}`)
      }
      
      if (lastAppliedFilters.value.discount_filter) {
        const discountDesc = lastAppliedFilters.value.discount_filter === 'with_discount' 
          ? 'Dengan Diskon' 
          : 'Tanpa Diskon'
        descriptions.push(`Filter: ${discountDesc}`)
      }
      
      if (searchTerm.value) {
        const rangeMatch = searchTerm.value.match(/^\w+\d+\s*-\s*\w+\d+$/)
        if (rangeMatch) {
          const [startCode, endCode] = searchTerm.value.split(/\s*-\s*/)
          descriptions.push(`Range: "${startCode.toUpperCase()}-${endCode.toUpperCase()}"`)
        } else {
          descriptions.push(`Pencarian: "${searchTerm.value}"`)
        }
      }
      
      return descriptions.length > 0 ? descriptions.join(' | ') : 'Semua Data'
    }

    const fetchReportData = async () => {
      try {
        loading.value = true
        const response = await transactionService.getSalesReport(
          filters.value.start_date || null,
          filters.value.end_date || null
        )
        
        if (response.success) {
          const totalDiscount = response.data.sales.reduce((sum, sale) => {
            return sum + parseFloat(sale.discount_amount || 0)
          }, 0)
          
          reportData.value = {
            ...response.data,
            total_discount: totalDiscount
          }
          
          filterApplied.value = !!(filters.value.start_date || filters.value.end_date || filters.value.payment_method || filters.value.discount_filter || searchTerm.value)
          lastAppliedFilters.value = { ...filters.value }
          
          showToastNotification('Data berhasil dimuat!', 'success')
        } else {
          showToastNotification('Gagal memuat data laporan', 'error')
        }
      } catch (error) {
        showToastNotification('Terjadi kesalahan saat memuat data', 'error')
      } finally {
        loading.value = false
      }
    }

    const applyFilters = () => {
      currentPage.value = 1
      showFilterDropdown.value = false
      fetchReportData()
    }

    const clearFilters = () => {
      filters.value.start_date = ''
      filters.value.end_date = ''
      filters.value.payment_method = ''
      filters.value.discount_filter = ''
      searchTerm.value = ''
      currentPage.value = 1
      filterApplied.value = false
      lastAppliedFilters.value = {}
      showFilterDropdown.value = false
      
      fetchReportData()
      showToastNotification('Filter berhasil direset', 'success')
    }

    const viewTransactionDetail = (transaction) => {
      selectedTransaction.value = transaction
      showDetailModal.value = true
    }

    const closeDetailModal = () => {
      showDetailModal.value = false
      selectedTransaction.value = null
    }

const printReceipt = (transaction) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  
  // Import logo - pastikan path sesuai dengan struktur project Anda
  const logoPath = '/src/assets/logo/logo_kurma_gray.png'
  
  const cartItemsHtml = transaction.details.map(detail => 
    `<div style="margin-bottom: 3px;">
      <div style="font-weight: bold; font-size: 12px;">${detail.product.name}</div>
      <div style="display: flex; justify-content: space-between; font-size: 10px;">
        <span>${detail.quantity} x Rp ${formatCurrency(detail.selling_price)}</span>
        <span>Rp ${formatCurrency(detail.subtotal)}</span>
      </div>
    </div>`
  ).join('')

  const subtotalForReceipt = getSubtotalAmount(transaction)
  
  let discountHtml = ''
  if (hasDiscount(transaction)) {
    discountHtml = `
      <div style="border-top: 1px dashed #000; padding-top: 5px; margin-top: 5px;">
        <div style="display: flex; justify-content: space-between; font-size: 10px;">
          <span>Subtotal:</span>
          <span>Rp ${formatCurrency(subtotalForReceipt)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 10px;">
          <span>Diskon ${formatDiscountDisplay(transaction)}:</span>
          <span>-Rp ${formatCurrency(transaction.discount_amount)}</span>
        </div>
      </div>
    `
  }

  let paymentDetailsHtml = ''
  const paymentMethod = transaction.payment_method || 'tunai'
  
  if (paymentMethod === 'tunai') {
    if (transaction.cash_received && transaction.cash_received > 0) {
      const changeAmount = transaction.change_amount || 0
      paymentDetailsHtml = `
        <div style="border-top: 1px dashed #000; padding-top: 5px; margin-top: 5px;">
          <div style="display: flex; justify-content: space-between; font-size: 10px;">
            <span>Tunai:</span>
            <span>Rp ${formatCurrency(transaction.cash_received)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 10px;">
            <span>Kembalian:</span>
            <span>${changeAmount > 0 ? 'Rp ' + formatCurrency(changeAmount) : '-'}</span>
          </div>
        </div>
      `
    } else {
      paymentDetailsHtml = `
        <div style="border-top: 1px dashed #000; padding-top: 5px; margin-top: 5px;">
          <div style="display: flex; justify-content: space-between; font-size: 10px;">
            <span>Pembayaran:</span>
            <span>Tunai</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 10px;">
            <span>Kembalian:</span>
            <span>-</span>
          </div>
        </div>
      `
    }
  } else if (paymentMethod === 'qris') {
    paymentDetailsHtml = `
      <div style="border-top: 1px dashed #000; padding-top: 5px; margin-top: 5px;">
        <div style="display: flex; justify-content: space-between; font-size: 10px;">
          <span>Pembayaran:</span>
          <span>QRIS</span>
        </div>
        <div style="text-align: center; font-size: 9px; margin: 3px 0;">
          ✓ Pembayaran Digital Berhasil
        </div>
        <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 10px;">
          <span>Kembalian:</span>
          <span>-</span>
        </div>
      </div>
    `
  }

  const transactionDate = formatDate(transaction.date)

  const receiptContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Struk - ${transaction.transaction_code}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Consolas', monospace;
          font-size: 12px;
          line-height: 1.4;
          font-weight: bold;
          width: 80mm;
          margin: 0;
          padding: 0;
          color: #000;
        }
        
        .receipt-container {
          width: 100%;
          max-width: 58mm;
          padding: 0; 
        }
        
        .header {
          text-align: center;
          margin-bottom: 8px;
          border-bottom: 1px dashed #000;
          padding-bottom: 5px;
        }
        
        .logo {
          width: 100px;
          height: 100px;
          margin: 5px auto 10px auto;
          display: block;
          /* Filter khusus untuk perjelas detail pohon/buah tanpa gelapkan tulisan */
          filter: 
            contrast(2.5)         /* Kontras sedang untuk perjelas abu-abu */
            brightness(0.6)       /* Sedikit gelap untuk solidkan detail */
            saturate(0);          /* Hilangkan warna */
          
          /* Rendering tajam */
          image-rendering: -webkit-optimize-contrast;
          image-rendering: -moz-crisp-edges;
          image-rendering: crisp-edges;
          image-rendering: pixelated;
          
          /* Print optimization */
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        
        .header h3 {
          font-size: 12px;
          font-weight: bold;
          margin-bottom: 2px;
          line-height: 1.1;
        }
        
        .header p {
          font-size: 9px;
          margin: 1px 0;
        }
        
        .transaction-info {
          margin-bottom: 8px;
          font-size: 10px;
          border-bottom: 1px dashed #000;
          padding-bottom: 5px;
        }
        
        .transaction-info p {
          margin: 1px 0;
          display: flex;
          justify-content: flex-start;
          align-items: center;
        }
        
        .transaction-info .label {
          width: 60px;
          display: inline-block;
          margin-right: 5px;
        }
        
        .transaction-info .value {
          flex: 1;
        }
        
        .items-section {
          border-bottom: 1px dashed #000;
          padding-bottom: 5px;
          margin-bottom: 5px;
        }
        
        .total-section {
          text-align: right;
          font-size: 11px;
          margin-top: 5px;
        }
        
        .total-section p {
          margin: 2px 0;
        }
        
        .grand-total {
          font-weight: bold;
          font-size: 12px;
        }
        
        .footer {
          text-align: center;
          margin-top: 10px;
          font-size: 9px;
          border-top: 1px dashed #000;
          padding-top: 5px;
        }
        
        .footer p {
          margin: 1px 0;
        }
        
        @page {
          size: 80mm auto;
          margin: 0;
        }
        
        @media print {
          body {
            width: 58mm;
            margin: 0;
            padding: 0mm;
          }
          
          .receipt-container {
            width: 80mm;
          }
          
          * {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          .logo {
            /* Filter print untuk perjelas detail pohon/buah */
            filter: 
              contrast(3.5)         /* Kontras lebih tinggi saat print */
              brightness(0.5)       /* Sedikit lebih gelap untuk detail */
              saturate(0);          /* Hilangkan warna */
            
            /* Rendering setting */
            image-rendering: pixelated !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      </style>
    </head>
    <body>
      <div class="receipt-container">
        <div class="header">
          <!-- Logo sama seperti printReceiptFromData -->
          <img src="${logoPath}" alt="Logo Grosir Kurma Pontianak" class="logo" onerror="console.log('Logo gagal dimuat'); this.style.display='none';">
          <!-- Hilangkan text title karena sudah ada di logo -->
          <p>Jl. Mitra Perdana No.5, Parit Tokaya</p>
          <p>Kec. Pontianak Sel., Kota Pontianak</p>
          <p>Kalimantan Barat 78115</p>
          <p>Telp: 0812-2100-6766</p>
        </div>
        
        <div class="transaction-info">
          <p><span class="label">Kode</span><span class="value">: ${transaction.transaction_code}</span></p>
          <p><span class="label">Tanggal</span><span class="value">: ${transactionDate}</span></p>
          <p><span class="label">Kasir</span><span class="value">: ${transaction.user?.name || 'Kasir'}</span></p>
          <p><span class="label">Metode</span><span class="value">: ${paymentMethod.toUpperCase()}</span></p>
        </div>
        
        <div class="items-section">
          ${cartItemsHtml}
        </div>
        
        ${discountHtml}
        
        <div class="total-section">
          <p class="grand-total">TOTAL: Rp ${formatCurrency(transaction.total_price)}</p>
          ${paymentDetailsHtml}
        </div>
        
        <div class="footer">
          <p>Terima kasih atas kunjungan Anda!</p>
          <p>Jangan Lupa Datang Kembali :)</p>
        </div>
      </div>
    </body>
    </html>
  `
  
  const printWindow = window.open('', '_blank', 'width=220,height=600')
  if (printWindow) {
    printWindow.document.write(receiptContent)
    printWindow.document.close()
    
    printWindow.onload = function() {
      setTimeout(() => {
        printWindow.print()
        printWindow.close()
      }, 500)
    }
  }
}

   const printReport = (format = 'compact') => {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const currentDate = new Date()
  
  let filterInfo = 'Semua Transaksi'
  if (filters.value.start_date && filters.value.end_date) {
    filterInfo = `Periode: ${formatDate(filters.value.start_date)} - ${formatDate(filters.value.end_date)}`
  } else if (filters.value.start_date) {
    filterInfo = `Dari: ${formatDate(filters.value.start_date)}`
  } else if (filters.value.end_date) {
    filterInfo = `Sampai: ${formatDate(filters.value.end_date)}`
  }

  if (filters.value.payment_method) {
    filterInfo += ` | Metode: ${filters.value.payment_method.toUpperCase()}`
  }

  if (filters.value.discount_filter) {
    const discountDesc = filters.value.discount_filter === 'with_discount' 
      ? 'Dengan Diskon' 
      : 'Tanpa Diskon'
    filterInfo += ` | Filter: ${discountDesc}`
  }

  const grandTotal = filteredTransactions.value.reduce((total, transaction) => total + parseFloat(transaction.total_price || 0), 0)
  const totalDiscount = filteredTransactions.value.reduce((total, transaction) => total + parseFloat(transaction.discount_amount || 0), 0)
  const totalSubtotal = filteredTransactions.value.reduce((total, transaction) => total + getSubtotalAmount(transaction), 0)
  const totalItems = filteredTransactions.value.reduce((total, transaction) => {
    return total + (transaction.details ? transaction.details.reduce((sum, detail) => sum + detail.quantity, 0) : 1)
  }, 0)

  const reportDate = utils.formatDateNice(currentDate)
  showPrintMenu.value = false

  if (format === 'a4') {
    printA4Report(filterInfo, grandTotal, totalDiscount, totalSubtotal, totalItems, reportDate, user)
  } else {
    printCompactReport(filterInfo, grandTotal, totalDiscount, totalSubtotal, totalItems, reportDate, user)
  }
}

const printA4Report = (filterInfo, grandTotal, totalDiscount, totalSubtotal, totalItems, reportDate, user) => {
  const tableRows = filteredTransactions.value.map((transaction, index) => {
    const itemCount = transaction.details ? transaction.details.reduce((total, detail) => total + detail.quantity, 0) : 1
    const subtotal = getSubtotalAmount(transaction)
    const discountDisplay = hasDiscount(transaction) 
      ? formatDiscountDisplay(transaction)
      : '-'
    const discountAmount = hasDiscount(transaction) 
      ? formatCurrency(transaction.discount_amount)
      : '-'

    return `<tr>
      <td class="border-cell text-center">${index + 1}</td>
      <td class="border-cell text-center date-cell">${formatDate(transaction.date)}</td>
      <td class="border-cell text-center code-cell">${transaction.transaction_code}</td>
      <td class="border-cell">${transaction.user?.name || 'Pembeli'}</td>
      <td class="border-cell text-center">${itemCount}</td>
      <td class="border-cell text-right">${formatCurrency(subtotal)}</td>
      <td class="border-cell text-center">${discountDisplay}</td>
      <td class="border-cell text-right">${discountAmount}</td>
      <td class="border-cell text-right total-cell">${formatCurrency(transaction.total_price)}</td>
    </tr>`
  }).join('')

  // Baris Total di bawah tabel
  const totalRow = `
    <tr class="total-row">
      <td class="border-cell text-center" colspan="4"><strong>TOTAL</strong></td>
      <td class="border-cell text-center"><strong>${totalItems}</strong></td>
      <td class="border-cell text-right"><strong>${formatCurrency(totalSubtotal)}</strong></td>
      <td class="border-cell text-center">-</td>
      <td class="border-cell text-right"><strong>${formatCurrency(totalDiscount)}</strong></td>
      <td class="border-cell text-right total-cell"><strong>${formatCurrency(grandTotal)}</strong></td>
    </tr>`

  const reportContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Laporan Transaksi - GROSIR KURMA PONTIANAK</title>
        <meta charset="UTF-8">
        <style>
          @page {
            size: A4;
            margin: 20mm 15mm;
          }
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Arial', sans-serif;
            font-size: 11px;
            line-height: 1.4;
            color: #333;
            max-width: 180mm;
            margin: 0 auto;
          }
          
          /* Header Perusahaan */
          .company-header {
            text-align: center;
            margin-bottom: 25px;
            padding-bottom: 20px;
            border-bottom: 3px double #333;
          }
          .company-name {
            font-size: 22px;
            font-weight: bold;
            color: #1e40af;
            margin-bottom: 8px;
            letter-spacing: 1px;
          }
          .company-address {
            font-size: 12px;
            color: #555;
            line-height: 1.4;
            margin-bottom: 3px;
          }
          .company-phone {
            font-size: 12px;
            color: #555;
            font-weight: 500;
          }
          
          /* Judul Laporan */
          .report-title {
            text-align: center;
            margin: 20px 0;
            font-size: 16px;
            font-weight: bold;
            text-decoration: underline;
            color: #333;
          }
          
          .info-section {
            background-color: #f8f9fa;
            padding: 12px;
            border-radius: 5px;
            border: 1px solid #dee2e6;
            margin-bottom: 20px;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
            font-size: 11px;
          }
          .info-label {
            font-weight: bold;
            color: #495057;
          }
          
          /* Tabel */
          .report-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            background: white;
          }
          .report-table th {
            background: #2c3e50;
            color: white;
            font-weight: bold;
            font-size: 10px;
            text-align: center;
            padding: 8px 5px;
            border: 1px solid #2c3e50;
          }
          .border-cell {
            border: 1px solid #ddd;
            padding: 6px 5px;
            font-size: 10px;
          }
          .code-cell {
            font-family: 'Courier New', monospace;
            font-weight: 600;
            background-color: #f8f9fa;
          }
          .date-cell {
            white-space: nowrap;
          }
          .total-cell {
            font-weight: bold;
            color: #28a745;
          }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .text-left { text-align: left; }
          
          /* Baris Total */
          .total-row {
            background-color: #e9ecef;
            font-weight: bold;
          }
          .total-row td {
            border: 2px solid #495057;
            padding: 8px 5px;
          }
          
          /* Ringkasan */
          .summary-section {
            margin-top: 25px;
            display: flex;
            justify-content: flex-end;
          }
          .summary-box {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            border: 2px solid #495057;
            border-radius: 8px;
            padding: 15px;
            width: 300px;
          }
          .summary-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 12px;
          }
          .summary-total {
            border-top: 2px solid #333;
            padding-top: 8px;
            margin-top: 8px;
            font-size: 14px;
            font-weight: bold;
            color: #1e40af;
          }
          
          /* Footer */
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #dee2e6;
            text-align: center;
            font-size: 10px;
            color: #6c757d;
          }
          .footer-info {
            margin-bottom: 5px;
          }
          
          @media print {
            body { 
              font-size: 10px;
            }
            .report-table th { 
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .total-row {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
        </style>
      </head>
      <body>
        <!-- Header Perusahaan -->
        <div class="company-header">
          <div class="company-name">GROSIR KURMA PONTIANAK</div>
          <div class="company-address">Jl. Mitra Perdana No.5, Parit Tokaya, Kec. Pontianak Sel.</div>
          <div class="company-address">Kota Pontianak, Kalimantan Barat 78115</div>
          <div class="company-phone">Telepon: 0812-2100-6766</div>
        </div>

        <!-- Judul Laporan -->
        <div class="report-title">LAPORAN TRANSAKSI PENJUALAN</div>

        <!-- Info Filter -->
        <div class="info-section">
          <div class="info-row">
            <span class="info-label">Filter Laporan:</span>
            <span>${filterInfo}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Jumlah Transaksi:</span>
            <span>${filteredTransactions.value.length} Transaksi</span>
          </div>
          <div class="info-row">
            <span class="info-label">Dicetak:</span>
            <span>${reportDate} oleh ${user.name || 'Administrator'}</span>
          </div>
        </div>

        <!-- Tabel Transaksi -->
        <table class="report-table">
          <thead>
            <tr>
              <th style="width: 5%;">No</th>
              <th style="width: 11%;">Tanggal</th>
              <th style="width: 14%;">Kode Transaksi</th>
              <th style="width: 16%;">Penjual</th>
              <th style="width: 8%;">Item</th>
              <th style="width: 13%;">Subtotal</th>
              <th style="width: 10%;">Diskon</th>
              <th style="width: 11%;">Jumlah Diskon</th>
              <th style="width: 13%;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
            ${totalRow}
          </tbody>
        </table>

          </div>
        </div>

        <!-- Footer -->
        <div class="footer">
          <div class="footer-info">
            <strong>GROSIR KURMA PONTIANAK</strong>
          </div>
          <div class="footer-info">
            © 2024 
          </div>
        </div>
      </body>
    </html>
  `

  const printWindow = window.open('', '_blank')
  if (printWindow) {
    printWindow.document.write(reportContent)
    printWindow.document.close()
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 500)
    showToastNotification('Laporan A4 berhasil dicetak!', 'success')
  } else {
    showToastNotification('Gagal membuka window print!', 'error')
  }
}

const printCompactReport = (filterInfo, grandTotal, totalDiscount, totalSubtotal, totalItems, reportDate, user) => {
  const tableRows = filteredTransactions.value.map((transaction, index) => {
    const itemCount = transaction.details ? transaction.details.reduce((total, detail) => total + detail.quantity, 0) : 1
    const subtotal = getSubtotalAmount(transaction)
    const discountDisplay = hasDiscount(transaction) 
      ? `${formatDiscountDisplay(transaction)}` 
      : '-'
    const discountAmount = hasDiscount(transaction) 
      ? formatCurrency(transaction.discount_amount)
      : '-'

    return `<tr>
      <td style="border: 1px solid #000; padding: 4px; text-align: center;">${index + 1}</td>
      <td style="border: 1px solid #000; padding: 4px; text-align: center; font-size: 9px;">${formatDate(transaction.date)}</td>
      <td style="border: 1px solid #000; padding: 4px; text-align: center; font-size: 9px;">${transaction.transaction_code}</td>
      <td style="border: 1px solid #000; padding: 4px; text-align: left;">${transaction.user?.name || 'Pembeli'}</td>
      <td style="border: 1px solid #000; padding: 4px; text-align: center;">${itemCount}</td>
      <td style="border: 1px solid #000; padding: 4px; text-align: right;">Rp. ${formatCurrency(subtotal)}</td>
      <td style="border: 1px solid #000; padding: 4px; text-align: center; font-size: 9px;">${discountDisplay}</td>
      <td style="border: 1px solid #000; padding: 4px; text-align: right;">Rp. ${discountAmount}</td>
      <td style="border: 1px solid #000; padding: 4px; text-align: right; font-weight: bold;">Rp. ${formatCurrency(transaction.total_price)}</td>
    </tr>`
  }).join('')

  // Baris Total
  const totalRow = `
    <tr style="background-color: #f0f0f0; font-weight: bold;">
      <td style="border: 2px solid #000; padding: 6px; text-align: center;" colspan="4">TOTAL</td>
      <td style="border: 2px solid #000; padding: 6px; text-align: center;">${totalItems}</td>
      <td style="border: 2px solid #000; padding: 6px; text-align: right;">Rp. ${formatCurrency(totalSubtotal)}</td>
      <td style="border: 2px solid #000; padding: 6px; text-align: center;">-</td>
      <td style="border: 2px solid #000; padding: 6px; text-align: right;">Rp. ${formatCurrency(totalDiscount)}</td>
      <td style="border: 2px solid #000; padding: 6px; text-align: right;">Rp. ${formatCurrency(grandTotal)}</td>
    </tr>`

  const reportContent = `
    <html>
      <head>
        <title>Laporan Transaksi - GROSIR KURMA PONTIANAK</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 10px; 
            font-size: 11px; 
          }
          .company-header {
            text-align: center;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 2px solid #000;
          }
          .company-name {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          .company-info {
            font-size: 10px;
            line-height: 1.3;
          }
          .report-title {
            text-align: center;
            font-size: 14px;
            font-weight: bold;
            margin: 15px 0;
            text-decoration: underline;
          }
          .info {
            margin-bottom: 15px;
            font-size: 9px;
            padding: 8px;
          }
          .table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 15px; 
          }
          .table th { 
            border: 1px solid #000; 
            padding: 6px; 
            text-align: center; 
            background-color: #333; 
            color: white;
            font-weight: bold; 
            font-size: 10px; 
          }
          .table td { 
            border: 1px solid #000; 
            padding: 4px; 
            font-size: 9px; 
          }
          .summary {
            margin-top: 20px;
            padding: 10px;
            background-color: #f9f9f9;
            border: 1px solid #333;
            text-align: right;
          }
          .summary-item {
            margin: 5px 0;
            font-size: 11px;
          }
          .grand-total {
            border-top: 2px solid #333;
            padding-top: 8px;
            margin-top: 8px;
            font-size: 13px;
            font-weight: bold;
          }
          .footer {
            margin-top: 25px;
            text-align: center;
            font-size: 9px;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 10px;
          }
          @media print {
            body { margin: 0; }
            .table th { 
              background-color: #333 !important; 
              color: white !important;
              -webkit-print-color-adjust: exact; 
            }
          }
        </style>
      </head>
      <body>
        <!-- Header Perusahaan -->
        <div class="company-header">
          <div class="company-name">GROSIR KURMA PONTIANAK</div>
          <div class="company-info">
            Jl. Mitra Perdana No.5, Parit Tokaya, Kec. Pontianak Sel.<br>
            Kota Pontianak, Kalimantan Barat 78115<br>
            Telepon: 0812-2100-6766
          </div>
        </div>

        <!-- Judul -->
        <div class="report-title">LAPORAN TRANSAKSI</div>

        <!-- Info -->
        <div class="info">
          ${filterInfo}<br>
          ${reportDate} oleh ${user.name || 'Admin'}
        </div>

        <!-- Tabel -->
        <table class="table">
          <thead>
            <tr>
              <th style="width: 4%;">No</th>
              <th style="width: 10%;">Tanggal</th>
              <th style="width: 13%;">Kode</th>
              <th style="width: 15%;">Penjual</th>
              <th style="width: 8%;">Item</th>
              <th style="width: 13%;">Subtotal</th>
              <th style="width: 10%;">Diskon</th>
              <th style="width: 12%;">Jumlah Diskon</th>
              <th style="width: 15%;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
            ${totalRow}
          </tbody>
        </table>

        <!-- Footer -->
        <div class="footer">
          © 2024 GROSIR KURMA PONTIANAK 
        </div>
      </body>
    </html>
  `

  const printWindow = window.open('', '_blank')
  if (printWindow) {
    printWindow.document.write(reportContent)
    printWindow.document.close()
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 500)
    showToastNotification('Laporan berhasil dicetak!', 'success')
  } else {
    showToastNotification('Gagal membuka window print!', 'error')
  }
    }

    const showToastNotification = (message, type = 'success') => {
      toastMessage.value = message
      toastType.value = type
      showToast.value = true
      setTimeout(() => {
        showToast.value = false
      }, 3000)
    }

    return {
      reportData,
      filters,
      searchTerm,
      showDetailModal,
      selectedTransaction,
      showToast,
      toastMessage,
      toastType,
      loading,
      currentPage,
      itemsPerPage,
      filterApplied,
      lastAppliedFilters,
      showFilterDropdown,
      showPrintMenu,
      
      filteredTransactions,
      totalPages,
      currentPageData,
      visiblePages,
      
      formatCurrency,
      formatNumber,
      formatDate,
      formatDateNice,
      getPaymentMethodClass,
      getFilterDescription,
      getFilterButtonText,
      hasDiscount,
      formatDiscountDisplay,
      getSubtotalAmount,
      applyFilters,
      clearFilters,
      viewTransactionDetail,
      closeDetailModal,
      printReceipt,
      printReport,
      showToastNotification
    }
  }
}
</script>

<style scoped>
@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.fixed.top-4.right-4 {
  animation: slideInRight 0.3s ease-out;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

.backdrop-blur-sm {
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

button:hover {
  transform: translateY(-1px);
  transition: transform 0.2s ease;
}

button:active {
  transform: translateY(0);
}

input:focus, select:focus {
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

tbody tr:hover {
  background-color: #f9fafb;
}

.bg-blue-50 {
  background-color: #eff6ff;
}

.border-blue-200 {
  border-color: #bfdbfe;
}

button[disabled] {
  opacity: 0.6;
  cursor: not-allowed;
}

.rotate-180 {
  transform: rotate(180deg);
  transition: transform 0.2s ease;
}

@media (max-width: 1024px) {
  .grid-cols-1.md\:grid-cols-3 { 
    grid-template-columns: 1fr; 
  }
  .flex.flex-col.lg\:flex-row { 
    flex-direction: column; 
  }
}

@media (max-width: 640px) {
  .grid-cols-1.md\:grid-cols-2 { 
    grid-template-columns: 1fr; 
  }
  .flex.flex-col.sm\:flex-row { 
    flex-direction: column; 
  }
  
  .absolute.right-0.mt-2.w-80 {
    right: auto;
    left: 0;
    width: 100vw;
    max-width: calc(100vw - 2rem);
  }
}

@media print { 
  .no-print { 
    display: none !important; 
  } 
}
</style>