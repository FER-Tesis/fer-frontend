// src/services/alerts.api.js
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
})

/* ====== TOKEN ====== */
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

/* ====== ERRORES ====== */
api.interceptors.response.use(
  res => res,
  err => {
    console.error('API Error (alerts.api.js):', err)
    throw err
  }
)

/* ============================================
   📌 LISTA DE ALERTAS EMOCIONALES
   GET /alerts/emotions
   ============================================ */
export async function getEmotionAlerts (params = {}) {
  const { data } = await api.get('/alerts/emotions', { params })
  return data
}

/* ============================================
   📌 MARCAR ALERTA COMO LEÍDA
   PATCH /alerts/emotions/:id/read
   ============================================ */
export async function markAlertAsRead (id) {
  const { data } = await api.patch(`/alerts/emotions/${id}/read`)
  return data
}

/* ============================================
   📡 WEBSOCKET TIEMPO REAL
   ============================================ */
export function connectAlertsRealtime (onMessage) {
  const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3000/ws/alerts'
  const socket = new WebSocket(wsUrl)

  socket.onmessage = ev => {
    try {
      const payload = JSON.parse(ev.data)
      if (payload.type === 'emotion-alert') {
        onMessage(payload.alert)
      }
    } catch (err) {
      console.error('Error WS alerts:', err)
    }
  }

  return () => socket.close()
}
