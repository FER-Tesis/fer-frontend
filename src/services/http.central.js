import axios from "axios"

export const httpCentral = axios.create({
  baseURL: import.meta.env.VITE_CENTRAL_API_URL
})
