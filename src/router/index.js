import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/login.vue'
import Dashboard from '../views/dashboard.vue'
import DefaultLayout from '../layout/DefaultLayout.vue'
import Jenis from '../views/jenis.vue'
import Distributor from '../views/distributor.vue'
import Product from '../views/product.vue'
import Satuan from '../views/satuan.vue'
import Laporan from '../views/laporan.vue'
import KelolaPegawai from '../views/kelolapegawai.vue'
import AdminTransaksi from '../views/transaksi.vue'
import KasirLayout from '../layout/KasirLayout.vue'
import KasirDashboard from '../views/kasir/dashboard.vue'
import KasirTransaksi from '../views/kasir/halamantransaksi.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { guestOnly: true }
  },
  {
    path: '/admin',
    component: DefaultLayout,
    meta: { requiresAuth: true, role: 'admin' },
    children: [
      { path: '', redirect: '/admin/dashboard' },
      { path: 'dashboard', name: 'AdminDashboard', component: Dashboard },
      { path: 'jenis', name: 'Jenis', component: Jenis },
      { path: 'distributor', name: 'Distributor', component: Distributor },
      { path: 'satuan', name: 'Satuan', component: Satuan },
      { path: 'product', name: 'Product', component: Product },
      { path: 'employee', name: 'KelolaPegawai', component: KelolaPegawai },
      { path: 'transaksi', name: 'AdminTransaksi', component: AdminTransaksi },
      { path: 'laporan', name: 'Laporan', component: Laporan },
    ]
  },
  {
    path: '/kasir',
    component: KasirLayout,
    meta: { requiresAuth: true, role: 'kasir' },
    children: [
      { path: '', redirect: '/kasir/dashboard' },
      { path: 'dashboard', name: 'KasirDashboard', component: KasirDashboard },
      { path: 'transaksi', name: 'KasirTransaksi', component: KasirTransaksi }
    ]
  },
  {
    path: '/',
    name: 'Root',
    beforeEnter: (to, from, next) => {
      console.log('Root route accessed from:', from.path)
      
      if (from.path && (from.path.startsWith('/admin') || from.path.startsWith('/kasir'))) {
        return next(false)
      }
      
      const token = localStorage.getItem('token')
      const userStr = localStorage.getItem('user')
      
      if (!token || !userStr) {
        console.log('No auth data, redirecting to login')
        return next('/login')
      }
      
      try {
        const user = JSON.parse(userStr)
        const role = (user.role?.name || user.role || '').toLowerCase()
        
        console.log('User role detected (lowercase):', role)
        
        if (role === 'admin') {
          return next('/admin/dashboard')
        } else if (role === 'kasir') {
          return next('/kasir/dashboard')
        } else {
          console.log('Unknown role:', role)
          return next('/login')
        }
      } catch (error) {
        console.error('Error parsing user data:', error)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        return next('/login')
      }
    }
  },
  {
    path: '/:catchAll(.*)',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

function getUserRole() {
  try {
    const userStr = localStorage.getItem('user')
    if (!userStr) return null
    
    const user = JSON.parse(userStr)
    const role = (user.role?.name || user.role || '').toLowerCase()
    return role
  } catch (error) {
    console.error('Error getting user role:', error)
    return null
  }
}

function isTokenValid() {
  const token = localStorage.getItem('token')
  const userStr = localStorage.getItem('user')
  
  if (!token || !userStr) return false
  
  try {
    JSON.parse(userStr)
    return true
  } catch {
    return false
  }
}

router.beforeEach((to, from, next) => {
  console.log('Router guard:', to.path)
  
  const isAuthenticated = isTokenValid()
  const role = getUserRole()
  
  console.log('Auth status:', isAuthenticated, 'Role:', role)

  if (to.meta.requiresAuth && !isAuthenticated) {
    console.log('Redirect to login - not authenticated')
    return next('/login')
  }

  if (to.meta.guestOnly && isAuthenticated) {
    console.log('Redirect authenticated user')
    if (role === 'admin') {
      return next('/admin/dashboard')
    } else if (role === 'kasir') {
      return next('/kasir/dashboard')
    }
    return next('/')
  }

  if (to.meta.requiresAuth && to.meta.role && to.meta.role !== role) {
    console.log('Role mismatch, redirecting. Required:', to.meta.role, 'User:', role)
    if (role === 'admin') {
      return next('/admin/dashboard')
    } else if (role === 'kasir') {
      return next('/kasir/dashboard')
    }
    return next('/login')
  }

  console.log('Navigation allowed')
  return next()
})

export default router