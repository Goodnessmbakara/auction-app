// app/auction/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useAccount } from "wagmi";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BidForm } from "@/components/bid-form";
import { BidHistory } from "@/components/bid-history";
import { ArrowLeft, Clock, User, Tag, Loader2, AlertCircle, Wifi, WifiOff } from "lucide-react";
import Link from "next/link";
import { Raleway, Poppins } from "next/font/google";
import { formatDistanceToNow } from "date-fns";
import { LoadingState } from "@/components/ui/loading-state";
import { useSocket } from '@/hooks/use-socket';
import { ethers } from "ethers";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Auction from '@/smart-contracts/artifacts/contracts/Auction.sol/Auction.json';

const raleway = Raleway({ subsets: ["latin"] });
const poppins = Poppins({ 
  weight: ['400', '500', '600'],
  subsets: ["latin"] 
});

interface Auction {
  id: string;
  title: string;
  description: string;
  category: string;
  startingBid: number;
  currentBid: number;
  sellerAddress: string;
  createdAt: string;
  endTime: string;
  imageUrl: string;
  status: string;
  highestBidder?: string;
  owner?: string;
  bids: Array<{
    bidder: string;
    amount: number;
    time: string;
  }>;
}

export default function AuctionDetailPage() {
  const { id } = useParams();
  const { address, isConnected } = useAccount();
  const { toast } = useToast();
  const [auction, setAuction] = useState<Auction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBidding, setIsBidding] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [isClaimingItem, setIsClaimingItem] = useState(false);
  const { socket, state: socketState, reconnect } = useSocket(id as string);

  useEffect(() => {
    const fetchAuction = async () => {
      try {
        const response = await fetch(`/api/auction/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch auction');
        }
        const data = await response.json();
        setAuction(data);
      } catch (error) {
        console.error('Error fetching auction:', error);
        toast({
          title: "Error",
          description: "Failed to load auction details",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAuction();
  }, [id, toast]);

  useEffect(() => {
    if (!socket) return;

    // Listen for new bids
    socket.on('new-bid', (bid: {
      bidder: string;
      amount: number;
      time: string;
    }) => {
      setAuction(prev => {
        if (!prev) return null;
        return {
          ...prev,
          currentBid: bid.amount,
          highestBidder: bid.bidder,
          bids: [bid, ...prev.bids],
        };
      });

      // Show toast notification
      toast({
        title: "New Bid Placed",
        description: `${ethers.formatEther(bid.amount)} AVAX by ${bid.bidder.slice(0, 6)}...${bid.bidder.slice(-4)}`,
      });
    });

    // Listen for auction status updates
    socket.on('auction-update', (update: {
      status: string;
      owner?: string;
    }) => {
      setAuction(prev => {
        if (!prev) return null;
        return {
          ...prev,
          status: update.status,
          owner: update.owner,
        };
      });
    });

    return () => {
      socket.off('new-bid');
      socket.off('auction-update');
    };
  }, [socket, toast]);

  const handlePlaceBid = async (bidAmount: number) => {
    if (!isConnected || !address) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to place a bid",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsBidding(true);

      // Create provider and signer
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Create contract instance
      const auctionContract = new ethers.Contract(
        id as string,
        Auction.abi,
        signer
      );

      // Place bid
      const tx = await auctionContract.bid({
        value: ethers.parseEther(bidAmount.toString())
      });

      // Wait for transaction to be mined
      const receipt = await tx.wait();

      // Get the NewHighestBid event
      const event = receipt.logs.find(
        (log: any) => log.fragment?.name === 'NewHighestBid'
      );

      if (!event) {
        throw new Error('NewHighestBid event not found');
      }

      // Update UI
      setAuction(prev => {
        if (!prev) return null;
        return {
          ...prev,
          currentBid: bidAmount,
          highestBidder: address,
          bids: [{
            bidder: address,
            amount: bidAmount,
            time: new Date().toISOString()
          }, ...prev.bids]
        };
      });

      toast({
        title: "Success",
        description: "Your bid has been placed successfully",
      });
    } catch (error) {
      console.error('Error placing bid:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to place bid",
        variant: "destructive",
      });
    } finally {
      setIsBidding(false);
    }
  };

  const handleClaimFunds = async () => {
    if (!isConnected || !address) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to claim funds",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsClaiming(true);
      const response = await fetch(`/api/auction/${id}/claim-funds`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sellerAddress: address,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to claim funds');
      }

      toast({
        title: "Success",
        description: `Successfully claimed ${data.amount} AVAX`,
      });

      // Update auction status
      setAuction(prev => {
        if (!prev) return null;
        return {
          ...prev,
          status: 'claimed',
        };
      });
    } catch (error) {
      console.error('Error claiming funds:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to claim funds",
        variant: "destructive",
      });
    } finally {
      setIsClaiming(false);
    }
  };

  const handleClaimItem = async () => {
    if (!isConnected || !address) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to claim the item",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsClaimingItem(true);
      const response = await fetch(`/api/auction/${id}/claim-item`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          winnerAddress: address,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to claim item');
      }

      toast({
        title: "Success",
        description: "Successfully claimed the item! Ownership has been transferred to your wallet.",
      });

      // Update auction status and ownership
      setAuction(prev => {
        if (!prev) return null;
        return {
          ...prev,
          status: 'item-claimed',
          owner: data.newOwner,
        };
      });
    } catch (error) {
      console.error('Error claiming item:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to claim item",
        variant: "destructive",
      });
    } finally {
      setIsClaimingItem(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <LoadingState
          title="Loading Auction Details"
          description="Fetching auction information from blockchain and IPFS..."
          steps={{
            current: 1,
            total: 2,
            steps: [
              "Fetching metadata from IPFS",
              "Loading blockchain data"
            ]
          }}
        />
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="container py-8">
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground">Auction not found</p>
          <Link href="/explore" className="mt-4 text-primary hover:underline">
            Back to auctions
          </Link>
        </div>
      </div>
    );
  }

  const timeLeft = formatDistanceToNow(new Date(auction.endTime), { addSuffix: true });
  const isEnded = new Date(auction.endTime) < new Date();

  return (
    <div className="container py-4 md:py-8 px-4 md:px-6">
      {/* Connection Status Alert */}
      {!socketState.isConnected && (
        <Alert variant="destructive" className="mb-4 md:mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Connection Lost</AlertTitle>
          <AlertDescription className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <span>
              {socketState.isConnecting
                ? `Attempting to reconnect (${socketState.reconnectAttempt + 1}/5)...`
                : socketState.lastError || 'Lost connection to server'}
            </span>
            {!socketState.isConnecting && (
              <Button
                variant="outline"
                size="sm"
                onClick={reconnect}
                className="w-full md:w-auto"
              >
                <WifiOff className="h-4 w-4 mr-2" />
                Reconnect
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )}

      <Link
        href="/explore"
        className="inline-flex items-center gap-1 text-sm text-[#EC38BC] hover:text-[#FF3CAC] mb-4 md:mb-6 group"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        Back to auctions
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
        {/* Left Column - Image and Details */}
        <div className="space-y-4 md:space-y-6">
          <div className="aspect-square rounded-lg overflow-hidden bg-[#1C043C]/50 border border-[#EC38BC]/20">
            <img
              src={auction.imageUrl}
              alt={auction.title}
              className="w-full h-full object-contain"
              loading="lazy"
            />
          </div>

          <Card className="bg-[#1C043C]/50 backdrop-blur border-[#EC38BC]/20">
            <CardHeader className="p-4 md:p-6">
              <CardTitle className={`${raleway.className} text-white text-lg md:text-xl`}>
                Auction Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-4 md:p-6">
              <div className="flex items-center gap-2 text-[#EC38BC]">
                <Clock className="h-4 w-4" />
                <span className={`${poppins.className} text-sm`}>
                  {isEnded ? 'Auction ended' : `Ends ${timeLeft}`}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[#EC38BC]">
                <User className="h-4 w-4" />
                <span className={`${poppins.className} text-sm`}>
                  {auction.owner ? (
                    <>
                      Owner: {auction.owner.slice(0, 6)}...{auction.owner.slice(-4)}
                    </>
                  ) : (
                    <>
                      Seller: {auction.sellerAddress.slice(0, 6)}...{auction.sellerAddress.slice(-4)}
                    </>
                  )}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[#EC38BC]">
                <Tag className="h-4 w-4" />
                <span className={`${poppins.className} text-sm`}>
                  Category: {auction.category}
                </span>
              </div>
              
              {isEnded && (
                <div className="pt-4 border-t border-[#EC38BC]/20 space-y-4">
                  {address?.toLowerCase() === auction.sellerAddress.toLowerCase() && (
                    <Button
                      onClick={handleClaimFunds}
                      disabled={isClaiming || auction.status === 'claimed'}
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600"
                    >
                      {isClaiming ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Claiming Funds...
                        </>
                      ) : auction.status === 'claimed' ? (
                        'Funds Claimed'
                      ) : (
                        'Claim Funds'
                      )}
                    </Button>
                  )}

                  {address?.toLowerCase() === auction.highestBidder?.toLowerCase() && !auction.owner && (
                    <Button
                      onClick={handleClaimItem}
                      disabled={isClaimingItem || auction.status === 'item-claimed'}
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600"
                    >
                      {isClaimingItem ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Claiming Item...
                        </>
                      ) : auction.status === 'item-claimed' ? (
                        'Item Claimed'
                      ) : (
                        'Claim Item'
                      )}
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Bidding and History */}
        <div className="space-y-4 md:space-y-6">
          <div>
            <h1 className={`${raleway.className} text-2xl md:text-3xl font-bold text-white mb-2`}>
              {auction.title}
            </h1>
            <p className={`${poppins.className} text-[#EC38BC] mb-4 md:mb-6 text-sm md:text-base`}>
              {auction.description}
            </p>
          </div>

          <Card className="bg-[#1C043C]/50 backdrop-blur border-[#EC38BC]/20">
            <CardHeader className="p-4 md:p-6">
              <CardTitle className={`${raleway.className} text-white text-lg md:text-xl`}>
                Current Bid
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <div className="text-2xl md:text-3xl font-bold text-[#EC38BC] mb-4">
                {auction.currentBid} AVAX
              </div>
              {!isEnded && (
                <BidForm
                  currentBid={auction.currentBid}
                  minIncrement={0.1}
                  onPlaceBid={handlePlaceBid}
                  isLoading={isBidding}
                />
              )}
            </CardContent>
          </Card>

          <Card className="bg-[#1C043C]/50 backdrop-blur border-[#EC38BC]/20">
            <CardHeader className="p-4 md:p-6">
              <CardTitle className={`${raleway.className} text-white text-lg md:text-xl`}>
                Bid History
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <BidHistory bids={auction.bids} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Loading States */}
      {(isBidding || isClaiming || isClaimingItem) && (
        <LoadingState
          title={
            isBidding ? "Placing Your Bid" :
            isClaiming ? "Claiming Funds" :
            "Claiming Item"
          }
          description="Please confirm the transaction in your wallet"
          variant="overlay"
          steps={{
            current: 1,
            total: 2,
            steps: [
              "Preparing transaction",
              "Confirming on blockchain"
            ]
          }}
        />
      )}
    </div>
  );
}