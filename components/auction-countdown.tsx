"use client"

import { useEffect, useState } from "react"

interface AuctionCountdownProps {
  endTime: Date | string // Accept both Date and string
}

export function AuctionCountdown({ endTime }: AuctionCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number
    hours: number
    minutes: number
    seconds: number
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  const [isEnded, setIsEnded] = useState(false)

  useEffect(() => {
    // Convert to Date if it's a string
    const endDate = typeof endTime === 'string' ? new Date(endTime) : endTime
    
    // Validate the date
    if (isNaN(endDate.getTime())) {
      console.error("Invalid endTime provided:", endTime)
      return
    }

    const calculateTimeLeft = () => {
      const difference = endDate.getTime() - new Date().getTime()

      if (difference <= 0) {
        setIsEnded(true)
        return {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
        }
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      }
    }

    setTimeLeft(calculateTimeLeft())

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(timer)
  }, [endTime])

  if (isEnded) {
    return <span className="text-sm font-medium text-red-500">Ended</span>
  }

  // For compact display (e.g. in cards)
  if (timeLeft.days > 0) {
    return (
      <span className="text-sm font-medium">
        {timeLeft.days}d {timeLeft.hours}h
      </span>
    )
  }

  return (
    <span className="text-sm font-medium">
      {String(timeLeft.hours).padStart(2, "0")}:
      {String(timeLeft.minutes).padStart(2, "0")}:
      {String(timeLeft.seconds).padStart(2, "0")}
    </span>
  )
}