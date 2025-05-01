// WebSocket service for real-time auction updates

// Types
export interface BidUpdate {
  auctionId: string
  bidder: string
  bidAmount: number
  timestamp: number
}

export interface AuctionUpdate {
  auctionId: string
  type: "new" | "ended" | "updated"
  data: any
}

type MessageHandler = (data: any) => void
type ConnectionHandler = () => void

// WebSocket client
class WebSocketService {
  private socket: WebSocket | null = null
  private url: string
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectTimeout = 3000
  private reconnectTimer: NodeJS.Timeout | null = null
  private messageHandlers: Map<string, MessageHandler[]> = new Map()
  private onConnectHandlers: ConnectionHandler[] = []
  private onDisconnectHandlers: ConnectionHandler[] = []

  constructor(url: string = process.env.NEXT_PUBLIC_WEBSOCKET_URL || "wss://auction-ws.example.com") {
    this.url = url
  }

  // Connect to WebSocket server
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        resolve()
        return
      }

      try {
        this.socket = new WebSocket(this.url)

        this.socket.onopen = () => {
          console.log("WebSocket connected")
          this.reconnectAttempts = 0
          this.onConnectHandlers.forEach((handler) => handler())
          resolve()
        }

        this.socket.onclose = () => {
          console.log("WebSocket disconnected")
          this.onDisconnectHandlers.forEach((handler) => handler())
          this.attemptReconnect()
        }

        this.socket.onerror = (error) => {
          console.error("WebSocket error:", error)
          reject(error)
        }

        this.socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            const { type, payload } = data

            if (this.messageHandlers.has(type)) {
              const handlers = this.messageHandlers.get(type) || []
              handlers.forEach((handler) => handler(payload))
            }
          } catch (error) {
            console.error("Error processing WebSocket message:", error)
          }
        }
      } catch (error) {
        console.error("Failed to connect to WebSocket:", error)
        reject(error)
      }
    })
  }

  // Attempt to reconnect
  private attemptReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
    }

    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`)

      this.reconnectTimer = setTimeout(() => {
        this.connect().catch(() => {
          this.attemptReconnect()
        })
      }, this.reconnectTimeout)
    } else {
      console.error("Max reconnect attempts reached")
    }
  }

  // Disconnect from WebSocket server
  disconnect(): void {
    if (this.socket) {
      this.socket.close()
      this.socket = null
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
  }

  // Send message to WebSocket server
  send(type: string, payload: any): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      const message = JSON.stringify({ type, payload })
      this.socket.send(message)
    } else {
      console.error("WebSocket not connected")
    }
  }

  // Subscribe to auction updates
  subscribeToAuction(auctionId: string): void {
    this.send("subscribe", { auctionId })
  }

  // Unsubscribe from auction updates
  unsubscribeFromAuction(auctionId: string): void {
    this.send("unsubscribe", { auctionId })
  }

  // Register message handler
  on(type: string, handler: MessageHandler): void {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, [])
    }

    const handlers = this.messageHandlers.get(type) || []
    handlers.push(handler)
    this.messageHandlers.set(type, handlers)
  }

  // Remove message handler
  off(type: string, handler: MessageHandler): void {
    if (this.messageHandlers.has(type)) {
      const handlers = this.messageHandlers.get(type) || []
      const index = handlers.indexOf(handler)

      if (index !== -1) {
        handlers.splice(index, 1)
        this.messageHandlers.set(type, handlers)
      }
    }
  }

  // Register connect handler
  onConnect(handler: ConnectionHandler): void {
    this.onConnectHandlers.push(handler)
  }

  // Register disconnect handler
  onDisconnect(handler: ConnectionHandler): void {
    this.onDisconnectHandlers.push(handler)
  }
}

// Create singleton instance
const websocketService = new WebSocketService()

export default websocketService
