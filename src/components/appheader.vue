<template>
  <header class="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
    <div class="ml-64 px-6 py-3 flex justify-between items-center h-16">
      <div></div>
      
      <div class="flex items-center space-x-4">
        <div class="text-sm text-gray-600">
          <span class="font-medium text-indigo-600">{{ displayUser.name }}</span>
          <span class="text-xs text-gray-500 ml-2">({{ displayUser.role }})</span>
        </div>

        <button 
          @click="showLogoutModal = true" 
          class="inline-flex items-center px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors duration-200 shadow-sm"
        >
          <ArrowRightOnRectangleIcon class="w-4 h-4 mr-2" />
          Logout
        </button>
      </div>
    </div>

    <!-- Modal Logout Baru (dari KasirHeader) -->
    <div v-if="showLogoutModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <div class="modal-icon">
            <ExclamationTriangleIcon class="warning-icon" />
          </div>
          <h3 class="modal-title">Konfirmasi Logout</h3>
          <p class="modal-message">Apakah Anda yakin ingin keluar dari sistem?</p>
        </div>
        
        <div class="modal-actions">
          <button class="btn-cancel" @click="closeModal">
            Batal
          </button>
          <button class="btn-confirm" @click="confirmLogout">
            Ya, Logout
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
import axios from 'axios'
import { ArrowRightOnRectangleIcon, ExclamationTriangleIcon } from '@heroicons/vue/24/outline'

export default {
  name: 'AppHeader',
  components: {
    ArrowRightOnRectangleIcon,
    ExclamationTriangleIcon
  },
  props: {
    pageTitle: {
      type: String,
      default: ''
    },
    userInfo: {
      type: Object,
      default: () => ({
        name: 'User',
        role: 'Guest'
      })
    }
  },
  data() {
    return {
      currentUser: {
        name: '',
        role: ''
      },
      userDataInterval: null,
      showLogoutModal: false
    }
  },
  mounted() {
    this.fetchUserData()
    this.userDataInterval = setInterval(() => {
      this.fetchUserData()
    }, 30000)
    
    document.addEventListener('keydown', this.handleEscapeKey)
  },
  
  beforeUnmount() {
    if (this.userDataInterval) {
      clearInterval(this.userDataInterval)
    }
    document.removeEventListener('keydown', this.handleEscapeKey)
  },
  methods: {
    async fetchUserData() {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          console.log('No token found')
          this.currentUser = { name: 'Guest', role: 'Guest' }
          return
        }

        console.log('Fetching user data with token:', token.substring(0, 20) + '...')
        
        const response = await axios.get('http://localhost:8000/api/user', {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        })
        
        console.log('API Response:', response.data)
        
        const userData = response.data.data || response.data
        
        if (userData && userData.name) {
          this.currentUser = {
            name: userData.name,
            role: this.normalizeRole(userData.role?.name || userData.role || 'Guest')
          }
          console.log('Current user set to:', this.currentUser)
        } else {
          console.error('Invalid user data structure:', userData)
          this.currentUser = { name: 'User', role: 'Guest' }
        }
        
      } catch (error) {
        console.error('Error fetching user data:', error.response?.data || error.message)
        
        if (error.response?.status === 401) {
          localStorage.removeItem('token')
          this.$router.push('/login')
        } else {
          this.currentUser = { name: 'User', role: 'Guest' }
        }
      }
    },
    
    normalizeRole(role) {
      const roleStr = role.toLowerCase()
      if (roleStr === 'admin' || roleStr === 'administrator') {
        return 'Admin'
      } else if (roleStr === 'kasir' || roleStr === 'cashier') {
        return 'Kasir'
      }
      return 'Guest'
    },
    
    handleEscapeKey(event) {
      if (event.key === 'Escape' && this.showLogoutModal) {
        this.closeModal()
      }
    },
    
    closeModal() {
      this.showLogoutModal = false
    },
    
    confirmLogout() {
      try {
        // Clear auth data
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        
        // Close modal
        this.showLogoutModal = false
        
        // Redirect to login
        this.$router.push('/login')
        
        // Show success message if toast available
        if (this.$toast) {
          this.$toast.success('Logout berhasil!')
        }
      } catch (error) {
        console.error('Logout error:', error)
        // Force redirect even if there's an error
        window.location.href = '/login'
      }
    },
    
    // Legacy method - keeping for backward compatibility
    logout() {
      this.confirmLogout()
    }
  },
  
  computed: {
    displayUser() {
      if (this.userInfo && this.userInfo.name && this.userInfo.name !== 'User') {
        return {
          name: this.userInfo.name,
          role: this.normalizeRole(this.userInfo.role)
        }
      }
      
      if (this.currentUser.name) {
        return this.currentUser
      }
      
      return { name: 'User', role: 'Guest' }
    }
  }
}
</script>

<style scoped>
/* Existing button styles */
button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

button:active {
  transform: translateY(0);
}

/* Modal Styles - Diambil dari KasirHeader */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 12px;
  max-width: 400px;
  width: 100%;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  animation: modalIn 0.3s ease;
}

@keyframes modalIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.modal-header {
  padding: 24px 24px 16px;
  text-align: center;
}

.modal-icon {
  margin-bottom: 16px;
}

.warning-icon {
  width: 48px;
  height: 48px;
  color: #f59e0b;
  margin: 0 auto;
}

.modal-title {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.modal-message {
  margin: 0;
  color: #6b7280;
  line-height: 1.5;
  font-size: 14px;
}

.modal-actions {
  padding: 16px 24px 24px;
  display: flex;
  gap: 12px;
  justify-content: center;
}

.btn-cancel {
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 10px 20px;
  color: #374151;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  font-size: 14px;
  min-height: 44px;
}

.btn-cancel:hover {
  background: #e5e7eb;
}

.btn-cancel:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

.btn-confirm {
  background: #ef4444;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  color: white;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  font-size: 14px;
  min-height: 44px;
}

.btn-confirm:hover {
  background: #dc2626;
}

.btn-confirm:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .modal-content {
    transition: none;
    animation: none;
  }
}
</style>