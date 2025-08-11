<template>
  <div class="kasir-layout">
    <!-- Mobile Overlay -->
    <div 
      v-if="isMobileMenuOpen" 
      class="mobile-overlay"
      @click="closeMobileMenu"
    ></div>

    <!-- Sidebar -->
    <div :class="sidebarClasses">
      <KasirSidebar @close="closeMobileMenu" />
    </div>
    
    <!-- Main Content Area -->
    <div class="main-area">
      <!-- Header with Mobile Menu Button -->
      <div class="header-container">
        <!-- Mobile Menu Button -->
        <button 
          class="mobile-menu-button"
          @click="toggleMobileMenu"
          type="button"
          aria-label="Toggle menu"
        >
          <Bars3Icon class="w-6 h-6" />
        </button>
        
        <!-- Header Content - tanpa pageTitle -->
        <KasirHeader :userInfo="currentUser" />
      </div>
      
      <!-- Main Content -->
      <main class="content-area">
        <router-view />
      </main>
    </div>
    
    <!-- Idle Warning Modal -->
    <IdleWarningModal 
      :show="showWarning"
      :timeLeft="timeLeft"
      @extend="extendSession"
      @logout="logout"
    />
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Bars3Icon } from '@heroicons/vue/24/outline'
import KasirHeader from '../components/kasir/kasirheader.vue'
import KasirSidebar from '../components/kasir/kasirsidebar.vue'
import IdleWarningModal from '../components/IdleWarningModal.vue'
import { useIdleTimer } from '../composables/useIdleTimer'
import api from '../../services/api' 

export default {
  name: 'KasirLayout',
  components: {
    Bars3Icon,
    KasirHeader,
    KasirSidebar,
    IdleWarningModal
  },
  setup() {
    const router = useRouter()
    const isMobileMenuOpen = ref(false)
    const currentUser = ref({
      name: 'Loading...',
      role: 'Kasir'
    })
    
    const { 
      showWarning, 
      timeLeft, 
      extendSession, 
      logout 
    } = useIdleTimer(5) // 5 menit idle
    
    // Mobile menu functions
    const toggleMobileMenu = () => {
      console.log('🔄 Toggle mobile menu:', !isMobileMenuOpen.value)
      isMobileMenuOpen.value = !isMobileMenuOpen.value
    }
    
    const closeMobileMenu = () => {
      console.log('❌ Close mobile menu')
      isMobileMenuOpen.value = false
    }
    
    // Computed classes for sidebar
    const sidebarClasses = computed(() => [
      'sidebar-container',
      isMobileMenuOpen.value ? 'sidebar-open' : 'sidebar-closed'
    ])
    
    // Fetch user data
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          router.push('/login')
          return
        }

        // ✅ Ganti dari axios ke api
        const response = await api.get('/user')
        
        const userData = response.data.data || response.data
        
        if (userData && userData.name) {
          currentUser.value = {
            name: userData.name,
            role: normalizeRole(userData.role?.name || userData.role || 'Kasir')
          }
        }
        
      } catch (error) {
        console.error('Error fetching user data:', error)
        if (error.response?.status === 401) {
          router.push('/login')
        }
      }
    }
    
    const normalizeRole = (role) => {
      if (!role || typeof role !== 'string') return 'Kasir'
      return role.toLowerCase() === 'admin' ? 'Admin' : 'Kasir'
    }
    
    // Handle window resize
    const handleResize = () => {
      if (window.innerWidth >= 1024 && isMobileMenuOpen.value) {
        closeMobileMenu()
      }
    }
    
    // Prevent body scroll when mobile menu is open
    const handleBodyScroll = () => {
      if (isMobileMenuOpen.value) {
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = ''
      }
    }
    
    // Handle escape key
    const handleKeydown = (event) => {
      if (event.key === 'Escape' && isMobileMenuOpen.value) {
        closeMobileMenu()
      }
    }
    
    // Watch mobile menu state
    watch(isMobileMenuOpen, () => {
      handleBodyScroll()
    })
    
    onMounted(async () => {
      await fetchUserData()
      window.addEventListener('resize', handleResize)
      document.addEventListener('keydown', handleKeydown)
      console.log('✅ KasirLayout mounted')
    })
    
    onUnmounted(() => {
      window.removeEventListener('resize', handleResize)
      document.removeEventListener('keydown', handleKeydown)
      document.body.style.overflow = ''
    })
    
    return {
      currentUser,
      isMobileMenuOpen,
      sidebarClasses,
      toggleMobileMenu,
      closeMobileMenu,
      showWarning,
      timeLeft,
      extendSession,
      logout
    }
  }
}
</script>
<style scoped>
/* Main Layout Container */
.kasir-layout {
  display: flex;
  height: 100vh;
  background: #f9fafb;
  position: relative;
  overflow: hidden;
}

