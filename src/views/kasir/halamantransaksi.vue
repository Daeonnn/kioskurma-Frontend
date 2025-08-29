<template>
  <div class="min-h-screen bg-gray-100 p-3 sm:p-4 md:p-6">
    <div class="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6 max-w-7xl mx-auto">
      
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 order-1">
        <div class="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 bg-gray-50">
          <h2 class="text-base sm:text-lg font-semibold text-gray-900">Pilih Barang</h2>
        </div>
        <div class="p-4 sm:p-6">
          <form @submit.prevent="addToCart">
            <div class="mb-4" @click="hideContextMenu">
                <label class="block text-sm font-medium text-gray-700 mb-2">Kode Transaksi (Format: TRYYMMDD000001)</label>
                <div class="relative">
                  <input 
                    v-model="transactionForm.transaction_code"
                    @contextmenu="handleRightClick"
                    type="text" 
                    class="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md bg-red-50 text-red-600 font-medium cursor-pointer"
                    readonly
                    title="Format: TR + YY + MM + DD + 000001 (Reset harian per user). Klik kanan untuk refresh."
                  >
                  <div v-if="loadingTransactionCode" class="absolute right-2 top-2">
                    <div class="animate-spin h-4 w-4 border-2 border-red-500 border-t-transparent rounded-full"></div>
                  </div>
                </div>
                
                <!-- Info format kode transaksi -->
                <div class="mt-1 text-xs text-gray-500">
                  <span v-if="transactionForm.transaction_code && transactionService.parseTransactionCode">
                    Format: TRYYMMDD000001 (Reset harian per user) | Seq: {{ transactionForm.transaction_sequence || 1 }}
                  </span>
                  <span v-else>Format: TRYYMMDD000001 (Reset harian per user)</span>
                </div>
                
                <div v-if="showContextMenu" 
                     :style="{ top: contextMenuPosition.y + 'px', left: contextMenuPosition.x + 'px' }"
                     class="fixed bg-white border border-gray-300 rounded-lg shadow-lg py-1 z-50 min-w-[140px]">
                  <button @click="refreshTransactionCode" 
                          class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                    🔄 Refresh Kode
                  </button>
                </div>
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">Kode barang</label>
              <div class="flex flex-col sm:flex-row gap-2">
                <input 
                  v-model="transactionForm.product_code"
                  @input="onProductCodeChange"
                  @keyup.enter="searchByCode"
                  type="text" 
                  placeholder="Masukkan kode barang"
                  class="flex-1 px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  :disabled="loadingProduct"
                >
                <button 
                  type="button"
                  @click="openProductModal"
                  class="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium text-sm sm:text-base transition-colors min-h-[44px]"
                  :disabled="loadingProducts"
                >
                  {{ loadingProducts ? 'Loading...' : 'Pilih Barang' }}
                </button>
              </div>
              <p v-if="loadingProduct" class="text-xs text-blue-600 mt-1">
                Mencari produk...
              </p>
            </div>

            <div class="space-y-4 mb-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Nama Barang</label>
                <input 
                  v-model="selectedProduct.name"
                  type="text" 
                  class="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md bg-gray-50"
                  readonly
                  placeholder="Pilih barang terlebih dahulu"
                >
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Harga Barang</label>
                <input 
                  v-model="formattedPrice"
                  type="text" 
                  class="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md bg-gray-50"
                  readonly
                  placeholder="Pilih barang terlebih dahulu"
                >
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Jumlah</label>
                <input 
                  v-model="transactionForm.quantity"
                  type="number" 
                  min="1"
                  :max="selectedProduct.stock"
                  class="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  :class="{ 'border-red-300 bg-red-50': hasStockError }"
                  @input="calculateTotal"
                  @blur="validateQuantity"
                  :disabled="!selectedProduct.id"
                  placeholder="Pilih barang untuk memasukkan jumlah"
                >
                <p v-if="selectedProduct.stock && selectedProduct.id" class="text-xs text-gray-500 mt-1">
                  Stok tersedia: {{ selectedProduct.stock }}
                </p>
                <p v-if="stockWarning" class="text-xs text-red-600 mt-1 font-medium">
                  {{ stockWarning }}
                </p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Total</label>
                <input 
                  v-model="formattedTotal"
                  type="text" 
                  class="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md bg-gray-50 font-medium"
                  readonly
                  placeholder="Total akan muncul setelah masukkan jumlah"
                >
              </div>
            </div>

            <button 
              type="submit"
              :disabled="!selectedProduct.id || !transactionForm.quantity || loadingProduct || hasStockError"
              class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 px-4 rounded-md font-medium flex items-center justify-center text-sm sm:text-base transition-colors min-h-[48px]"
            >
              <svg class="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 7h-3V6a4 4 0 0 0-8 0v1H5a1 1 0 0 0-1 1v11a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V8a1 1 0 0 0-1-1zM10 6a2 2 0 0 1 4 0v1h-4V6zm8 13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V9h2v1a1 1 0 0 0 2 0V9h4v1a1 1 0 0 0 2 0V9h2v10z"/>
              </svg>
              <span class="truncate">Tambahkan ke Antrian</span>
            </button>
          </form>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm border border-gray-200 order-2">
        <div class="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 bg-gray-50">
          <h2 class="text-base sm:text-lg font-semibold text-gray-900">Antrian Barang</h2>
        </div>
        <div class="p-4 sm:p-6">
          <div v-if="cartItems.length === 0" class="text-center py-8 sm:py-12">
            <svg class="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
            </svg>
            <p class="text-gray-500 text-sm sm:text-base">Tidak ada antrian</p>
          </div>

          <div v-else>
            <div class="space-y-3 sm:space-y-4 mb-6">
              <div v-for="(item, index) in cartItems" :key="index" 
                   class="border border-gray-200 rounded-lg p-3 sm:p-4">
                <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3">
                  <div class="flex-1 mb-2 sm:mb-0">
                    <h3 class="font-medium text-gray-900 text-sm sm:text-base">{{ item.name }}</h3>
                    <p class="text-xs sm:text-sm text-gray-500">{{ item.kode_barang }} • {{ item.queue_code }}</p>
                  </div>
                  <button 
                    @click="removeFromCart(index)"
                    class="text-red-600 hover:text-red-800 self-end sm:self-start p-1 rounded transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center"
                    title="Hapus item"
                  >
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                    </svg>
                  </button>
                </div>
                
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-sm">
                  <div class="flex justify-between sm:flex-col">
                    <span class="text-gray-600">Jumlah:</span>
                    <p class="font-medium">{{ item.quantity }}</p>
                  </div>
                  <div class="flex justify-between sm:flex-col">
                    <span class="text-gray-600">Harga Item:</span>
                    <p class="font-medium">Rp {{ formatCurrency(item.selling_price) }}</p>
                  </div>
                  <div class="flex justify-between sm:flex-col">
                    <span class="text-gray-600">Subtotal:</span>
                    <p class="font-medium">Rp {{ formatCurrency(item.subtotal) }}</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="border-t border-gray-200 pt-4 mb-4">
              <div class="flex justify-between items-center text-lg font-semibold mb-4">
                <span>Harga Total Pembelanjaan:</span>
                <span>Rp {{ formatCurrency(subtotalAmount) }}</span>
              </div>

              <div class="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                <h3 class="text-lg font-semibold text-orange-800 mb-3 flex items-center">
                  <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9.5 3A6.5 6.5 0 0 1 16 9.5c0 1.61-.59 3.09-1.56 4.23l.27.27h.79l5 5-1.5 1.5-5-5v-.79l-.27-.27A6.516 6.516 0 0 1 9.5 16 6.5 6.5 0 0 1 3 9.5 6.5 6.5 0 0 1 9.5 3m0 2C7 5 5 7 5 9.5S7 14 9.5 14 14 12 14 9.5 12 5 9.5 5Z"/>
                  </svg>
                  Diskon
                </h3>
                
                <div v-if="appliedDiscount" class="mb-4 p-3 bg-green-100 border border-green-300 rounded-md">
                  <div class="flex justify-between items-center">
                    <div>
                      <p class="font-medium text-green-800">
                        {{ appliedDiscount.type === 'percentage' ? `Diskon ${appliedDiscount.value}%` : `Diskon Rp ${formatCurrency(appliedDiscount.value)}` }}
                      </p>
                      <p class="text-sm text-green-600">
                        Potongan: Rp {{ formatCurrency(appliedDiscount.amount) }}
                      </p>
                    </div>
                    <button 
                      @click="removeDiscount"
                      class="text-red-600 hover:text-red-800 p-1 rounded transition-colors"
                      title="Hapus diskon"
                    >
                      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                      </svg>
                    </button>
                  </div>
                </div>

                <div v-if="!appliedDiscount" class="space-y-3">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Tipe Diskon</label>
                    <div class="grid grid-cols-2 gap-2">
                      <button
                        @click="discountType = 'percentage'"
                        :class="[
                          'p-3 rounded-md border-2 font-medium transition-all',
                          discountType === 'percentage' 
                            ? 'border-orange-500 bg-orange-50 text-orange-700' 
                            : 'border-gray-300 bg-white text-gray-700 hover:border-orange-300'
                        ]"
                        type="button"
                      >
                        <div class="flex items-center justify-center">
                          <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M18.5 3.5L3.5 18.5L5 20L20 5M7 4V8H11V10H5V4H7M17 14V18H21V20H15V14H17Z"/>
                          </svg>
                          Persentase
                        </div>
                      </button>
                      <button
                        @click="discountType = 'fixed'"
                        :class="[
                          'p-3 rounded-md border-2 font-medium transition-all',
                          discountType === 'fixed' 
                            ? 'border-orange-500 bg-orange-50 text-orange-700' 
                            : 'border-gray-300 bg-white text-gray-700 hover:border-orange-300'
                        ]"
                        type="button"
                      >
                        <div class="flex items-center justify-center">
                          <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M7,15H9C9,16.08 10.37,17 12,17C13.63,17 15,16.08 15,15C15,13.9 13.96,13.5 11.76,12.97C9.64,12.44 7,11.78 7,9C7,7.21 8.47,5.69 10.5,5.18V3H13.5V5.18C15.53,5.69 17,7.21 17,9H15C15,7.92 13.63,7 12,7C10.37,7 9,7.92 9,9C9,10.1 10.04,10.5 12.24,11.03C14.36,11.56 17,12.22 17,15C17,16.79 15.53,18.31 13.5,18.82V21H10.5V18.82C8.47,18.31 7,16.79 7,15Z"/>
                          </svg>
                          Nominal
                        </div>
                      </button>
                    </div>
                  </div>

                  <div v-if="discountType">
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      {{ discountType === 'percentage' ? 'Persentase (%)' : 'Nominal (Rp)' }}
                    </label>
                    <input
                      v-model.number="discountValue"
                      type="number"
                      :min="0"
                      :max="discountType === 'percentage' ? 80 : maxDiscountFixed"
                      :step="discountType === 'percentage' ? 1 : 1000"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      :placeholder="discountType === 'percentage' ? 'Masukkan persentase (1-80)' : 'Masukkan nominal diskon'"
                      @input="validateDiscountInput"
                    >
                    <p v-if="discountType === 'percentage'" class="text-xs text-gray-500 mt-1">
                      Maksimal 80% dari subtotal
                    </p>
                    <p v-if="discountType === 'fixed'" class="text-xs text-gray-500 mt-1">
                      Maksimal Rp {{ formatCurrency(maxDiscountFixed) }}
                    </p>
                  </div>

                  <button
                    @click="applyDiscount"
                    :disabled="!discountType || !discountValue || discountValue <= 0"
                    class="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-md font-medium transition-colors"
                    type="button"
                  >
                    Terapkan Diskon
                  </button>

                  <div v-if="discountType && discountValue > 0" class="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                    <p class="text-sm text-yellow-800">
                      <strong>Preview:</strong> 
                      {{ discountType === 'percentage' 
                         ? `Diskon ${discountValue}% = Rp ${formatCurrency(calculateDiscountPreview())}` 
                         : `Diskon Rp ${formatCurrency(discountValue)}` 
                      }}
                    </p>
                  </div>
                </div>
              </div>
              
              <div class="flex justify-between items-center text-xl font-bold mb-6 p-4 bg-gray-50 rounded-lg border-2 border-blue-200">
                <span>Total Pembayaran:</span>
                <div class="text-right">
                  <div v-if="appliedDiscount" class="text-sm font-normal text-gray-600 line-through">
                    Rp {{ formatCurrency(subtotalAmount) }}
                  </div>
                  <span class="text-blue-600">Rp {{ formatCurrency(totalAmount) }}</span>
                </div>
              </div>
              
              <div class="mb-4 sm:mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-3">Metode Pembayaran</label>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button 
                    @click="selectPaymentMethod('tunai')"
                    :class="[
                      'p-3 sm:p-4 rounded-lg border-2 font-medium transition-all duration-200 min-h-[56px]',
                      paymentMethod === 'tunai' 
                        ? 'border-green-500 bg-green-50 text-green-700' 
                        : 'border-gray-300 bg-white text-gray-700 hover:border-green-300'
                    ]"
                    type="button"
                  >
                    <div class="flex items-center justify-center">
                      <svg class="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"/>
                      </svg>
                      <span>Tunai</span>
                    </div>
                  </button>
                  
                  <button 
                    @click="selectPaymentMethod('qris')"
                    :class="[
                      'p-3 sm:p-4 rounded-lg border-2 font-medium transition-all duration-200 min-h-[56px]',
                      paymentMethod === 'qris' 
                        ? 'border-blue-500 bg-blue-50 text-blue-700' 
                        : 'border-gray-300 bg-white text-gray-700 hover:border-blue-300'
                    ]"
                    type="button"
                  >
                    <div class="flex items-center justify-center">
                      <svg class="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 2V5h1v1H5zM3 13a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3zm2 2v-1h1v1H5zM13 3a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1V4a1 1 0 011-1h3zm-1 2v1h-1V5h1zM11 13a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-3zm2 2v-1h1v1h-1z" clip-rule="evenodd"/>
                      </svg>
                      <span>QRIS</span>
                    </div>
                  </button>
                </div>
              </div>

              <div v-if="paymentMethod === 'tunai'" class="mb-4 sm:mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-2">Jumlah Uang Diterima</label>
                <input
                  v-model.number="cashReceived"
                  type="number"
                  min="0"
                  :step="1000"
                  class="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  :class="{ 'border-red-300 bg-red-50': cashError }"
                  placeholder="Masukkan jumlah uang yang diterima"
                  @input="calculateChange"
                >
                <p v-if="cashError" class="text-xs text-red-600 mt-1 font-medium">
                  {{ cashError }}
                </p>
                
                <div v-if="changeAmount >= 0 && cashReceived && cashReceived >= totalAmount" 
                     class="mt-3 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                    <span class="text-sm sm:text-base font-medium text-green-800 mb-1 sm:mb-0">Kembalian:</span>
                    <span class="text-lg sm:text-xl font-bold text-green-800">Rp {{ formatCurrency(changeAmount) }}</span>
                  </div>
                </div>
                
                <div class="mt-3 sm:mt-4">
                  <p class="text-xs text-gray-600 mb-2">Uang Tunai:</p>
                  <div class="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
                    <button
                      v-for="amount in quickCashAmounts"
                      :key="amount"
                      @click="setQuickCash(amount)"
                      class="px-3 py-2 text-xs sm:text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors min-h-[40px] flex items-center justify-center"
                      type="button"
                    >
                      Rp {{ formatCurrency(amount) }}
                    </button>
                  </div>
                </div>
              </div>

              <div v-if="paymentMethod === 'qris'" class="mb-4 sm:mb-6">
                <div class="text-center p-4 sm:p-6 bg-blue-50 border border-blue-200 rounded-lg">
                  <div class="w-32 h-32 sm:w-40 sm:h-40 bg-white border-2 border-blue-300 rounded-lg mx-auto mb-3 sm:mb-4 flex items-center justify-center">
                    <div class="text-center">
                      <svg class="w-16 h-16 sm:w-20 sm:h-20 text-blue-500 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 2V5h1v1H5zM3 13a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3zm2 2v-1h1v1H5zM13 3a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1V4a1 1 0 011-1h3zm-1 2v1h-1V5h1zM11 13a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-3zm2 2v-1h1v1h-1z" clip-rule="evenodd"/>
                      </svg>
                      <p class="text-xs text-blue-600">QR Code</p>
                    </div>
                  </div>
                  <p class="text-sm font-medium text-blue-800 mb-1">Scan QR Code untuk pembayaran</p>
                  <p class="text-lg sm:text-xl font-bold text-blue-900 mb-2">Rp {{ formatCurrency(totalAmount) }}</p>
                  <p class="text-xs text-blue-600">Menunggu konfirmasi pembayaran...</p>
                </div>
              </div>

              <button 
                @click="processTransaction"
                :disabled="processing || cartItems.length === 0 || !isPaymentValid"
                class="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3 sm:py-4 px-4 rounded-md font-medium flex items-center justify-center text-sm sm:text-base transition-colors min-h-[52px]"
                type="button"
              >
                <div v-if="processing" class="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2 flex-shrink-0"></div>
                <span v-if="processing">Memproses...</span>
                <span v-else-if="paymentMethod === 'qris'" class="truncate">Konfirmasi Pembayaran QRIS</span>
                <span v-else class="truncate">Proses Transaksi</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showProductModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="closeProductModal"></div>
      
      <div class="relative flex items-center justify-center min-h-screen p-4">
        <div class="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
          <div class="flex justify-between items-center p-4 sm:p-6 border-b border-gray-200">
            <h3 class="text-lg sm:text-xl font-semibold text-gray-900">Pilih Barang</h3>
            <button @click="closeProductModal" class="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 min-w-[40px] min-h-[40px] flex items-center justify-center">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <div class="p-4 sm:p-6">
            <div class="mb-4">
              <input 
                v-model="searchQuery"
                @input="debouncedSearch"
                type="text" 
                placeholder="Cari produk..."
                class="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
            </div>
            
            <div class="overflow-y-auto max-h-[50vh] border border-gray-200 rounded-lg">
              <div v-if="loadingProducts" class="text-center py-8">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p class="text-gray-500 mt-2 text-sm sm:text-base">Memuat produk...</p>
              </div>
              
              <div v-else-if="products.length > 0">
                <table class="hidden sm:table w-full text-sm">
                  <thead class="bg-gray-50 sticky top-0">
                    <tr>
                      <th class="px-4 py-3 text-left text-gray-700 font-medium">Kode Barang</th>
                      <th class="px-4 py-3 text-left text-gray-700 font-medium">Nama Barang</th>
                      <th class="px-4 py-3 text-left text-gray-700 font-medium">Harga</th>
                      <th class="px-4 py-3 text-left text-gray-700 font-medium">Stok</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="product in products" :key="product.id" 
                        class="border-t border-gray-200 hover:bg-blue-50 cursor-pointer transition-colors"
                        :class="{ 'opacity-50 cursor-not-allowed': product.stock === 0 }"
                        @click="product.stock > 0 ? selectProduct(product) : null">
                      <td class="px-4 py-3 text-blue-600 font-medium hover:text-blue-800">
                        {{ product.kode_barang }}
                        <span v-if="product.stock === 0" class="text-red-500 text-xs ml-2">(Habis)</span>
                      </td>
                      <td class="px-4 py-3">{{ product.name }}</td>
                      <td class="px-4 py-3">Rp {{ formatCurrency(product.selling_price) }}</td>
                      <td class="px-4 py-3">
                        <span :class="product.stock > 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'">
                          {{ product.stock }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>

                <div class="sm:hidden">
                  <div v-for="product in products" :key="product.id" 
                       class="border-b border-gray-200 p-4 hover:bg-blue-50 cursor-pointer transition-colors"
                       :class="{ 'opacity-50 cursor-not-allowed': product.stock === 0 }"
                       @click="product.stock > 0 ? selectProduct(product) : null">
                    <div class="flex justify-between items-start mb-2">
                      <div class="flex-1">
                        <div class="font-medium text-blue-600">
                          {{ product.kode_barang }}
                          <span v-if="product.stock === 0" class="text-red-500 text-xs ml-2">(Habis)</span>
                        </div>
                        <div class="text-gray-900 font-medium">{{ product.name }}</div>
                      </div>
                      <div class="text-right">
                        <div class="font-medium">Rp {{ formatCurrency(product.selling_price) }}</div>
                        <div :class="product.stock > 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'">
                          Stok: {{ product.stock }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div v-else class="text-center py-8">
                <p class="text-gray-500 text-sm sm:text-base">Produk tidak ditemukan</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showToast" 
         :class="toastType === 'success' ? 'bg-green-500' : toastType === 'error' ? 'bg-red-500' : 'bg-blue-500'"
         class="fixed top-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm text-white px-4 sm:px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300">
      <div class="flex items-center">
        <svg v-if="toastType === 'success'" class="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
        </svg>
        <svg v-else-if="toastType === 'error'" class="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
        </svg>
        <svg v-else class="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
          <path d="M13 9h-2V7h2m0 10h-2v-6h2m-1-9A10 10 0 0 0 2 12a10 10 0 0 0 10 10 10 10 0 0 0 10-10A10 10 0 0 0 12 2z"/>
        </svg>
        <span class="text-sm sm:text-base">{{ toastMessage }}</span>
      </div>
    </div>

    <div v-if="showSuccessModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
      <div class="relative flex items-center justify-center min-h-screen p-4">
        <div class="bg-white rounded-xl shadow-2xl w-full max-w-md">
          <div class="p-6 text-center">
            <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
            </div>
            
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Transaksi Berhasil!</h3>
            <p class="text-gray-600 mb-4">Kode Transaksi: {{ lastTransactionCode }}</p>
            <p class="text-gray-600 mb-2">Total: Rp {{ formatCurrency(lastTransactionTotal) }}</p>
            <p class="text-gray-600 mb-2">Metode: {{ paymentMethod === 'tunai' ? 'Tunai' : 'QRIS' }}</p>
            
            <div v-if="lastTransactionDiscount" class="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
              <p class="text-sm text-orange-800">
                <strong>Diskon:</strong> 
                {{ lastTransactionDiscount.type === 'percentage' 
                   ? `${lastTransactionDiscount.value}% (Rp ${formatCurrency(lastTransactionDiscount.amount)})` 
                   : `Rp ${formatCurrency(lastTransactionDiscount.amount)}` 
                }}
              </p>
            </div>
            
            <div v-if="paymentMethod === 'tunai' && lastTransactionCash > 0" class="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
              <div class="text-sm space-y-1">
                <div class="flex justify-between">
                  <span class="text-gray-600">Uang Diterima:</span>
                  <span class="font-medium">Rp {{ formatCurrency(lastTransactionCash) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Kembalian:</span>
                  <span class="font-medium text-green-600">Rp {{ formatCurrency(lastTransactionChange) }}</span>
                </div>
              </div>
            </div>
            
            <div class="flex flex-col sm:flex-row gap-3">
              <button 
                @click="printReceiptWithData"
                class="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-md font-medium transition-colors min-h-[48px] flex items-center justify-center"
                type="button"
              >
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
                </svg>
                Cetak Struk
              </button>
              <button 
                @click="closeSuccessModal"
                class="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-3 px-4 rounded-md font-medium transition-colors min-h-[48px]"
                type="button"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { productService, transactionService, utils } from '../../../services/api'

export default {
  name: 'KasirTransaksi',
  setup() {
    const showProductModal = ref(false)
    const showToast = ref(false)
    const showSuccessModal = ref(false)
    const toastMessage = ref('')
    const toastType = ref('success')
    const processing = ref(false)
    const loadingProducts = ref(false)
    const loadingProduct = ref(false)
    const loadingTransactionCode = ref(false)
    const searchQuery = ref('')
    const lastTransactionCode = ref('')
    const lastTransactionTotal = ref(0)
    const lastTransactionItems = ref([])
    const lastTransactionCash = ref(0)
    const lastTransactionChange = ref(0)
    const lastTransactionDiscount = ref(null)
    const stockWarning = ref('')
    const queueCounter = ref(1)
    
    const showContextMenu = ref(false)
    const contextMenuPosition = ref({ x: 0, y: 0 })
    
    const paymentMethod = ref('tunai')
    const cashReceived = ref(null)
    const changeAmount = ref(0)
    const cashError = ref('')
    
    const discountType = ref('')
    const discountValue = ref(0)
    const appliedDiscount = ref(null)
    
    const products = ref([])
    
    // ✅ UPDATED: transactionForm dengan format TRYYMMDD000001
    const transactionForm = ref({
      transaction_code: '', // Format: TRYYMMDD000001
      transaction_sequence: 1, // Reset harian per user
      user_id: null, // ID user untuk reset sequence
      product_code: '',
      quantity: null,
      subtotal: 0
    })
    
    const selectedProduct = ref({
      id: null,
      kode_barang: '',
      name: '',
      selling_price: 0,
      stock: 0
    })
    
    const cartItems = ref([])
    
    let searchTimeout = null
    
    const subtotalAmount = computed(() => {
      return cartItems.value.reduce((total, item) => total + parseFloat(item.subtotal || 0), 0)
    })
    
    const totalAmount = computed(() => {
      const discountAmount = appliedDiscount.value ? parseFloat(appliedDiscount.value.amount || 0) : 0
      return subtotalAmount.value - discountAmount
    })

    const maxDiscountFixed = computed(() => {
      const subtotal = parseFloat(subtotalAmount.value) || 0
      const maxDiscount = Math.floor(subtotal * 0.8)
      console.log('🔍 maxDiscountFixed computed:', {
        subtotal: subtotal,
        calculation: subtotal * 0.8,
        floored: maxDiscount,
        formatted: utils.formatCurrency(maxDiscount)
      })
      return maxDiscount
    })
    
    const formattedPrice = computed(() => {
      return selectedProduct.value.selling_price 
        ? `Rp ${utils.formatCurrency(selectedProduct.value.selling_price)}` 
        : ''
    })
    
    const formattedTotal = computed(() => {
      return transactionForm.value.subtotal 
        ? `Rp ${utils.formatCurrency(transactionForm.value.subtotal)}` 
        : ''
    })
    
    const hasStockError = computed(() => {
      return stockWarning.value !== ''
    })
    
    const currentQueueCode = computed(() => {
      return generateQueueCode(queueCounter.value)
    })
    
    const isPaymentValid = computed(() => {
      if (paymentMethod.value === 'qris') {
        return true
      }
      if (paymentMethod.value === 'tunai') {
        return cashReceived.value && parseFloat(cashReceived.value) >= parseFloat(totalAmount.value) && !cashError.value
      }
      return false
    })
    
    const quickCashAmounts = computed(() => {
      const total = totalAmount.value
      const amounts = []
      
      amounts.push(total)
      
      const roundedUp10k = Math.ceil(total / 10000) * 10000
      const roundedUp20k = Math.ceil(total / 20000) * 20000
      const roundedUp50k = Math.ceil(total / 50000) * 50000
      const roundedUp100k = Math.ceil(total / 100000) * 100000
      
      if (roundedUp10k > total) amounts.push(roundedUp10k)
      if (roundedUp20k > total && roundedUp20k !== roundedUp10k) amounts.push(roundedUp20k)
      if (roundedUp50k > total && roundedUp50k !== roundedUp20k) amounts.push(roundedUp50k)
      if (roundedUp100k > total && roundedUp100k !== roundedUp50k) amounts.push(roundedUp100k)
      
      return amounts.slice(0, 4)
    })
    
    const formatCurrency = utils.formatCurrency

    const calculateDiscountPreview = () => {
      if (!discountType.value || !discountValue.value) return 0
      
      const subtotal = parseFloat(subtotalAmount.value) || 0
      
      if (discountType.value === 'percentage') {
        return Math.round((subtotal * parseFloat(discountValue.value)) / 100)
      } else {
        return parseFloat(discountValue.value) || 0
      }
    }

    const validateDiscountInput = () => {
      const discountValueNumber = parseFloat(discountValue.value) || 0
      const subtotal = parseFloat(subtotalAmount.value) || 0
      
      console.log('🔍 validateDiscountInput:', {
        type: discountType.value,
        value: discountValueNumber,
        subtotal: subtotal
      })
      
      if (discountType.value === 'percentage') {
        if (discountValueNumber > 80) {
          discountValue.value = 80
          console.warn('⚠️ Auto-corrected percentage to 80%')
        }
      } else if (discountType.value === 'fixed') {
        const maxFixed = Math.floor(subtotal * 0.8)
        if (discountValueNumber > maxFixed) {
          discountValue.value = maxFixed
          console.warn('⚠️ Auto-corrected fixed amount to max:', maxFixed)
        }
      }
    }
    
    const applyDiscount = () => {
      const discountTypeValue = discountType.value
      const discountValueNumber = parseFloat(discountValue.value) || 0
      const subtotal = parseFloat(subtotalAmount.value) || 0
      
      console.log('🔍 APPLY DISCOUNT DEBUG:', {
        discountType: discountTypeValue,
        discountValue: discountValueNumber,
        subtotal: subtotal,
        types: {
          discountValueType: typeof discountValueNumber,
          subtotalType: typeof subtotal
        }
      })

      if (!discountTypeValue || discountValueNumber <= 0) {
        showToastNotification('Pilih tipe diskon dan masukkan nilai yang valid!', 'error')
        return
      }
      
      if (subtotal <= 0) {
        showToastNotification('Tidak ada item dalam keranjang!', 'error')
        return
      }

      let discountAmount = 0
      
      if (discountTypeValue === 'percentage') {
        if (discountValueNumber > 80.0) {
          console.error('❌ Percentage validation failed:', discountValueNumber, '> 80')
          showToastNotification('Persentase diskon tidak boleh lebih dari 80%!', 'error')
          return
        }
        
        discountAmount = Math.round((subtotal * discountValueNumber) / 100)
        
        console.log('✅ Percentage calculation:', {
          formula: `${subtotal} * ${discountValueNumber} / 100`,
          result: discountAmount,
          rounded: Math.round(discountAmount)
        })
        
      } else if (discountTypeValue === 'fixed') {
        const maxFixedAmount = Math.floor(subtotal * 0.8)
        
        if (discountValueNumber > maxFixedAmount) {
          console.error('❌ Fixed validation failed:', discountValueNumber, '>', maxFixedAmount)
          showToastNotification(`Nominal diskon tidak boleh lebih dari 80% subtotal! Maksimal: Rp ${formatCurrency(maxFixedAmount)}`, 'error')
          return
        }
        
        discountAmount = discountValueNumber
      }

      const maxTotalDiscount = Math.floor(subtotal * 0.8)
      if (discountAmount > maxTotalDiscount) {
        console.error('❌ Final validation failed:', discountAmount, '>', maxTotalDiscount)
        showToastNotification(`Total diskon melebihi 80% dari subtotal!`, 'error')
        return
      }

      console.log('✅ Discount validation passed:', {
        type: discountTypeValue,
        value: discountValueNumber,
        amount: discountAmount,
        maxAllowed: maxTotalDiscount
      })

      appliedDiscount.value = {
        type: discountTypeValue,
        value: discountValueNumber,
        amount: discountAmount
      }
      
      showToastNotification(`Diskon berhasil diterapkan: Rp ${formatCurrency(discountAmount)}`, 'success')
      
      discountType.value = ''
      discountValue.value = 0
      
      if (paymentMethod.value === 'tunai') {
        calculateChange()
      }
    }
    
    const removeDiscount = () => {
      appliedDiscount.value = null
      discountType.value = ''
      discountValue.value = 0
      showToastNotification('Diskon dihapus', 'success')
      
      if (paymentMethod.value === 'tunai') {
        calculateChange()
      }
    }
    
    const getTransactionCodeFromServer = async (retryCount = 0) => {
      const maxRetries = 3
      
      try {
        loadingTransactionCode.value = true
        console.log(`[KASIR] Getting transaction code with format TRYYMMDD000001 (attempt ${retryCount + 1}/${maxRetries + 1})...`)
        
        const response = await transactionService.getNextTransactionCode()
        
        if (response.success && response.data.next_code) {
          const { next_code, next_sequence, user_id } = response.data
          console.log('[KASIR] Transaction code received with new format:', { 
            code: next_code, 
            sequence: next_sequence, 
            user_id: user_id,
            format_valid: transactionService.validateTransactionCodeFormat ? transactionService.validateTransactionCodeFormat(next_code) : true
          })
          
          // ✅ VALIDASI format kode transaksi
          if (transactionService.validateTransactionCodeFormat && !transactionService.validateTransactionCodeFormat(next_code)) {
            console.warn('[KASIR] Invalid transaction code format received:', next_code)
          }
          
          // ✅ UPDATED: Set kode transaksi dengan format TRYYMMDD000001
          transactionForm.value.transaction_code = next_code
          transactionForm.value.transaction_sequence = next_sequence
          transactionForm.value.user_id = user_id
        
          return { code: next_code, sequence: next_sequence, user_id }
        } else {
          throw new Error('Server response invalid: ' + JSON.stringify(response))
        }
      } catch (error) {
        console.error('[KASIR] Error getting transaction code:', error)

        if (retryCount < maxRetries) {
          console.log('[KASIR] Retrying in 1 second...')
          await new Promise(resolve => setTimeout(resolve, 1000))
          return getTransactionCodeFromServer(retryCount + 1)
        } else {
          console.error('[KASIR] Max retries reached, using fallback')
          
          // ✅ UPDATED: Fallback dengan format TRYYMMDD000001
          const now = new Date()
          const year = now.getFullYear().toString().slice(-2) // 2 digit terakhir tahun
          const month = String(now.getMonth() + 1).padStart(2, '0') // 2 digit bulan
          const day = String(now.getDate()).padStart(2, '0') // 2 digit hari
          const sequence = '000001' // Default sequence untuk fallback
          
          const fallbackCode = `TR${year}${month}${day}${sequence}`
          const fallbackSequence = 1
          
          console.log('[KASIR] Using fallback code with new format:', fallbackCode, 'sequence:', fallbackSequence)
          
          // Set fallback values
          transactionForm.value.transaction_code = fallbackCode
          transactionForm.value.transaction_sequence = fallbackSequence
          transactionForm.value.user_id = null
          
          return { code: fallbackCode, sequence: fallbackSequence, user_id: null }
        }
      } finally {
        loadingTransactionCode.value = false
      }
    }
    
    const initializeTransactionCode = async (retryCount = 0) => {
      const maxRetries = 3
      
      try {
        console.log(`[KASIR] Initializing transaction code with format TRYYMMDD000001 (attempt ${retryCount + 1}/${maxRetries + 1})...`)
        const result = await getTransactionCodeFromServer()
        
        console.log('[KASIR] Transaction code initialized with new format:', {
          code: result.code,
          sequence: result.sequence,
          user_id: result.user_id,
          format_valid: transactionService.validateTransactionCodeFormat ? transactionService.validateTransactionCodeFormat(result.code) : true
        })
        return result
      } catch (error) {
        console.error(`[KASIR] Error initializing transaction code with new format (attempt ${retryCount + 1}):`, error)
        
        if (retryCount < maxRetries) {
          console.log('[KASIR] Retrying in 1 second...')
          await new Promise(resolve => setTimeout(resolve, 1000))
          return initializeTransactionCode(retryCount + 1)
        } else {
          console.error('[KASIR] Max retries reached, using fallback')
          showToastNotification('Gagal mendapatkan kode transaksi dari server. Menggunakan fallback.', 'error')
          return { code: transactionForm.value.transaction_code, sequence: transactionForm.value.transaction_sequence, user_id: null }
        }
      }
    }
    
    const handleRightClick = (event) => {
      event.preventDefault()
      contextMenuPosition.value = { x: event.clientX, y: event.clientY }
      showContextMenu.value = true
    }

    const hideContextMenu = () => {
      showContextMenu.value = false
    }

    const refreshTransactionCode = async () => {
      hideContextMenu()
      try {
        const newCode = await getTransactionCodeFromServer()
        transactionForm.value.transaction_code = newCode
        showToastNotification(`Kode transaksi diperbarui: ${newCode}`, 'success')
      } catch (error) {
        showToastNotification('Gagal memperbarui kode transaksi', 'error')
      }
    }
    
    const generateQueueCode = (number) => {
      return `AN${number.toString().padStart(3, '0')}`
    }
    
    const validateQuantity = () => {
      if (!selectedProduct.value.id || !transactionForm.value.quantity) {
        stockWarning.value = ''
        return
      }
      
      const quantity = parseInt(transactionForm.value.quantity)
      
      if (quantity <= 0) {
        stockWarning.value = 'Jumlah harus lebih dari 0!'
        return
      }
      
      if (quantity > selectedProduct.value.stock) {
        stockWarning.value = `Jumlah melebihi stok yang tersedia! (Stok: ${selectedProduct.value.stock})`
        return
      }
      
      const existingItem = cartItems.value.find(item => item.id === selectedProduct.value.id)
      if (existingItem) {
        const totalQuantity = existingItem.quantity + quantity
        if (totalQuantity > selectedProduct.value.stock) {
          stockWarning.value = `Total jumlah (${totalQuantity}) melebihi stok! (Stok: ${selectedProduct.value.stock}, Sudah di keranjang: ${existingItem.quantity})`
          return
        }
      }
      
      stockWarning.value = ''
    }
    
    const fetchProducts = async (searchTerm = '') => {
      try {
        loadingProducts.value = true
        const response = await productService.getProducts({ search: searchTerm })
        
        if (response.success) {
          products.value = response.data
        } else {
          showToastNotification('Gagal memuat produk', 'error')
        }
      } catch (error) {
        console.error('Error fetching products:', error)
        showToastNotification('Gagal memuat produk', 'error')
      } finally {
        loadingProducts.value = false
      }
    }
    
    const debouncedSearch = () => {
      clearTimeout(searchTimeout)
      searchTimeout = setTimeout(() => {
        fetchProducts(searchQuery.value)
      }, 300)
    }
    
    const searchByCode = async () => {
      if (!transactionForm.value.product_code.trim()) return
      
      try {
        loadingProduct.value = true
        const response = await productService.getProductByCode(transactionForm.value.product_code)
        
        if (response.success) {
          selectProduct(response.data)
        } else {
          showToastNotification('Produk tidak ditemukan', 'error')
          clearSelectedProduct()
        }
      } catch (error) {
        console.error('Error searching product by code:', error)
        showToastNotification('Gagal mencari produk', 'error')
        clearSelectedProduct()
      } finally {
        loadingProduct.value = false
      }
    }
    
    const onProductCodeChange = () => {
      if (!transactionForm.value.product_code.trim()) {
        clearSelectedProduct()
      }
    }
    
    const clearSelectedProduct = () => {
      selectedProduct.value = {
        id: null,
        kode_barang: '',
        name: '',
        selling_price: 0,
        stock: 0
      }
      transactionForm.value.subtotal = 0
      transactionForm.value.quantity = null
      stockWarning.value = ''
    }
    
    const openProductModal = async () => {
      showProductModal.value = true
      await fetchProducts()
    }
    
    const closeProductModal = () => {
      showProductModal.value = false
      searchQuery.value = ''
    }
    
    const selectProduct = (product) => {
      if (product.stock <= 0) {
        showToastNotification('Stok produk tidak tersedia!', 'error')
        return
      }
      
      selectedProduct.value = {
        id: product.id,
        kode_barang: product.kode_barang,
        name: product.name,
        selling_price: parseFloat(product.selling_price),
        stock: product.stock
      }
      
      transactionForm.value.product_code = product.kode_barang
      transactionForm.value.quantity = null
      transactionForm.value.subtotal = 0
      stockWarning.value = ''
      closeProductModal()
    }
    
    const calculateTotal = () => {
      validateQuantity()
      const quantity = parseInt(transactionForm.value.quantity) || 0
      const price = selectedProduct.value.selling_price || 0
      transactionForm.value.subtotal = quantity * price
    }
    
    const addToCart = () => {
      if (!selectedProduct.value.id || !transactionForm.value.quantity) {
        showToastNotification('Pilih produk dan masukkan jumlah!', 'error')
        return
      }
      
      if (hasStockError.value) {
        showToastNotification('Periksa kembali jumlah yang dimasukkan!', 'error')
        return
      }
      
      const quantity = parseInt(transactionForm.value.quantity)
      
      if (quantity <= 0) {
        showToastNotification('Jumlah harus lebih dari 0!', 'error')
        return
      }
      
      if (quantity > selectedProduct.value.stock) {
        showToastNotification('Jumlah melebihi stok yang tersedia!', 'error')
        return
      }
      
      const existingItemIndex = cartItems.value.findIndex(item => item.id === selectedProduct.value.id)
      
      if (existingItemIndex !== -1) {
        const newQuantity = cartItems.value[existingItemIndex].quantity + quantity
        if (newQuantity > selectedProduct.value.stock) {
          showToastNotification('Total jumlah melebihi stok yang tersedia!', 'error')
          return
        }
        cartItems.value[existingItemIndex].quantity = newQuantity
        cartItems.value[existingItemIndex].subtotal = newQuantity * selectedProduct.value.selling_price
      } else {
        const newItem = {
          id: selectedProduct.value.id,
          kode_barang: selectedProduct.value.kode_barang,
          name: selectedProduct.value.name,
          selling_price: selectedProduct.value.selling_price,
          quantity: quantity,
          subtotal: transactionForm.value.subtotal,
          stock: selectedProduct.value.stock,
          queue_code: generateQueueCode(queueCounter.value)
        }
        cartItems.value.push(newItem)
        queueCounter.value++
      }
      
      clearSelectedProduct()
      transactionForm.value.product_code = ''
      
      showToastNotification('Produk berhasil ditambahkan ke antrian!', 'success')
      
      if (appliedDiscount.value) {
        appliedDiscount.value = null
        showToastNotification('Diskon direset karena ada perubahan item', 'info')
      }
    }
    
    const removeFromCart = (index) => {
      cartItems.value.splice(index, 1)
      showToastNotification('Produk dihapus dari antrian!', 'success')
      resetPayment()
      
      if (appliedDiscount.value) {
        appliedDiscount.value = null
        showToastNotification('Diskon direset karena ada perubahan item', 'info')
      }
    }
    
    const selectPaymentMethod = (method) => {
      paymentMethod.value = method
      resetPayment()
    }
    
    const resetPayment = () => {
      cashReceived.value = null
      changeAmount.value = 0
      cashError.value = ''
    }
    
    const calculateChange = () => {
      cashError.value = ''
      
      if (!cashReceived.value || cashReceived.value === '') {
        changeAmount.value = 0
        return
      }
      
      const cash = parseFloat(cashReceived.value)
      const total = parseFloat(totalAmount.value)
      
      if (isNaN(cash) || isNaN(total)) {
        cashError.value = 'Input tidak valid'
        changeAmount.value = 0
        return
      }
      
      if (cash < total) {
        cashError.value = `Uang tidak cukup! Kurang: Rp ${formatCurrency(total - cash)}`
        changeAmount.value = 0
      } else {
        changeAmount.value = cash - total
        cashError.value = ''
      }
    }
    
    const setQuickCash = (amount) => {
      cashReceived.value = amount
      calculateChange()
    }
    
    const processTransaction = async () => {
      if (cartItems.value.length === 0) {
        showToastNotification('Tidak ada produk dalam antrian!', 'error')
        return
      }
      
      if (!isPaymentValid.value) {
        if (paymentMethod.value === 'tunai') {
          showToastNotification('Periksa kembali jumlah uang yang diterima!', 'error')
        } else {
          showToastNotification('Pilih metode pembayaran!', 'error')
        }
        return
      }
      
      if (processing.value) {
        console.log('[KASIR] Transaction already in progress, ignoring duplicate request...')
        return
      }
      
      processing.value = true
      
      try {
        console.log('[KASIR] Starting transaction process...')
        
        const freshTransactionCode = await getTransactionCodeFromServer()
        
        lastTransactionItems.value = [...cartItems.value]
        lastTransactionTotal.value = totalAmount.value
        lastTransactionDiscount.value = appliedDiscount.value ? {...appliedDiscount.value} : null
        
        const storedCashReceived = paymentMethod.value === 'tunai' ? parseFloat(cashReceived.value) : 0
        const storedChangeAmount = paymentMethod.value === 'tunai' ? parseFloat(changeAmount.value) : 0
        
        lastTransactionCash.value = storedCashReceived
        lastTransactionChange.value = storedChangeAmount
        
        const cashReceivedValue = paymentMethod.value === 'tunai' ? parseFloat(cashReceived.value) : parseFloat(totalAmount.value)
        const changeAmountValue = paymentMethod.value === 'tunai' ? parseFloat(changeAmount.value) : 0

        const currentDateForBackend = utils.getCurrentDateForBackend()
        
        const saleData = {
          transaction_code: freshTransactionCode,
          date: currentDateForBackend,
          payment_method: paymentMethod.value,
          cash_received: cashReceivedValue,
          change_amount: changeAmountValue,
          total_amount: parseFloat(totalAmount.value),
          discount: appliedDiscount.value,
          items: cartItems.value.map(item => ({
            product_id: item.id,
            quantity: item.quantity,
            selling_price: item.selling_price,
            subtotal: item.subtotal
          }))
        }
        
        console.log('[KASIR] Sending transaction to server with discount:', saleData)
        const response = await transactionService.processSale(saleData)
        
        if (response.success) {
          lastTransactionCode.value = response.data.transaction_code || 
                                     response.data.invoice_number || 
                                     freshTransactionCode
          
          console.log('[KASIR] Transaction completed successfully:', {
            transaction_code: lastTransactionCode.value,
            total: lastTransactionTotal.value,
            payment_method: paymentMethod.value,
            discount: lastTransactionDiscount.value
          })
          
          showSuccessModal.value = true
          
          cartItems.value = []
          queueCounter.value = 1
          appliedDiscount.value = null
          discountType.value = ''
          discountValue.value = 0
          resetPayment()
          paymentMethod.value = 'tunai'
          
          window.dispatchEvent(new CustomEvent('newTransaction'))
          localStorage.setItem('newTransaction', Date.now().toString())
          setTimeout(() => localStorage.removeItem('newTransaction'), 100)
          
          showToastNotification('Transaksi berhasil diproses!', 'success')
        } else {
          throw new Error(response.message || 'Gagal memproses transaksi')
        }
        
      } catch (error) {
        console.error('[KASIR] Transaction error:', error)
        showToastNotification(error.message || 'Terjadi kesalahan saat memproses transaksi!', 'error')
        
        try {
          await initializeTransactionCode()
        } catch (refreshError) {
          console.error('[KASIR] Failed to refresh transaction code:', refreshError)
        }
      } finally {
        processing.value = false
      }
    }
    
    const closeSuccessModal = async () => {
      showSuccessModal.value = false
      
      try {
        await initializeTransactionCode()
        console.log('[KASIR] Ready for next transaction')
      } catch (error) {
        console.error('[KASIR] Failed to get new transaction code:', error)
        showToastNotification('Gagal mendapatkan kode transaksi baru. Silakan refresh halaman.', 'error')
      }
    }
    
        const printReceiptWithData = () => {
          const receiptData = {
            transaction_code: lastTransactionCode.value,
            total: lastTransactionTotal.value,
            items: lastTransactionItems.value,
            paymentMethod: paymentMethod.value,
            cashReceived: lastTransactionCash.value,
            changeAmount: lastTransactionChange.value,
            discount: lastTransactionDiscount.value
          }
          
          printReceiptFromData(receiptData)
        }
        
const printReceiptFromData = (data) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  
  // Import logo - pastikan path sesuai dengan struktur project Anda
  const logoPath = '/src/assets/logo/logo_kurma_gray.png'
  
  const cartItemsHtml = data.items.map(item => 
    `<div style="margin-bottom: 3px;">
      <div style="font-weight: bold; font-size: 12px;">${item.name}</div>
      <div style="display: flex; justify-content: space-between; font-size: 10px;">
        <span>${item.quantity} x Rp ${formatCurrency(item.selling_price)}</span>
        <span>Rp ${formatCurrency(item.subtotal)}</span>
      </div>
    </div>`
  ).join('')

  const subtotalForReceipt = data.items.reduce((sum, item) => sum + item.subtotal, 0)
  
  let discountHtml = ''
  if (data.discount && data.discount.amount > 0) {
    discountHtml = `
      <div style="border-top: 1px dashed #000; padding-top: 5px; margin-top: 5px;">
        <div style="display: flex; justify-content: space-between; font-size: 10px;">
          <span>Subtotal:</span>
          <span>Rp ${formatCurrency(subtotalForReceipt)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 10px;">
          <span>Diskon ${data.discount.type === 'percentage' ? data.discount.value + '%' : 'Rp ' + formatCurrency(data.discount.value)}:</span>
          <span>-Rp ${formatCurrency(data.discount.amount)}</span>
        </div>
      </div>
    `
  }

  let paymentDetailsHtml = ''
  
  if (data.paymentMethod === 'tunai') {
    if (data.cashReceived && data.cashReceived > 0) {
      const changeAmount = data.changeAmount || 0
      paymentDetailsHtml = `
        <div style="border-top: 1px dashed #000; padding-top: 5px; margin-top: 5px;">
          <div style="display: flex; justify-content: space-between; font-size: 10px;">
            <span>Tunai:</span>
            <span>Rp ${formatCurrency(data.cashReceived)}</span>
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
  } else if (data.paymentMethod === 'qris') {
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

  const currentTime = new Date()
  const day = currentTime.getDate().toString().padStart(2, '0')
  const month = (currentTime.getMonth() + 1).toString().padStart(2, '0')
  const year = currentTime.getFullYear()
  const hours = currentTime.getHours().toString().padStart(2, '0')
  const minutes = currentTime.getMinutes().toString().padStart(2, '0')
  
  const receiptDate = `${day}/${month}/${year} ${hours}:${minutes}`

  const receiptContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Struk - ${data.transaction_code}</title>
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
          <!-- Logo sama seperti printReceipt -->
          <img src="${logoPath}" alt="Logo Grosir Kurma Pontianak" class="logo" onerror="console.log('Logo gagal dimuat'); this.style.display='none';">
          <!-- Hilangkan text title karena sudah ada di logo -->
          <p>Jl. Mitra Perdana No.5, Parit Tokaya</p>
          <p>Kec. Pontianak Sel., Kota Pontianak</p>
          <p>Kalimantan Barat 78115</p>
          <p>Telp: 0812-2100-6766</p>
        </div>
        
        <div class="transaction-info">
          <p><span class="label">Kode</span><span class="value">: ${data.transaction_code}</span></p>
          <p><span class="label">Tanggal</span><span class="value">: ${receiptDate}</span></p>
          <p><span class="label">Kasir</span><span class="value">: ${user.name || 'Kasir'}</span></p>
          <p><span class="label">Metode</span><span class="value">: ${data.paymentMethod.toUpperCase()}</span></p>
        </div>
        
        <div class="items-section">
          ${cartItemsHtml}
        </div>
        
        ${discountHtml}
        
        <div class="total-section">
          <p class="grand-total">TOTAL: Rp ${formatCurrency(data.total)}</p>
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
    
    const showToastNotification = (message, type = 'success') => {
      toastMessage.value = message
      toastType.value = type
      showToast.value = true
      setTimeout(() => {
        showToast.value = false
      }, 3000)
    }
    
    // ✅ UPDATED: onMounted dengan format TRYYMMDD000001
    onMounted(async () => {
      console.log('[KASIR] Component mounted with format TRYYMMDD000001')
      
      // ✅ INITIALIZE transaction code dengan format baru
      await initializeTransactionCode()
      
      // ✅ SET window reference
      window.transactionForm = transactionForm
      
      const handleGlobalClick = () => {
        if (showContextMenu.value) {
          hideContextMenu()
        }
      }
      
      document.addEventListener('click', handleGlobalClick)
      
      onUnmounted(() => {
        document.removeEventListener('click', handleGlobalClick)
      })
      
      console.log('[KASIR] Transaction system with format TRYYMMDD000001 ready')
    })
    
    return {
      showProductModal,
      showToast,
      showSuccessModal,
      toastMessage,
      toastType,
      processing,
      loadingProducts,
      loadingProduct,
      loadingTransactionCode,
      searchQuery,
      lastTransactionCode,
      lastTransactionTotal,
      lastTransactionCash,
      lastTransactionChange,
      lastTransactionDiscount,
      products,
      transactionForm,
      selectedProduct,
      cartItems,
      stockWarning,
      currentQueueCode,
      paymentMethod,
      cashReceived,
      changeAmount,
      cashError,
      discountType,
      discountValue,
      appliedDiscount,
      handleRightClick,
      hideContextMenu,
      refreshTransactionCode,
      showContextMenu,
      contextMenuPosition,
      subtotalAmount,
      totalAmount,
      maxDiscountFixed,
      formattedPrice,
      formattedTotal,
      hasStockError,
      isPaymentValid,
      quickCashAmounts,
      formatCurrency,
      calculateDiscountPreview,
      validateDiscountInput,
      searchByCode,
      onProductCodeChange,
      openProductModal,
      closeProductModal,
      selectProduct,
      calculateTotal,
      addToCart,
      removeFromCart,
      processTransaction,
      closeSuccessModal,
      printReceiptWithData,
      printReceiptFromData,
      debouncedSearch,
      validateQuantity,
      selectPaymentMethod,
      calculateChange,
      setQuickCash,
      applyDiscount,
      removeDiscount
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

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.fixed.top-4 {
  animation: slideInDown 0.3s ease-out;
}

@media (min-width: 640px) {
  .fixed.top-4 {
    animation: slideInRight 0.3s ease-out;
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

.bg-orange-50 {
  transition: all 0.3s ease;
}

.bg-orange-50:hover {
  background-color: rgb(255 247 237);
  box-shadow: 0 4px 12px rgba(251, 146, 60, 0.15);
}

::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

button:hover:not(:disabled) {
  transform: translateY(-1px);
  transition: transform 0.2s ease;
}

button:active {
  transform: translateY(0);
}

.bg-green-100 {
  animation: slideInDown 0.3s ease-out;
}

.bg-yellow-50 {
  animation: pulse 2s infinite;
}

@media (max-width: 640px) {
  button, input[type="button"], input[type="submit"] {
    min-height: 44px;
    min-width: 44px;
  }
}

input:focus, button:focus {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  outline: 2px solid transparent;
  outline-offset: 2px;
}

input:focus.border-orange-300 {
  box-shadow: 0 0 0 3px rgba(251, 146, 60, 0.1);
  border-color: #fb923c;
}

input.border-red-300:focus {
  box-shadow: 0 0 0 3px rgba(248, 113, 113, 0.1);
  border-color: #f87171;
}

@media (prefers-reduced-motion: reduce) {
  .transition-all,
  .transition-colors,
  .animate-spin,
  .animate-pulse {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

@supports (padding: max(0px)) {
  .p-3 {
    padding: max(12px, env(safe-area-inset-top), env(safe-area-inset-right), env(safe-area-inset-bottom), env(safe-area-inset-left));
  }
}

@media (prefers-contrast: high) {
  .border-gray-300 {
    border-color: #000;
  }
  
  .bg-gray-50 {
    background-color: #fff;
  }
  
  .bg-orange-50 {
    background-color: #fff;
    border-color: #fb923c;
  }
}

@supports selector(:focus-visible) {
  button:focus:not(:focus-visible) {
    box-shadow: none;
    outline: none;
  }
  
  button:focus-visible {
    box-shadow: 0 0 0 2px #3b82f6;
    outline: 2px solid transparent;
    outline-offset: 2px;
  }
}

.bg-orange-600:hover {
  background-color: #ea580c;
  box-shadow: 0 4px 12px rgba(234, 88, 12, 0.3);
}

.border-orange-500 {
  border-color: #f97316;
}

.bg-orange-50 {
  background-color: #fff7ed;
}

.text-orange-700 {
  color: #c2410c;
}

.text-orange-800 {
  color: #9a3412;
}
</style>