import { httpUser } from './http.user'

export async function getUsers() {
  const res = await httpUser.get('/user/users')
  return res.data
}

export async function createUser(payload) {
  const res = await httpUser.post('/user/users', payload)
  return res.data
}

export async function updateUser(id, payload) {
  const res = await httpUser.patch(`/user/users/${id}`, payload)
  return res.data
}

export async function deleteUser(id) {
  const res = await httpUser.delete(`/user/users/${id}`)
  return res.data
}

export async function getUsersMetrics() {
  const res = await httpUser.get('/user/users/metrics')
  return res.data
}
