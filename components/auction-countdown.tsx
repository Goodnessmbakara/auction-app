"use client"

import { useEffect, useState } from "react"
import { formatDistanceToNow, formatDistanceStrict } from "date-fns"
import { Clock } from "lucide-react"

interface AuctionCountdownProps {
  endTime: string
  onEnd?: () => void
}

export function AuctionCountdown({ endTime, onEnd }: AuctionCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<string>("")
  const [isEnded, setIsEnded] = useState(false)

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date()
      const end = new Date(endTime)
      const timeUntilEnd = end.getTime() - now.getTime()

      if (timeUntilEnd <= 0) {
        setIsEnded(true)
        setTimeLeft("Auction ended")
        onEnd?.()
        return
      }

      // Show detailed countdown when less than 1 hour
      if (timeUntilEnd < 3600000) {
        setTimeLeft(formatDistanceStrict(end, now, { addSuffix: true }))
      } else {
        setTimeLeft(formatDistanceToNow(end, { addSuffix: true }))
      }
    }

    // Update immediately
    updateCountdown()

    // Update every second
    const interval = setInterval(updateCountdown, 1000)

    return () => clearInterval(interval)
  }, [endTime, onEnd])

  return (
    <div className="flex items-center gap-2">
      <Clock className={`h-4 w-4 ${isEnded ? "text-red-500" : "text-[#EC38BC]"}`} />
      <span className={`text-sm ${isEnded ? "text-red-500" : "text-[#EC38BC]"}`}>
        {timeLeft}
      </span>
    </div>
  )
}