import axios from "axios"

export const httpAuth = axios.create({
  baseURL: import.meta.env.VITE_AUTH_API_URL
})
