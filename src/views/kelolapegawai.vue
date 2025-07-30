<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <!-- Confirmation Dialog -->
    <div v-if="showConfirmDialog" class="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50" @click="cancelDelete">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 transform transition-all animate-scale-in" @click.stop>
        <div class="p-6">
          <div class="flex items-center mb-4">
            <div class="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
              <svg class="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900">Konfirmasi Hapus</h3>
          </div>
          
          <p class="text-base text-gray-600 mb-6">
            Apakah Anda yakin ingin menghapus pegawai ini? Tindakan ini tidak dapat dibatalkan.
          </p>
          
          <div class="flex gap-3">
            <button
              @click="cancelDelete"
              class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              Batal
            </button>
            <button
              @click="confirmDelete"
              class="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              Hapus
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast Notifications -->
    <div class="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      <div 
        v-for="toast in toasts" 
        :key="toast.id"
        :class="[
          'transform transition-all duration-300 ease-in-out',
          'bg-white rounded-lg shadow-lg border-l-4 p-4 w-full',
          toast.type === 'success' ? 'border-green-500' : 'border-red-500',
          'animate-slide-in-right'
        ]"
      >
        <div class="flex items-start">
          <div v-if="toast.type === 'success'" class="flex-shrink-0">
            <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
              </svg>
            </div>
          </div>
          
          <div v-else class="flex-shrink-0">
            <div class="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <svg class="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
              </svg>
            </div>
          </div>
          
          <div class="ml-3 flex-1 min-w-0">
            <p :class="[
              'text-sm font-medium',
              toast.type === 'success' ? 'text-green-800' : 'text-red-800'
            ]">
              {{ toast.title }}
            </p>
            <p v-if="toast.message" :class="[
              'text-sm mt-1',
              toast.type === 'success' ? 'text-green-600' : 'text-red-600'
            ]">
              {{ toast.message }}
            </p>
          </div>
          
          <div class="ml-4 flex-shrink-0">
            <button
              @click="removeToast(toast.id)"
              class="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors p-1"
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Breadcrumb -->
    <nav class="mb-6">
      <ol class="flex text-gray-600 text-sm space-x-2">
        <li>
          <router-link to="/admin/dashboard" class="hover:text-indigo-600 transition-colors">Home</router-link>
        </li>
        <li>/</li>
        <li class="text-indigo-600 font-semibold">Pegawai</li>
      </ol>
    </nav>

    <!-- Header Section -->
    <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div class="flex justify-between items-center">
        <h2 class="text-2xl font-bold text-gray-800">Data Pegawai</h2>
        <button 
          @click="showForm = !showForm" 
          class="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2"
        >
          <svg v-if="!showForm" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
          {{ showForm ? 'Batal' : 'Tambah Pegawai' }}
        </button>
      </div>
    </div>

    <!-- Form Dialog -->
    <div v-if="showForm" class="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50" @click="closeForm">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 transform transition-all" @click.stop>
        <div class="p-6">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-xl font-semibold text-gray-800">
              {{ isEditMode ? 'Ubah Pegawai' : 'Tambah Pegawai Baru' }}
            </h3>
            <button @click="closeForm" class="text-gray-400 hover:text-gray-600 transition-colors p-1">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <form @submit.prevent="isEditMode ? updateEmployee() : addEmployee()">
            <div class="mb-4">
              <label for="name" class="block text-sm font-medium text-gray-700 mb-2">Nama</label>
              <input
                v-model="form.name"
                id="name"
                type="text"
                placeholder="Masukkan nama lengkap"
                class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                required
              />
              <div v-if="errors.name" class="text-red-500 text-sm mt-1">{{ errors.name[0] }}</div>
            </div>

            <div class="mb-4">
              <label for="username" class="block text-sm font-medium text-gray-700 mb-2">Username</label>
              <input
                v-model="form.username"
                id="username"
                type="text"
                placeholder="Masukkan username"
                class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                required
              />
              <div v-if="errors.username" class="text-red-500 text-sm mt-1">{{ errors.username[0] }}</div>
            </div>

            <div class="mb-4">
              <label for="email" class="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                v-model="form.email"
                id="email"
                type="email"
                placeholder="Masukkan email"
                class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                required
              />
              <div v-if="errors.email" class="text-red-500 text-sm mt-1">{{ errors.email[0] }}</div>
            </div>

            <div class="mb-4">
              <label for="password" class="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                v-model="form.password"
                id="password"
                type="password"
                placeholder="Masukkan password"
                class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                :required="!isEditMode"
              />
              <div v-if="errors.password" class="text-red-500 text-sm mt-1">{{ errors.password[0] }}</div>
            </div>

            <div class="mb-4" v-if="!isEditMode || form.password">
              <label for="password_confirmation" class="block text-sm font-medium text-gray-700 mb-2">Konfirm Password</label>
              <input
                v-model="form.password_confirmation"
                id="password_confirmation"
                type="password"
                placeholder="Konfirmasi password"
                class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                :required="!isEditMode || form.password"
              />
              <div v-if="errors.password_confirmation" class="text-red-500 text-sm mt-1">{{ errors.password_confirmation[0] }}</div>
            </div>

            <div class="mb-6">
              <label for="role" class="block text-sm font-medium text-gray-700 mb-2">Level</label>
              <select
                v-model="form.role"
                id="role"
                class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                required
              >
                <option value="">Pilih Level</option>
                <option value="admin">Admin</option>
                <option value="kasir">Kasir</option>
              </select>
              <div v-if="errors.role" class="text-red-500 text-sm mt-1">{{ errors.role[0] }}</div>
            </div>

            <div class="flex gap-3">
              <button 
                type="submit"
                class="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-lg font-medium transition-colors duration-200"
                :disabled="isSubmitting"
              >
                {{ isSubmitting ? 'Menyimpan...' : (isEditMode ? 'Simpan' : 'Simpan') }}
              </button>
              <button
  type="button"
  @click="closeForm"
  class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-lg font-medium transition-colors duration-200"
