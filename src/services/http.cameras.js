import axios from "axios"

export const httpCameras = axios.create({
  baseURL: import.meta.env.VITE_CAMERA_API_URL
})
