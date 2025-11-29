// src/services/settings.api.js
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
})

/**
 * Obtener umbrales de estrés configurados
 * Ejemplo:
 * { critical: 80, warn: 60 }
 */
export async function getThresholds () {
  const { data } = await api.get('/settings/thresholds')
  return data
}

/**
 * Actualizar umbrales
 * payload: { critical: number, warn: number }
 */
export async function updateThresholds (payload) {
  const { data } = await api.put('/settings/thresholds', payload)
  return data
}
