import axios from "axios"

export const httpCamera = axios.create({
  baseURL: import.meta.env.VITE_CAMERA_API_URL
})
