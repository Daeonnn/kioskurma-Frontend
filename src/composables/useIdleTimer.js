import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

export function useIdleTimer(timeoutMinutes = 5) {
  const router = useRouter()
  const isIdle = ref(false)
  const showWarning = ref(false)
  const timeLeft = ref(0)
  
  let idleTimer = null
  let warningTimer = null
  let countdownTimer = null
  let isWarningActive = false // Flag untuk mencegah reset saat warning aktif
  
  const IDLE_TIME = timeoutMinutes * 60 * 1000 // Convert to milliseconds
  const WARNING_TIME = 60 * 1000 // Show warning 1 minute before logout
  
  const events = [
    'mousedown', 'mousemove', 'keypress', 'scroll', 
    'touchstart', 'touchmove', 'click', 'keydown'
  ]

  const logout = () => {
    console.log('Auto logout due to inactivity')
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('cached_user')
    
    isIdle.value = false
    showWarning.value = false
    timeLeft.value = 0
    isWarningActive = false
    
    router.push('/login')
  }

  const resetTimer = () => {
    // Jangan reset timer jika warning sedang aktif
    if (isWarningActive) {
      console.log('Warning active, ignoring user activity')
      return
    }

    console.log('User activity detected, resetting timer.')
    clearTimeout(idleTimer)
    clearTimeout(warningTimer)
    clearTimeout(countdownTimer)

    if (showWarning.value) {
      showWarning.value = false
      timeLeft.value = 0
      isWarningActive = false
    }

    // Set the warning timer (warn 1 minute before logout)
    warningTimer = setTimeout(() => {
      isWarningActive = true // Set flag sebelum menampilkan warning
      showWarning.value = true
      timeLeft.value = 60 // 1 minute warning
      countdownTimer = setInterval(() => {
        timeLeft.value--
        if (timeLeft.value <= 0) {
          clearInterval(countdownTimer)
          logout()
        }
      }, 1000)
    }, IDLE_TIME - WARNING_TIME)

    // Set idle timer
    idleTimer = setTimeout(() => {
      if (!showWarning.value) {
        logout()
      }
    }, IDLE_TIME)
  }

  const extendSession = () => {
    console.log('Session extended by user')
    showWarning.value = false
    timeLeft.value = 0
    isWarningActive = false // Reset flag
    clearTimeout(countdownTimer)
    resetTimer()  // Reset the idle timer after session extension
  }

  const forceLogout = () => {
    console.log('User chose to logout')
    isWarningActive = false // Reset flag
    logout()
  }

  const startIdleTimer = () => {
    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, resetTimer, true)
    })
    resetTimer()  // Initial reset
  }

  const stopIdleTimer = () => {
    events.forEach(event => {
      document.removeEventListener(event, resetTimer, true)
    })
    clearTimeout(idleTimer)
    clearTimeout(warningTimer)
    clearTimeout(countdownTimer)
    isWarningActive = false
  }
  
  onMounted(() => {
    startIdleTimer()
  })
  
  onUnmounted(() => {
    stopIdleTimer()
  })
  
  return {
    isIdle,
    showWarning,
    timeLeft,
    extendSession,
    logout: forceLogout,
    resetTimer
  }
}