"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ConnectWalletButton } from "@/components/connect-wallet-button"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export default function Navbar() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2 md:gap-6">
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500"></div>
            <span className="hidden font-bold sm:inline-block">LiskAuctions</span>
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link
              href="/"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === "/" ? "text-primary" : "text-muted-foreground",
              )}
            >
              Home
            </Link>
            <Link
              href="/explore"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === "/explore" ? "text-primary" : "text-muted-foreground",
              )}
            >
              Explore
            </Link>
            <Link
              href="/dashboard"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === "/dashboard" ? "text-primary" : "text-muted-foreground",
              )}
            >
              Dashboard
            </Link>
          </nav>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search auctions..."
              className="w-[200px] pl-8 md:w-[250px] lg:w-[300px]"
            />
          </div>
          <Link href="/create">
            <Button variant="outline" size="sm">
              Create Auction
            </Button>
          </Link>
          <ConnectWalletButton />
        </div>

        <div className="flex md:hidden">
          <Button variant="ghost" size="icon" className="mr-2">
            <Search className="h-5 w-5" />
          </Button>
          <ConnectWalletButton />
        </div>
      </div>
    </header>
  )
}
