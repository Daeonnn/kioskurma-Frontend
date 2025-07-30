import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  withCredentials: true,
  headers: {
    Accept: 'application/json'
  }
})

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
  async getNextTransactionCode() {
    try {
      console.log('🔄 Getting next transaction code from server...')
      const response = await api.get('/sales/next-transaction-code')
      
      if (response.data.success && response.data.data.next_code) {
        const code = response.data.data.next_code
        console.log('✅ Next transaction code received:', code)
        return { success: true, data: { next_code: code } }
      }
      
      throw new Error('Invalid response from server')
    } catch (error) {
      console.error('❌ Error fetching next transaction code:', error)
      
      const fallbackCode = 'TR001'
      console.log('🔄 Using fallback code:', fallbackCode)
      return { success: true, data: { next_code: fallbackCode } }
    }
  },

  async processSale(saleData) {
    try {
      console.log('🚀 Processing sale with discount:', {
        transaction_code: saleData.transaction_code,
        total_amount: saleData.total_amount,
        items_count: saleData.items?.length,
        has_discount: !!saleData.discount,
        discount_info: saleData.discount
      })

      if (saleData.items && saleData.items.length > 0) {
        const stockValidation = await utils.validateStock(saleData.items)
        if (!stockValidation.success) {
          throw new Error(stockValidation.message)
        }
      }

      if (!saleData.transaction_code || !saleData.transaction_code.startsWith('TR')) {
        throw new Error('Kode transaksi tidak valid')
      }

      if (saleData.discount) {
        const subtotal = saleData.items.reduce((sum, item) => sum + parseFloat(item.subtotal), 0)
        const discountValidation = discountHelpers.validateDiscount(saleData.discount, subtotal)
        if (!discountValidation.isValid) {
          throw new Error(discountValidation.message)
        }
      }

      const response = await api.post('/sales', saleData)
      
      if (response.data.success) {
        console.log('✅ Sale with discount processed successfully:', response.data.data.transaction_code)
        
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
      console.error('❌ Error processing sale with discount:', error)
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message)
      }
      throw new Error(error.message || 'Gagal memproses transaksi. Silakan coba lagi.')
    }
  },

  async getSalesReport(startDate = null, endDate = null) {
    try {
      const params = new URLSearchParams()
      if (startDate) params.append('start_date', startDate)
      if (endDate) params.append('end_date', endDate)

      const response = await api.get(`/sales/report?${params.toString()}`)
      return response.data
    } catch (error) {
      console.error('Error fetching sales report:', error)
      throw error
    }
  },

  async getDiscountReport(startDate = null, endDate = null) {
    try {
      const params = new URLSearchParams()
      if (startDate) params.append('start_date', startDate)
      if (endDate) params.append('end_date', endDate)

      const response = await api.get(`/sales/discount-report?${params.toString()}`)
      return response.data
    } catch (error) {
      console.error('Error fetching discount report:', error)
      throw error
    }
  },

  async getDiscountStats(startDate = null, endDate = null) {
    try {
      const params = new URLSearchParams()
      if (startDate) params.append('start_date', startDate)
      if (endDate) params.append('end_date', endDate)

      const response = await api.get(`/sales/discount-stats?${params.toString()}`)
      return response.data
    } catch (error) {
      console.error('Error fetching discount stats:', error)
      throw error
    }
  },

  async getSalesByDateRange(startDate, endDate) {
    try {
      const params = new URLSearchParams()
      params.append('start_date', startDate)
      params.append('end_date', endDate)

      const response = await api.get(`/sales?${params.toString()}`)
      return response.data
    } catch (error) {
      console.error('Error fetching sales by date range:', error)
      throw error
    }
  },

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

