import { httpCamera } from "./http.camera"

export async function getCameraByAssignedUser(userId) {
  const { data } = await httpCamera.get(`/camera/cameras/assigned/user/${userId}`)
  return data
}

export async function updateCameraStatus(cameraId, payload) {
  const { data } = await httpCamera.patch(`/camera/cameras/${cameraId}/status`, payload)
  return data
}

export async function getCamerasMetrics() {
  const { data } = await httpCamera.get(`/camera/cameras/metrics`)
  return data
}

export async function getCameras() {
  const { data } = await httpCamera.get(`/camera/cameras`)
  return data
}

export async function createCamera(payload) {
  const { data } = await httpCamera.post(`/camera/cameras`, payload)
  return data
}

export async function updateCamera(id, payload) {
  const { data } = await httpCamera.patch(`/camera/cameras/${id}`, payload)
  return data
}

export async function deleteCamera(id) {
  const { data } = await httpCamera.delete(`/camera/cameras/${id}`)
  return data
}