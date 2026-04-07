export function wsAlert(path) {
  const base = import.meta.env.VITE_ALERT_API_URL
  const wsBase = base.replace("http", "ws") + path

  return new WebSocket(wsBase)
}
