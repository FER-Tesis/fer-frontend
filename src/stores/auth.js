import { defineStore } from "pinia"
import { login as apiLogin } from "@/services/auth.api"
import { getCameraByAssignedUser } from "@/services/camera.api"

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: localStorage.getItem("token") || "",
    user: localStorage.getItem("user")
      ? JSON.parse(localStorage.getItem("user"))
      : null,
    cameraId: localStorage.getItem("camera_id") || "",
    monitoringActive: localStorage.getItem("monitoring_active") === "true",
    loading: false,
    error: ""
  }),

  getters: {
    isAuthenticated: (s) => !!s.token && !!s.user,
    role: (s) => s.user?.role
  },

  actions: {
    async login(email, password) {
      this.loading = true
      this.error = ""

      try {
        const data = await apiLogin(email, password)

        this.token = data.access_token

        const payload = JSON.parse(atob(data.access_token.split(".")[1]))

        this.user = {
          id: payload.sub,
          role: payload.role
        }

        localStorage.setItem("token", this.token)
        localStorage.setItem("user", JSON.stringify(this.user))

        if (this.user.role === "agent") {
          try {
            const camera = await getCameraByAssignedUser(this.user.id)
            this.cameraId = camera.id || camera._id || ""
            localStorage.setItem("camera_id", this.cameraId)
          } catch {
            this.cameraId = ""
            localStorage.removeItem("camera_id")
          }
        } else {
          this.cameraId = ""
          localStorage.removeItem("camera_id")
        }

        return this.user
      } catch (e) {
        this.error = "Credenciales incorrectas"
        throw e
      } finally {
        this.loading = false
      }
    },

    logout() {
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      localStorage.removeItem("camera_id")

      this.token = ""
      this.user = null
      this.cameraId = ""
    }
  }
})
