import { httpAlert } from './http.alert'
import { wsAlert } from './ws.alert'

export async function getSupervisorPendingEmotionAlerts(supervisorId) {
  const { data } = await httpAlert.get(
    `/emotion/alert/supervisors/${supervisorId}/alerts/pending`
  )
  return data
}

export async function acknowledgeEmotionAlert(alertId) {
  await httpAlert.patch(
    `/emotion/alert/alerts/${alertId}/acknowledge`
  )
}

export function connectSupervisorPendingEmotionAlertsWS(supervisorId) {
  return wsAlert(
    `/emotion/alert/ws/supervisor/${supervisorId}/pending`
  )
}