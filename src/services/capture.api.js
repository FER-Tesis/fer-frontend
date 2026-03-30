import { httpCamera } from "./http.camera"

export async function startCapture(cameraId) {
  const { data } = await httpCamera.post(`/capture/${cameraId}/start`)
  return data
}

export async function stopCapture(cameraId) {
  const { data } = await httpCamera.post(`/capture/${cameraId}/stop`)
  return data
}

export async function getCaptureStatus(cameraId) {
  const { data } = await httpCamera.get(`/capture/${cameraId}/status`)
  return data
}