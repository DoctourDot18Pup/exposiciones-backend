import axios from 'axios'

const client = axios.create({ baseURL: '/api/v1' })

client.interceptors.request.use(cfg => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('sii_token')
    if (token) cfg.headers.Authorization = `Bearer ${token}`
  }
  return cfg
})

client.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('sii_token')
      localStorage.removeItem('sii_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default client
