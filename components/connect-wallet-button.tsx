// components/connect-wallet-button.tsx

"use client"

import { useAccount, useConnect, useDisconnect } from "wagmi"
import { Button } from "@/components/ui/button"
import { Wallet, ArrowRight, LogOut } from "lucide-react"

export function ConnectWalletButton() {
  const { isConnected, address } = useAccount()  // use Wagmi's useAccount hook
  const { connect, connectors } = useConnect()  // use connect for wallet connection
  const { disconnect } = useDisconnect()  // use disconnect for wallet disconnect

  if (isConnected) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="gap-2">
          <span className="h-2 w-2 rounded-full bg-green-500"></span>
          <span className="hidden md:inline-block">
            {address?.substring(0, 6)}...{address?.substring(address.length - 4)}
          </span>
          <span className="md:hidden">{address?.substring(0, 4)}...</span>
        </Button>
        <Button variant="ghost" size="icon" onClick={disconnect} className="h-8 w-8">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      {connectors.map((connector) => (
        <Button key={connector.id} onClick={() => connect(connector)} size="sm" className="gap-2">
          <Wallet className="h-4 w-4" />
          {`Connect ${connector.name}`}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      ))}
    </div>
  )
}
