import { httpCentral } from './http.central'
import { wsCentral } from './ws.central'

export async function getAgentCurrent (agentId) {
  const { data } = await httpCentral.get(`/monitoring/agent/${agentId}/current`)
  return data
}

export async function getAgentDayHistory (agentId) {
  const { data } = await httpCentral.get(`/monitoring/agent/${agentId}/history/day`)
  return data
}

export async function getAgentWeekHistory (agentId) {
  const { data } = await httpCentral.get(`/monitoring/agent/${agentId}/history/week`)
  return data
}

export function connectAgentCurrentWS(agentId) {
  return wsCentral(`/monitoring/ws/agent/${agentId}/current`)
}

export async function getAgentsSupervisor(supervisorId) {
  const { data } = await httpCentral.get(`/monitoring/supervisor/${supervisorId}/agents`)
  return data
}

export function connectSupervisorAgentsWS(supervisorId) {
  return wsCentral(`/monitoring/ws/supervisor/${supervisorId}/agents`)
}

export async function getSupervisorCameras(supervisorId) {
  const { data } = await httpCentral.get(`/monitoring/supervisor/${supervisorId}/cameras`)
  return data
}

export function connectSupervisorCamerasWS(supervisorId) {
  return wsCentral(`/monitoring/ws/supervisor/${supervisorId}/cameras`)
}