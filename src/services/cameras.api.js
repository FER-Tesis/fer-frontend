// src/services/cameras.api.js
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
})

/* ============================================
   🔐 Enviar token automáticamente en cada request
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
    console.error('API Error (cameras.api.js):', err)
    throw err
  }
)

/* ============================================
   📌 1. Lista de cámaras (Supervisor + Admin)
   GET /cameras
   ============================================ */
export async function getCameras () {
  const { data } = await api.get('/cameras')
  // Esperado del backend:
  // [
  //   { id, name, agent, status, last, location }
  // ]
  return data
}

/* ============================================
   📌 2. Cambiar estado (activar/desactivar)
   PATCH /cameras/:id/status
   body: { status: 'active' | 'inactive' }
   ============================================ */
export async function updateCameraStatus (id, status) {
  const { data } = await api.patch(`/cameras/${id}/status`, { status })
  return data
}

/* ============================================
   📌 3. Métricas para dashboard (Admin)
   GET /cameras/metrics
   (por si luego lo usas)
   ============================================ */
export async function getCamerasMetrics () {
  const { data } = await api.get('/cameras/metrics')
  return data
}

/* ============================================
   📡 4. Tiempo real (opcional)
   Mensaje que podría enviar backend:
   { type: 'camera-update', camera: {...} }
   ============================================ */
export function connectCamerasRealtime (onMessage) {
  const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3000/ws/cameras'
  const socket = new WebSocket(wsUrl)

  socket.onmessage = ev => {
    try {
      const payload = JSON.parse(ev.data)
      if (payload.type === 'camera-update') {
        onMessage(payload.camera)
      }
    } catch (err) {
      console.error('WS Error (cámaras):', err)
    }
  }

  return () => socket.close()
}
