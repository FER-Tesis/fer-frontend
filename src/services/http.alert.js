import axios from "axios"

export const httpAlert = axios.create({
  baseURL: import.meta.env.VITE_ALERT_API_URL
})
