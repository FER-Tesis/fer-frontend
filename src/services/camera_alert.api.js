import { httpAlert } from './http.alert'
import { wsAlert } from './ws.alert'

export async function getSupervisorActiveCameraAlerts(supervisorId) {
  const { data } = await httpAlert.get(
    `/camera/alert/supervisor/${supervisorId}/active`
  )
  return data
}

export async function getAdminActiveCameraAlerts () {
  const { data } = await httpAlert.get('/camera/alert/admin/alerts/active')
  return data
}

export function connectSupervisorActiveCameraAlertsWS(supervisorId) {
  return wsAlert(`/camera/alert/ws/supervisor/${supervisorId}/active`)
}