<template>
  <div class="p-3 sm:p-4 lg:p-6">
    <!-- Breadcrumb - Hidden on mobile -->
    <nav class="hidden sm:flex mb-4 lg:mb-6" aria-label="Breadcrumb">
      <ol class="inline-flex items-center space-x-1 md:space-x-3">
        <li class="inline-flex items-center">
          <span class="text-gray-500 text-sm">Home</span>
        </li>
        <li>
          <div class="flex items-center">
            <span class="text-gray-400">/</span>
            <span class="ml-1 text-gray-500 text-sm">Dashboard</span>
          </div>
        </li>
      </ol>
    </nav>

    <!-- Hero Section - Responsive -->
    <div class="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-4 sm:p-6 mb-4 sm:mb-6 text-white">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div class="mb-4 sm:mb-0">
          <h2 class="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">Selamat Datang, {{ getUserInfo() }}!</h2>
          <p class="text-blue-100 text-sm sm:text-base mb-3 sm:mb-4">Mulai transaksi baru dan kelola penjualan Anda</p>
          <router-link 
            to="/kasir/transaksi"
            class="bg-white text-blue-600 hover:bg-blue-50 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium inline-flex items-center transition-colors text-sm sm:text-base w-full sm:w-auto justify-center sm:justify-start"
          >
            <svg class="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 7h-3V6a4 4 0 0 0-8 0v1H5a1 1 0 0 0-1 1v11a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V8a1 1 0 0 0-1-1zM10 6a2 2 0 0 1 4 0v1h-4V6zm8 13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V9h2v1a1 1 0 0 0 2 0V9h4v1a1 1 0 0 0 2 0V9h2v10z"/>
            </svg>
            Mulai Transaksi Baru
          </router-link>
        </div>
        <div class="hidden sm:block lg:block">
          <svg class="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 text-blue-300" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 7h-3V6a4 4 0 0 0-8 0v1H5a1 1 0 0 0-1 1v11a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V8a1 1 0 0 0-1-1zM10 6a2 2 0 0 1 4 0v1h-4V6zm8 13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V9h2v1a1 1 0 0 0 2 0V9h4v1a1 1 0 0 0 2 0V9h2v10z"/>
          </svg>
        </div>
      </div>
    </div>

    <!-- Loading State - Responsive -->
    <div v-if="loading" class="text-center py-6 sm:py-8">
      <div class="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600 mx-auto mb-3 sm:mb-4"></div>
      <p class="text-gray-500 text-sm sm:text-base">Memuat data dashboard...</p>
    </div>

    <!-- Stats Cards - Responsive Grid -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
      <!-- Total Produk -->
      <div class="bg-gradient-to-br from-green-400 to-green-600 rounded-lg p-4 sm:p-6 text-white relative overflow-hidden">
        <div class="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 transform translate-x-4 sm:translate-x-6 -translate-y-4 sm:-translate-y-6">
          <div class="w-full h-full bg-white/10 rounded-full"></div>
        </div>
        <div class="relative">
          <div class="flex items-center mb-2">
            <svg class="w-6 h-6 sm:w-8 sm:h-8 mr-2 sm:mr-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 7h-3V6a4 4 0 0 0-8 0v1H5a1 1 0 0 0-1 1v11a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V8a1 1 0 0 0-1-1zM10 6a2 2 0 0 1 4 0v1h-4V6zm8 13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V9h2v1a1 1 0 0 0 2 0V9h4v1a1 1 0 0 0 2 0V9h2v10z"/>
            </svg>
            <span class="text-2xl sm:text-3xl font-bold">{{ stats.totalProducts }}</span>
          </div>
          <p class="text-green-100 text-sm sm:text-base">Total Produk</p>
        </div>
      </div>

      <!-- Transaksi Hari Ini -->
      <div class="bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg p-4 sm:p-6 text-white relative overflow-hidden">
        <div class="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 transform translate-x-4 sm:translate-x-6 -translate-y-4 sm:-translate-y-6">
          <div class="w-full h-full bg-white/10 rounded-full"></div>
        </div>
        <div class="relative">
          <div class="flex items-center mb-2">
            <svg class="w-6 h-6 sm:w-8 sm:h-8 mr-2 sm:mr-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            <span class="text-2xl sm:text-3xl font-bold">{{ stats.todayTransactions }}</span>
          </div>
          <p class="text-blue-100 text-sm sm:text-base">Transaksi Hari Ini</p>
        </div>
      </div>

      <!-- Item Terjual - Full width on mobile, normal on larger screens -->
      <div class="bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg p-4 sm:p-6 text-white relative overflow-hidden sm:col-span-2 lg:col-span-1">
        <div class="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 transform translate-x-4 sm:translate-x-6 -translate-y-4 sm:-translate-y-6">
          <div class="w-full h-full bg-white/10 rounded-full"></div>
        </div>
        <div class="relative">
          <div class="flex items-center mb-2">
            <svg class="w-6 h-6 sm:w-8 sm:h-8 mr-2 sm:mr-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
            <span class="text-2xl sm:text-3xl font-bold">{{ stats.itemsSold }}</span>
          </div>
          <p class="text-purple-100 text-sm sm:text-base">Item Terjual Hari Ini</p>
        </div>
      </div>
    </div>

    <!-- Recent Transactions Card - Responsive with Pagination -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200">
      <div class="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 bg-gray-50">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div class="flex items-center mb-2 sm:mb-0">
            <h2 class="text-base sm:text-lg font-semibold text-gray-900 mr-3">Transaksi Terbaru</h2>
            <span v-if="recentTransactions.length > 0" class="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {{ recentTransactions.length }} dari {{ totalTransactions }}
            </span>
          </div>
          <button 
            @click="loadDashboardData"
            class="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center justify-center sm:justify-start"
          >
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            Refresh
          </button>
        </div>
      </div>
      
      <div class="p-4 sm:p-6">
        <!-- Loading State -->
        <div v-if="loadingTransactions" class="text-center py-6 sm:py-8">
          <div class="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p class="text-gray-500 text-sm">Memuat transaksi terbaru...</p>
        </div>
        
        <!-- Transactions List - Mobile Optimized with Pagination -->
        <div v-else-if="recentTransactions.length > 0">
          <div class="space-y-3 mb-4">
            <div v-for="transaction in paginatedTransactions" :key="transaction.id" 
                 class="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div class="flex items-center mb-2 sm:mb-0">
                <div class="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0">
                  <svg class="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                </div>
                <div class="min-w-0 flex-1">
                  <p class="font-medium text-gray-900 text-sm sm:text-base truncate">{{ transaction.transaction_code }}</p>
                  <!-- FIXED: PRIORITAS created_at dulu, baru date -->
                  <p class="text-xs sm:text-sm text-gray-500">{{ formatTime(transaction.created_at || transaction.date) }}</p>
                </div>
              </div>
              <div class="text-left sm:text-right ml-11 sm:ml-0">
                <p class="font-medium text-gray-900 text-sm sm:text-base">Rp {{ formatCurrency(transaction.total_price) }}</p>
                <p class="text-xs sm:text-sm text-gray-500">{{ transaction.items_count }} item</p>
              </div>
            </div>
          </div>

          <!-- Pagination Controls -->
          <div v-if="totalPages > 1" class="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-gray-200">
            <div class="text-sm text-gray-700 mb-3 sm:mb-0">
              Menampilkan {{ startIndex + 1 }} - {{ endIndex }} dari {{ recentTransactions.length }} transaksi
            </div>
            
            <div class="flex items-center space-x-2">
              <!-- Previous Button -->
              <button
                @click="previousPage"
                :disabled="currentPage === 1"
                class="px-3 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                </svg>
              </button>
              
              <!-- Page Numbers -->
              <div class="flex space-x-1">
                <button
                  v-for="page in visiblePages"
                  :key="page"
                  @click="goToPage(page)"
                  :class="[
                    'px-3 py-1 text-sm font-medium rounded-md',
                    currentPage === page
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                  ]"
                >
                  {{ page }}
                </button>
              </div>
              
              <!-- Next Button -->
              <button
                @click="nextPage"
                :disabled="currentPage === totalPages"
                class="px-3 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        <!-- Empty State - Mobile Optimized -->
        <div v-else class="text-center py-6 sm:py-8">
          <svg class="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          <h3 class="text-base sm:text-lg font-medium text-gray-900 mb-1 sm:mb-2">Belum ada transaksi</h3>
          <p class="text-gray-500 text-sm sm:text-base mb-3 sm:mb-4">Mulai transaksi pertama Anda hari ini</p>
          <router-link 
            to="/kasir/transaksi"
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium inline-flex items-center text-sm sm:text-base"
          >
            <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 7h-3V6a4 4 0 0 0-8 0v1H5a1 1 0 0 0-1 1v11a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V8a1 1 0 0 0-1-1zM10 6a2 2 0 0 1 4 0v1h-4V6zm8 13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V9h2v1a1 1 0 0 0 2 0V9h4v1a1 1 0 0 0 2 0V9h2v10z"/>
            </svg>
            Mulai Transaksi
          </router-link>
        </div>
      </div>
    </div>

    <!-- Toast Notification - Mobile Optimized -->
    <div v-if="showToast" 
         :class="toastType === 'success' ? 'bg-green-500' : 'bg-red-500'"
         class="fixed top-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-auto text-white px-4 sm:px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300">
      <div class="flex items-center">
        <svg v-if="toastType === 'success'" class="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
        </svg>
        <svg v-else class="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
        </svg>
        <span class="text-sm sm:text-base">{{ toastMessage }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { utils } from '../../../services/api'

export default {
  name: 'KasirDashboard',
  setup() {
    const loading = ref(true)
    const loadingTransactions = ref(false)
    
    const showToast = ref(false)
    const toastMessage = ref('')
    const toastType = ref('success')
    
    const stats = ref({
      totalProducts: 0,
      todayTransactions: 0,
      itemsSold: 0
    })
    
    const recentTransactions = ref([])
    const totalTransactions = ref(0)
    
    // Pagination state
    const currentPage = ref(1)
    const itemsPerPage = 10
    
    let idleTimer = null
    let refreshInterval = null
    
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
    
    // Computed properties for pagination
    const totalPages = computed(() => {
      return Math.ceil(recentTransactions.value.length / itemsPerPage)
    })
    
    const startIndex = computed(() => {
      return (currentPage.value - 1) * itemsPerPage
    })
    
    const endIndex = computed(() => {
      return Math.min(startIndex.value + itemsPerPage, recentTransactions.value.length)
    })
    
    const paginatedTransactions = computed(() => {
      return recentTransactions.value.slice(startIndex.value, endIndex.value)
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
    
    // Pagination methods
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
    
    const goToPage = (page) => {
      currentPage.value = page
    }
    
    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('id-ID').format(amount)
    }
    
    // FUNGSI UNTUK MENDAPATKAN TANGGAL HARI INI DALAM FORMAT YANG BENAR
    const getTodayInCorrectFormat = () => {
      const now = new Date()
      
      // Coba beberapa format yang mungkin digunakan database
      const formats = {
        iso: now.toISOString().split('T')[0], // 2025-07-06
        localDate: now.getFullYear() + '-' + 
          String(now.getMonth() + 1).padStart(2, '0') + '-' + 
          String(now.getDate()).padStart(2, '0'), // 2025-07-06
        dateString: now.toDateString(), // Sun Jul 06 2025
        localString: now.toLocaleDateString('en-CA') // 2025-07-06 (Canadian format = ISO)
      }
      
      console.log('Today in different formats:', formats)
      return formats
    }
    
    // FUNGSI UNTUK EXTRACT TANGGAL DARI STRING DATABASE
    const extractDateFromDatabaseString = (dateString) => {
      if (!dateString) return null
      
      try {
        // Parse ke Date object
        const date = new Date(dateString)
        
        if (isNaN(date.getTime())) {
          console.error('Invalid date:', dateString)
          return null
        }
        
        // Extract tanggal dalam format YYYY-MM-DD
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        
        const extractedDate = `${year}-${month}-${day}`
        
        console.log('Date extraction:', {
          original: dateString,
          parsed: date.toString(),
          extracted: extractedDate
        })
        
        return extractedDate
      } catch (error) {
        console.error('Error extracting date:', dateString, error)
        return null
      }
    }
    
    // FORMAT WAKTU YANG SUDAH DIPERBAIKI
    const formatTime = (dateString) => {
      if (!dateString) {
        return 'Waktu tidak tersedia'
      }
      
      try {
        const date = new Date(dateString)
        
        if (isNaN(date.getTime())) {
          return 'Format waktu tidak valid'
        }
        
        // Cek apakah hari ini dengan cara yang lebih robust
        const now = new Date()
        const isToday = (
          date.getDate() === now.getDate() &&
          date.getMonth() === now.getMonth() &&
          date.getFullYear() === now.getFullYear()
        )
        
        if (isToday) {
          const timeString = date.toLocaleTimeString('id-ID', { 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit',
            hour12: false
          })
          return `Hari ini, ${timeString}`
        } else {
          return date.toLocaleDateString('id-ID', { 
            day: '2-digit', 
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          })
        }
        
      } catch (error) {
        console.error('formatTime error:', error)
        return 'Error parsing date'
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
    
    const apiCall = async (endpoint, options = {}) => {
      try {
        const token = localStorage.getItem('token')
        
        if (!token) {
          console.warn('No auth token found')
          throw new Error('Token not found')
        }
        
        console.log(`Making API call to: ${API_BASE_URL}${endpoint}`)
        
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            ...options.headers
          },
          ...options
        })
        
        console.log(`API Response status: ${response.status}`)
        
        const data = await response.json()
        
        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            throw new Error('Session expired. Please login again.')
          }
          throw new Error(data.message || `HTTP error! status: ${response.status}`)
        }
        
        return data
      } catch (error) {
        console.error(`API Error (${endpoint}):`, error)
        throw error
      }
    }
    
    const loadProductsCount = async () => {
      try {
        console.log('Loading products count...')
        const response = await apiCall('/products')
        if (response.success) {
          stats.value.totalProducts = response.data.length
          console.log(`Total products loaded: ${response.data.length}`)
        }
      } catch (error) {
        console.error('Error loading products count:', error)
        stats.value.totalProducts = 0
        showToastNotification('Gagal memuat data produk', 'error')
      }
    }
    
    const loadTodayTransactions = async () => {
      try {
        console.log('Loading today transactions...')
        const response = await apiCall('/sales')
        
        if (response.success) {
          console.log('Sales data received:', response.data.length, 'transactions')
          
          const todayFormats = getTodayInCorrectFormat()
          console.log('Filtering transactions for today:', todayFormats.iso)
          
          let todayTransactions = []
          
          // Coba filter dengan format yang berbeda
          for (const sale of response.data) {
            const saleDateTime = sale.date || sale.created_at
            
            if (!saleDateTime) {
              continue
            }
            
            const extractedDate = extractDateFromDatabaseString(saleDateTime)
            
            if (extractedDate === todayFormats.iso || extractedDate === todayFormats.localDate) {
              todayTransactions.push(sale)
            }
          }
          
          console.log(`Found ${todayTransactions.length} transactions for today`)
          
          // Jika tidak ada transaksi hari ini, ambil semua transaksi (untuk testing)
          if (todayTransactions.length === 0) {
            console.log('No transactions found for today, using all transactions for stats')
            todayTransactions = response.data
          }
          
          stats.value.todayTransactions = todayTransactions.length
          
          const totalItemsSold = todayTransactions.reduce((total, sale) => {
            if (sale.details && Array.isArray(sale.details)) {
              return total + sale.details.reduce((sum, detail) => sum + detail.quantity, 0)
            }
            return total
          }, 0)
          
          stats.value.itemsSold = totalItemsSold
          
          console.log(`Today stats: ${todayTransactions.length} transactions, ${totalItemsSold} items sold`)
        }
      } catch (error) {
        console.error('Error loading today transactions:', error)
        stats.value.todayTransactions = 0
        stats.value.itemsSold = 0
        
        if (error.message.includes('403') || error.message.includes('Access denied')) {
          console.log('Permission denied for sales data, using fallback values')
        } else {
          showToastNotification('Gagal memuat data transaksi hari ini', 'error')
        }
      }
    }
    
    const loadRecentTransactions = async () => {
      loadingTransactions.value = true
      try {
        console.log('Loading recent transactions...')
        const response = await apiCall('/sales')
        
        if (response.success) {
          console.log('Recent transactions data received:', response.data.length)
          
          const todayFormats = getTodayInCorrectFormat()
          
          let todayTransactions = []
          
          // Filter transaksi hari ini
          for (const sale of response.data) {
            const saleDateTime = sale.date || sale.created_at
            
            if (!saleDateTime) {
              console.warn('Transaction without date:', sale)
              continue
            }
            
            const extractedDate = extractDateFromDatabaseString(saleDateTime)
            
            if (extractedDate === todayFormats.iso || extractedDate === todayFormats.localDate) {
              const itemsCount = sale.details ? sale.details.reduce((sum, detail) => sum + detail.quantity, 0) : 0
              const transactionCode = sale.transaction_code || sale.invoice_number || 'N/A'
              
              todayTransactions.push({
                ...sale,
                items_count: itemsCount,
                transaction_code: transactionCode
              })
            }
          }
          
          // Jika tidak ada transaksi hari ini, ambil 10 transaksi terbaru
          if (todayTransactions.length === 0) {
            console.log('No transactions for today, showing 10 most recent transactions')
            
            todayTransactions = response.data
              .map(sale => {
                const itemsCount = sale.details ? sale.details.reduce((sum, detail) => sum + detail.quantity, 0) : 0
                const transactionCode = sale.transaction_code || sale.invoice_number || 'N/A'
                
                return {
                  ...sale,
                  items_count: itemsCount,
                  transaction_code: transactionCode
                }
              })
              .sort((a, b) => {
                // Sort by ID descending (newest first)
                return b.id - a.id
              })
              .slice(0, 10) // Ambil 10 terbaru
          } else {
            // Sort transaksi hari ini berdasarkan ID terbaru
            todayTransactions.sort((a, b) => b.id - a.id)
          }
          
          recentTransactions.value = todayTransactions
          totalTransactions.value = todayTransactions.length
          currentPage.value = 1
          
          console.log(`Recent transactions loaded: ${todayTransactions.length} transactions`)
          
          // Test formatTime dengan transaksi pertama
          if (todayTransactions.length > 0) {
            const firstTransaction = todayTransactions[0]
            console.log('Testing formatTime with first transaction:')
            const testTime = formatTime(firstTransaction.date || firstTransaction.created_at)
            console.log('Format time result:', testTime)
          }
        }
      } catch (error) {
        console.error('Error loading recent transactions:', error)
        recentTransactions.value = []
        totalTransactions.value = 0
        
        if (error.message.includes('403') || error.message.includes('Access denied')) {
          console.log('Permission denied for recent transactions, showing empty state')
        } else {
          showToastNotification('Gagal memuat transaksi terbaru', 'error')
        }
      } finally {
        loadingTransactions.value = false
      }
    }
    
    const getUserInfo = () => {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}')
        return user.name || 'Kasir'
      } catch {
        return 'Kasir'
      }
    }
    
    const loadDashboardData = async () => {
      loading.value = true
      try {
        console.log('Loading dashboard data for user:', getUserInfo())
        console.log('Current time:', new Date().toString())
        
        await Promise.allSettled([
          loadProductsCount(),
          loadTodayTransactions(),
          loadRecentTransactions()
        ])
        
        showToastNotification('Dashboard berhasil dimuat!', 'success')
        
      } catch (error) {
        console.error('Error loading dashboard data:', error)
        showToastNotification('Gagal memuat sebagian data dashboard', 'error')
      } finally {
        loading.value = false
      }
    }
    
    // Auto refresh untuk mendeteksi transaksi baru
    const autoRefreshData = async () => {
      try {
        console.log('Auto refreshing dashboard data...')
        const oldTransactionCount = stats.value.todayTransactions
        
        await loadTodayTransactions()
        await loadRecentTransactions()
        
        // Jika ada transaksi baru, beri notifikasi
        if (stats.value.todayTransactions > oldTransactionCount) {
          const newTransactions = stats.value.todayTransactions - oldTransactionCount
          showToastNotification(`${newTransactions} transaksi baru terdeteksi!`, 'success')
          console.log(`New transactions detected: ${newTransactions}`)
        }
        
      } catch (error) {
        console.error('Error in auto refresh:', error)
      }
    }
    
    const resetIdleTimer = () => {
      clearTimeout(idleTimer)
      idleTimer = setTimeout(() => {
        if (confirm('Sesi akan berakhir karena tidak ada aktivitas. Lanjutkan?')) {
          resetIdleTimer()
        } else {
          localStorage.removeItem('user')
          localStorage.removeItem('token')
          showToastNotification('Session berakhir karena tidak ada aktivitas', 'error')
          window.location.href = '/login'
        }
      }, 15 * 60 * 1000) // 15 menit
    }
    
    // Event listener untuk mendeteksi transaksi baru
    const handleStorageChange = (event) => {
      if (event.key === 'newTransaction') {
        console.log('New transaction detected from storage event')
        setTimeout(() => {
          autoRefreshData()
        }, 1000)
      }
    }
    
    const handleNewTransaction = () => {
      console.log('New transaction event received')
      setTimeout(() => {
        autoRefreshData()
      }, 1000)
    }
    
    onMounted(() => {
      console.log('Dashboard mounted at:', new Date().toString())
      
      resetIdleTimer()
      
      const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']
      events.forEach(event => {
        document.addEventListener(event, resetIdleTimer, true)
      })
      
      // Initial load
      loadDashboardData()
      
      // Auto refresh setiap 1 menit untuk mendeteksi transaksi baru
      refreshInterval = setInterval(() => {
        autoRefreshData()
      }, 60000)
      
      // Listen untuk storage changes (transaksi dari tab lain)
      window.addEventListener('storage', handleStorageChange)
      
      // Listen untuk custom event transaksi baru
      window.addEventListener('newTransaction', handleNewTransaction)
      
      onUnmounted(() => {
        clearTimeout(idleTimer)
        if (refreshInterval) clearInterval(refreshInterval)
        
        events.forEach(event => {
          document.removeEventListener(event, resetIdleTimer, true)
        })
        
        window.removeEventListener('storage', handleStorageChange)
        window.removeEventListener('newTransaction', handleNewTransaction)
      })
    })
    
    return {
      loading,
      loadingTransactions,
      showToast,
      toastMessage,
      toastType,
      stats,
      recentTransactions,
      totalTransactions,
      
      // Pagination
      currentPage,
      totalPages,
      startIndex,
      endIndex,
      paginatedTransactions,
      visiblePages,
      nextPage,
      previousPage,
      goToPage,
      
      // Functions
      formatCurrency,
      formatTime,
      showToastNotification,
      loadDashboardData,
      getUserInfo
    }
  }
}
</script>

<style scoped>
/* Custom responsive animations */
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

@keyframes slideInDown {
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Toast animations - responsive */
.fixed.top-4 {
  animation: slideInDown 0.3s ease-out;
}

@media (min-width: 640px) {
  .fixed.top-4 {
    animation: slideInRight 0.3s ease-out;
  }
}

/* Loading spinner animation */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Smooth transitions */
.transition-colors {
  transition: background-color 0.2s ease, color 0.2s ease;
}

/* Custom scrollbar for webkit browsers */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Ensure minimum touch target size on mobile */
@media (max-width: 640px) {
  button, a {
    min-height: 44px;
  }
}

/* Reduce motion for users who prefer it */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>