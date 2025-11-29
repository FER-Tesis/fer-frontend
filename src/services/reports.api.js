// src/services/reports.api.js
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
})

/* ============================================
   🔐 Agregar Token automáticamente
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
    console.error('API Error (reports.api.js):', err)
    throw err
  }
)

/* ============================================
   📝 1. Agente reporta falla de cámara
   POST /camera-reports
   ============================================ */
export async function createCameraReport(payload) {
  const { data } = await api.post('/camera-reports', payload)
  return data
}

/* ============================================
   📋 2. Supervisor carga lista de reportes
   GET /camera-reports?status=pending
   ============================================ */
export async function getCameraReports(params = {}) {
  const { data } = await api.get('/camera-reports', { params })
  return data
}

/* ============================================
   ✔️ 3. Resolver reporte
   PATCH /camera-reports/:id/resolve
   ============================================ */
export async function resolveCameraReport(id) {
  const { data } = await api.patch(`/camera-reports/${id}/resolve`)
  return data
}
