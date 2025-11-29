// src/services/users.api.js
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
})

/* ============================================
   🔐 Token automático en cada request
   ============================================ */
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

/* ============================================
   ⚠️ Manejo global de errores
   ============================================ */
api.interceptors.response.use(
  res => res,
  err => {
    console.error('API Error (users.api.js):', err)
    throw err
  }
)

/* ============================================
   📌 1. Lista de usuarios
   GET /admin/users
   ============================================ */
export async function getUsers() {
  const { data } = await api.get('/admin/users')
  return data
}

/* ============================================
   📌 2. Resumen para KPIs
   GET /admin/users/summary
   ============================================ */
export async function getUsersSummary() {
  const { data } = await api.get('/admin/users/summary')
  return data
}

/* ============================================
   📌 3. Crear nuevo usuario
   POST /admin/users
   ============================================ */
export async function createUser(payload) {
  const { data } = await api.post('/admin/users', payload)
  return data
}

/* ============================================
   📌 4. Actualizar usuario
   PUT /admin/users/:id
   ============================================ */
export async function updateUser(id, payload) {
  const { data } = await api.put(`/admin/users/${id}`, payload)
  return data
}

/* ============================================
   📌 5. Eliminar usuario
   DELETE /admin/users/:id
   ============================================ */
export async function deleteUser(id) {
  const { data } = await api.delete(`/admin/users/${id}`)
  return data
}
