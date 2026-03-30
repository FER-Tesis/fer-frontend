import { httpAuth } from "./http.auth"

export async function login(email, password) {
  const { data } = await httpAuth.post("/login", {
    email,
    password
  })
  return data  // { access_token, token_type }
}

export async function logout(token) {
  const { data } = await httpAuth.post("/logout", {
    token
  })
  return data
}