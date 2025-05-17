import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { AuctionCountdown } from "@/components/auction-countdown"
import { Badge } from "@/components/ui/badge"

// Mock data for featured auctions
const auctions = [
  {
    id: "1",
    title: "Cosmic Voyager #42",
    image: "/placeholder.jpg?height=400&width=400",
    currentBid: 1250,
    endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    category: "Digital Art",
  },
  {
    id: "2",
    title: "Blockchain Pioneer",
    image: "/placeholder.jpg?height=400&width=400",
    currentBid: 890,
    endTime: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours from now
    category: "Collectible",
  },
  {
    id: "3",
    title: "Neon Genesis",
    image: "/placeholder.jpg?height=400&width=400",
    currentBid: 3400,
    endTime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
    category: "Virtual Land",
  },
  {
    id: "4",
    title: "Crypto Punk #1337",
    image: "/placeholder.jpg?height=400&width=400",
    currentBid: 5600,
    endTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
    category: "Avatar",
  },
]

export function FeaturedAuctions() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {auctions.map((auction) => (
        <Link key={auction.id} href={`/auction/${auction.id}`}>
          <Card className="overflow-hidden transition-all hover:shadow-md hover:shadow-purple-500/10 hover:-translate-y-1">
            <div className="relative aspect-square overflow-hidden">
              <Badge className="absolute left-2 top-2 z-10">{auction.category}</Badge>
              <Image
                src={auction.image || "/placeholder.jpg"}
                alt={auction.title}
                width={400}
                height={400}
                className="h-full w-full object-cover transition-transform hover:scale-105"
              />
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold line-clamp-1">{auction.title}</h3>
              <div className="mt-2 flex items-baseline justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Current Bid</p>
                  <p className="font-semibold">{auction.currentBid} LSK</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Ends in</p>
                  <AuctionCountdown endTime={auction.endTime} />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
