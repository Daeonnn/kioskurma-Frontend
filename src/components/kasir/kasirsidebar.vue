<template>
  <div class="sidebar-content">
    <div class="sidebar-header">
      <img
        src="../../assets/logo/logo_kurma.png"
        alt="Logo Kurma"
        class="logo-img"
      />
      <button 
        class="close-button"
        @click="$emit('close')"
        type="button"
        aria-label="Close menu"
      >
        <XMarkIcon class="w-6 h-6" />
      </button>
    </div>

    <nav class="sidebar-nav">
      <ul class="nav-list">
        <li>
          <router-link 
            to="/kasir/dashboard" 
            class="nav-item"
            active-class="nav-active"
            @click="$emit('close')"
          >
            <HomeIcon class="nav-icon" />
            <span class="nav-text">Dashboard</span>
          </router-link>
        </li>
        
        <li>
          <router-link 
            to="/kasir/transaksi" 
            class="nav-item"
            active-class="nav-active"
            @click="$emit('close')"
          >
            <ShoppingCartIcon class="nav-icon" />
            <span class="nav-text">Transaksi</span>
          </router-link>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script>
import {
  HomeIcon,
  ShoppingCartIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'

export default {
  name: 'KasirSidebar',
  components: {
    HomeIcon,
    ShoppingCartIcon,
    XMarkIcon
  },
  emits: ['close']
}
</script>

<style scoped>
.sidebar-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: white;
}

.sidebar-header {
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 64px;
  flex-shrink: 0;
}

.logo-img {
  height: 60px;
  width: auto;
  object-fit: contain;
}

.close-button {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  transition: all 0.2s ease;
  display: none;
}

.close-button:hover {
  background: #f3f4f6;
  color: #374151;
}

.sidebar-nav {
  flex: 1;
  padding: 16px 0;
  overflow-y: auto;
}

.nav-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  color: #374151;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s ease;
  border-radius: 8px;
  margin: 0 16px;
}

.nav-item:hover {
  background: #f0f4ff;
  color: #4f46e5;
}

.nav-item.nav-active,
.nav-item.router-link-active {
  background: #eef2ff;
  color: #4f46e5;
  font-weight: 600;
}

.nav-icon {
  width: 20px;
  height: 20px;
  margin-right: 12px;
  flex-shrink: 0;
}

.nav-item:nth-child(1) .nav-icon {
  color: #4f46e5;
}

.nav-item:nth-child(2) .nav-icon {
  color: #2563eb;
}

.nav-item:hover .nav-icon,
.nav-item.nav-active .nav-icon,
.nav-item.router-link-active .nav-icon {
  color: #4f46e5;
}

.nav-text {
  flex: 1;
  font-size: 15px;
}

@media (max-width: 1023px) {
  .close-button {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .sidebar-header {
    justify-content: space-between;
  }
}

@media (min-width: 1024px) {
  .sidebar-header {
    justify-content: center;
  }
}
</style>