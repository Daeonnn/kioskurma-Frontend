<template>
  <div class="flex h-screen bg-gray-50">
    <!-- Sidebar -->
    <Sidebar />
    
    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col ml-64">
      <!-- AppHeader - akan muncul di semua halaman -->
      <AppHeader :userInfo="currentUser" />
      
      <!-- Main Content - dengan overflow scroll -->
      <main class="flex-1 overflow-auto">
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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Sidebar from '../components/sidebar.vue'
import AppHeader from '../components/appheader.vue'
import IdleWarningModal from '../components/IdleWarningModal.vue'
import { useIdleTimer } from '../composables/useIdleTimer'
import axios from 'axios'

export default {
  name: 'AdminLayout',
  components: {
    Sidebar,
    AppHeader,
    IdleWarningModal
  },
  setup() {
    const router = useRouter()
    const currentUser = ref({
      name: 'Loading...',
      role: 'Admin'
    })
    
    const { 
      showWarning, 
      timeLeft, 
      extendSession, 
      logout 
    } = useIdleTimer(5) // Set idle time to 5 minutes
    
    // Fetch user data and role verification
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          router.push('/login')
          return
        }

        const response = await axios.get('http://localhost:8000/api/user', {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        })
        
        const userData = response.data.data || response.data
        
        if (userData && userData.name) {
          currentUser.value = {
            name: userData.name,
            role: normalizeRole(userData.role?.name || userData.role || 'Admin')
          }
        }
        
      } catch (error) {
        console.error('Error fetching user data:', error)
        router.push('/login')
      }
    }
    
    const normalizeRole = (role) => {
      if (!role || typeof role !== 'string') return 'Admin'
      return role.toLowerCase() === 'admin' ? 'Admin' : 'Kasir'
    }
    
    onMounted(async () => {
      await fetchUserData()
    })
    
    return {
      currentUser,
      showWarning,
      timeLeft,
      extendSession,
      logout
    }
  }
}
</script>