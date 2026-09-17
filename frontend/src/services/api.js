import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * Helper function to extract clear, human-readable error messages from Axios or Network errors.
 */
export const formatApiError = (err, defaultMessage = 'An unexpected error occurred.') => {
  if (!err.response) {
    if (err.code === 'ECONNABORTED') {
      return 'Request timed out. Please check your network connection and try again.'
    }
    return 'Unable to connect to the server. Please ensure the backend server is running and try again.'
  }

  const status = err.response.status
  const detail = err.response.data?.detail

  if (detail) {
    if (typeof detail === 'string') {
      return detail
    }
    if (Array.isArray(detail)) {
      return detail
        .map((item) => {
          if (typeof item === 'string') return item
          const field = item.loc ? item.loc[item.loc.length - 1] : ''
          return field ? `${field}: ${item.msg}` : item.msg || JSON.stringify(item)
        })
        .join('; ')
    }
    if (typeof detail === 'object') {
      return detail.msg || JSON.stringify(detail)
    }
  }

  if (status === 500) {
    return 'Internal server error occurred. Please try again later.'
  }

  if (status === 401) {
    return 'Invalid email or password. Please try again.'
  }

  if (status === 403) {
    return 'Access denied. You do not have permission.'
  }

  return defaultMessage
}

// Intercept 401 Unauthorized responses to clear token automatically
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export const registerApi = async (userData) => {
  const response = await api.post('/register', userData)
  return response.data
}

export const loginApi = async (credentials) => {
  const response = await api.post('/login', credentials)
  return response.data
}

export const getProfileApi = async () => {
  const response = await api.get('/user/profile')
  return response.data
}

export const logoutApi = async () => {
  try {
    await api.post('/logout')
  } catch (e) {
    // Ignore errors during logout cleanup
  }
}

export default api

