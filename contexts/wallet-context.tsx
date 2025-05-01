"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { connectWalletWithPassphrase } from "@/lib/lisk-sdk"

interface WalletContextType {
  isConnected: boolean
  address: string | null
  publicKey: string | null
  connect: (passphrase: string) => Promise<void>
  disconnect: () => void
}

const WalletContext = createContext<WalletContextType>({
  isConnected: false,
  address: null,
  publicKey: null,
  connect: async () => {},
  disconnect: () => {},
})

export const useWallet = () => useContext(WalletContext)

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState<string | null>(null)
  const [publicKey, setPublicKey] = useState<string | null>(null)

  // Check for existing wallet connection on mount
  useEffect(() => {
    const storedAddress = localStorage.getItem("wallet_address")
    const storedPublicKey = localStorage.getItem("wallet_public_key")

    if (storedAddress && storedPublicKey) {
      setIsConnected(true)
      setAddress(storedAddress)
      setPublicKey(storedPublicKey)
    }
  }, [])

  const connect = async (passphrase: string) => {
    try {
      const res = await fetch("/api/wallet/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passphrase }),
      })

      if (!res.ok) throw new Error("Failed to connect")

      const { address, publicKey } = await res.json()

      localStorage.setItem("wallet_address", address)
      localStorage.setItem("wallet_public_key", publicKey)

      setIsConnected(true)
      setAddress(address)
      setPublicKey(publicKey)
    } catch (error) {
      console.error("Failed to connect wallet:", error)
      throw error
    }
  }
  
  const disconnect = () => {
    localStorage.removeItem("wallet_address")
    localStorage.removeItem("wallet_public_key")

    setIsConnected(false)
    setAddress(null)
    setPublicKey(null)
  }

  return (
    <WalletContext.Provider value={{ isConnected, address, publicKey, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  )
}
