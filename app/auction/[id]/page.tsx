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
  const { toast } = useToast()
  const [auction, setAuction] = useState(initialAuction)
  const [isLoading, setIsLoading] = useState(true)
  const [isBidding, setIsBidding] = useState(false)
  const [newBidNotification, setNewBidNotification] = useState<BidUpdate | null>(null)
  const [currentWalletAddress, setCurrentWalletAddress] = useState<string | null>(null)

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
            if (currentWalletAddress !== data.bidder) {
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
  }, [params.id, currentWalletAddress])

  // Handle bid submission
  const handlePlaceBid = async (bidAmount: number) => {
    if (!currentWalletAddress) {
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
          bidder: currentWalletAddress,
          bidAmount: bidAmount,
          timestamp: Date.now(),
        }

        // Update auction with new bid
        setAuction((prev) => ({
          ...prev,
          currentBid: bidAmount,
          bids: [
            {
              bidder: currentWalletAddress,
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
            </div>
            <Image
              src={auction.image}
              alt={auction.title}
              width={600}
              height={600}
              className="object-cover w-full h-full"
            />
          </div>
        </div>

        {/* Right Column - Auction Details */}
        <div className="flex flex-col gap-4">
          <Card className="flex flex-col gap-4">
            <CardHeader>
              <div className="flex justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{auction.category}</Badge>
                  <div className="flex items-center gap-1">
                    <span className="font-medium">{auction.seller.name}</span>
                    {auction.seller.verified && <Flag className="h-4 w-4 text-yellow-400" />}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <p className="font-semibold">{auction.currentBid} LSK</p>
                  <span className="text-sm text-muted-foreground">Current Bid</span>
                </div>
              </div>
              <CardTitle>{auction.title}</CardTitle>
              <CardDescription>{auction.description}</CardDescription>
            </CardHeader>

            <Tabs defaultValue="auction">
              <TabsList className="grid grid-cols-3 gap-2">
                <TabsTrigger value="auction">Auction</TabsTrigger>
                <TabsTrigger value="bids">Bid History</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
              </TabsList>

              <TabsContent value="auction">
                <AuctionCountdown endTime={auction.endTime} />
                <BidForm
                  currentBid={auction.currentBid}
                  minBidIncrement={auction.minBidIncrement}
                  onPlaceBid={handlePlaceBid}
                  isBidding={isBidding}
                />
              </TabsContent>
              <TabsContent value="bids">
                <BidHistory bids={auction.bids} />
              </TabsContent>
              <TabsContent value="details">
                <p>
                  <strong>Seller Address:</strong> {auction.seller.address}
                </p>
                <p>
                  <strong>Created On:</strong> {new Date(auction.created).toLocaleDateString()}
                </p>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  )
}
