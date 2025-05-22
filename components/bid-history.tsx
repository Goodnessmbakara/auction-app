import { formatDistanceToNow } from "date-fns"
import { Card, CardContent } from "@/components/ui/card"
import { Raleway, Poppins } from "next/font/google"

const raleway = Raleway({ subsets: ["latin"] })
const poppins = Poppins({ 
  weight: ['400', '500', '600'],
  subsets: ["latin"] 
})

interface Bid {
  bidder: string
  amount: number
  time: string
}

interface BidHistoryProps {
  bids: Bid[]
}

export function BidHistory({ bids }: BidHistoryProps) {
  if (bids.length === 0) {
    return (
      <div className="text-center py-6">
        <p className={`${poppins.className} text-muted-foreground`}>
          No bids yet. Be the first to bid!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {bids.map((bid, index) => (
        <Card 
          key={index}
          className="bg-[#1C043C]/30 backdrop-blur border-[#EC38BC]/10"
        >
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className={`${raleway.className} text-white font-medium`}>
                  {bid.amount} AVAX
                </p>
                <p className={`${poppins.className} text-sm text-[#EC38BC]`}>
                  by {bid.bidder.slice(0, 6)}...{bid.bidder.slice(-4)}
                </p>
              </div>
              <p className={`${poppins.className} text-sm text-muted-foreground`}>
                {formatDistanceToNow(new Date(bid.time), { addSuffix: true })}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
