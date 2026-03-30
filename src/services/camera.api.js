import { httpCamera } from "./http.camera"

export async function getCameraByAssignedUser(userId) {
  const { data } = await httpCamera.get(`/camera/cameras/assigned/user/${userId}`)
  return data
}

export async function updateCameraStatus(cameraId, payload) {
  const { data } = await httpCamera.patch(`/camera/cameras/${cameraId}/status`, payload)
  return data
}