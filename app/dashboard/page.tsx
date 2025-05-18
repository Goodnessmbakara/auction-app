"use client"

import { useState, useEffect } from "react"
import { useAccount } from "wagmi"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Raleway, Poppins } from "next/font/google"
import { 
  Clock, 
  Trophy, 
  History, 
  Wallet, 
  Plus, 
  ArrowUpRight, 
  ArrowDownRight,
  Sparkles
} from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

const raleway = Raleway({ subsets: ["latin"] })
const poppins = Poppins({ 
  weight: ['400', '500', '600'],
  subsets: ["latin"] 
})

// Mock data - Replace with actual data from your backend
const mockActiveAuctions = [
  {
    id: 1,
    title: "Digital Art #1",
    currentBid: 1.5,
    endTime: "2024-03-20T12:00:00Z",
    image: "/placeholder.jpg",
    bids: 5
  },
  {
    id: 2,
    title: "Collectible NFT",
    currentBid: 2.8,
    endTime: "2024-03-21T15:00:00Z",
    image: "/placeholder.jpg",
    bids: 3
  }
]

const mockBids = [
  {
    id: 1,
    auctionTitle: "Rare Digital Art",
    bidAmount: 1.2,
    timestamp: "2024-03-15T10:30:00Z",
    status: "active"
  },
  {
    id: 2,
    auctionTitle: "Virtual Land Plot",
    bidAmount: 3.5,
    timestamp: "2024-03-14T18:45:00Z",
    status: "outbid"
  }
]

const mockWonAuctions = [
  {
    id: 1,
    title: "Digital Art #3",
    winningBid: 2.1,
    endTime: "2024-03-10T12:00:00Z",
    image: "/placeholder.jpg"
  }
]

const mockTransactions = [
  {
    id: 1,
    type: "bid",
    amount: 1.2,
    timestamp: "2024-03-15T10:30:00Z",
    status: "completed"
  },
  {
    id: 2,
    type: "win",
    amount: 2.1,
    timestamp: "2024-03-10T12:00:00Z",
    status: "completed"
  }
]

