"use client";
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { AuctionCountdown } from "@/components/auction-countdown"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react";

interface Auction {
  id: string;
  title: string;
  image: string;
  currentBid: number;
  endTime: Date;
  category: string;
}

export function FeaturedAuctions() {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const response = await fetch('/api/auction/active-auctions');
        const data = await response.json();
        setAuctions(data.slice(0, 4)); // Get only 4 featured auctions
      } catch (error) {
        console.error('Failed to fetch auctions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAuctions();
  }, []);

  if (isLoading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <div className="aspect-square bg-muted animate-pulse" />
            <CardContent className="p-4">
              <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
              <div className="mt-2 space-y-2">
                <div className="h-4 w-1/2 bg-muted animate-pulse rounded" />
                <div className="h-4 w-1/3 bg-muted animate-pulse rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

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
