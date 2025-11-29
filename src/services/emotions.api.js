// src/services/emotions.api.js
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
})

export async function fetchTeamEmotions () {
  // GET /emotions/team → lista de agentes con su emoción actual
  const { data } = await api.get('/emotions/team')
  return data
}

export async function fetchAgentEmotion (agentId) {
  // GET /emotions/agent/:id
  const { data } = await api.get(`/emotions/agent/${agentId}`)
  return data
}

// Si luego usan WebSocket / SSE, acá puedes dejar el hook
export function connectEmotionStream (onMessage) {
  // tu compañero puede cambiar esto por WebSocket real
  // const ws = new WebSocket('ws://...');
  // ws.onmessage = (ev) => onMessage(JSON.parse(ev.data))
  // return () => ws.close()
  return () => {} // de momento no hace nada
}
