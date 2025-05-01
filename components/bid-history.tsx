import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface Bid {
  bidder: string
  amount: number
  time: Date
}

interface BidHistoryProps {
  bids: Bid[]
}

export function BidHistory({ bids }: BidHistoryProps) {
  // Function to format time ago
  const timeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)

    let interval = seconds / 31536000
    if (interval > 1) return Math.floor(interval) + " years ago"

    interval = seconds / 2592000
    if (interval > 1) return Math.floor(interval) + " months ago"

    interval = seconds / 86400
    if (interval > 1) return Math.floor(interval) + " days ago"

    interval = seconds / 3600
    if (interval > 1) return Math.floor(interval) + " hours ago"

    interval = seconds / 60
    if (interval > 1) return Math.floor(interval) + " minutes ago"

    return Math.floor(seconds) + " seconds ago"
  }

  return (
    <div className="space-y-4">
      {bids.length === 0 ? (
        <p className="text-center text-muted-foreground py-4">No bids yet. Be the first to bid!</p>
      ) : (
        <ul className="space-y-3">
          {bids.map((bid, index) => (
            <li key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                    {bid.bidder.substring(3, 5).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">
                    {bid.bidder.substring(0, 6)}...{bid.bidder.substring(bid.bidder.length - 4)}
                  </p>
                  <p className="text-xs text-muted-foreground">{timeAgo(bid.time)}</p>
                </div>
              </div>
              <p className="font-semibold">{bid.amount} LSK</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
