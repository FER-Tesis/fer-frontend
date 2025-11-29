import { defineStore } from "pinia"
import { login as apiLogin } from "@/services/auth.api"

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: localStorage.getItem("token") || "",
    user: localStorage.getItem("user")
      ? JSON.parse(localStorage.getItem("user"))
      : null,
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

        // token viene del backend: { access_token, token_type }
        this.token = data.access_token

        // decodificamos el JWT para obtener role/id
        const payload = JSON.parse(atob(data.access_token.split(".")[1]))

        this.user = {
          id: payload.sub,
          role: payload.role
        }

        localStorage.setItem("token", this.token)
        localStorage.setItem("user", JSON.stringify(this.user))

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
      this.token = ""
      this.user = null
    }
  }
})
