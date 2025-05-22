"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ConnectWalletButton } from "@/components/connect-wallet-button"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { useAccount } from "wagmi"
import { ethers } from "ethers"

interface BidFormProps {
  currentBid: number
  minIncrement: number
  onPlaceBid: (amount: number) => Promise<void>
  isLoading?: boolean
}

export function BidForm({ currentBid, minIncrement, onPlaceBid, isLoading = false }: BidFormProps) {
  const { isConnected, address } = useAccount()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [bidAmount, setBidAmount] = useState<string>("")
  const [error, setError] = useState<string | null>(null)

  const validateBid = (amount: number): string | null => {
    if (isNaN(amount) || amount <= 0) {
      return "Bid amount must be greater than 0"
    }

    const minBid = currentBid + minIncrement
    if (amount < minBid) {
      return `Minimum bid must be ${ethers.formatEther(minBid)} AVAX`
    }

    // Check if bid amount is too high (e.g., 100x current bid)
    const maxBid = currentBid * 100
    if (amount > maxBid) {
      return "Bid amount seems unusually high. Please verify the amount."
    }

    return null
  }

  const handleBidChange = (value: string) => {
    setBidAmount(value)
    const amount = parseFloat(value)
    setError(validateBid(amount))
  }

  const handlePlaceBid = async () => {
    if (!isConnected || !address) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to place a bid.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)
      const amount = parseFloat(bidAmount)
      const validationError = validateBid(amount)
      
      if (validationError) {
        setError(validationError)
        return
      }

      await onPlaceBid(amount)
      setBidAmount("")
      setError(null)

      toast({
        title: "Bid Placed",
        description: `Your bid of ${ethers.formatEther(amount)} AVAX has been placed successfully.`,
      })
    } catch (error) {
      console.error("Error placing bid:", error)
      setError("Failed to place bid. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const suggestedBids = [
    currentBid + minIncrement,
    currentBid + minIncrement * 2,
    currentBid + minIncrement * 5,
  ]

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="bidAmount">Your Bid (AVAX)</Label>
        <Input
          id="bidAmount"
          type="number"
          step={minIncrement}
          min={currentBid + minIncrement}
          value={bidAmount}
          onChange={(e) => handleBidChange(e.target.value)}
          placeholder={`Minimum: ${ethers.formatEther(currentBid + minIncrement)} AVAX`}
          className={error ? "border-red-500" : ""}
        />
        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {suggestedBids.map((bid) => (
          <Button
            key={bid}
            type="button"
            variant="outline"
            onClick={() => handleBidChange(bid.toString())}
            className="flex-1"
          >
            {ethers.formatEther(bid)} AVAX
          </Button>
        ))}
      </div>

      {isConnected ? (
        <Button
          onClick={handlePlaceBid}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600"
          disabled={!!error || !bidAmount}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Placing Bid...
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
