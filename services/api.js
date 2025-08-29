import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  withCredentials: true,
  headers: {
    Accept: 'application/json'
  }
})

// Existing interceptors remain the same...
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    if (['post', 'put', 'patch'].includes(config.method)) {
      if (!(config.data instanceof FormData)) {
        config.headers['Content-Type'] = 'application/json'
      }
    }
    
    console.log('API Request:', {
      method: config.method,
      url: config.url,
      headers: config.headers,
      data: config.data instanceof FormData ? 'FormData' : config.data
    })
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      status: response.status,
      data: response.data
    })
    return response
  },
  (error) => {
    console.error('API Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    })
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_data')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ✅ UPDATED PRODUCT SERVICE with Enhanced Stock Tracking
export const productService = {
  async getProducts(filters = {}) {
    try {
      const params = new URLSearchParams()
      if (filters.search) params.append('search', filters.search)
      const response = await api.get(`/products?${params.toString()}`)
      return response.data
    } catch (error) {
      console.error('Error fetching products:', error)
      throw error
    }
  },

  async getProductById(productId) {
    try {
      const response = await api.get(`/products/${productId}`)
      return response.data
    } catch (error) {
      console.error('Error fetching product by ID:', error)
      throw error
    }
  },

  async getProductByCode(kodeBarang) {
    try {
      const response = await api.get(`/products?search=${encodeURIComponent(kodeBarang)}`)
      if (response.data.success && response.data.data.length > 0) {
        const exactMatch = response.data.data.find(product => product.kode_barang === kodeBarang)
        if (exactMatch) return { success: true, data: exactMatch }
      }
      return { success: false, message: 'Product not found' }
    } catch (error) {
      console.error('Error fetching product by code:', error)
      throw error
    }
  },

  async createProduct(productData) {
    try {
      const response = await api.post('/products', productData)
      return response.data
    } catch (error) {
      console.error('Error creating product:', error)
      throw error
    }
  },

  async createProductWithPhoto(formData) {
    try {
      console.log('Sending FormData to backend...')
      
      for (let pair of formData.entries()) {
        console.log('FormData entry:', pair[0], pair[1])
      }
      
      const response = await api.post('/products', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data
    } catch (error) {
      console.error('Error creating product with photo:', error)
      console.error('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers
        }
      })
      throw error
    }
  },

  async updateProduct(productId, productData) {
    try {
      const response = await api.put(`/products/${productId}`, productData)
      return response.data
    } catch (error) {
      console.error('Error updating product:', error)
      throw error
    }
  },

  async updateProductWithPhoto(productId, formData) {
    try {
      console.log('Updating product with photo...', productId)
      
      for (let pair of formData.entries()) {
        console.log('Update FormData entry:', pair[0], pair[1])
      }
      
      const response = await api.post(`/products/${productId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data
    } catch (error) {
      console.error('Error updating product with photo:', error)
      console.error('Update error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      })
      throw error
    }
  },

  async deleteProduct(productId) {
    try {
      const response = await api.delete(`/products/${productId}`)
      return response.data
    } catch (error) {
      console.error('Error deleting product:', error)
      throw error
    }
  },

  // EXISTING STOCK METHODS
  async addStock(productId, additionalStock) {
    try {
      const response = await api.patch(`/products/${productId}/add-stock`, {
        additional_stock: additionalStock
      })
      return response.data
    } catch (error) {
      console.error('Error adding stock:', error)
      throw error
    }
  },

  // ✅ ENHANCED: Stock tracking methods with better error handling
  async addStockWithTracking(productId, data) {
    try {
      console.log('Adding stock with tracking:', {
        productId,
        quantity: data.quantity,
        distributor_id: data.distributor_id,
        notes: data.notes
      })
      
      const response = await api.post(`/products/${productId}/add-stock-tracking`, {
        quantity: data.quantity,
        distributor_id: data.distributor_id,
        notes: data.notes
      })
      return response.data
    } catch (error) {
      console.error('Error adding stock with tracking:', error)
      throw error
    }
  },

  // ✅ COMPLETELY FIXED: Stock History dengan multiple endpoint fallbacks dan error handling
  async getStockHistory(productId, params = {}) {
    try {
      console.log('🔍 Fetching stock history for product:', productId, 'with params:', params)
      
      // ✅ CLEAN PARAMS: Handle 'all' parameter properly
      const cleanParams = {}
      if (params.start_date) cleanParams.start_date = params.start_date
      if (params.end_date) cleanParams.end_date = params.end_date
      
      // ✅ FIXED: Convert 'all' to large number, ensure numeric values
      if (params.per_page === 'all') {
        cleanParams.per_page = 1000 // Large number instead of 'all'
      } else if (params.per_page && !isNaN(params.per_page)) {
        cleanParams.per_page = parseInt(params.per_page)
      } else {
        cleanParams.per_page = 25 // Default
      }
      
      if (params.sort) cleanParams.sort = params.sort
      if (params.order) cleanParams.order = params.order
      
      console.log('🔍 Using clean params:', cleanParams)
      
      // ✅ STRATEGY 1: Try main stock history endpoint
      try {
        console.log('🔍 Strategy 1: Trying main stock history endpoint...')
        const response = await api.get(`/products/${productId}/stock-history`, {
          params: cleanParams
        })
        
        console.log('✅ Strategy 1 success:', response.data)
        return response.data
        
      } catch (primaryError) {
        console.log('❌ Strategy 1 failed:', primaryError.response?.status, primaryError.response?.data?.message)
        
        // ✅ STRATEGY 2: Try alternative stock movements endpoint
        try {
          console.log('🔍 Strategy 2: Trying stock movements endpoint...')
          const response = await api.get(`/products/${productId}/stock-movements`, {
            params: cleanParams
          })
          
          console.log('✅ Strategy 2 success:', response.data)
          return response.data
          
        } catch (secondaryError) {
          console.log('❌ Strategy 2 failed:', secondaryError.response?.status, secondaryError.response?.data?.message)
          
          // ✅ STRATEGY 3: Try generic stock movements with product filter
          try {
            console.log('🔍 Strategy 3: Trying generic stock movements with product filter...')
            const response = await api.get(`/stock-movements`, {
              params: {
                product_id: productId,
                ...cleanParams
              }
            })
            
            console.log('✅ Strategy 3 success:', response.data)
            return response.data
            
          } catch (tertiaryError) {
            console.log('❌ Strategy 3 failed:', tertiaryError.response?.status, tertiaryError.response?.data?.message)
            
            // ✅ STRATEGY 4: Check if product exists and return empty structure
            try {
              console.log('🔍 Strategy 4: Checking if product exists...')
              const productResponse = await api.get(`/products/${productId}`)
              
              if (productResponse.data.success && productResponse.data.data) {
                console.log('✅ Strategy 4: Product exists, returning empty stock history structure')
                return {
                  success: true,
                  data: {
                    movements: [],
                    product: productResponse.data.data,
                    meta: {
                      total: 0,
                      per_page: cleanParams.per_page || 25,
                      current_page: 1,
                      last_page: 1
                    }
                  },
                  message: 'Product found but no stock history available yet'
                }
              }
              
            } catch (productError) {
              console.log('❌ Strategy 4 failed - Product not found:', productError.response?.status)
              
              // ✅ FINAL FALLBACK: Return safe empty structure
              console.log('🔄 Final fallback: Returning empty stock history structure')
              return {
                success: true,
                data: {
                  movements: [],
                  meta: {
                    total: 0,
                    per_page: cleanParams.per_page || 25,
                    current_page: 1,
                    last_page: 1
                  }
                },
                message: 'No stock history data available - this feature may not be implemented yet'
              }
            }
          }
        }
      }
      
    } catch (error) {
      console.error('❌ Critical error in getStockHistory:', error)
      
      // ✅ ULTIMATE FALLBACK: Return safe empty structure even in worst case
      return {
        success: true,
        data: {
          movements: [],
          meta: {
            total: 0,
            per_page: 25,
            current_page: 1,
            last_page: 1
          }
        },
        message: 'Stock history feature is not available'
      }
    }
  },

  // ✅ NEW: Alternative method for stock movements (fallback strategy)
  async getStockMovements(productId, params = {}) {
    try {
      console.log('🔍 Fetching stock movements for product:', productId)
      
      const cleanParams = {
        product_id: productId,
        per_page: params.per_page === 'all' ? 1000 : (params.per_page || 25),
        sort: params.sort || 'created_at',
        order: params.order || 'desc'
      }
      
      // Add other params
      if (params.start_date) cleanParams.start_date = params.start_date
      if (params.end_date) cleanParams.end_date = params.end_date
      
      const response = await api.get('/stock-movements', {
        params: cleanParams
      })
      
      return response.data
    } catch (error) {
      console.error('Error fetching stock movements:', error)
      throw error
    }
  },

  // ✅ NEW: Get stock history summary
  async getStockHistorySummary(productId) {
    try {
      console.log('🔍 Fetching stock history summary for product:', productId)
      
      const response = await api.get(`/products/${productId}/stock-summary`)
      return response.data
    } catch (error) {
      console.error('Error fetching stock summary:', error)
      
      // ✅ FALLBACK: Calculate summary from movements
      try {
        const movementsResponse = await this.getStockHistory(productId, { per_page: 1000 })
        if (movementsResponse.success && movementsResponse.data.movements) {
          const movements = Array.isArray(movementsResponse.data.movements) 
            ? movementsResponse.data.movements 
            : movementsResponse.data.movements.data || []
          
          const totalIn = movements
            .filter(m => m.type === 'in')
            .reduce((sum, m) => sum + parseInt(m.quantity || 0), 0)
          
          const totalOut = movements
            .filter(m => m.type === 'out')
            .reduce((sum, m) => sum + parseInt(m.quantity || 0), 0)
          
          return {
            success: true,
            data: {
              total_in: totalIn,
              total_out: totalOut,
              movements_count: movements.length
            }
          }
        }
      } catch (fallbackError) {
        console.error('Fallback calculation also failed:', fallbackError)
      }
      
      return {
        success: true,
        data: {
          total_in: 0,
          total_out: 0,
          movements_count: 0
        }
      }
    }
  },

  // Existing methods continue...
  async reduceStock(productId, quantity) {
    try {
      const productResponse = await this.getProductById(productId)
      if (!productResponse.success) {
        throw new Error('Product not found')
      }

      const product = productResponse.data
      
      if (product.stock < quantity) {
        throw new Error(`Insufficient stock. Available: ${product.stock}, Required: ${quantity}`)
      }

      const newStock = product.stock - quantity
      const updatedData = {
        ...product,
        stock: newStock
      }

      const response = await api.put(`/products/${productId}`, updatedData)
      return response.data
    } catch (error) {
      console.error('Error reducing stock:', error)
      throw error
    }
  },

  async bulkUpdateStock(stockUpdates) {
    try {
      const promises = stockUpdates.map(async (update) => {
        return await this.reduceStock(update.product_id, update.quantity)
      })

      const results = await Promise.all(promises)
      return { success: true, data: results }
    } catch (error) {
      console.error('Error bulk updating stock:', error)
      throw error
    }
  },

  async getLowStockProducts(threshold = 10) {
    try {
      const response = await this.getProducts()
      if (response.success) {
        const lowStockProducts = response.data.filter(product => product.stock <= threshold)
        return { success: true, data: lowStockProducts }
      }
      return response
    } catch (error) {
      console.error('Error fetching low stock products:', error)
      throw error
    }
  }
}

export const transactionService = {
  /**
   * ✅ UPDATED: Mengambil kode transaksi berikutnya dengan format TR250830000001
   * Format: TRYYMMDD000001
   * - TR = prefix
   * - YY = 2-digit year (25 untuk 2025)
   * - MM = 2-digit month (08 untuk Agustus)
   * - DD = 2-digit day (30 untuk tanggal 30)
   * - 000001 = 6-digit sequence (reset harian per user)
   */
  async getNextTransactionCode() {
    try {
      console.log('🔄 Getting next transaction code with format TRYYMMDD000001...')
      const response = await api.get('/sales/next-transaction-code')
      
      if (response.data.success && response.data.data) {
        const { next_code, next_sequence, user_id } = response.data.data
        console.log('✅ Next transaction code received:', { next_code, next_sequence, user_id })
        
        // Validasi format kode transaksi
        if (!this.validateTransactionCodeFormat(next_code)) {
          console.warn('⚠️ Invalid transaction code format received:', next_code)
        }
        
        return { 
          success: true, 
          data: { 
            next_code,
            next_sequence,
            user_id
          } 
        }
      }
      
      throw new Error('Invalid response from server')
    } catch (error) {
      console.error('❌ Error fetching next transaction code:', error)
      
      // ✅ UPDATED: Fallback dengan format TRYYMMDD000001
      const now = new Date()
      const year = now.getFullYear().toString().slice(-2) // 2 digit terakhir tahun
      const month = String(now.getMonth() + 1).padStart(2, '0') // 2 digit bulan
      const day = String(now.getDate()).padStart(2, '0') // 2 digit hari
      const sequence = '000001' // Default sequence untuk fallback
      
      const fallbackCode = `TR${year}${month}${day}${sequence}`
      const fallbackSequence = 1
      
      console.log('🔄 Using fallback code with new format:', fallbackCode, 'sequence:', fallbackSequence)
      return { 
        success: true, 
        data: { 
          next_code: fallbackCode,
          next_sequence: fallbackSequence,
          user_id: null
        } 
      }
    }
  },

  /**
   * ✅ NEW: Validasi format kode transaksi TRYYMMDD000001
   */
  validateTransactionCodeFormat(code) {
    if (!code) return false
    // Format: TR + YY + MM + DD + 000001 (total 12 karakter)
    const regex = /^TR\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{6}$/
    return regex.test(code)
  },

  /**
   * ✅ NEW: Parse kode transaksi untuk mendapatkan informasi tanggal
   */
  parseTransactionCode(code) {
    if (!this.validateTransactionCodeFormat(code)) {
      return null
    }
    
    const year = '20' + code.substring(2, 4) // TR[YY]MMDD000001
    const month = code.substring(4, 6)       // TRYY[MM]DD000001
    const day = code.substring(6, 8)         // TRYYMMDD[000001]
    const sequence = code.substring(8)       // TRYYMMDD[000001]
    
    return {
      year: parseInt(year),
      month: parseInt(month),
      day: parseInt(day),
      sequence: parseInt(sequence),
      date: `${year}-${month}-${day}`
    }
  },

  /**
   * ✅ UPDATED: Process sale dengan validasi format kode transaksi yang benar
   */
  async processSale(saleData) {
    try {
      console.log('🚀 Processing sale with new format TRYYMMDD000001:', {
        transaction_code: saleData.transaction_code,
        transaction_sequence: saleData.transaction_sequence,
        total_amount: saleData.total_amount,
        items_count: saleData.items?.length,
        has_discount: !!saleData.discount,
        discount_info: saleData.discount,
        full_data: JSON.stringify(saleData, null, 2)
      })

      // ✅ VALIDASI: Items harus ada
      if (!saleData.items || saleData.items.length === 0) {
        throw new Error('Tidak ada produk dalam keranjang!')
      }

      // ✅ VALIDASI: Stock validation
      const stockValidation = await utils.validateStock(saleData.items)
      if (!stockValidation.success) {
        throw new Error(stockValidation.message)
      }

      // ✅ UPDATED: Validasi format kode transaksi TRYYMMDD000001
      if (!saleData.transaction_code || !this.validateTransactionCodeFormat(saleData.transaction_code)) {
        throw new Error('Format kode transaksi tidak valid. Harus TRYYMMDD000001 (contoh: TR250830000001)')
      }

      // ✅ VALIDASI: Transaction sequence harus ada
      if (!saleData.transaction_sequence || saleData.transaction_sequence < 1) {
        throw new Error('Transaction sequence tidak valid')
      }

      // ✅ VALIDASI: User ID harus ada
      if (!saleData.user_id) {
        console.warn('⚠️ User ID tidak ada, mungkin menggunakan fallback')
      }

      // ✅ VALIDASI: Date harus ada dan valid
      if (!saleData.date) {
        saleData.date = new Date().toISOString().split('T')[0] // Format: YYYY-MM-DD
        console.log('📅 Date not provided, using current date:', saleData.date)
      }

      // ✅ VALIDASI: Discount validation
      if (saleData.discount) {
        const subtotal = saleData.items.reduce((sum, item) => sum + parseFloat(item.subtotal), 0)
        const discountValidation = discountHelpers.validateDiscount(saleData.discount, subtotal)
        if (!discountValidation.isValid) {
          throw new Error(discountValidation.message)
        }
      }

              // ✅ DEBUG: Validate items structure
        console.log('🔍 Validating items structure:')
        saleData.items.forEach((item, index) => {
          console.log(`Item ${index + 1}:`, {
            product_id: item.product_id,
            quantity: item.quantity,
            selling_price: item.selling_price,
            subtotal: item.subtotal,
            has_required_fields: !!(item.product_id && item.quantity && item.selling_price)
          })
          // Validasi field required untuk items
          if (!item.product_id) {
            throw new Error(`Item ${index + 1}: product_id is required`)
          }
          if (!item.quantity || item.quantity <= 0) {
            throw new Error(`Item ${index + 1}: quantity harus lebih dari 0`)
          }
          if (!item.selling_price || item.selling_price <= 0) {
            throw new Error(`Item ${index + 1}: selling_price harus lebih dari 0`)
          }
        })

      // ✅ KIRIM DATA ke backend
      console.log('📤 Sending data to backend with new format:', JSON.stringify(saleData, null, 2))
      const response = await api.post('/sales', saleData)
      
      if (response.data.success) {
        console.log('✅ Sale processed successfully with new format:', {
          transaction_code: response.data.data.transaction_code,
          transaction_sequence: response.data.data.transaction_sequence,
          user_id: response.data.data.user_id
        })
        
        if (saleData.discount) {
          console.log('💰 Discount applied:', {
            type: saleData.discount.type,
            value: saleData.discount.value,
            amount: saleData.discount.amount
          })
        }
      }
      
      return response.data
    } catch (error) {
      console.error('❌ Error processing sale:', error)
      
      // ✅ ENHANCED: Better error handling untuk 422
      if (error.response?.status === 422) {
        console.error('🚨 Validation Error (422):', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          errors: error.response.data?.errors,
          message: error.response.data?.message
        })
        
        // Format error message dari Laravel validation
        if (error.response.data?.errors) {
          const validationErrors = error.response.data.errors
          const errorMessages = []
          
          Object.keys(validationErrors).forEach(field => {
            const fieldErrors = validationErrors[field]
            errorMessages.push(`${field}: ${fieldErrors.join(', ')}`)
          })
          
          throw new Error(`Validasi gagal:\n${errorMessages.join('\n')}`)
        }
        
        throw new Error(error.response.data?.message || 'Data tidak valid - periksa format data yang dikirim')
      }
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message)
      }
      throw new Error(error.message || 'Gagal memproses transaksi. Silakan coba lagi.')
    }
  },

  /**
   * ✅ Get sales dengan role-based filtering
   */
  async getSales(params = {}) {
    try {
      const queryParams = new URLSearchParams()
      if (params.start_date) queryParams.append('start_date', params.start_date)
      if (params.end_date) queryParams.append('end_date', params.end_date)
      if (params.user_id) queryParams.append('user_id', params.user_id)

      const response = await api.get(`/sales?${queryParams.toString()}`)
      return response.data
    } catch (error) {
      console.error('Error fetching sales:', error)
      throw error
    }
  },

  /**
   * ✅ Sales report dengan breakdown per-user
   */
  async getSalesReport(startDate = null, endDate = null, userId = null) {
    try {
      const params = new URLSearchParams()
      if (startDate) params.append('start_date', startDate)
      if (endDate) params.append('end_date', endDate)
      if (userId) params.append('user_id', userId)

      const response = await api.get(`/sales/reports/general?${params.toString()}`)
      return response.data
    } catch (error) {
      console.error('Error fetching sales report:', error)
      try {
        const response = await api.get(`/sales/report?${params.toString()}`)
        return response.data
      } catch (fallbackError) {
        console.error('Error with fallback endpoint:', fallbackError)
        throw error
      }
    }
  },

  /**
   * ✅ Discount report dengan per-user filtering
   */
  async getDiscountReport(startDate = null, endDate = null, userId = null) {
    try {
      const params = new URLSearchParams()
      if (startDate) params.append('start_date', startDate)
      if (endDate) params.append('end_date', endDate)
      if (userId) params.append('user_id', userId)

      const response = await api.get(`/sales/reports/discount?${params.toString()}`)
      return response.data
    } catch (error) {
      console.error('Error fetching discount report:', error)
      try {
        const response = await api.get(`/sales/discount-report?${params.toString()}`)
        return response.data
      } catch (fallbackError) {
        console.error('Error with fallback discount report:', fallbackError)
        throw error
      }
    }
  },

  /**
   * ✅ Discount stats dengan role-based filtering
   */
  async getDiscountStats(startDate = null, endDate = null, userId = null) {
    try {
      const params = new URLSearchParams()
      if (startDate) params.append('start_date', startDate)
      if (endDate) params.append('end_date', endDate)
      if (userId) params.append('user_id', userId)

      const response = await api.get(`/sales/stats/discount?${params.toString()}`)
      return response.data
    } catch (error) {
      console.error('Error fetching discount stats:', error)
      try {
        const response = await api.get(`/sales/discount-stats?${params.toString()}`)
        return response.data
      } catch (fallbackError) {
        console.error('Error with fallback discount stats:', fallbackError)
        throw error
      }
    }
  },

  /**
   * ✅ Get sales by date range dengan role filtering
   */
  async getSalesByDateRange(startDate, endDate, userId = null) {
    try {
      const params = new URLSearchParams()
      params.append('start_date', startDate)
      params.append('end_date', endDate)
      if (userId) params.append('user_id', userId)

      const response = await api.get(`/sales?${params.toString()}`)
      return response.data
    } catch (error) {
      console.error('Error fetching sales by date range:', error)
      throw error
    }
  },

  /**
   * ✅ Get sale by ID dengan role-based access
   */
  async getSaleById(saleId) {
    try {
      const response = await api.get(`/sales/${saleId}`)
      return response.data
    } catch (error) {
      console.error('Error fetching sale by ID:', error)
      throw error
    }
  }
}

// ✅ UPDATED DISCOUNT HELPERS untuk per-user system
export const discountHelpers = {
  calculateDiscount(subtotal, discountType, discountValue) {
    console.log('🔍 calculateDiscount input:', { subtotal, discountType, discountValue })
    
    if (!discountType || !discountValue || discountValue <= 0) {
      return {
        type: null,
        value: 0,
        amount: 0,
        total: subtotal
      }
    }

    const subtotalNumber = parseFloat(subtotal) || 0
    const valueNumber = parseFloat(discountValue) || 0
    
    let discountAmount = 0
    
    if (discountType === 'percentage') {
      if (valueNumber > 80) {
        throw new Error('Persentase diskon tidak boleh lebih dari 80%')
      }
      discountAmount = Math.round((subtotalNumber * valueNumber) / 100)
    } else if (discountType === 'fixed') {
      const maxFixed = Math.floor(subtotalNumber * 0.8)
      if (valueNumber > maxFixed) {
        throw new Error(`Nominal diskon tidak boleh lebih dari 80% subtotal (max: ${maxFixed})`)
      }
      discountAmount = valueNumber
    } else {
      throw new Error('Tipe diskon tidak valid')
    }

    const result = {
      type: discountType,
      value: valueNumber,
      amount: discountAmount,
      total: subtotalNumber - discountAmount
    }
    
    console.log('✅ calculateDiscount result:', result)
    return result
  },

  validateDiscount(discount, subtotalAmount) {
    console.log('🔍 validateDiscount input:', { discount, subtotalAmount })

    if (!discount) {
      return { isValid: true, message: 'No discount applied' }
    }

    const { type, value, amount } = discount
    const subtotal = parseFloat(subtotalAmount) || 0

    if (!type || !['percentage', 'fixed'].includes(type)) {
      return { isValid: false, message: 'Tipe diskon tidak valid' }
    }

    const valueNumber = parseFloat(value) || 0
    const amountNumber = parseFloat(amount) || 0

    if (valueNumber <= 0) {
      return { isValid: false, message: 'Nilai diskon harus lebih dari 0' }
    }

    if (amountNumber <= 0) {
      return { isValid: false, message: 'Nominal diskon harus lebih dari 0' }
    }

    if (type === 'percentage') {
      console.log('🔍 Validating percentage:', valueNumber, '<=', 80)
      
      if (valueNumber > 80) {
        return { isValid: false, message: 'Persentase diskon tidak boleh lebih dari 80%' }
      }
      
      const calculatedAmount = Math.round((subtotal * valueNumber) / 100)
      const tolerance = 5
      
      console.log('🔍 Percentage amount check:', {
        receivedAmount: amountNumber,
        calculatedAmount: calculatedAmount,
        difference: Math.abs(amountNumber - calculatedAmount),
        tolerance: tolerance
      })
      
      if (Math.abs(amountNumber - calculatedAmount) > tolerance) {
        return { isValid: false, message: 'Perhitungan diskon persentase tidak sesuai' }
      }
    }

    if (type === 'fixed') {
      const maxAmount = Math.floor(subtotal * 0.8)
      
      console.log('🔍 Fixed validation:', {
        amount: amountNumber,
        maxAmount: maxAmount,
        isValid: amountNumber <= maxAmount
      })
      
      if (amountNumber > maxAmount) {
        return { isValid: false, message: `Nominal diskon tidak boleh lebih dari 80% subtotal (max: ${maxAmount})` }
      }
    }

    const maxTotalDiscount = Math.floor(subtotal * 0.8)
    
    console.log('🔍 Final validation:', {
      discountAmount: amountNumber,
      maxTotalDiscount: maxTotalDiscount,
      isValid: amountNumber <= maxTotalDiscount
    })
    
    if (amountNumber > maxTotalDiscount) {
      return { isValid: false, message: `Total diskon tidak boleh lebih dari 80% subtotal` }
    }

    console.log('✅ Discount validation passed')
    return { isValid: true, message: 'Discount is valid' }
  },

  formatDiscountDisplay(discount) {
    if (!discount || !discount.amount || discount.amount <= 0) {
      return null
    }

    const formattedAmount = utils.formatCurrency(discount.amount)
    
    if (discount.type === 'percentage') {
      return `Diskon ${discount.value}% (Rp ${formattedAmount})`
    } else {
      return `Diskon Rp ${formattedAmount}`
    }
  },

  parseDiscountFromSale(sale) {
    if (!sale.discount_amount || sale.discount_amount <= 0) {
      return null
    }

    return {
      type: sale.discount_type,
      value: sale.discount_value,
      amount: sale.discount_amount
    }
  },

  getDiscountPresets() {
    return [
      { type: 'percentage', value: 5, label: '5%' },
      { type: 'percentage', value: 10, label: '10%' },
      { type: 'percentage', value: 15, label: '15%' },
      { type: 'percentage', value: 20, label: '20%' },
      { type: 'percentage', value: 25, label: '25%' },
      { type: 'percentage', value: 30, label: '30%' },
      { type: 'percentage', value: 50, label: '50%' },
      { type: 'percentage', value: 75, label: '75%' },
      { type: 'percentage', value: 80, label: '80%' },
      { type: 'fixed', value: 5000, label: 'Rp 5.000' },
      { type: 'fixed', value: 10000, label: 'Rp 10.000' },
      { type: 'fixed', value: 25000, label: 'Rp 25.000' },
      { type: 'fixed', value: 50000, label: 'Rp 50.000' },
      { type: 'fixed', value: 100000, label: 'Rp 100.000' }
    ]
  },

  getValidPresets(subtotal) {
    const presets = this.getDiscountPresets()
    const maxFixed = Math.floor(subtotal * 0.8)
    
    return presets.filter(preset => {
      if (preset.type === 'fixed') {
        return preset.value <= maxFixed
      }
      return true
    })
  }
}

// ✅ UPDATED KASIR COMPONENT METHODS untuk format baru
export const kasirComponentMethods = {
  /**
   * ✅ UPDATED: Initialize transaction code dengan format TRYYMMDD000001
   */
  async initializeTransactionCode() {
    try {
      console.log('🔄 Initializing transaction code with new format TRYYMMDD000001...')
      
      const response = await transactionService.getNextTransactionCode()
      
      if (response.success && response.data.next_code) {
        const { next_code, next_sequence, user_id } = response.data
        
        if (window.transactionForm?.value) {
          window.transactionForm.value.transaction_code = next_code
          window.transactionForm.value.transaction_sequence = next_sequence
          window.transactionForm.value.user_id = user_id
        }
        
        console.log('✅ Transaction code initialized with new format:', {
          code: next_code,
          sequence: next_sequence,
          user_id: user_id,
          parsed: transactionService.parseTransactionCode(next_code)
        })
        return { code: next_code, sequence: next_sequence, user_id }
      } else {
        throw new Error('Failed to get transaction code from server')
      }
    } catch (error) {
      console.error('❌ Error initializing transaction code:', error)
      
      // ✅ UPDATED: Fallback dengan format TRYYMMDD000001
      const now = new Date()
      const year = now.getFullYear().toString().slice(-2)
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const day = String(now.getDate()).padStart(2, '0')
      const sequence = '000001'
      
      const fallbackCode = `TR${year}${month}${day}${sequence}`
      const fallbackSequence = 1
      
      if (window.transactionForm?.value) {
        window.transactionForm.value.transaction_code = fallbackCode
        window.transactionForm.value.transaction_sequence = fallbackSequence
      }
      console.log('🔄 Using fallback transaction code with new format:', fallbackCode, 'sequence:', fallbackSequence)
      return { code: fallbackCode, sequence: fallbackSequence, user_id: null }
    }
  },

  /**
   * ✅ UPDATED: Process transaction dengan format baru
   */
  async processTransaction(transactionData) {
    try {
      const { cartItems, totalAmount, paymentMethod, cashReceived, changeAmount, appliedDiscount } = transactionData
      
      if (!cartItems || cartItems.length === 0) {
        throw new Error('Tidak ada produk dalam antrian!')
      }
      
      if (paymentMethod === 'tunai' && parseFloat(cashReceived) < parseFloat(totalAmount)) {
        throw new Error('Periksa kembali jumlah uang yang diterima!')
      }
      
      if (!paymentMethod) {
        throw new Error('Pilih metode pembayaran!')
      }
      
      // ✅ AMBIL transaction code dan sequence
      let transactionCode = window.transactionForm?.value?.transaction_code
      let transactionSequence = window.transactionForm?.value?.transaction_sequence
      
      if (!transactionCode || !transactionService.validateTransactionCodeFormat(transactionCode) || !transactionSequence) {
        const newTransaction = await this.initializeTransactionCode()
        transactionCode = newTransaction.code
        transactionSequence = newTransaction.sequence
      }

      const subtotal = cartItems.reduce((sum, item) => sum + parseFloat(item.subtotal), 0)
      const currentDateForBackend = utils.getCurrentDateForBackend()
      
      console.log('🚀 Processing transaction with new format TRYYMMDD000001:', {
        transaction_code: transactionCode,
        transaction_sequence: transactionSequence,
        date: currentDateForBackend,
        subtotal: subtotal,
        discount: appliedDiscount,
        total_amount: totalAmount,
        parsed_code: transactionService.parseTransactionCode(transactionCode)
      })
      
      const cashReceivedValue = paymentMethod === 'tunai' ? parseFloat(cashReceived) : parseFloat(totalAmount)
      const changeAmountValue = paymentMethod === 'tunai' ? parseFloat(changeAmount) : 0

      // ✅ STRUKTUR DATA untuk format baru
      const saleData = {
        transaction_code: transactionCode,
        transaction_sequence: transactionSequence,
        user_id: window.transactionForm?.value?.user_id || null,
        date: currentDateForBackend,
        payment_method: paymentMethod,
        cash_received: cashReceivedValue,
        change_amount: changeAmountValue,
        total_amount: parseFloat(totalAmount),
        discount: appliedDiscount,
        items: cartItems.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          selling_price: item.selling_price,
          subtotal: item.subtotal
        }))
      }
      
      const response = await transactionService.processSale(saleData)
      
      if (response.success) {
        console.log('✅ Transaction completed with new format:', {
          transaction_code: transactionCode,
          transaction_sequence: transactionSequence,
          total: totalAmount,
          discount: appliedDiscount,
          parsed: transactionService.parseTransactionCode(transactionCode)
        })
        
        // ✅ GET NEXT TRANSACTION CODE setelah sukses
        setTimeout(async () => {
          await this.initializeTransactionCode()
        }, 100)
        
        return {
          success: true,
          data: {
            transaction_code: transactionCode,
            transaction_sequence: transactionSequence,
            invoice_number: response.data.transaction_code || transactionCode,
            total: totalAmount,
            payment_method: paymentMethod,
            cash_received: cashReceivedValue,
            change_amount: changeAmountValue,
            discount: appliedDiscount,
            items: cartItems
          }
        }
      } else {
        throw new Error(response.message || 'Gagal memproses transaksi')
      }
      
    } catch (error) {
      console.error('❌ Transaction error with new format:', error)
      throw error
    }
  }
}

// Master Data Service (tidak berubah)
export const masterDataService = {
  async getJenis() {
    try {
      const response = await api.get('/jenis')
      return response.data
    } catch (error) {
      console.error('Error fetching jenis:', error)
      throw error
    }
  },

  async createJenis(jenisData) {
    try {
      const response = await api.post('/jenis', jenisData)
      return response.data
    } catch (error) {
      console.error('Error creating jenis:', error)
      throw error
    }
  },

  async getSatuan() {
    try {
      const response = await api.get('/satuan')
      return response.data
    } catch (error) {
      console.error('Error fetching satuan:', error)
      throw error
    }
  },

  async createSatuan(satuanData) {
    try {
      const response = await api.post('/satuan', satuanData)
      return response.data
    } catch (error) {
      console.error('Error creating satuan:', error)
      throw error
    }
  },

  async getDistributor() {
    try {
      const response = await api.get('/distributor')
      return response.data
    } catch (error) {
      console.error('Error fetching distributor:', error)
      throw error
    }
  },

  async createDistributor(distributorData) {
    try {
      const response = await api.post('/distributor', distributorData)
      return response.data
    } catch (error) {
      console.error('Error creating distributor:', error)
      throw error
    }
  }
}

// ✅ UPDATED Utils dengan format baru
export const utils = {
  formatCurrency(amount) {
    const num = parseFloat(amount) || 0
    return new Intl.NumberFormat('id-ID').format(num)
  },

  /**
   * ✅ UPDATED: Format transaction code untuk format TRYYMMDD000001
   */
  formatTransactionCode(transactionCode) {
    if (!transactionCode) {
      // Generate default dengan format baru
      const now = new Date()
      const year = now.getFullYear().toString().slice(-2)
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const day = String(now.getDate()).padStart(2, '0')
      return `TR${year}${month}${day}000001`
    }
    
    if (transactionCode.startsWith('TR')) {
      return transactionCode
    }
    
    const numbers = transactionCode.match(/\d+/g)
    if (numbers && numbers.length > 0) {
      const lastNumber = numbers[numbers.length - 1]
      // Jika angka kurang dari format baru, tambahkan tanggal
      if (lastNumber.length < 10) {
        const now = new Date()
        const year = now.getFullYear().toString().slice(-2)
        const month = String(now.getMonth() + 1).padStart(2, '0')
        const day = String(now.getDate()).padStart(2, '0')
        const sequence = lastNumber.padStart(6, '0')
        return `TR${year}${month}${day}${sequence}`
      }
      return `TR${lastNumber}`
    }
    
    // Default fallback dengan format baru
    const now = new Date()
    const year = now.getFullYear().toString().slice(-2)
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    return `TR${year}${month}${day}000001`
  },

  formatDate(dateInput) {
    if (!dateInput) return '-'
    
    try {
      let date
      
      if (dateInput instanceof Date) {
        date = dateInput
      } else if (typeof dateInput === 'string') {
        if (dateInput.includes('T')) {
          date = new Date(dateInput)
        } else if (dateInput.includes('/')) {
          const [day, month, year] = dateInput.split('/')
          date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
        } else if (dateInput.includes('-')) {
          if (dateInput.includes(' ')) {
            date = new Date(dateInput)
          } else {
            const [year, month, day] = dateInput.split('-')
            date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
          }
        } else {
          date = new Date(dateInput)
        }
      } else {
        date = new Date(dateInput)
      }
      
      if (isNaN(date.getTime())) {
        console.warn('Invalid date:', dateInput)
        return typeof dateInput === 'string' ? dateInput : '-'
      }
      
      const day = date.getDate().toString().padStart(2, '0')
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const year = date.getFullYear()
      
      return `${day}/${month}/${year}`
    } catch (error) {
      console.error('Date formatting error:', error, dateInput)
      return typeof dateInput === 'string' ? dateInput : '-'
    }
  },

  formatDateNice(dateInput) {
    if (!dateInput) return '-'
    
    try {
      let date
      
      if (dateInput instanceof Date) {
        date = dateInput
      } else if (typeof dateInput === 'string') {
        if (dateInput.includes('T')) {
          date = new Date(dateInput)
        } else if (dateInput.includes('/')) {
          const [day, month, year] = dateInput.split('/')
          date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
        } else if (dateInput.includes('-')) {
          if (dateInput.includes(' ')) {
            date = new Date(dateInput)
          } else {
            const [year, month, day] = dateInput.split('-')
            date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
          }
        } else {
          date = new Date(dateInput)
        }
      } else {
        date = new Date(dateInput)
      }
      
      if (isNaN(date.getTime())) {
        console.warn('Invalid date for nice format:', dateInput)
        return this.formatDate(dateInput)
      }
      
      const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
      const monthNames = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
      ]
      
      const dayName = dayNames[date.getDay()]
      const day = date.getDate().toString().padStart(2, '0')
      const monthName = monthNames[date.getMonth()]
      const year = date.getFullYear()
      
      return `${dayName}, ${day} ${monthName} ${year}`
    } catch (error) {
      console.error('Date nice formatting error:', error, dateInput)
      return this.formatDate(dateInput)
    }
  },

  formatDateReceipt(dateInput) {
    if (!dateInput) {
      dateInput = new Date()
    }
    
    try {
      let date
      
      if (dateInput instanceof Date) {
        date = dateInput
      } else if (typeof dateInput === 'string') {
        if (dateInput.includes('T')) {
          date = new Date(dateInput)
        } else if (dateInput.includes('/')) {
          if (dateInput.includes(' ')) {
            const [datePart, timePart] = dateInput.split(' ')
            const [day, month, year] = datePart.split('/')
            const [hours, minutes] = timePart.split(':')
            date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hours), parseInt(minutes))
          } else {
            const [day, month, year] = dateInput.split('/')
            date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
          }
        } else if (dateInput.includes('-')) {
          if (dateInput.includes(' ')) {
            date = new Date(dateInput)
          } else {
            const [year, month, day] = dateInput.split('-')
            date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
          }
        } else {
          date = new Date(dateInput)
        }
      } else {
        date = new Date(dateInput)
      }
      
      if (isNaN(date.getTime())) {
        console.warn('Invalid date for receipt, using current time:', dateInput)
        date = new Date()
      }
      
      const day = date.getDate().toString().padStart(2, '0')
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const year = date.getFullYear()
      const hours = date.getHours().toString().padStart(2, '0')
      const minutes = date.getMinutes().toString().padStart(2, '0')
      
      return `${day}/${month}/${year} ${hours}:${minutes}`
    } catch (error) {
      console.error('Date receipt formatting error:', error, dateInput)
      const now = new Date()
      const day = now.getDate().toString().padStart(2, '0')
      const month = (now.getMonth() + 1).toString().padStart(2, '0')
      const year = now.getFullYear()
      const hours = now.getHours().toString().padStart(2, '0')
      const minutes = now.getMinutes().toString().padStart(2, '0')
      
      return `${day}/${month}/${year} ${hours}:${minutes}`
    }
  },

  formatDateForBackend(dateInput) {
    if (!dateInput) return null
    
    try {
      let date
      
      if (dateInput instanceof Date) {
        date = dateInput
      } else if (typeof dateInput === 'string') {
        if (dateInput.includes('T')) {
          date = new Date(dateInput)
        } else if (dateInput.includes('/')) {
          const [day, month, year] = dateInput.split('/')
          date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
        } else if (dateInput.includes('-')) {
          if (dateInput.includes(' ')) {
            date = new Date(dateInput)
          } else {
            const [year, month, day] = dateInput.split('-')
            date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
          }
        } else {
          date = new Date(dateInput)
        }
      } else {
        date = new Date(dateInput)
      }
      
      if (isNaN(date.getTime())) {
        console.warn('Invalid date for backend format:', dateInput)
        return null
      }
      
      const year = date.getFullYear()
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const day = date.getDate().toString().padStart(2, '0')
      
      return `${year}-${month}-${day}`
    } catch (error) {
      console.error('Date backend formatting error:', error, dateInput)
      return null
    }
  },

  getCurrentDateForBackend() {
    const now = new Date()
    
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    const seconds = String(now.getSeconds()).padStart(2, '0')
    
    const dateTimeString = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
    
    console.log('[UTILS] Current date for backend:', dateTimeString)
    return dateTimeString
  },

  formatDateTime(dateInput) {
    if (!dateInput) return '-'
    
    try {
      let date
      
      if (dateInput instanceof Date) {
        date = dateInput
      } else if (typeof dateInput === 'string') {
        if (dateInput.includes('T')) {
          date = new Date(dateInput)
        } else if (dateInput.includes('/')) {
          if (dateInput.includes(' ')) {
            const [datePart, timePart] = dateInput.split(' ')
            const [day, month, year] = datePart.split('/')
            const [hours, minutes] = timePart.split(':')
            date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hours), parseInt(minutes))
          } else {
            const [day, month, year] = dateInput.split('/')
            date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
          }
        } else if (dateInput.includes('-')) {
          if (dateInput.includes(' ')) {
            date = new Date(dateInput)
          } else {
            const [year, month, day] = dateInput.split('-')
            date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
          }
        } else {
          date = new Date(dateInput)
        }
      } else {
        date = new Date(dateInput)
      }
      
      if (isNaN(date.getTime())) {
        console.warn('Invalid date for DateTime format:', dateInput)
        return this.formatDate(dateInput)
      }
      
      const day = date.getDate().toString().padStart(2, '0')
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const year = date.getFullYear()
      const hours = date.getHours().toString().padStart(2, '0')
      const minutes = date.getMinutes().toString().padStart(2, '0')
      
      return `${day}/${month}/${year} ${hours}:${minutes}`
    } catch (error) {
      console.error('DateTime formatting error:', error, dateInput)
      return this.formatDate(dateInput)
    }
  },

  async validateStock(items) {
    try {
      for (const item of items) {
        let product
        
        if (item.product_id) {
          const productResponse = await productService.getProductById(item.product_id)
          if (!productResponse.success) {
            throw new Error(`Produk dengan ID ${item.product_id} tidak ditemukan`)
          }
          product = productResponse.data
        } else if (item.kode_barang) {
          const productResponse = await productService.getProductByCode(item.kode_barang)
          if (!productResponse.success) {
            throw new Error(`Produk ${item.kode_barang} tidak ditemukan`)
          }
          product = productResponse.data
        } else {
          throw new Error('Product ID atau kode barang harus disediakan')
        }
        
        if (product.stock < item.quantity) {
          throw new Error(`Stok ${product.name} tidak mencukupi. Stok tersedia: ${product.stock}, diminta: ${item.quantity}`)
        }
      }
      return { success: true }
    } catch (error) {
      return { success: false, message: error.message }
    }
  },

  generateProductCode(products) {
    if (!products || products.length === 0) {
      return 'BR001'
    }
    
    const kodeBRList = products
      .filter(product => product.kode_barang && product.kode_barang.startsWith('BR'))
      .map(product => {
        const numPart = product.kode_barang.replace('BR', '')
        return parseInt(numPart) || 0
      })
      .sort((a, b) => b - a)
    
    const nextNumber = kodeBRList.length > 0 ? kodeBRList[0] + 1 : 1
    const formattedNumber = nextNumber.toString().padStart(3, '0')
    
    return `BR${formattedNumber}`
  },

  calculateTotal(items) {
    return items.reduce((total, item) => {
      return total + (parseFloat(item.quantity || 0) * parseFloat(item.price || 0))
    }, 0)
  },

  getStockStatus(stock) {
    if (stock <= 0) return { status: 'out_of_stock', label: 'Habis', color: 'red' }
    if (stock <= 5) return { status: 'very_low', label: 'Sangat Rendah', color: 'red' }
    if (stock <= 20) return { status: 'low', label: 'Rendah', color: 'yellow' }
    return { status: 'normal', label: 'Normal', color: 'green' }
  },

  /**
   * ✅ UPDATED: Validate transaction code untuk format TRYYMMDD000001
   */
  validateTransactionCode(code) {
    return transactionService.validateTransactionCodeFormat(code)
  },

  /**
   * ✅ UPDATED: Generate transaction code untuk format TRYYMMDD000001
   */
  generateTransactionCode(number = 1) {
    const now = new Date()
    const year = now.getFullYear().toString().slice(-2)
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const sequence = number.toString().padStart(6, '0')
    
    return `TR${year}${month}${day}${sequence}`
  }
}

// ✅ UPDATED DASHBOARD SERVICE untuk format baru
export const dashboardService = {
  async getDashboardStats(userId = null) {
    try {
      const productsResponse = await productService.getProducts()
      const products = productsResponse.data || []

      const endDate = new Date().toISOString().split('T')[0]
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      
      const salesResponse = await transactionService.getSalesByDateRange(startDate, endDate, userId)
      const sales = salesResponse.data || []

      const discountStatsResponse = await transactionService.getDiscountStats(startDate, endDate, userId)
      const discountStats = discountStatsResponse.data || {}

      const totalProducts = products.length
      const lowStockProducts = products.filter(p => p.stock <= 10).length
      const outOfStockProducts = products.filter(p => p.stock <= 0).length
      const totalSales = sales.length
      const totalRevenue = sales.reduce((sum, sale) => sum + parseFloat(sale.total_price || 0), 0)

      return {
        success: true,
        data: {
          totalProducts,
          lowStockProducts,
          outOfStockProducts,
          totalSales,
          totalRevenue,
          discountStats,
          recentSales: sales.slice(0, 5),
          lowStockItems: products.filter(p => p.stock <= 10).slice(0, 5)
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      throw error
    }
  }
}

// Lifecycle Methods (tidak berubah)
export const lifecycleMethods = {
  async onMounted() {
    console.log('Kasir transaksi component mounted with new format TRYYMMDD000001')
    
    await kasirComponentMethods.initializeTransactionCode()
    
    const handleGlobalClick = () => {
      if (window.showContextMenu?.value) {
        window.hideContextMenu?.()
      }
    }
    
    document.addEventListener('click', handleGlobalClick)
    
    return () => {
      console.log('Kasir component cleanup')
      document.removeEventListener('click', handleGlobalClick)
    }
  }
}

// ✅ UPDATED TRANSACTION CODE HELPERS untuk format TRYYMMDD000001
export const transactionCodeHelpers = {
  /**
   * ✅ UPDATED: Format transaction code untuk format TRYYMMDD000001
   */
  formatTransactionCode(code) {
    return utils.formatTransactionCode(code)
  },

  /**
   * ✅ UPDATED: Validate transaction code format TRYYMMDD000001
   */
  isValidTransactionCode(code) {
    return transactionService.validateTransactionCodeFormat(code)
  },

  /**
   * ✅ UPDATED: Get next transaction code (dengan format baru)
   */
  getNextTransactionCode(currentCode) {
    if (!currentCode || !this.isValidTransactionCode(currentCode)) {
      return utils.generateTransactionCode(1)
    }
    
    const parsed = transactionService.parseTransactionCode(currentCode)
    if (!parsed) {
      return utils.generateTransactionCode(1)
    }
    
    // Jika hari berbeda, reset sequence
    const now = new Date()
    const currentDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    
    if (parsed.date !== currentDate) {
      return utils.generateTransactionCode(1)
    }
    
    // Increment sequence untuk hari yang sama
    return utils.generateTransactionCode(parsed.sequence + 1)
  },

  getTransactionNumber(transactionCode) {
    const parsed = transactionService.parseTransactionCode(transactionCode)
    return parsed ? parsed.sequence : 1
  },

  formatTransactionCodeForDisplay(code) {
    return this.formatTransactionCode(code)
  },

  formatTransactionCodeForSearch(searchTerm) {
    if (!searchTerm) return ''
    
    if (/^\d+$/.test(searchTerm)) {
      // Jika hanya angka, buat dengan format hari ini
      const now = new Date()
      const year = now.getFullYear().toString().slice(-2)
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const day = String(now.getDate()).padStart(2, '0')
      const sequence = searchTerm.padStart(6, '0')
      return `TR${year}${month}${day}${sequence}`
    }
    
    if (/^TR\d/.test(searchTerm.toUpperCase())) {
      return searchTerm.toUpperCase()
    }
    
    return searchTerm
  },

  batchFormatTransactionCodes(transactions) {
    return transactions.map(transaction => ({
      ...transaction,
      display_transaction_code: this.formatTransactionCode(transaction.transaction_code),
      formatted_code: this.formatTransactionCode(transaction.transaction_code),
      parsed_code: transactionService.parseTransactionCode(transaction.transaction_code)
    }))
  }
}

// ✅ UPDATED PRINT HELPERS untuk format TRYYMMDD000001
export const printHelpers = {
  /**
   * ✅ UPDATED: Print receipt dengan format transaction code baru
   */
  printReceiptWithTransactionCode(transaction, userInfo = null) {
    const user = userInfo || JSON.parse(localStorage.getItem('user') || '{}')
    const transactionCode = transaction.transaction_code
    const parsedCode = transactionService.parseTransactionCode(transactionCode)
    
    const cartItemsHtml = transaction.items ? transaction.items.map(item => 
      `<div style="margin-bottom: 5px;">
        <div><strong>${item.name}</strong></div>
        <div style="display: flex; justify-content: space-between;">
          <span>${item.quantity} x Rp ${utils.formatCurrency(item.selling_price)}</span>
          <span>Rp ${utils.formatCurrency(item.subtotal)}</span>
        </div>
      </div>`
    ).join('') : ''

    const subtotalForReceipt = transaction.items ? transaction.items.reduce((sum, item) => sum + parseFloat(item.subtotal || 0), 0) : parseFloat(transaction.total || 0)
    
    let discountHtml = ''
    if (transaction.discount && transaction.discount.amount > 0) {
      discountHtml = `
        <div style="border-top: 1px dashed #000; padding-top: 10px; margin-top: 10px;">
          <div style="display: flex; justify-content: space-between;">
            <span>Subtotal:</span>
            <span>Rp ${utils.formatCurrency(subtotalForReceipt)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; color: #e74c3c;">
            <span>Diskon ${transaction.discount.type === 'percentage' ? transaction.discount.value + '%' : 'Rp ' + utils.formatCurrency(transaction.discount.value)}:</span>
            <span>-Rp ${utils.formatCurrency(transaction.discount.amount)}</span>
          </div>
        </div>
      `
    }

    let paymentDetailsHtml = ''
    const paymentMethod = transaction.payment_method || 'tunai'
    
    if (paymentMethod === 'tunai') {
      if (transaction.cash_received && parseFloat(transaction.cash_received) > 0) {
        const changeAmount = parseFloat(transaction.change_amount || 0)
        paymentDetailsHtml = `
          <div style="border-top: 1px dashed #000; padding-top: 10px; margin-top: 10px;">
            <p style="margin: 0; text-align: right;">Bayar: Rp ${utils.formatCurrency(transaction.cash_received)}</p>
            <p style="margin: 0; text-align: right; font-weight: bold;">Kembalian: ${changeAmount > 0 ? 'Rp ' + utils.formatCurrency(changeAmount) : '-'}</p>
          </div>
        `
      } else {
        paymentDetailsHtml = `
          <div style="border-top: 1px dashed #000; padding-top: 10px; margin-top: 10px;">
            <p style="margin: 0; text-align: right;">Pembayaran: Tunai</p>
            <p style="margin: 0; text-align: right; font-weight: bold;">Kembalian: -</p>
          </div>
        `
      }
    } else if (paymentMethod === 'qris') {
      paymentDetailsHtml = `
        <div style="border-top: 1px dashed #000; padding-top: 10px; margin-top: 10px;">
          <p style="margin: 0; text-align: right;">Pembayaran: QRIS</p>
          <p style="margin: 0; text-align: right; font-size: 12px;">✓ Pembayaran Digital Berhasil</p>
          <p style="margin: 0; text-align: right; font-weight: bold;">Kembalian: -</p>
        </div>
      `
    }

    const currentDate = new Date()
    const receiptDate = utils.formatDateReceipt(currentDate)

    // ✅ UPDATED: Receipt dengan format TRYYMMDD000001
    const receiptContent = `
      <div style="width: 300px; font-family: monospace; margin: 0 auto;">
        <div style="text-align: center; border-bottom: 1px dashed #000; padding-bottom: 10px; margin-bottom: 10px;">
          <h3 style="margin: 0;">GROSIR KURMA PONTIANAK</h3>
          <p style="margin: 0; font-size: 12px;">Sistem Kasir Digital</p>
          <p style="margin: 0; font-size: 12px;">Telp: 0812-2100-6766</p>
        </div>
        
        <div style="margin-bottom: 10px;">
          <p style="margin: 0;"><strong>Kode Transaksi:</strong> ${transactionCode}</p>
          <p style="margin: 0;"><strong>Tanggal:</strong> ${receiptDate}</p>
          <p style="margin: 0;"><strong>Kasir:</strong> ${user.name || 'Kasir'}</p>
          <p style="margin: 0;"><strong>Metode:</strong> ${paymentMethod.toUpperCase()}</p>
          ${transaction.transaction_sequence ? `<p style="margin: 0; font-size: 11px;"><strong>Seq:</strong> #${transaction.transaction_sequence}</p>` : ''}
          ${parsedCode ? `<p style="margin: 0; font-size: 10px; color: #666;"><strong>Tanggal Kode:</strong> ${parsedCode.date}</p>` : ''}
        </div>
        
        <div style="border-bottom: 1px dashed #000; padding-bottom: 10px; margin-bottom: 10px;">
          ${cartItemsHtml}
        </div>
        
        ${discountHtml}
        
        <div style="text-align: right; font-size: 14px;">
          <p style="margin: 0;"><strong>TOTAL: Rp ${utils.formatCurrency(transaction.total)}</strong></p>
          ${paymentDetailsHtml}
        </div>
        
        <div style="text-align: center; margin-top: 20px; font-size: 12px;">
          <p style="margin: 0;">Terima kasih atas kunjungan Anda!</p>
          <p style="margin: 0;">Jangan Lupa Datang Kembali :)</p>
          <p style="margin: 0; margin-top: 10px; font-size: 10px;">Format Baru: TRYYMMDD000001</p>
        </div>
      </div>
    `
    
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Struk Belanja - ${transactionCode}</title>
            <style>
              body { margin: 0; padding: 20px; }
              @media print {
                body { margin: 0; padding: 0; }
              }
            </style>
          </head>
          <body>
            ${receiptContent}
          </body>
        </html>
      `)
      printWindow.document.close()
      
      setTimeout(async () => {
        printWindow.print()
        printWindow.close()
        
        console.log('[KASIR] Getting new transaction code after print with new format...')
        try {
          await kasirComponentMethods.initializeTransactionCode()
          console.log('[KASIR] Ready for next transaction with new format')
        } catch (error) {
          console.error('[KASIR] Failed to refresh transaction code after print:', error)
        }
      }, 250)
    }
  },

  /**
   * ✅ UPDATED: Print report dengan format TRYYMMDD000001
   */
  printReportWithTransactionCode(transactions, filterInfo = '', userInfo = null) {
    const user = userInfo || JSON.parse(localStorage.getItem('user') || '{}')
    const currentDate = new Date()
    
    const formattedTransactions = transactionCodeHelpers.batchFormatTransactionCodes(transactions)
    
    const tableRows = formattedTransactions.map(transaction => 
      `<tr>
        <td style="border: 1px solid #000; padding: 8px; text-align: center;">${transaction.formatted_code}</td>
        <td style="border: 1px solid #000; padding: 8px; text-align: center;">${transaction.user?.name || 'Kasir'}</td>
        <td style="border: 1px solid #000; padding: 8px; text-align: center;">${transaction.details ? transaction.details.reduce((total, detail) => total + detail.quantity, 0) : 1}</td>
        <td style="border: 1px solid #000; padding: 8px; text-align: center;">Rp ${utils.formatCurrency(transaction.total_price)}</td>
        <td style="border: 1px solid #000; padding: 8px; text-align: center;">${transaction.has_discount ? discountHelpers.formatDiscountDisplay(discountHelpers.parseDiscountFromSale(transaction)) || '-' : '-'}</td>
        <td style="border: 1px solid #000; padding: 8px; text-align: center;">${utils.formatDate(transaction.date)}</td>
        <td style="border: 1px solid #000; padding: 8px; text-align: center;">${transaction.transaction_sequence || '-'}</td>
        <td style="border: 1px solid #000; padding: 8px; text-align: center; font-size: 10px;">${transaction.parsed_code ? transaction.parsed_code.date : '-'}</td>
      </tr>`
    ).join('')

    const grandTotal = transactions.reduce((total, transaction) => total + parseFloat(transaction.total_price || 0), 0)
    const totalDiscount = transactions.reduce((total, transaction) => total + parseFloat(transaction.discount_amount || 0), 0)

    const reportDate = utils.formatDateNice(currentDate)

    const reportContent = `
      <html>
        <head>
          <title>Data Transaksi Format TRYYMMDD000001 - GROSIR KURMA PONTIANAK</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .header h2 { margin: 0; font-size: 18px; font-weight: bold; }
            .header p { margin: 5px 0; font-size: 14px; }
            .table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            .table th, .table td { border: 1px solid #000; padding: 8px; text-align: center; }
            .table th { background-color: #f0f0f0; font-weight: bold; }
            .grand-total { margin-top: 20px; text-align: right; font-weight: bold; }
            .info { margin-bottom: 20px; font-size: 12px; }
            @media print {
              body { margin: 0; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>Data Transaksi Format TRYYMMDD000001</h2>
            <p>GROSIR KURMA PONTIANAK</p>
          </div>
          
          <div class="info">
            <p><strong>Filter:</strong> ${filterInfo || 'Semua Transaksi'}</p>
            <p><strong>Dicetak pada:</strong> ${reportDate} oleh ${user.name || 'Admin'}</p>
            <p><strong>Format:</strong> TR + YY + MM + DD + 000001 (Reset harian per user)</p>
          </div>
          
          <table class="table">
            <thead>
              <tr>
                <th>Kode Transaksi</th>
                <th>Nama Kasir</th>
                <th>Jumlah Item</th>
                <th>Total Harga</th>
                <th>Diskon</th>
                <th>Tanggal</th>
                <th>Sequence</th>
                <th>Tanggal Kode</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
          
          <div style="text-align: right; margin-top: 20px;">
            <p style="font-size: 16px; margin: 0;"><strong>Total Diskon</strong></p>
            <p style="font-size: 16px; font-weight: bold; margin: 5px 0 0 0; color: #e74c3c;">Rp ${utils.formatCurrency(totalDiscount)}</p>
            <p style="font-size: 18px; margin: 10px 0 0 0;"><strong>Grand Total</strong></p>
            <p style="font-size: 20px; font-weight: bold; margin: 5px 0 0 0;">Rp ${utils.formatCurrency(grandTotal)}</p>
          </div>
          
          <div class="footer" style="margin-top: 30px; text-align: center; font-size: 12px;">
            <p>Laporan ini dicetak pada ${reportDate} oleh ${user.name || 'Admin'}</p>
            <p>Format Baru: TRYYMMDD000001 - Reset harian per user</p>
            <p>Powered by KIOS KURMA POS System v2.1</p>
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
    }
  }
}

export default api