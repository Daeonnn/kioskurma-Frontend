<!-- KasirHeader.vue - With Heroicons -->
<template>
  <div class="header-content">
    <!-- Left side - Empty, no title -->
    <div class="header-left">
      <!-- Kosong, tidak ada title -->
    </div>
    
    <!-- Right side - User info and actions -->
    <div class="header-right">
      <!-- User Info (Desktop) -->
      <div class="user-info desktop-only">
        <div class="user-details">
          <span class="user-name">{{ displayUser.name }}</span>
          <span class="user-role">({{ displayUser.role }})</span>
        </div>
      </div>
      
      <!-- Mobile user dropdown -->
      <div class="mobile-user-menu mobile-only">
        <button 
          class="user-avatar"
          @click="toggleUserDropdown"
          type="button"
          aria-label="User menu"
        >
          <UserIcon class="avatar-icon" />
        </button>
        
        <!-- Dropdown menu -->
        <div v-if="showUserDropdown" class="user-dropdown">
          <div class="dropdown-header">
            <div class="dropdown-user-name">{{ displayUser.name }}</div>
            <div class="dropdown-user-role">{{ displayUser.role }}</div>
          </div>
          <div class="dropdown-divider"></div>
          <button 
            class="dropdown-item logout-item"
            @click="handleLogout"
          >
            <ArrowRightOnRectangleIcon class="logout-icon" />
            <span>Logout</span>
          </button>
        </div>
      </div>
      
      <!-- Desktop Logout Button -->
      <button 
        class="desktop-logout-btn desktop-only"
        @click="showLogoutModal = true"
        type="button"
      >
        <ArrowRightOnRectangleIcon class="logout-icon" />
        <span class="logout-text">Logout</span>
      </button>
    </div>

    <!-- Logout Confirmation Modal -->
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
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  UserIcon,
  ArrowRightOnRectangleIcon,
  ExclamationTriangleIcon
} from '@heroicons/vue/24/outline'

export default {
  name: 'KasirHeader',
  components: {
    UserIcon,
    ArrowRightOnRectangleIcon,
    ExclamationTriangleIcon
  },
  props: {
    userInfo: {
      type: Object,
      default: () => ({
        name: 'User',
        role: 'Kasir'
      })
    }
  },
  setup(props) {
    const router = useRouter()
    const showLogoutModal = ref(false)
    const showUserDropdown = ref(false)
    
    // Computed user info dengan fallback
    const displayUser = computed(() => {
      return {
        name: props.userInfo?.name || 'User',
        role: props.userInfo?.role || 'Kasir'
      }
    })
    
    const toggleUserDropdown = () => {
      showUserDropdown.value = !showUserDropdown.value
    }
    
    const closeModal = () => {
      showLogoutModal.value = false
    }
    
    const handleLogout = () => {
      showUserDropdown.value = false
      showLogoutModal.value = true
    }
    
    const confirmLogout = () => {
      try {
        // Clear auth data
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        
        // Close modal
        showLogoutModal.value = false
        
        // Redirect to login
        router.push('/login')
      } catch (error) {
        console.error('Logout error:', error)
        // Force redirect even if there's an error
        window.location.href = '/login'
      }
    }
    
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (showUserDropdown.value && !event.target.closest('.mobile-user-menu')) {
        showUserDropdown.value = false
      }
    }
    
    // Handle escape key
    const handleKeydown = (event) => {
      if (event.key === 'Escape') {
        if (showLogoutModal.value) {
          closeModal()
        }
        if (showUserDropdown.value) {
          showUserDropdown.value = false
        }
      }
    }
    
    onMounted(() => {
      document.addEventListener('click', handleClickOutside)
      document.addEventListener('keydown', handleKeydown)
    })
    
    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside)
      document.removeEventListener('keydown', handleKeydown)
    })
    
    return {
      displayUser,
      showLogoutModal,
      showUserDropdown,
      toggleUserDropdown,
      closeModal,
      handleLogout,
      confirmLogout
    }
  }
}
</script>

<style scoped>
/* Header Content */
.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 64px;
  padding: 0 20px;
  background: white;
  width: 100%;
  border-bottom: 1px solid #e5e7eb;
}

/* Left Side - Empty now */
.header-left {
  flex: 1;
}

/* Page title removed - no longer needed */

/* Right Side */
.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-details {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  font-size: 14px;
}

.user-name {
  font-weight: 600;
  color: #3b82f6;
  line-height: 1.2;
}

.user-role {
  font-size: 12px;
  color: #6b7280;
  line-height: 1.2;
}

/* Mobile User Menu */
.mobile-user-menu {
  position: relative;
}

.user-avatar {
  background: #f3f4f6;
  border: 2px solid #d1d5db;
  border-radius: 50%;
  width: 44px;
  height: 44px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-avatar:hover {
  background: #e5e7eb;
  border-color: #9ca3af;
  transform: scale(1.05);
}

.user-avatar:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

.avatar-icon {
  width: 20px;
  height: 20px;
  color: #6b7280;
}

/* User Dropdown */
.user-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  min-width: 200px;
  z-index: 50;
  animation: slideDown 0.2s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dropdown-header {
  padding: 16px;
  border-bottom: 1px solid #f3f4f6;
}

.dropdown-user-name {
  font-weight: 600;
  color: #1f2937;
  font-size: 14px;
  margin-bottom: 2px;
}

.dropdown-user-role {
  color: #6b7280;
  font-size: 12px;
}

.dropdown-divider {
  height: 1px;
  background: #e5e7eb;
  margin: 0;
}

.dropdown-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  transition: background 0.2s ease;
  font-size: 14px;
}

.logout-item {
  color: #ef4444;
}

.logout-item:hover {
  background: #fef2f2;
}

.logout-item:focus {
  outline: none;
  background: #fef2f2;
}

/* Desktop Logout Button */
.desktop-logout-btn {
  background: #ef4444;
  border: none;
  border-radius: 8px;
  padding: 10px 16px;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  font-size: 14px;
  min-height: 44px;
}

.desktop-logout-btn:hover {
  background: #dc2626;
  transform: translateY(-1px);
}

.desktop-logout-btn:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

.logout-icon {
  width: 16px;
  height: 16px;
}

/* Modal */
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

/* Responsive Design */
.desktop-only {
  display: flex;
}

.mobile-only {
  display: none;
}

@media (max-width: 768px) {
  .header-content {
    padding: 0 16px;
  }
  
  /* No page title to hide anymore */
  
  .desktop-only {
    display: none; /* Hide desktop elements */
  }
  
  .mobile-only {
    display: block; /* Show mobile elements */
  }
  
  .header-right {
    gap: 8px;
  }
  
  .modal-content {
    margin: 16px;
  }
  
  .modal-actions {
    flex-direction: column;
  }
  
  .btn-cancel,
  .btn-confirm {
    width: 100%;
    justify-content: center;
  }
}

@media (min-width: 769px) {
  .desktop-only {
    display: flex; /* Show desktop elements */
  }
  
  .mobile-only {
    display: none; /* Hide mobile elements */
  }
}

/* Small mobile adjustments */
@media (max-width: 480px) {
  .header-content {
    padding: 0 12px;
  }
  
  .user-avatar {
    width: 40px;
    height: 40px;
  }
  
  .avatar-icon {
    width: 18px;
    height: 18px;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .user-avatar,
  .desktop-logout-btn,
  .dropdown-item {
    border: 1px solid currentColor;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .user-avatar,
  .desktop-logout-btn,
  .dropdown-item,
  .user-dropdown,
  .modal-content {
    transition: none;
    animation: none;
  }
}
</style>