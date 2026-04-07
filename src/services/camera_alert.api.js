import { httpAlert } from './http.alert'
import { wsAlert } from './ws.alert'

export async function getSupervisorActiveCameraAlerts(supervisorId) {
  const { data } = await httpAlert.get(
    `/supervisor/${supervisorId}/active`
  )
  return data
}

export function connectSupervisorActiveCameraAlertsWS(supervisorId) {
  return wsAlert(`/ws/supervisor/${supervisorId}/active`)
}