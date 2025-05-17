"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AuctionCountdown } from "@/components/auction-countdown"
import { ConnectWalletButton } from "@/components/connect-wallet-button"
import { Plus } from "lucide-react"

// Mock data for user dashboard
const mockData = {
  createdAuctions: [
    {
      id: "1",
      title: "Cosmic Voyager #42",
      image: "/placeholder.jpg?height=200&width=200",
      currentBid: 1250,
      endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      bids: 6,
    },
    {
      id: "2",
      title: "Blockchain Pioneer",
      image: "/placeholder.jpg?height=200&width=200",
      currentBid: 890,
      endTime: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours from now
      bids: 4,
    },
  ],
  activeBids: [
    {
      id: "3",
      title: "Neon Genesis",
      image: "/placeholder.jpg?height=200&width=200",
      currentBid: 3400,
      yourBid: 3200,
      endTime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
      status: "outbid",
    },
    {
      id: "4",
      title: "Crypto Punk #1337",
      image: "/placeholder.jpg?height=200&width=200",
      currentBid: 5600,
      yourBid: 5600,
      endTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
      status: "highest",
    },
  ],
  wonItems: [
    {
      id: "5",
      title: "Digital Dreamscape",
      image: "/placeholder.jpg?height=200&width=200",
      finalBid: 2800,
      wonDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    },
    {
      id: "6",
      title: "Metaverse Parcel #789",
      image: "/placeholder.jpg?height=200&width=200",
      finalBid: 4500,
      wonDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
    },
  ],
}

export default function DashboardPage() {
  const [isConnected, setIsConnected] = useState(false)

  if (!isConnected) {
    return (
      <div className="container py-12">
        <div className="mx-auto max-w-md text-center">
          <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
          <Card>
            <CardHeader>
              <CardTitle>Connect Your Wallet</CardTitle>
              <CardDescription>You need to connect your wallet to view your dashboard.</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center py-6">
              <ConnectWalletButton />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <Link href="/create">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Auction
            </Button>
          </Link>
        </div>

        <Tabs defaultValue="created" className="w-full">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="created">My Auctions</TabsTrigger>
            <TabsTrigger value="bids">Active Bids</TabsTrigger>
            <TabsTrigger value="won">Won Items</TabsTrigger>
          </TabsList>

          <TabsContent value="created" className="mt-6">
            {mockData.createdAuctions.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <p className="mb-4 text-center text-muted-foreground">You haven't created any auctions yet.</p>
                  <Link href="/create">
                    <Button>Create Your First Auction</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {mockData.createdAuctions.map((auction) => (
                  <Card key={auction.id} className="overflow-hidden">
                    <div className="relative aspect-video overflow-hidden">
                      <Badge className="absolute right-2 top-2 z-10">
                        {auction.bids} {auction.bids === 1 ? "bid" : "bids"}
                      </Badge>
                      <Image
                        src={auction.image || "/placeholder.jpg"}
                        alt={auction.title}
                        width={300}
                        height={200}
                        className="h-full w-full object-cover"
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
                      <div className="mt-4 flex gap-2">
                        <Link href={`/auction/${auction.id}`} className="flex-1">
                          <Button variant="outline" className="w-full">
                            View
                          </Button>
                        </Link>
                        <Button variant="outline" className="w-1/3">
                          Edit
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="bids" className="mt-6">
            {mockData.activeBids.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <p className="mb-4 text-center text-muted-foreground">You don't have any active bids.</p>
                  <Link href="/">
                    <Button>Explore Auctions</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {mockData.activeBids.map((auction) => (
                  <Card key={auction.id} className="overflow-hidden">
                    <div className="relative aspect-video overflow-hidden">
                      <Badge
                        className={`absolute right-2 top-2 z-10 ${
                          auction.status === "highest" ? "bg-green-500" : "bg-orange-500"
                        }`}
                      >
                        {auction.status === "highest" ? "Highest Bid" : "Outbid"}
                      </Badge>
                      <Image
                        src={auction.image || "/placeholder.jpg"}
                        alt={auction.title}
                        width={300}
                        height={200}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold line-clamp-1">{auction.title}</h3>
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-xs text-muted-foreground">Current Bid</p>
                          <p className="font-semibold">{auction.currentBid} LSK</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Your Bid</p>
                          <p className="font-semibold">{auction.yourBid} LSK</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Ends in</p>
                          <AuctionCountdown endTime={auction.endTime} />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Status</p>
                          <p
                            className={`font-semibold ${
                              auction.status === "highest" ? "text-green-500" : "text-orange-500"
                            }`}
                          >
                            {auction.status === "highest" ? "Winning" : "Outbid"}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4">
                        <Link href={`/auction/${auction.id}`}>
                          <Button className="w-full">
                            {auction.status === "highest" ? "View Auction" : "Place New Bid"}
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="won" className="mt-6">
            {mockData.wonItems.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <p className="mb-4 text-center text-muted-foreground">You haven't won any auctions yet.</p>
                  <Link href="/">
                    <Button>Explore Auctions</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {mockData.wonItems.map((item) => (
                  <Card key={item.id} className="overflow-hidden">
                    <div className="relative aspect-video overflow-hidden">
                      <Badge className="absolute right-2 top-2 z-10 bg-green-500">Won</Badge>
                      <Image
                        src={item.image || "/placeholder.jpg"}
                        alt={item.title}
                        width={300}
                        height={200}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold line-clamp-1">{item.title}</h3>
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-xs text-muted-foreground">Final Bid</p>
                          <p className="font-semibold">{item.finalBid} LSK</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Won On</p>
                          <p className="font-semibold">{item.wonDate.toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Button variant="outline" className="flex-1">
                          View Item
                        </Button>
                        <Button variant="outline" className="flex-1">
                          Download
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