export default function DashboardPage() {
  const { isConnected, address } = useAccount()
  const { toast } = useToast()
  const [balance, setBalance] = useState<number>(0)

  useEffect(() => {
    // Fetch user's balance and other data here
    // This is mock data for now
    setBalance(5.8)
  }, [address])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatTimeLeft = (endTime: string) => {
    const end = new Date(endTime)
    const now = new Date()
    const diff = end.getTime() - now.getTime()
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    
    return `${days}d ${hours}h`
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-[#EC38BC]" />
          <h1 className={`${raleway.className} text-3xl font-bold text-[#1C043C]`}>Dashboard</h1>
        </div>
        <Link href="/create">
          <Button className="bg-gradient-to-r from-[#8B5CF6] to-[#EC38BC] hover:from-[#9414d1] hover:to-[#FF3CAC] group">
            <Plus className="mr-2 h-4 w-4" />
            Create Auction
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="bg-[#1C043C]/50 backdrop-blur border-[#EC38BC]/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className={`${raleway.className} text-sm font-medium text-white`}>
              Active Auctions
            </CardTitle>
            <Clock className="h-4 w-4 text-[#EC38BC]" />
          </CardHeader>
          <CardContent>
            <div className={`${raleway.className} text-2xl font-bold text-white`}>{mockActiveAuctions.length}</div>
            <p className={`${poppins.className} text-xs text-[#EC38BC]`}>
              Ongoing auctions
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#1C043C]/50 backdrop-blur border-[#EC38BC]/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className={`${raleway.className} text-sm font-medium text-white`}>
              Active Bids
            </CardTitle>
            <ArrowUpRight className="h-4 w-4 text-[#EC38BC]" />
          </CardHeader>
          <CardContent>
            <div className={`${raleway.className} text-2xl font-bold text-white`}>{mockBids.length}</div>
            <p className={`${poppins.className} text-xs text-[#EC38BC]`}>
              Current bids
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#1C043C]/50 backdrop-blur border-[#EC38BC]/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className={`${raleway.className} text-sm font-medium text-white`}>
              Won Auctions
            </CardTitle>
            <Trophy className="h-4 w-4 text-[#EC38BC]" />
          </CardHeader>
          <CardContent>
            <div className={`${raleway.className} text-2xl font-bold text-white`}>{mockWonAuctions.length}</div>
            <p className={`${poppins.className} text-xs text-[#EC38BC]`}>
              Successful wins
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#1C043C]/50 backdrop-blur border-[#EC38BC]/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className={`${raleway.className} text-sm font-medium text-white`}>
              Wallet Balance
            </CardTitle>
            <Wallet className="h-4 w-4 text-[#EC38BC]" />
          </CardHeader>
          <CardContent>
            <div className={`${raleway.className} text-2xl font-bold text-white`}>{balance} AVAX</div>
            <p className={`${poppins.className} text-xs text-[#EC38BC]`}>
              Available balance
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList className="bg-[#1C043C]/50 border-[#EC38BC]/20">
          <TabsTrigger value="active" className="data-[state=active]:bg-[#EC38BC] data-[state=active]:text-white">
            Active Auctions
          </TabsTrigger>
          <TabsTrigger value="bids" className="data-[state=active]:bg-[#EC38BC] data-[state=active]:text-white">
            My Bids
          </TabsTrigger>
          <TabsTrigger value="won" className="data-[state=active]:bg-[#EC38BC] data-[state=active]:text-white">
            Won Auctions
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-[#EC38BC] data-[state=active]:text-white">
            Transaction History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {mockActiveAuctions.map((auction) => (
            <Card key={auction.id} className="bg-[#1C043C]/50 backdrop-blur border-[#EC38BC]/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="relative h-16 w-16 overflow-hidden rounded-lg">
                    <img
                      src={auction.image}
                      alt={auction.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className={`${raleway.className} text-lg font-semibold text-white`}>{auction.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="border-[#EC38BC] text-[#EC38BC]">
                        {auction.bids} bids
                      </Badge>
                      <span className={`${poppins.className} text-sm text-[#EC38BC]`}>
                        Current: {auction.currentBid} AVAX
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`${poppins.className} text-sm text-[#EC38BC]`}>
                      Ends in
                    </div>
                    <div className={`${raleway.className} text-lg font-semibold text-white`}>
                      {formatTimeLeft(auction.endTime)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="bids" className="space-y-4">
          {mockBids.map((bid) => (
            <Card key={bid.id} className="bg-[#1C043C]/50 backdrop-blur border-[#EC38BC]/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`${raleway.className} text-lg font-semibold text-white`}>{bid.auctionTitle}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge 
                        variant="outline" 
                        className={`${
                          bid.status === 'active' 
                            ? 'border-green-500 text-green-500' 
                            : 'border-red-500 text-red-500'
                        }`}
                      >
                        {bid.status === 'active' ? 'Active' : 'Outbid'}
                      </Badge>
                      <span className={`${poppins.className} text-sm text-[#EC38BC]`}>
                        {formatDate(bid.timestamp)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`${poppins.className} text-sm text-[#EC38BC]`}>
                      Bid Amount
                    </div>
                    <div className={`${raleway.className} text-lg font-semibold text-white`}>
                      {bid.bidAmount} AVAX
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="won" className="space-y-4">
          {mockWonAuctions.map((auction) => (
            <Card key={auction.id} className="bg-[#1C043C]/50 backdrop-blur border-[#EC38BC]/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="relative h-16 w-16 overflow-hidden rounded-lg">
                    <img
                      src={auction.image}
                      alt={auction.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className={`${raleway.className} text-lg font-semibold text-white`}>{auction.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="border-green-500 text-green-500">
                        Won
                      </Badge>
                      <span className={`${poppins.className} text-sm text-[#EC38BC]`}>
                        {formatDate(auction.endTime)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`${poppins.className} text-sm text-[#EC38BC]`}>
                      Winning Bid
                    </div>
                    <div className={`${raleway.className} text-lg font-semibold text-white`}>
                      {auction.winningBid} AVAX
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {mockTransactions.map((tx) => (
            <Card key={tx.id} className="bg-[#1C043C]/50 backdrop-blur border-[#EC38BC]/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      tx.type === 'bid' ? 'bg-[#EC38BC]/20' : 'bg-green-500/20'
                    }`}>
                      {tx.type === 'bid' ? (
                        <ArrowUpRight className="h-4 w-4 text-[#EC38BC]" />
                      ) : (
                        <Trophy className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                    <div>
                      <h3 className={`${raleway.className} text-lg font-semibold text-white`}>
                        {tx.type === 'bid' ? 'Bid Placed' : 'Auction Won'}
                      </h3>
                      <span className={`${poppins.className} text-sm text-[#EC38BC]`}>
                        {formatDate(tx.timestamp)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`${raleway.className} text-lg font-semibold ${
                      tx.type === 'bid' ? 'text-[#EC38BC]' : 'text-green-500'
                    }`}>
                      {tx.type === 'bid' ? '-' : '+'}{tx.amount} AVAX
                    </div>
                    <Badge variant="outline" className="border-green-500 text-green-500">
                      {tx.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