>
  Batal
</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Data Table -->
    <div class="bg-white rounded-lg shadow-sm overflow-hidden">
      <div class="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <h3 class="text-lg font-semibold text-gray-800">Daftar Pegawai</h3>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kode Pegawai</th>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="(employee, index) in employees" :key="employee.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ index + 1 }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {{ employee.employee_code }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ employee.name }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ employee.username }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <span :class="[
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                  employee.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                ]">
                  {{ employee.role === 'admin' ? 'Admin' : 'Kasir' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex gap-2">
                  <button 
                    @click="editEmployee(employee)" 
                    class="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                  >
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                    </svg>
                    Ubah
                  </button>
                  
                  <button 
                    @click="deleteEmployee(employee.id)" 
                    class="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                  >
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                    Hapus
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Empty State -->
      <div v-if="employees.length === 0" class="text-center py-12 px-4">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.196-2.121M17 20h-1m1 0a1 1 0 01-1-1v-1m2-9a3 3 0 11-6 0 3 3 0 016 0zM9 12a4 4 0 11-8 0 4 4 0 018 0zM9 12c0 .796.316 1.559.879 2.121l-1.415 1.415A5.972 5.972 0 017 12a6 6 0 1112 0c0 1.372-.46 2.634-1.234 3.657"></path>
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">Belum ada data pegawai</h3>
        <p class="mt-1 text-sm text-gray-500">Mulai dengan menambahkan pegawai pertama Anda.</p>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'EmployeeManagement',
  data() {
    return {
      employees: [],
      form: {
        id: null,
        name: '',
        username: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: '',
      },
      errors: {},
      showForm: false,
      isEditMode: false,
      isSubmitting: false,
      toasts: [],
      toastId: 0,
      showConfirmDialog: false,
      deleteItemId: null
    }
  },
  methods: {
    showToast(type, title, message = null, duration = 4000) {
      const id = ++this.toastId
      const toast = { id, type, title, message }
      this.toasts.push(toast)

      setTimeout(() => {
        this.removeToast(id)
      }, duration)
    },

    removeToast(id) {
      const index = this.toasts.findIndex(toast => toast.id === id)
      if (index > -1) {
        this.toasts.splice(index, 1)
      }
    },

    formatDate(dateString) {
      if (!dateString) return '-'
      const date = new Date(dateString)
      return date.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    },

    async getEmployees() {
      const token = localStorage.getItem('token')
      
      try {
        const response = await axios.get('http://localhost:8000/api/users', {
          headers: { Authorization: `Bearer ${token}` }
        })
        
        if (response.data.success) {
          this.employees = response.data.data
        } else {
          this.showToast('error', 'Gagal Memuat Data', response.data.message)
        }
      } catch (error) {
        console.error('Error fetching employees:', error)
        const message = error.response?.data?.message || 'Terjadi kesalahan saat memuat data'
        this.showToast('error', 'Gagal Memuat Data', message)
      }
    },

    async addEmployee() {
      const token = localStorage.getItem('token')
      this.isSubmitting = true
      this.errors = {}

      try {
        const response = await axios.post('http://localhost:8000/api/users', {
          name: this.form.name,
          username: this.form.username,
          email: this.form.email,
          password: this.form.password,
          password_confirmation: this.form.password_confirmation,
          role: this.form.role,
        }, {
          headers: { Authorization: `Bearer ${token}` }
        })

        if (response.data.success) {
          this.showToast('success', 'Berhasil!', response.data.message)
          this.resetForm()
          this.closeForm()
          this.getEmployees()
        } else {
          this.showToast('error', 'Gagal Menambah Pegawai', response.data.message)
        }
      } catch (error) {
        console.error('Error adding employee:', error)
        
        if (error.response?.status === 422) {
          this.errors = error.response.data.errors || {}
          this.showToast('error', 'Validasi Error', 'Periksa kembali data yang diinput')
        } else {
          const message = error.response?.data?.message || 'Terjadi kesalahan saat menambahkan pegawai'
          this.showToast('error', 'Gagal Menambah Pegawai', message)
        }
      } finally {
        this.isSubmitting = false
      }
    },

    editEmployee(employee) {
      this.form.id = employee.id
      this.form.name = employee.name
      this.form.username = employee.username
      this.form.email = employee.email || ''
      this.form.password = ''
      this.form.password_confirmation = ''
      this.form.role = employee.role || ''
      this.isEditMode = true
      this.showForm = true
      this.errors = {}
    },

    async updateEmployee() {
      const token = localStorage.getItem('token')
      this.isSubmitting = true
      this.errors = {}

      const updateData = {
        name: this.form.name,
        username: this.form.username,
        email: this.form.email,
        role: this.form.role,
      }

      if (this.form.password) {
        updateData.password = this.form.password
        updateData.password_confirmation = this.form.password_confirmation
      }

      try {
        const response = await axios.put(`http://localhost:8000/api/users/${this.form.id}`, updateData, {
          headers: { Authorization: `Bearer ${token}` }
        })

        if (response.data.success) {
          this.showToast('success', 'Berhasil!', response.data.message)
          this.resetForm()
          this.closeForm()
          this.getEmployees()
        } else {
          this.showToast('error', 'Gagal Update Pegawai', response.data.message)
        }
      } catch (error) {
        console.error('Error updating employee:', error)
        
        if (error.response?.status === 422) {
          this.errors = error.response.data.errors || {}
          this.showToast('error', 'Validasi Error', 'Periksa kembali data yang diinput')
        } else if (error.response?.status === 404) {
          this.showToast('error', 'Pegawai Tidak Ditemukan', 'Data pegawai yang akan diupdate tidak ditemukan')
        } else {
          const message = error.response?.data?.message || 'Terjadi kesalahan saat mengupdate pegawai'
          this.showToast('error', 'Gagal Update Pegawai', message)
        }
      } finally {
        this.isSubmitting = false
      }
    },

    deleteEmployee(id) {
      this.deleteItemId = id
      this.showConfirmDialog = true
    },

    async confirmDelete() {
      const token = localStorage.getItem('token')
      
      try {
        const response = await axios.delete(`http://localhost:8000/api/users/${this.deleteItemId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })

        if (response.data.success) {
          this.showToast('success', 'Berhasil!', response.data.message)
          this.getEmployees()
        } else {
          this.showToast('error', 'Gagal Hapus Pegawai', response.data.message)
        }
      } catch (error) {
        console.error('Error deleting employee:', error)
        
        if (error.response?.status === 404) {
          this.showToast('error', 'Pegawai Tidak Ditemukan', 'Data pegawai yang akan dihapus tidak ditemukan')
        } else {
          const message = error.response?.data?.message || 'Terjadi kesalahan saat menghapus pegawai'
          this.showToast('error', 'Gagal Hapus Pegawai', message)
        }
      } finally {
        this.cancelDelete()
      }
    },

    cancelDelete() {
      this.showConfirmDialog = false
      this.deleteItemId = null
    },

    resetForm() {
      this.form.id = null
      this.form.name = ''
      this.form.username = ''
      this.form.email = ''
      this.form.password = ''
      this.form.password_confirmation = ''
      this.form.role = ''
      this.errors = {}
    },

    closeForm() {
      this.showForm = false
      this.isEditMode = false
      this.resetForm()
    }
  },
  
  mounted() {
    this.getEmployees()
  }
}
</script>

<style scoped>
@keyframes slide-in-right {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.animate-slide-in-right {
  animation: slide-in-right 0.3s ease-out;
}

@keyframes scale-in {
  from {
    transform: scale(0.9);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.animate-scale-in {
  animation: scale-in 0.2s ease-out;
}

input:focus {
  outline: none;
}

button:focus {
  outline: 2px solid #4F46E5;
  outline-offset: 2px;
}

.backdrop-blur-sm {
  background-color: rgba(0, 0, 0, 0.5);
}

@supports (backdrop-filter: blur(4px)) {
  .backdrop-blur-sm {
    backdrop-filter: blur(4px);
    background-color: rgba(0, 0, 0, 0.3);
  }
}
</style>