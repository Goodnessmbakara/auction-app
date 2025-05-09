"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ConnectWalletButton } from "@/components/connect-wallet-button"

declare global {
  interface Window {
    ethereum: any
  }
}

interface BidFormProps {
  currentBid: number
  minIncrement: number
  onPlaceBid: (amount: number) => void
  isLoading?: boolean
}

export function BidForm({ currentBid, minIncrement, onPlaceBid, isLoading = false }: BidFormProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [bidAmount, setBidAmount] = useState(currentBid + minIncrement)

  // Update bid amount when current bid changes (real-time updates)
  useEffect(() => {
    setBidAmount(currentBid + minIncrement)
  }, [currentBid, minIncrement])

  // Check if wallet is connected
  useEffect(() => {
    if (window.ethereum) {
      const checkConnection = async () => {
        const accounts = await window.ethereum.request({ method: "eth_accounts" })
        setIsConnected(accounts.length > 0)
      }

      checkConnection()

      // Listen for account changes
      window.ethereum.on("accountsChanged", checkConnection)

      return () => {
        window.ethereum.removeListener("accountsChanged", checkConnection)
      }
    }
  }, [])

  const handleBidChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseFloat(e.target.value)
    setBidAmount(isNaN(value) ? 0 : value)
  }

  const handlePlaceBid = () => {
    onPlaceBid(bidAmount)
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="bid-amount">Your Bid (LSK)</Label>
        <div className="flex gap-2">
          <Input
            id="bid-amount"
            type="number"
            min={currentBid + minIncrement}
            step={minIncrement}
            value={bidAmount}
            onChange={handleBidChange}
            disabled={isLoading}
          />
          <Button
            variant="outline"
            onClick={() => setBidAmount(currentBid + minIncrement)}
            className="whitespace-nowrap"
            disabled={isLoading}
          >
            Min Bid
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Minimum bid is {currentBid + minIncrement} LSK ({minIncrement} LSK more than current bid)
        </p>
      </div>

      {isConnected ? (
        <Button
          onClick={handlePlaceBid}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600"
          disabled={bidAmount < currentBid + minIncrement || isLoading}
        >
          {isLoading ? (
            <>
              <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></span>
              Processing...
            </>
          ) : (
            "Place Bid"
          )}
        </Button>
      ) : (
        <ConnectWalletButton />
      )}
    </div>
  )
}
