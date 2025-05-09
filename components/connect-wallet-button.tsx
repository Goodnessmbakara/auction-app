"use client"

import { useState } from "react"
import { useAccount, useConnect, useDisconnect, Connector } from "wagmi"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Wallet, LogOut, Loader2 } from "lucide-react"

export function ConnectWalletButton() {
  const { isConnected, address } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()

  const [isConnecting, setIsConnecting] = useState(false)
  const [activeConnector, setActiveConnector] = useState<Connector | null>(null)

  const handleConnect = async (connector: Connector) => {
    console.log("Attempting to connect with:", connector.name)
    setIsConnecting(true)
    setActiveConnector(connector)

    try {
      await connect({ connector })
      // Dropdown will close automatically since we removed manual open control
    } catch (error) {
      console.error("Connection failed:", error)
    } finally {
      setIsConnecting(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Wallet className="h-4 w-4" />
          {isConnected
            ? `${address?.slice(0, 6)}...${address?.slice(-4)}`
            : "Connect Wallet"}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        {isConnected ? (
          <DropdownMenuItem
            onClick={() => {
              disconnect()
              // No need to manually close dropdown, it closes automatically
            }}
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Disconnect
          </DropdownMenuItem>
        ) : (
          connectors.map((connector) => (
            <DropdownMenuItem
              key={connector.id}
              onClick={() => handleConnect(connector)}
              // Temporarily disable disabling to test clickability
              // disabled={!connector.ready || isConnecting}
              className="flex items-center gap-2"
            >
              {isConnecting && activeConnector?.id === connector.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Wallet className="h-4 w-4" />
              )}
              {connector.name}
              
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
