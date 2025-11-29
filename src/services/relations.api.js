import { httpUser } from "@/services/http.user"

export async function addAgent(supervisor_id, agent_id) {
  const { data } = await httpUser.post('/relations', {
    supervisor_id,
    agent_id
  })
  return data
}

export async function getAssignedAgents(supervisorId) {
  const { data } = await httpUser.get(`/relations/supervisor/${supervisorId}`)
  return data
}

export async function getAvailableAgents() {
  const { data } = await httpUser.get(`/relations/available-agents`)
  return data
}

export async function removeAgent(supervisorId, agentId) {
  const { data } = await httpUser.delete(`/relations/${supervisorId}/${agentId}`)
  return data
}