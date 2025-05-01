"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Wallet, ArrowRight, LogOut } from "lucide-react"
import { useWallet } from "@/contexts/wallet-context"
import { useToast } from "@/hooks/use-toast"

export function ConnectWalletButton() {
  const { isConnected, address, connect, disconnect } = useWallet()
  const [open, setOpen] = useState(false)
  const [liskAddress, setLiskAddress] = useState("")
  const [passphrase, setPassphrase] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleConnect = async () => {
    try {
      setIsLoading(true)

      // For demo purposes, we're using a simple passphrase
      // In a real app, you would use a secure method
      await connect(passphrase || "test passphrase")

      toast({
        title: "Wallet Connected",
        description: "Your wallet has been connected successfully.",
      })

      setOpen(false)
    } catch (error) {
      console.error(error)
      toast({
        title: "Connection Failed",
        description: "Failed to connect wallet. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDisconnect = () => {
    disconnect()
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected.",
    })
  }

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="gap-2">
          <span className="h-2 w-2 rounded-full bg-green-500"></span>
          <span className="hidden md:inline-block">
            {address.substring(0, 6)}...{address.substring(address.length - 4)}
          </span>
          <span className="md:hidden">{address.substring(0, 4)}...</span>
        </Button>
        <Button variant="ghost" size="icon" onClick={handleDisconnect} className="h-8 w-8">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Wallet className="h-4 w-4" />
          <span className="hidden sm:inline-block">Connect Wallet</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Connect your wallet</DialogTitle>
          <DialogDescription>Connect your Lisk wallet to start bidding and creating auctions.</DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="passphrase" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="passphrase">Passphrase</TabsTrigger>
            <TabsTrigger value="address">Lisk Address</TabsTrigger>
          </TabsList>
          <TabsContent value="passphrase" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="passphrase">Passphrase</Label>
              <Input
                id="passphrase"
                type="password"
                placeholder="Enter your 12-word passphrase"
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Your passphrase is never stored and only used to sign transactions.
              </p>
            </div>
            <Button onClick={handleConnect} className="w-full" disabled={isLoading}>
              {isLoading ? "Connecting..." : "Connect"}
              {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </TabsContent>
          <TabsContent value="address" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="lisk-address">Lisk Address</Label>
              <Input
                id="lisk-address"
                placeholder="Enter your Lisk address"
                value={liskAddress}
                onChange={(e) => setLiskAddress(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Read-only mode. You won't be able to place bids or create auctions.
              </p>
            </div>
            <Button onClick={handleConnect} className="w-full" disabled={isLoading}>
              {isLoading ? "Connecting..." : "Connect"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