/* Mobile Overlay */
.mobile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 98;
  display: none;
}

/* Sidebar Container */
.sidebar-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 280px;
  height: 100vh;
  background: white;
  z-index: 99;
  transition: transform 0.3s ease;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  transform: translateX(-100%);
}

.sidebar-open {
  transform: translateX(0);
}

.sidebar-closed {
  transform: translateX(-100%);
}

/* Main Content Area */
.main-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

/* Header Container */
.header-container {
  position: relative;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  z-index: 30;
  display: flex;
  align-items: center;
  min-height: 64px;
  flex-shrink: 0;
}

/* Mobile Menu Button */
.mobile-menu-button {
  display: block;
  background: #f3f4f6;
  border: 2px solid #d1d5db;
  border-radius: 8px;
  padding: 10px 12px;
  margin: 0 16px;
  cursor: pointer;
  font-size: 18px;
  color: #374151;
  min-width: 44px;
  min-height: 44px;
  transition: all 0.2s ease;
  font-weight: bold;
}

.mobile-menu-button:hover {
  background: #e5e7eb;
  border-color: #9ca3af;
  transform: scale(1.05);
}

.mobile-menu-button:active {
  transform: scale(0.95);
  background: #d1d5db;
}

.mobile-menu-button:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Content Area */
.content-area {
  flex: 1;
  overflow: auto;
  background: #f3f4f6;
  padding: 0;
}

/* Desktop Styles */
@media (min-width: 1024px) {
  /* Hide mobile elements */
  .mobile-overlay {
    display: none !important;
  }
  
  .mobile-menu-button {
    display: none;
  }
  
  /* Desktop sidebar */
  .sidebar-container {
    position: relative;
    transform: translateX(0) !important;
    flex-shrink: 0;
    z-index: auto;
    height: 100vh;
  }
  
  /* Desktop main area */
  .main-area {
    margin-left: 0;
    width: calc(100% - 280px);
  }
  
  /* Desktop header */
  .header-container {
    padding-left: 0;
  }
}

/* Mobile Styles */
@media (max-width: 1023px) {
  /* Show mobile overlay when menu is open */
  .kasir-layout .mobile-overlay {
    display: block;
  }
  
  /* Full width main area on mobile */
  .main-area {
    width: 100%;
    margin-left: 0;
  }
}

/* Content padding adjustments */
.content-area {
  padding: 16px;
}

@media (min-width: 640px) and (max-width: 1023px) {
  .content-area {
    padding: 24px;
  }
}

@media (min-width: 1024px) {
  .content-area {
    padding: 32px;
  }
}

/* Utility Classes */
.flex {
  display: flex;
}

.flex-1 {
  flex: 1 1 0%;
}

.flex-col {
  flex-direction: column;
}

.flex-shrink-0 {
  flex-shrink: 0;
}

.h-screen {
  height: 100vh;
}

.overflow-hidden {
  overflow: hidden;
}

.overflow-auto {
  overflow: auto;
}

.bg-gray-50 {
  background-color: #f9fafb;
}

.bg-gray-100 {
  background-color: #f3f4f6;
}

/* Accessibility improvements */
.mobile-menu-button:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .mobile-menu-button {
    border: 2px solid currentColor;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .sidebar-container,
  .mobile-menu-button {
    transition: none;
  }
}

/* Debug helper (remove in production) */
.debug-responsive::before {
  content: "📱 MOBILE";
  position: fixed;
  bottom: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  z-index: 200;
}

@media (min-width: 1024px) {
  .debug-responsive::before {
    content: "🖥️ DESKTOP";
    color: #34d399;
  }
}
</style>