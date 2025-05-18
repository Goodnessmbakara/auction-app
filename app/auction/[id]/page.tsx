// app/auction/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { AuctionCountdown } from "@/components/auction-countdown";
import { BidForm } from "@/components/bid-form";
import { BidHistory } from "@/components/bid-history";
import { ArrowLeft, Share2, Flag, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import websocketService, { type BidUpdate } from "@/lib/websocket-service";
import { useAccount } from "wagmi";
import axios from "axios";
import type { Metadata } from 'next'

// Define the Auction type
interface Auction {
  id: string;
  title: string;
  description: string;
  image: string; // IPFS CID or gateway URL
  category: string;
  seller: {
    address: string;
    name: string;
    verified: boolean;
  };
  currentBid: number;
  minBidIncrement: number;
  startingBid: number;
  endTime: string; // ISO date string
  created: string; // ISO date string
  bids: Array<{
    bidder: string;
    amount: number;
    time: string; // ISO date string
  }>;
}

// Define the expected props for BidForm
interface BidFormProps {
  currentBid: number;
  minIncrement: number;
  onPlaceBid: (bidAmount: number) => Promise<void>;
  isBidding: boolean;
}

type PageParams = {
  id: string;
};



export default function AuctionDetailsPage({ params }: { params: PageParams }) {
  const { toast } = useToast();
  const [auction, setAuction] = useState<Auction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBidding, setIsBidding] = useState(false);
  const [newBidNotification, setNewBidNotification] = useState<BidUpdate | null>(null);

  const { address, isConnected } = useAccount();

  // Fetch auction data from IPFS or backend
  useEffect(() => {
    const fetchAuction = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`/api/auction/${params.id}`);
        const auctionData: Auction = response.data;

        // If image is an IPFS CID, convert to gateway URL
        const ipfsGateway = "https://gateway.pinata.cloud/ipfs/";
        auctionData.image = auctionData.image.startsWith("Qm")
          ? `${ipfsGateway}${auctionData.image}`
          : auctionData.image;

        setAuction(auctionData);
      } catch (error) {
        console.error("Failed to fetch auction:", error);
        toast({
          title: "Error",
          description: "Failed to fetch auction details. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAuction();
  }, [params.id, toast]);

  // Set up WebSocket connection for real-time updates
  // In the WebSocket useEffect:
useEffect(() => {
  let isMounted = true;
  let reconnectInterval: NodeJS.Timeout;

  const connectWebSocket = async () => {
    try {
      if (!websocketService.isConnected()) {
        await websocketService.connect();
      }
      
      websocketService.subscribeToAuction(params.id);

      // Add ping-pong for connection health
      const keepAlive = setInterval(() => {
        websocketService.ping();
      }, 30000);

      websocketService.on("bid", (data: BidUpdate) => {
        // ... existing handler
      });

      return () => {
        clearInterval(keepAlive);
      };
    } catch (error) {
      console.error("Connection error:", error);
      reconnectInterval = setTimeout(connectWebSocket, 5000);
    }
  };

  connectWebSocket();

  return () => {
    isMounted = false;
    clearTimeout(reconnectInterval);
    websocketService.unsubscribeFromAuction(params.id);
    if (websocketService.isConnected()) {
      websocketService.disconnect();
    }
  };
}, [params.id, address, toast]);

  // Handle bid submission
  const handlePlaceBid = async (bidAmount: number) => {
    if (!isConnected || !address) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to place a bid.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsBidding(true);

      await axios.post(`/api/auction/${params.id}/bid`, {
        bidder: address,
        bidAmount,
      });

      setAuction((prev) =>
        prev
          ? {
              ...prev,
              currentBid: bidAmount,
              bids: [
                {
                  bidder: address,
                  amount: bidAmount,
                  time: new Date().toISOString(),
                },
                ...prev.bids,
              ],
            }
          : prev
      );

      toast({
        title: "Bid Placed",
        description: `Your bid of ${bidAmount} AVX has been placed successfully.`,
      });
    } catch (error) {
      console.error("Failed to place bid:", error);
      toast({
        title: "Bid Failed",
        description: "Failed to place your bid. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsBidding(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-4 text-muted-foreground">Loading auction details...</p>
        </div>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="container py-8">
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground">Auction not found.</p>
          <Link href="/explore" className="mt-4 text-primary hover:underline">
            Back to auctions
          </Link>
        </div>
      </div>
    );
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
                  <p className="text-sm text-muted-foreground">
                    {newBidNotification.bidder.substring(0, 6)}...
                    {newBidNotification.bidder.substring(newBidNotification.bidder.length - 4)} placed a bid of{" "}
                    <span className="font-semibold">{newBidNotification.bidAmount} AVX</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <div className="relative overflow-hidden rounded-lg border border-border/50 bg-background">
            <div className="absolute right-2 top-2 z-10 flex gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full bg-background/80 backdrop-blur"
              >
                <Heart className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full bg-background/80 backdrop-blur"
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
            <Image
              src={auction.image}
              alt={auction.title}
              width={600}
              height={600}
              className="object-cover w-full h-full"
              placeholder="blur"
              blurDataURL="/placeholder.jpg"
            />
          </div>
        </div>

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
                  <p className="font-semibold">{auction.currentBid} AVX</p>
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
                <AuctionCountdown endTime={new Date(auction.endTime)} />
                <BidForm
                  currentBid={auction.currentBid}
                  minIncrement={auction.minBidIncrement}
                  onPlaceBid={handlePlaceBid}
                  isBidding={isBidding}
                />
              </TabsContent>
              <TabsContent value="bids">
                <BidHistory
                  bids={auction.bids.map((bid) => ({
                    ...bid,
                    time: new Date(bid.time),
                  }))}
                />
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
  );
}