import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FeaturedAuctions } from "@/components/featured-auctions"

export default function HomePage() {
  return (
    <div className="flex flex-col gap-12 pb-8">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-br from-background via-background to-purple-950/20">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <Badge variant="outline" className="w-fit border-purple-500 text-purple-500">
                  Powered by Lisk Blockchain
                </Badge>
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                  Decentralized Auctions for Digital Assets
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  Bid, sell, and collect unique digital items on the most trusted decentralized marketplace.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="/explore">
                  <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600">
                    Explore Auctions
                  </Button>
                </Link>
                <Link href="/create">
                  <Button size="lg" variant="outline">
                    Create Auction
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="relative h-[350px] w-[350px] md:h-[450px] md:w-[450px]">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 opacity-20 blur-3xl"></div>
                <div className="relative h-full w-full rounded-xl border border-border/50 bg-background/50 p-4 backdrop-blur">
                  <div className="grid h-full w-full grid-cols-2 grid-rows-2 gap-4">
                    <div className="overflow-hidden rounded-lg bg-muted">
                      <Image
                        src="/placeholder.svg?height=200&width=200"
                        alt="NFT"
                        width={200}
                        height={200}
                        className="h-full w-full object-cover transition-transform hover:scale-110"
                      />
                    </div>
                    <div className="overflow-hidden rounded-lg bg-muted">
                      <Image
                        src="/placeholder.svg?height=200&width=200"
                        alt="NFT"
                        width={200}
                        height={200}
                        className="h-full w-full object-cover transition-transform hover:scale-110"
                      />
                    </div>
                    <div className="overflow-hidden rounded-lg bg-muted">
                      <Image
                        src="/placeholder.svg?height=200&width=200"
                        alt="NFT"
                        width={200}
                        height={200}
                        className="h-full w-full object-cover transition-transform hover:scale-110"
                      />
                    </div>
                    <div className="overflow-hidden rounded-lg bg-muted">
                      <Image
                        src="/placeholder.svg?height=200&width=200"
                        alt="NFT"
                        width={200}
                        height={200}
                        className="h-full w-full object-cover transition-transform hover:scale-110"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Auctions */}
      <section className="container px-4 md:px-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Featured Auctions</h2>
            <Link href="/explore">
              <Button variant="link">View All</Button>
            </Link>
          </div>
          <FeaturedAuctions />
        </div>
      </section>

      {/* How It Works */}
      <section className="container px-4 md:px-6">
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">How It Works</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="bg-background/50 backdrop-blur">
              <CardContent className="pt-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
                  <span className="text-xl font-bold text-purple-600 dark:text-purple-300">1</span>
                </div>
                <h3 className="text-lg font-bold">Connect Your Wallet</h3>
                <p className="text-muted-foreground">
                  Link your Lisk wallet to start bidding on auctions or create your own.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-background/50 backdrop-blur">
              <CardContent className="pt-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
                  <span className="text-xl font-bold text-purple-600 dark:text-purple-300">2</span>
                </div>
                <h3 className="text-lg font-bold">Create or Bid</h3>
                <p className="text-muted-foreground">
                  List your digital assets for auction or place bids on items you want.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-background/50 backdrop-blur">
              <CardContent className="pt-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
                  <span className="text-xl font-bold text-purple-600 dark:text-purple-300">3</span>
                </div>
                <h3 className="text-lg font-bold">Secure Transactions</h3>
                <p className="text-muted-foreground">
                  All transactions are secured by the Lisk blockchain with full transparency.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
