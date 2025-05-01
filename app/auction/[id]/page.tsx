"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { AuctionCountdown } from "@/components/auction-countdown"
import { BidForm } from "@/components/bid-form"
import { BidHistory } from "@/components/bid-history"
import { ArrowLeft, Share2, Flag, Heart } from "lucide-react"
import { useWallet } from "@/contexts/wallet-context"
import { useToast } from "@/hooks/use-toast"
import websocketService, { type BidUpdate } from "@/lib/websocket-service"

// Mock data for a single auction
const initialAuction = {
  id: "1",
  title: "Cosmic Voyager #42",
  description:
    "A stunning digital artwork exploring the vastness of space and the human desire for exploration. This piece represents the journey of humanity beyond our planet, into the unknown reaches of the cosmos.",
  image: "/placeholder.svg?height=600&width=600",
  category: "Digital Art",
  seller: {
    address: "lsk24cd35u4jdq8szo3pnsqe5dsxwrnazyqqqg5eu",
    name: "CryptoArtist",
    verified: true,
  },
  currentBid: 1250,
  minBidIncrement: 50,
  startingBid: 500,
  endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
  created: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
  bids: [
    {
      bidder: "lsk3j2k3j2k3j2k3j2k3j2k3j2k3j2k3j2k3j2k",
      amount: 1250,
      time: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    },
    {
      bidder: "lsk4k5j6h7j8k9l0k9j8h7g6f5d4s3a2s1d2f3g",
      amount: 1200,
      time: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    },
    {
      bidder: "lsk1a2s3d4f5g6h7j8k9l0k9j8h7g6f5d4s3a2s",
      amount: 1000,
      time: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
    },
    {
      bidder: "lsk9l8k7j6h5g4f3d2s1a2s3d4f5g6h7j8k9l0k",
      amount: 800,
      time: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
    },
    {
      bidder: "lsk5g6h7j8k9l0k9j8h7g6f5d4s3a2s1d2f3g4h",
      amount: 600,
      time: new Date(Date.now() - 36 * 60 * 60 * 1000), // 36 hours ago
    },
    {
      bidder: "lsk2s3d4f5g6h7j8k9l0k9j8h7g6f5d4s3a2s1d",
      amount: 500,
      time: new Date(Date.now() - 48 * 60 * 60 * 1000), // 48 hours ago
    },
  ],
}

