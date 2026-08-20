import { useEffect, useRef } from "react"

export function useWebSocket(url: string, onMessage: (data: any) => void) {
  const ws = useRef<WebSocket | null>(null)

  useEffect(() => {
    ws.current = new WebSocket(url)

    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        onMessage(data)
      } catch (e) {
        console.error("Error parsing websocket message", e)
      }
    }

    return () => {
      ws.current?.close()
    }
  }, [url, onMessage])

  return ws.current
}
