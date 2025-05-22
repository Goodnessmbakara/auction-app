"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ConnectWalletButton } from "@/components/connect-wallet-button";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Raleway, Poppins } from "next/font/google";

const raleway = Raleway({ subsets: ["latin"] });
const poppins = Poppins({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
});

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#EC38BC]/20 bg-[#090214]/95 backdrop-blur supports-[backdrop-filter]:bg-[#090214]/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2 md:gap-6">
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg shadow-[#EC38BC]/20">
              <img
                src="/AvaBidLogo.png"
                alt="AvaBid Logo"
                className="h-7 w-7 object-contain"
              />
            </div>
            <span
              className={`${raleway.className} hidden font-bold sm:inline-block bg-white bg-clip-text text-transparent`}
            >
              AvaBid
            </span>
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link
              href="/"
              className={cn(
                `${poppins.className} text-sm font-medium transition-colors hover:text-[#EC38BC]`,
                pathname === "/" ? "text-[#EC38BC]" : "text-white/70"
              )}
            >
              Home
            </Link>
            <Link
              href="/explore"
              className={cn(
                `${poppins.className} text-sm font-medium transition-colors hover:text-[#EC38BC]`,
                pathname === "/explore" ? "text-[#EC38BC]" : "text-white/70"
              )}
            >
              Explore
            </Link>
            <Link
              href="/dashboard"
              className={cn(
                `${poppins.className} text-sm font-medium transition-colors hover:text-[#EC38BC]`,
                pathname === "/dashboard" ? "text-[#EC38BC]" : "text-white/70"
              )}
            >
              Dashboard
            </Link>
          </nav>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[#EC38BC]" />
            <Input
              type="search"
              placeholder="Search auctions..."
              className="w-[200px] pl-8 md:w-[250px] lg:w-[300px] bg-[#1C043C]/50 border-[#EC38BC]/20 text-white placeholder:text-white/50 focus:border-[#EC38BC] focus:ring-[#EC38BC]"
            />
          </div>
          <Link href="/create">
            <Button
              variant="outline"
              size="sm"
              className="border-[#EC38BC] text-[#EC38BC] hover:bg-[#EC38BC] hover:text-white transition-all duration-300"
            >
              Create Auction
            </Button>
          </Link>
          <ConnectWalletButton />
        </div>

        <div className="flex md:hidden">
          <Button
            variant="ghost"
            size="icon"
            className="mr-2 text-[#EC38BC] hover:text-[#FF3CAC]"
          >
            <Search className="h-5 w-5" />
          </Button>
          <ConnectWalletButton />
        </div>
      </div>
    </header>
  );
}
