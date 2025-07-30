<template>
  <div v-if="show" class="fixed inset-0 z-50 overflow-y-auto">
    <!-- Backdrop with blur effect -->
    <div class="fixed inset-0 bg-white/30 backdrop-blur-md transition-all duration-300"></div>
    
    <!-- Modal -->
    <div class="flex items-center justify-center min-h-screen p-4">
      <div class="relative bg-white rounded-lg shadow-xl max-w-md w-full border border-gray-200">
        <div class="p-6 text-center">
          <div class="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-yellow-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L1 21h22L12 2zm0 3.5L19.5 19h-15L12 5.5zM11 10v4h2v-4h-2zm0 6v2h2v-2h-2z"/>
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Sesi Akan Berakhir</h3>
          <p class="text-gray-600 mb-4">Sesi Anda akan berakhir karena tidak ada aktivitas.</p>
          <div class="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
            <div class="text-2xl font-bold text-red-600">{{ formatTime(timeLeft) }}</div>
            <div class="text-sm text-red-500">detik tersisa</div>
          </div>
          <div class="flex gap-3">
            <button @click="$emit('extend')" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors">Lanjutkan Sesi</button>
            <button @click="$emit('logout')" class="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors">Logout Sekarang</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'IdleWarningModal',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    timeLeft: {
      type: Number,
      default: 0
    }
  },
  emits: ['extend', 'logout'],
  methods: {
    formatTime(seconds) {
      return Math.max(0, seconds)
    }
  }
}
</script>