export default function AuctionDetailsPage({ params }: { params: { id: string } }) {
  const { isConnected, address } = useWallet()
  const { toast } = useToast()
  const [auction, setAuction] = useState(initialAuction)
  const [isLoading, setIsLoading] = useState(true)
  const [isBidding, setIsBidding] = useState(false)
  const [newBidNotification, setNewBidNotification] = useState<BidUpdate | null>(null)

  // Fetch auction data
  useEffect(() => {
    const fetchAuction = async () => {
      try {
        setIsLoading(true)
        // In a real app, you would fetch the auction data from the blockchain
        // const auctionData = await getAuction(params.id)
        // setAuction(auctionData)

        // For demo purposes, we'll use the mock data
        setTimeout(() => {
          setIsLoading(false)
        }, 1000)
      } catch (error) {
        console.error("Failed to fetch auction:", error)
        toast({
          title: "Error",
          description: "Failed to fetch auction details. Please try again.",
          variant: "destructive",
        })
        setIsLoading(false)
      }
    }

    fetchAuction()
  }, [params.id, toast])

  // Set up WebSocket connection for real-time updates
  useEffect(() => {
    const connectWebSocket = async () => {
      try {
        await websocketService.connect()

        // Subscribe to auction updates
        websocketService.subscribeToAuction(params.id)

        // Listen for bid updates
        websocketService.on("bid", (data: BidUpdate) => {
          if (data.auctionId === params.id) {
            // Update auction with new bid
            setAuction((prev) => ({
              ...prev,
              currentBid: data.bidAmount,
              bids: [
                {
                  bidder: data.bidder,
                  amount: data.bidAmount,
                  time: new Date(data.timestamp),
                },
                ...prev.bids,
              ],
            }))

            // Show notification if the bid is not from the current user
            if (address !== data.bidder) {
              setNewBidNotification(data)

              // Clear notification after 5 seconds
              setTimeout(() => {
                setNewBidNotification(null)
              }, 5000)
            }
          }
        })

        return () => {
          // Unsubscribe and disconnect when component unmounts
          websocketService.unsubscribeFromAuction(params.id)
          websocketService.disconnect()
        }
      } catch (error) {
        console.error("WebSocket connection error:", error)
      }
    }

    connectWebSocket()
  }, [params.id, address])

  // Handle bid submission
  const handlePlaceBid = async (bidAmount: number) => {
    if (!isConnected || !address) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to place a bid.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsBidding(true)

      // In a real app, you would place the bid on the blockchain
      // await placeBid('your_passphrase', params.id, bidAmount)

      // For demo purposes, we'll simulate a successful bid
      setTimeout(() => {
        // Simulate WebSocket update
        const bidUpdate: BidUpdate = {
          auctionId: params.id,
          bidder: address,
          bidAmount: bidAmount,
          timestamp: Date.now(),
        }

        // Update auction with new bid
        setAuction((prev) => ({
          ...prev,
          currentBid: bidAmount,
          bids: [
            {
              bidder: address,
              amount: bidAmount,
              time: new Date(),
            },
            ...prev.bids,
          ],
        }))

        toast({
          title: "Bid Placed",
          description: `Your bid of ${bidAmount} LSK has been placed successfully.`,
        })

        setIsBidding(false)
      }, 2000)
    } catch (error) {
      console.error("Failed to place bid:", error)
      toast({
        title: "Bid Failed",
        description: "Failed to place your bid. Please try again.",
        variant: "destructive",
      })
      setIsBidding(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-4 text-muted-foreground">Loading auction details...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <Link
        href="/explore"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to auctions
      </Link>

      {/* New Bid Notification */}
      {newBidNotification && (
        <div className="fixed bottom-4 right-4 z-50 max-w-md animate-in fade-in slide-in-from-bottom-5">
          <Card className="border-purple-500 bg-purple-950/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold">
                  {newBidNotification.bidder.substring(3, 5).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold">New Bid!</p>
                  <p className="text-sm">
                    {newBidNotification.bidder.substring(0, 6)}...
                    {newBidNotification.bidder.substring(newBidNotification.bidder.length - 4)} placed a bid of{" "}
                    <span className="font-semibold">{newBidNotification.bidAmount} LSK</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Left Column - Image */}
        <div className="flex flex-col gap-4">
          <div className="relative overflow-hidden rounded-lg border border-border/50 bg-background">
            <div className="absolute right-2 top-2 z-10 flex gap-2">
              <Button variant="outline" size="icon" className="h-8 w-8 rounded-full bg-background/80 backdrop-blur">
                <Heart className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8 rounded-full bg-background/80 backdrop-blur">
                <Share2 className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8 rounded-full bg-background/80 backdrop-blur">
                <Flag className="h-4 w-4" />
              </Button>
            </div>
            <Image
              src={auction.image || "/placeholder.svg"}
              alt={auction.title}
              width={600}
              height={600}
              className="aspect-square w-full object-cover"
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Item Details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Category</p>
                  <p className="font-medium">{auction.category}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Created</p>
                  <p className="font-medium">{auction.created.toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Starting Bid</p>
                  <p className="font-medium">{auction.startingBid} LSK</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Minimum Increment</p>
                  <p className="font-medium">{auction.minBidIncrement} LSK</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Details and Bidding */}
        <div className="flex flex-col gap-6">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-purple-500 text-purple-500">
                {auction.category}
              </Badge>
              <p className="text-sm text-muted-foreground">
                Auction ends in <AuctionCountdown endTime={auction.endTime} />
              </p>
            </div>

            <h1 className="mt-2 text-3xl font-bold">{auction.title}</h1>

            <div className="mt-4 flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-purple-500"></div>
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium">{auction.seller.name}</span>
                {auction.seller.verified && (
                  <Badge variant="secondary" className="h-5 px-1">
                    ✓
                  </Badge>
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                {auction.seller.address.substring(0, 6)}...
                {auction.seller.address.substring(auction.seller.address.length - 4)}
              </span>
            </div>

            <p className="mt-4 text-muted-foreground">{auction.description}</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Current Bid</CardTitle>
              <CardDescription>Place your bid to win this auction</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <p className="text-sm text-muted-foreground">Highest Bid</p>
                <p className="text-3xl font-bold">{auction.currentBid} LSK</p>
              </div>

              <BidForm
                currentBid={auction.currentBid}
                minIncrement={auction.minBidIncrement}
                onPlaceBid={handlePlaceBid}
                isLoading={isBidding}
              />
            </CardContent>
          </Card>

          <Tabs defaultValue="bids">
            <TabsList className="w-full">
              <TabsTrigger value="bids" className="flex-1">
                Bid History
              </TabsTrigger>
              <TabsTrigger value="details" className="flex-1">
                Details
              </TabsTrigger>
            </TabsList>
            <TabsContent value="bids">
              <Card>
                <CardContent className="p-4">
                  <BidHistory bids={auction.bids} />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="details">
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold">Blockchain Details</h3>
                      <div className="mt-2 grid grid-cols-1 gap-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Contract Address</span>
                          <span className="font-mono">0x1a2b...3c4d</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Token ID</span>
                          <span className="font-mono">42</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Blockchain</span>
                          <span>Lisk</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold">Auction Details</h3>
                      <div className="mt-2 grid grid-cols-1 gap-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Auction ID</span>
                          <span className="font-mono">{auction.id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Created</span>
                          <span>{auction.created.toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Starting Bid</span>
                          <span>{auction.startingBid} LSK</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