export const kasirComponentMethods = {
  async initializeTransactionCode() {
    try {
      console.log('🔄 Initializing transaction code from server...')
      
      const response = await transactionService.getNextTransactionCode()
      
      if (response.success && response.data.next_code) {
        const transactionCode = response.data.next_code
        
        if (window.transactionForm?.value) {
          window.transactionForm.value.transaction_code = transactionCode
        }
        
        console.log('✅ Transaction code initialized:', transactionCode)
        return transactionCode
      } else {
        throw new Error('Failed to get transaction code from server')
      }
    } catch (error) {
      console.error('❌ Error initializing transaction code:', error)
      
      const fallbackCode = 'TR001'
      if (window.transactionForm?.value) {
        window.transactionForm.value.transaction_code = fallbackCode
      }
      console.log('🔄 Using fallback transaction code:', fallbackCode)
      return fallbackCode
    }
  },

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
      
      let transactionCode = window.transactionForm?.value?.transaction_code
      if (!transactionCode || !transactionCode.startsWith('TR')) {
        transactionCode = await this.initializeTransactionCode()
      }

      const subtotal = cartItems.reduce((sum, item) => sum + parseFloat(item.subtotal), 0)

      const currentDateForBackend = utils.getCurrentDateForBackend()
      
      console.log('🚀 Processing transaction with discount:', {
        transaction_code: transactionCode,
        date: currentDateForBackend,
        subtotal: subtotal,
        discount: appliedDiscount,
        total_amount: totalAmount
      })
      
      const cashReceivedValue = paymentMethod === 'tunai' ? parseFloat(cashReceived) : parseFloat(totalAmount)
      const changeAmountValue = paymentMethod === 'tunai' ? parseFloat(changeAmount) : 0

      const saleData = {
        transaction_code: transactionCode,
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
        console.log('✅ Transaction with discount completed:', {
          transaction_code: transactionCode,
          total: totalAmount,
          discount: appliedDiscount
        })
        
        setTimeout(async () => {
          await this.initializeTransactionCode()
        }, 100)
        
        return {
          success: true,
          data: {
            transaction_code: transactionCode,
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
      console.error('❌ Transaction error:', error)
      throw error
    }
  }
}

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

export const utils = {
  formatCurrency(amount) {
    const num = parseFloat(amount) || 0
    return new Intl.NumberFormat('id-ID').format(num)
  },

  formatTransactionCode(transactionCode) {
    if (!transactionCode) return 'TR001'
    
    if (transactionCode.startsWith('TR')) {
      return transactionCode
    }
    
    const numbers = transactionCode.match(/\d+/g)
    if (numbers && numbers.length > 0) {
      const lastNumber = numbers[numbers.length - 1]
      return `TR${lastNumber.padStart(3, '0')}`
    }
    
    return 'TR001'
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

  validateTransactionCode(code) {
    if (!code) return false
    return /^TR\d{3}$/.test(code)
  },

  generateTransactionCode(number = 1) {
    return `TR${number.toString().padStart(3, '0')}`
  }
}

export const dashboardService = {
  async getDashboardStats() {
    try {
      const productsResponse = await productService.getProducts()
      const products = productsResponse.data || []

      const endDate = new Date().toISOString().split('T')[0]
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      const salesResponse = await transactionService.getSalesByDateRange(startDate, endDate)
      const sales = salesResponse.data || []

      const discountStatsResponse = await transactionService.getDiscountStats(startDate, endDate)
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

export const lifecycleMethods = {
  async onMounted() {
    console.log('Kasir transaksi component mounted')
    
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

export const transactionCodeHelpers = {
  formatTransactionCode(code) {
    if (!code) return 'TR001'
    
    if (code.startsWith('TR')) {
      return code
    }
    
    const numbers = code.match(/\d+/g)
    if (numbers && numbers.length > 0) {
      const lastNumber = numbers[numbers.length - 1]
      return `TR${lastNumber.padStart(3, '0')}`
    }
    
    return 'TR001'
  },

  isValidTransactionCode(code) {
    return /^TR\d{3}$/.test(code)
  },

  getNextTransactionCode(currentCode) {
    if (!currentCode || !this.isValidTransactionCode(currentCode)) {
      return 'TR001'
    }
    
    const currentNumber = parseInt(currentCode.replace('TR', ''))
    const nextNumber = currentNumber + 1
    return `TR${nextNumber.toString().padStart(3, '0')}`
  },

  getTransactionNumber(transactionCode) {
    if (!this.isValidTransactionCode(transactionCode)) {
      return 1
    }
    return parseInt(transactionCode.replace('TR', ''))
  },

  formatTransactionCodeForDisplay(code) {
    return this.formatTransactionCode(code)
  },

  formatTransactionCodeForSearch(searchTerm) {
    if (!searchTerm) return ''
    
    if (/^\d+$/.test(searchTerm)) {
      return `TR${searchTerm.padStart(3, '0')}`
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
      formatted_code: this.formatTransactionCode(transaction.transaction_code)
    }))
  }
}

export const printHelpers = {
  printReceiptWithTransactionCode(transaction, userInfo = null) {
    const user = userInfo || JSON.parse(localStorage.getItem('user') || '{}')
    const transactionCode = transaction.transaction_code
    
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
          <p style="margin: 0; margin-top: 10px; font-size: 10px;">Powered by KIOS KURMA POS System</p>
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
        
        console.log('[KASIR] Getting new transaction code after print...')
        try {
          await kasirComponentMethods.initializeTransactionCode()
          console.log('[KASIR] Ready for next transaction after print')
        } catch (error) {
          console.error('[KASIR] Failed to refresh transaction code after print:', error)
        }
      }, 250)
    }
  },

  printReportWithTransactionCode(transactions, filterInfo = '', userInfo = null) {
    const user = userInfo || JSON.parse(localStorage.getItem('user') || '{}')
    const currentDate = new Date()
    
    const formattedTransactions = transactionCodeHelpers.batchFormatTransactionCodes(transactions)
    
    const tableRows = formattedTransactions.map(transaction => 
      `<tr>
        <td style="border: 1px solid #000; padding: 8px; text-align: center;">${transaction.formatted_code}</td>
        <td style="border: 1px solid #000; padding: 8px; text-align: center;">${transaction.user?.name || 'Pembeli'}</td>
        <td style="border: 1px solid #000; padding: 8px; text-align: center;">${transaction.details ? transaction.details.reduce((total, detail) => total + detail.quantity, 0) : 1}</td>
        <td style="border: 1px solid #000; padding: 8px; text-align: center;">Rp ${utils.formatCurrency(transaction.total_price)}</td>
        <td style="border: 1px solid #000; padding: 8px; text-align: center;">${transaction.has_discount ? discountHelpers.formatDiscountDisplay(discountHelpers.parseDiscountFromSale(transaction)) || '-' : '-'}</td>
        <td style="border: 1px solid #000; padding: 8px; text-align: center;">${utils.formatDate(transaction.date)}</td>
      </tr>`
    ).join('')

    const grandTotal = transactions.reduce((total, transaction) => total + parseFloat(transaction.total_price || 0), 0)
    const totalDiscount = transactions.reduce((total, transaction) => total + parseFloat(transaction.discount_amount || 0), 0)

    const reportDate = utils.formatDateNice(currentDate)

    const reportContent = `
      <html>
        <head>
          <title>Data Semua Transaksi dengan Diskon - GROSIR KURMA PONTIANAK</title>
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
            <h2>Data Semua Transaksi dengan Diskon</h2>
            <p>GROSIR KURMA PONTIANAK</p>
          </div>
          
          <div class="info">
            <p><strong>Filter:</strong> ${filterInfo || 'Semua Transaksi'}</p>
            <p><strong>Dicetak pada:</strong> ${reportDate} oleh ${user.name || 'Admin'}</p>
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
            <p>Powered by KIOS KURMA POS System</p>
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