import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FeaturedAuctions } from "@/components/featured-auctions"
import { Raleway, Poppins } from "next/font/google"
import { ArrowRight, Shield, Zap, Lock } from "lucide-react"

const raleway = Raleway({ subsets: ["latin"] })
const poppins = Poppins({ 
  weight: ['400', '500', '600'],
  subsets: ["latin"] 
})

export default function HomePage() {
  return (
    <div className="flex flex-col gap-12 pb-8">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-br from-[#090214] via-[#1C043C] to-[#450063]">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg shadow-[#EC38BC]/20">
                    <img 
                      src="/AvaBidLogo.png" 
                      alt="AvaBid Logo" 
                      className="h-8 w-8 object-contain" 
                    />
                  </div>
                  <Badge variant="outline" className="w-fit border-[#EC38BC] text-[#EC38BC]">
                    Powered by Avalanche
                  </Badge>
                </div>
                <h1 className={`${raleway.className} text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-white`}>
                  Revolutionizing Digital Auctions
                </h1>
                <p className={`${poppins.className} max-w-[600px] text-[#EC38BC] md:text-xl`}>
                  Experience lightning-fast, secure, and transparent auctions for NFTs and digital assets on Avalanche.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="/explore">
                  <Button size="lg" className="bg-gradient-to-r from-[#8B5CF6] to-[#EC38BC] hover:from-[#9414d1] hover:to-[#FF3CAC] group">
                    Explore Auctions
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link href="/create">
                  <Button size="lg" variant="outline" className="border-[#EC38BC] text-[#EC38BC] hover:bg-[#EC38BC] hover:text-white transition-all duration-300">
                    Create Auction
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="relative h-[350px] w-[350px] md:h-[450px] md:w-[450px]">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#EC38BC] opacity-20 blur-3xl"></div>
                <div className="relative h-full w-full rounded-xl border border-[#EC38BC]/50 bg-[#1C043C]/50 p-4 backdrop-blur">
                  <div className="grid h-full w-full grid-cols-2 grid-rows-2 gap-4">
                    <div className="overflow-hidden rounded-lg bg-[#090214]">
                      <Image
                        src="/placeholder.jpg?height=200&width=200"
                        alt="NFT"
                        width={200}
                        height={200}
                        className="h-full w-full object-cover transition-transform hover:scale-110"
                      />
                    </div>
                    <div className="overflow-hidden rounded-lg bg-[#090214]">
                      <Image
                        src="/placeholder.jpg?height=200&width=200"
                        alt="NFT"
                        width={200}
                        height={200}
                        className="h-full w-full object-cover transition-transform hover:scale-110"
                      />
                    </div>
                    <div className="overflow-hidden rounded-lg bg-[#090214]">
                      <Image
                        src="/placeholder.jpg?height=200&width=200"
                        alt="NFT"
                        width={200}
                        height={200}
                        className="h-full w-full object-cover transition-transform hover:scale-110"
                      />
                    </div>
                    <div className="overflow-hidden rounded-lg bg-[#090214]">
                      <Image
                        src="/placeholder.jpg?height=200&width=200"
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
            <h2 className={`${raleway.className} text-2xl font-bold tracking-tight md:text-3xl text-[#1C043C]`}>Featured Auctions</h2>
            <Link href="/explore">
              <Button variant="link" className="text-[#EC38BC] hover:text-[#FF3CAC] group">
                View All
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
          <FeaturedAuctions />
        </div>
      </section>

      {/* How It Works */}
      <section className="container px-4 md:px-6">
        <div className="flex flex-col gap-4">
          <h2 className={`${raleway.className} text-2xl font-bold tracking-tight md:text-3xl text-[#1C043C]`}>How It Works</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="bg-[#1C043C]/50 backdrop-blur border-[#EC38BC]/20 hover:border-[#EC38BC] transition-all duration-300">
              <CardContent className="pt-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#8B5CF6]/20">
                  <Shield className="h-6 w-6 text-[#EC38BC]" />
                </div>
                <h3 className={`${raleway.className} text-lg font-bold text-white`}>Connect Your Wallet</h3>
                <p className={`${poppins.className} text-[#EC38BC]`}>
                  Connect your EVM wallet for secure transactions on the Avalanche network.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-[#1C043C]/50 backdrop-blur border-[#EC38BC]/20 hover:border-[#EC38BC] transition-all duration-300">
              <CardContent className="pt-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#8B5CF6]/20">
                  <Zap className="h-6 w-6 text-[#EC38BC]" />
                </div>
                <h3 className={`${raleway.className} text-lg font-bold text-white`}>Create or Bid</h3>
                <p className={`${poppins.className} text-[#EC38BC]`}>
                  List your digital assets for auction or place bids on items you want.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-[#1C043C]/50 backdrop-blur border-[#EC38BC]/20 hover:border-[#EC38BC] transition-all duration-300">
              <CardContent className="pt-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#8B5CF6]/20">
                  <Lock className="h-6 w-6 text-[#EC38BC]" />
                </div>
                <h3 className={`${raleway.className} text-lg font-bold text-white`}>Secure Transactions</h3>
                <p className={`${poppins.className} text-[#EC38BC]`}>
                  All transactions are secured by the Avalanche blockchain with full transparency.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
