export function wsCentral(path) {
  const base = import.meta.env.VITE_CENTRAL_API_URL
  const wsBase = base.replace("http", "ws") + path

  return new WebSocket(wsBase)
}
