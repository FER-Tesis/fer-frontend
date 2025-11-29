// src/services/agents.api.js
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
})

/* ====== OPCIONAL: enviar token automáticamente ====== */
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

/* ====== OPCIONAL: manejo de errores global ====== */
api.interceptors.response.use(
  res => res,
  err => {
    console.error('API Error (agents.api.js):', err)
    throw err
  }
)

/* ============================
   📌 OBTENER LISTA DE AGENTES
   GET /agents
   ============================ */
export async function fetchAgents () {
  const { data } = await api.get('/agents')
  return data
}

/* ============================
   📌 OBTENER DETALLES DE 1 AGENTE
   GET /agents/:id
   ============================ */
export async function fetchAgentDetails (id) {
  const { data } = await api.get(`/agents/${id}`)
  return data
}

/* ============================
   📌 HISTORIAL DE EMOCIONES
   GET /agents/:id/history?range=&date=
   ============================ */
export async function fetchAgentEmotionHistory (id, params = {}) {
  const { data } = await api.get(`/agents/${id}/history`, { params })
  return data
}

/* ============================
   📌 FORZAR REFRESCO DE EMOCIÓN
   GET /agents/:id/emotion
   ============================ */
export async function refreshAgentEmotion (id) {
  const { data } = await api.get(`/agents/${id}/emotion`)
  return data
}

/* ============================
   📌 STREAM EN TIEMPO REAL
   ============================ */
export function connectAgentsRealtime (onMessage) {
  const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3000/ws/agents'
  const socket = new WebSocket(wsUrl)

  socket.onmessage = ev => {
    try {
      const payload = JSON.parse(ev.data)
      onMessage(payload)
    } catch (err) {
      console.error('Error WS agentes:', err)
    }
  }

  return () => socket.close()
}
