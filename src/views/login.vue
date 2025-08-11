<template>
  <div class="min-h-screen w-full relative overflow-hidden">
    <div 
      class="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
      :style="`background-image: url(${bgLogin})`"
    ></div>

    <div class="absolute inset-0 bg-black/20 z-5"></div>

    <div class="relative z-10 min-h-screen flex items-center justify-center p-4">
      <div class="w-full max-w-sm mx-auto">
        <div class="text-center mb-8">
          <div class="flex justify-center mb-6">
            <img
              src="../assets/logo/logo_kurma.png"
              alt="Logo Kurma"
              class="h-20 w-auto sm:h-24 md:h-28 max-w-full object-contain"
            />
          </div>
        </div>

        <div class="bg-white/10 backdrop-blur-sm rounded-xl p-6 sm:p-8 shadow-2xl border border-white/20">
          <form @submit.prevent="handleLogin" class="space-y-5">
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
              </div>
              <input
                type="text"
                v-model="loginForm.username"
                placeholder="USERNAME"
                class="w-full pl-12 pr-4 py-4 bg-white/95 border border-gray-200 text-gray-800 placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 text-sm sm:text-base"
                required
                :disabled="loading"
              />
            </div>

            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                </svg>
              </div>
              <input
                type="password"
                v-model="loginForm.password"
                placeholder="PASSWORD"
                class="w-full pl-12 pr-4 py-4 bg-white/95 border border-gray-200 text-gray-800 placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 text-sm sm:text-base"
                required
                :disabled="loading"
              />
            </div>

            <button
              type="submit"
              class="w-full py-4 bg-white text-gray-800 font-semibold rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-amber-500 transition-all duration-200 border border-gray-200 shadow-lg text-sm sm:text-base disabled:opacity-70 disabled:cursor-not-allowed"
              :disabled="loading"
            >
              <span v-if="loading" class="flex items-center justify-center">
                <svg class="animate-spin h-5 w-5 text-gray-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </span>
              <span v-else>MASUK</span>
            </button>

            <transition name="fade">
              <div
                v-if="alert.show"
                :class="alertClass"
                class="text-sm text-center p-3 rounded-lg font-medium"
              >
                {{ alert.message }}
              </div>
            </transition>
          </form>
        </div>
      </div>
    </div>

    <div v-if="showSuccessPopup" class="fixed inset-0 z-50">
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
      <div class="relative flex items-center justify-center min-h-screen p-4">
        <div class="bg-white rounded-2xl shadow-2xl max-w-sm w-full mx-auto overflow-hidden transform transition-all duration-500" :class="successPopupClass">
          <div class="p-8 text-center">
            <div class="relative mb-6">
              <div class="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center relative overflow-hidden">
                <div class="absolute inset-0 bg-green-500 rounded-full transform transition-transform duration-1000" :class="{ 'scale-100': showCheckmark, 'scale-0': !showCheckmark }"></div>
                <svg class="w-10 h-10 text-white relative z-10 transform transition-all duration-500" :class="{ 'scale-100 rotate-0': showCheckmark, 'scale-0 rotate-180': !showCheckmark }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              
              <div class="absolute inset-0 w-20 h-20 mx-auto">
                <div class="w-full h-full border-4 border-green-200 rounded-full animate-ping" v-if="!showCheckmark"></div>
              </div>
            </div>
            
            <h3 class="text-xl font-bold text-gray-900 mb-2">Login Berhasil!</h3>
            <p class="text-gray-600 mb-4">Selamat datang kembali</p>
            
            <div class="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500"></div>
              <span>Mengarahkan ke dashboard...</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue' 
import { useRouter } from 'vue-router'
import bgLogin from '../assets/logo/bg-login.png'
import api from '../../services/api'

const router = useRouter()

const loginForm = ref({
  username: '',
  password: ''
})

const loading = ref(false)
const showSuccessPopup = ref(false)
const showCheckmark = ref(false)
const successPopupClass = ref('scale-95 opacity-0')

const alert = ref({
  show: false,
  type: '',
  message: ''
})

onMounted(() => {
  console.log('Login component mounted successfully')
})

const alertClass = computed(() => {
  return alert.value.type === 'success'
    ? 'bg-green-100 text-green-700'
    : 'bg-red-100 text-red-700'
})

const showAlert = (type, message) => {
  try {
    alert.value = { show: true, type, message }
    setTimeout(hideAlert, 5000)
  } catch (error) {
    console.error('Error in showAlert:', error)
  }
}

const hideAlert = () => {
  try {
    alert.value.show = false
  } catch (error) {
    console.error('Error in hideAlert:', error)
  }
}

const showSuccessAnimation = () => {
  showSuccessPopup.value = true
  
  setTimeout(() => {
    successPopupClass.value = 'scale-100 opacity-100'
  }, 50)
  
  setTimeout(() => {
    showCheckmark.value = true
  }, 300)
}

const hideSuccessPopup = () => {
  successPopupClass.value = 'scale-95 opacity-0'
  
  setTimeout(() => {
    showSuccessPopup.value = false
    showCheckmark.value = false
  }, 300)
}

const handleLogin = async () => {
  console.log('handleLogin function called')
  
  try {
    loading.value = true
    hideAlert()

    console.log('Making login request...')
    
    const response = await api.post('/auth/login', {
      username: loginForm.value.username,
      password: loginForm.value.password
    })

    console.log('Login response received:', response.data)

    let token = null
    let userData = null

    if (response.data) {
      if (response.data.success && response.data.data) {
        token = response.data.data.access_token
        userData = response.data.data.user
      } else if (response.data.access_token) {
        token = response.data.access_token
        userData = response.data.user
      } else if (response.data.token) {
        token = response.data.token
        userData = response.data.user
      }
    }

    console.log('Token:', token ? 'Found' : 'Not found')
    console.log('User data:', userData ? 'Found' : 'Not found')

    if (token) {
      localStorage.setItem('token', token)
      console.log('Token saved')
      
      if (userData) {
        localStorage.setItem('user', JSON.stringify(userData))
        console.log('User data saved:', userData)
      }
      
      loading.value = false
      showSuccessAnimation()
      
      setTimeout(() => {
        try {
          hideSuccessPopup()
          
          setTimeout(() => {
            if (userData && userData.role) {
              const role = userData.role.name || userData.role
              console.log('Redirecting user with role:', role)
              
              if (role === 'admin') {
                router.replace('/admin/dashboard')
              } else if (role === 'kasir') {
                router.replace('/kasir/dashboard')
              } else {
                console.log('Unknown role, redirecting to root')
                router.replace('/')
              }
            } else {
              console.log('No user data, redirecting to root')
              router.replace('/')
            }
          }, 300)
        } catch (redirectError) {
          console.error('Redirect error:', redirectError)
          router.replace('/')
        }
      }, 2500)
      
    } else {
      showAlert('error', 'Login gagal - Token tidak ditemukan')
    }

  } catch (error) {
    console.error('Login error:', error)
    
    let errorMessage = 'Terjadi kesalahan!'
    
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message
    } else if (error.response?.status === 401) {
      errorMessage = 'Username atau password salah!'
    } else if (!error.response) {
      errorMessage = 'Tidak dapat terhubung ke server'
    }
    
    showAlert('error', errorMessage)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

@keyframes checkmark {
  0% {
    stroke-dasharray: 0 50;
    stroke-dashoffset: 0;
  }
  100% {
    stroke-dasharray: 50 0;
    stroke-dashoffset: 0;
  }
}

.checkmark-animation {
  animation: checkmark 0.6s ease-in-out;
}
</style>