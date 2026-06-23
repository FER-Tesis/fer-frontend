import { httpAlert } from './http.alert'
import { wsAlert } from './ws.alert'

export async function getSupervisorActiveCameraAlerts(supervisorId) {
  const { data } = await httpAlert.get(
    `/camera/alert/supervisor/${supervisorId}/active`
  )
  return data
}

export function connectSupervisorActiveCameraAlertsWS(supervisorId) {
  return wsAlert(`/camera/alert/ws/supervisor/${supervisorId}/active`)
}

export async function getAdminActiveCameraAlerts() {
  const { data } = await httpAlert.get(
    `/camera/alert/active`
  )
  return data
}

export function connectAdminActiveCameraAlertsWS() {
  return wsAlert(`/camera/alert/ws/admin/active`)
}