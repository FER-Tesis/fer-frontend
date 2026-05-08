import { httpCentral } from './http.central'

export async function createSupervisorExportJob (supervisorId, payload) {
  const { data } = await httpCentral.post(`/export/supervisor/${supervisorId}`, payload)
  return data
}

export async function getExportJobStatus (jobId) {
  const { data } = await httpCentral.get(`/export/${jobId}`)
  return data
}

export function getExportDownloadUrl (jobId) {
  return `${httpCentral.defaults.baseURL}/export/${jobId}/download`
}