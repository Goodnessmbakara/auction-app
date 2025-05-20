"use client"

import { useState, useEffect } from "react"
import axios from "axios";
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
import { AuctionCountdown } from "@/components/auction-countdown"

const raleway = Raleway({ subsets: ["latin"] })
const poppins = Poppins({ 
  weight: ['400', '500', '600'],
  subsets: ["latin"] 
})

interface Auction {
  id: string;
  title: string;
  image: string;
  currentBid: number;
  bids: number;
  endTime: string;
  status?: string;
  winningBid?: number;
  timestamp?: string;
  amount?: number;
  type?: string;
}

export default function DashboardPage() {
  const { isConnected, address } = useAccount()
  const { toast } = useToast()
  const [balance, setBalance] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(true)

  const [activeAuctions, setActiveAuctions] = useState<Auction[]>([]);
  const [bids, setBids] = useState<Auction[]>([]);
  const [wonAuctions, setWonAuctions] = useState<Auction[]>([]);
  const [transactions, setTransactions] = useState<Auction[]>([]);

  useEffect(() => {
    if (!isConnected || !address) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        // Replace with your actual API endpoints
        const [auctionsRes, bidsRes, winsRes, txsRes] = await Promise.all([
          axios.get(`/api/auction/user-auctions?address=${address}`),
          axios.get(`/api/auction/user-bids?address=${address}`),
          axios.get(`/api/auction/user-wins?address=${address}`),
          axios.get(`/api/auction/user-transactions?address=${address}`),
        ]);
        
        setActiveAuctions(auctionsRes.data);
        setBids(bidsRes.data);
        setWonAuctions(winsRes.data);
        setTransactions(txsRes.data);
        setBalance(5.8); // Mock balance - replace with actual fetch
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        toast({
          title: "Error",
          description: "Failed to fetch dashboard data.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [address, isConnected, toast]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid date";
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  if (!isConnected) {
    return (
      <div className="container py-8">
        <Card className="bg-[#1C043C]/50 backdrop-blur border-[#EC38BC]/20">
          <CardHeader>
            <CardTitle className="text-white">Connect Your Wallet</CardTitle>
            <CardDescription className="text-[#EC38BC]">
              Please connect your wallet to view your dashboard.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-[#EC38BC]" />
            <h1 className={`${raleway.className} text-3xl font-bold text-[#1C043C]`}>Dashboard</h1>
          </div>
        </div>
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="bg-[#1C043C]/50 backdrop-blur border-[#EC38BC]/20">
              <CardContent className="p-6">
                <div className="animate-pulse flex space-x-4">
                  <div className="rounded-full bg-[#EC38BC]/20 h-12 w-12"></div>
                  <div className="flex-1 space-y-4 py-1">
                    <div className="h-4 bg-[#EC38BC]/20 rounded w-3/4"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-[#EC38BC]/20 rounded"></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
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
            <div className={`${raleway.className} text-2xl font-bold text-white`}>{activeAuctions.length}</div>
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
            <div className={`${raleway.className} text-2xl font-bold text-white`}>{bids.length}</div>
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
            <div className={`${raleway.className} text-2xl font-bold text-white`}>{wonAuctions.length}</div>
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
          {activeAuctions.length > 0 ? (
            activeAuctions.map((auction) => (
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
                      <AuctionCountdown endTime={auction.endTime} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="bg-[#1C043C]/50 backdrop-blur border-[#EC38BC]/20">
              <CardContent className="p-6 text-center text-[#EC38BC]">
                No active auctions found
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="bids" className="space-y-4">
          {bids.length > 0 ? (
            bids.map((bid) => (
              <Card key={bid.id} className="bg-[#1C043C]/50 backdrop-blur border-[#EC38BC]/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className={`${raleway.className} text-lg font-semibold text-white`}>{bid.title}</h3>
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
                          {formatDate(bid.timestamp || '')}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`${poppins.className} text-sm text-[#EC38BC]`}>
                        Bid Amount
                      </div>
                      <div className={`${raleway.className} text-lg font-semibold text-white`}>
                        {bid.currentBid} AVAX
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="bg-[#1C043C]/50 backdrop-blur border-[#EC38BC]/20">
              <CardContent className="p-6 text-center text-[#EC38BC]">
                No bids found
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="won" className="space-y-4">
          {wonAuctions.length > 0 ? (
            wonAuctions.map((auction) => (
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
                        {auction.winningBid || auction.currentBid} AVAX
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="bg-[#1C043C]/50 backdrop-blur border-[#EC38BC]/20">
              <CardContent className="p-6 text-center text-[#EC38BC]">
                No won auctions found
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {transactions.length > 0 ? (
            transactions.map((tx) => (
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
                          {formatDate(tx.timestamp || '')}
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
                        {tx.status || 'completed'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="bg-[#1C043C]/50 backdrop-blur border-[#EC38BC]/20">
              <CardContent className="p-6 text-center text-[#EC38BC]">
                No transactions found
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}