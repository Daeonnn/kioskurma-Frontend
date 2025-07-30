<template>
  <aside class="w-64 fixed h-full bg-white shadow-md flex flex-col">
    <div class="p-2 border-b border-gray-200">
      <div class="flex justify-center">
        <img
          src="../assets/logo/logo_kurma.png"
          alt="Logo Kurma"
          class="h-12 w-auto sm:h-14 md:h-16 max-w-full object-contain"
        />
      </div>
    </div>

    <nav class="p-4 flex-1">
      <ul class="space-y-1">
        <li>
          <router-link 
            to="/admin/dashboard" 
            class="flex items-center p-3 rounded-lg hover:bg-indigo-50 text-gray-700 hover:text-indigo-600" 
            active-class="bg-indigo-50 text-indigo-600 font-medium"
          >
            <HomeIcon class="w-5 h-5 mr-3 text-indigo-500" />
            <span>Dashboard</span>
          </router-link>
        </li>
        
        <li>
          <button 
            @click="toggleMaster" 
            class="flex items-center p-3 w-full text-left rounded-lg hover:bg-indigo-50 text-gray-700 hover:text-indigo-600"
          >
            <Cog6ToothIcon class="w-5 h-5 mr-3 text-green-500" />
            <span>Master</span>
            <svg 
              :class="{ 'rotate-90': masterOpen }" 
              class="w-4 h-4 ml-auto transform transition-transform" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
          
          <ul v-show="masterOpen" class="ml-6 mt-1 space-y-1">
            <li>
              <router-link 
                to="/admin/distributor" 
                class="flex items-center p-2 rounded-lg hover:bg-indigo-50 text-gray-700 hover:text-indigo-600" 
                active-class="bg-indigo-50 text-indigo-600 font-medium"
              >
                <TruckIcon class="w-4 h-4 mr-3 text-red-500" />
                <span>Distributor</span>
              </router-link>
            </li>
            <li>
              <router-link 
                to="/admin/jenis" 
                class="flex items-center p-2 rounded-lg hover:bg-indigo-50 text-gray-700 hover:text-indigo-600" 
                active-class="bg-indigo-50 text-indigo-600 font-medium"
              >
                <BookmarkIcon class="w-4 h-4 mr-3 text-purple-500" />
                <span>Jenis</span>
              </router-link>
            </li>
            <li>
              <router-link 
                to="/admin/satuan" 
                class="flex items-center p-2 rounded-lg hover:bg-indigo-50 text-gray-700 hover:text-indigo-600" 
                active-class="bg-indigo-50 text-indigo-600 font-medium"
              >
                <AdjustmentsHorizontalIcon class="w-4 h-4 mr-3 text-yellow-500" />
                <span>Satuan</span>
              </router-link>
            </li>
          </ul>
        </li>

        <li>
          <router-link 
            to="/admin/product" 
            class="flex items-center p-3 rounded-lg hover:bg-indigo-50 text-gray-700 hover:text-indigo-600" 
            active-class="bg-indigo-50 text-indigo-600 font-medium"
          >
            <CubeIcon class="w-5 h-5 mr-3 text-blue-500" />
            <span>Produk</span>
          </router-link>
        </li>

        <li>
          <router-link 
            to="/admin/employee" 
            class="flex items-center p-3 rounded-lg hover:bg-indigo-50 text-gray-700 hover:text-indigo-600" 
            active-class="bg-indigo-50 text-indigo-600 font-medium"
          >
            <UserGroupIcon class="w-5 h-5 mr-3 text-orange-500" />
            <span>Kelola Pegawai</span>
          </router-link>
        </li>
        
        <li>
          <router-link 
            to="/admin/laporan" 
            class="flex items-center p-3 rounded-lg hover:bg-indigo-50 text-gray-700 hover:text-indigo-600" 
            active-class="bg-indigo-50 text-indigo-600 font-medium"
          >
            <ClipboardDocumentListIcon class="w-5 h-5 mr-3 text-gray-500" />
            <span>Laporan Transaksi</span>
          </router-link>
        </li>
      </ul>
    </nav>
  </aside>
</template>

<script>
import {
  HomeIcon,
  CubeIcon,
  TruckIcon,
  TagIcon,
  BookmarkIcon,
  AdjustmentsHorizontalIcon,
  Cog6ToothIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon
} from '@heroicons/vue/24/outline'

export default {
  name: 'Sidebar',
  components: {
    HomeIcon,
    CubeIcon,
    TruckIcon,
    TagIcon,
    BookmarkIcon,
    AdjustmentsHorizontalIcon,
    Cog6ToothIcon,
    ClipboardDocumentListIcon,
    UserGroupIcon
  },
  data() {
    return {
      masterOpen: false
    }
  },
  methods: {
    toggleMaster() {
      this.masterOpen = !this.masterOpen
    }
  },
  mounted() {
    const currentPath = this.$route.path
    if (currentPath.includes('/admin/distributor') || 
        currentPath.includes('/admin/jenis') || 
        currentPath.includes('/admin/satuan')) {
      this.masterOpen = true
    }
  },
  watch: {
    '$route'(to) {
      if (to.path.includes('/admin/distributor') || 
          to.path.includes('/admin/jenis') || 
          to.path.includes('/admin/satuan')) {
        this.masterOpen = true
      }
    }
  }
}
</script>