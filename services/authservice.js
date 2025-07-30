// services/authService.js
import apiClient from '../api/axios'

class AuthService {
  // Login user
  async login(credentials) {
    try {
      const response = await apiClient.post('/api/login', credentials)
      return response.data
    } catch (error) {
      throw error
    }
  }


  // Logout user
  async logout() {
    try {
      const response = await apiClient.post('/api/logout')
      this.clearTokens()
      return response.data
    } catch (error) {
      this.clearTokens()
      throw error
    }
  }

  // Get current user
  async getCurrentUser() {
    try {
      const response = await apiClient.get('/api/user')
      return response.data
    } catch (error) {
      throw error
    }
  }

  // Save tokens to localStorage
  saveTokens(token, user) {
    localStorage.setItem('auth_token', token)
    localStorage.setItem('user_data', JSON.stringify(user))
  }

  // Clear tokens from localStorage
  clearTokens() {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_data')
  }

  // Check if user is authenticated
  isAuthenticated() {
    const token = localStorage.getItem('auth_token')
    return !!token
  }

  // Get stored token
  getToken() {
    return localStorage.getItem('auth_token')
  }

  // Get stored user data
  getUser() {
    const userData = localStorage.getItem('user_data')
    return userData ? JSON.parse(userData) : null
  }
}

export default new AuthService()
