"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { ArrowLeft, ImageIcon, Upload, Sparkles } from "lucide-react"
import { useAccount } from "wagmi"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { Raleway, Poppins } from "next/font/google"

const raleway = Raleway({ subsets: ["latin"] })
const poppins = Poppins({ 
  weight: ['400', '500', '600'],
  subsets: ["latin"] 
})

export default function CreateAuctionPage() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    startingBid: 100,
    duration: 7,
    image: null as File | null,
  })
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const { isConnected, address } = useAccount()
  const { toast } = useToast()

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("[CreateAuction] Image change event triggered")
    const file = e.target.files?.[0] || null
    console.log("[CreateAuction] Selected file:", file?.name, "Size:", file?.size)
    setFormData({ ...formData, image: file })

    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        console.log("[CreateAuction] Image preview generated")
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setImagePreview(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("[CreateAuction] Form submission started")
    console.log("[CreateAuction] Form data:", {
      ...formData,
      image: formData.image ? {
        name: formData.image.name,
        size: formData.image.size,
        type: formData.image.type
      } : null
    })

    if (!isConnected || !address) {
      console.log("[CreateAuction] Wallet not connected")
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to create an auction.",
        variant: "destructive",
      })
      return
    }

    if (!formData.image) {
      console.log("[CreateAuction] No image selected")
      toast({
        title: "Image Required",
        description: "Please upload an image for your auction.",
        variant: "destructive",
      })
      return
    }

    const payload = new FormData()
    payload.append("title", formData.title)
    payload.append("description", formData.description)
    payload.append("category", formData.category)
    payload.append("startingBid", String(formData.startingBid))
    payload.append("duration", String(formData.duration))
    payload.append("image", formData.image)
    payload.append("sellerAddress", address)

    console.log("[CreateAuction] Sending request to /api/auction/create-auction")
    try {
      const res = await fetch("/api/auction/create-auction", {
        method: "POST",
        body: payload,
      })

      const data = await res.json()
      console.log("[CreateAuction] Server response:", data)

      if (!res.ok) {
        throw new Error(data.message || "Something went wrong")
      }

      console.log("[CreateAuction] Auction created successfully")
      toast({
        title: "Success",
        description: "Your auction has been created successfully!",
      })
    } catch (err) {
      console.error("[CreateAuction] Error creating auction:", err)
      toast({
        title: "Error",
        description: "Failed to create auction. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container py-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-[#EC38BC] hover:text-[#FF3CAC] mb-6 group"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        Back to auctions
      </Link>

      <div className="mx-auto max-w-2xl">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="h-6 w-6 text-[#EC38BC]" />
          <h1 className={`${raleway.className} text-3xl font-bold text-[#1C043C]`}>Create New Auction</h1>
        </div>

        {!isConnected ? (
          <Card className="bg-[#1C043C]/50 backdrop-blur border-[#EC38BC]/20">
            <CardHeader>
              <CardTitle className={`${raleway.className} text-white`}>Connect Your Wallet</CardTitle>
              <CardDescription className={`${poppins.className} text-[#EC38BC]`}>
                You need to connect your wallet to create an auction.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center py-6">
              {/* The user should connect via the Navbar or a dedicated ConnectButton component */}
            </CardContent>
          </Card>
        ) : (
          <form onSubmit={handleSubmit} encType="multipart/form-data">
            <Card className="bg-[#1C043C]/50 backdrop-blur border-[#EC38BC]/20">
              <CardHeader>
                <CardTitle className={`${raleway.className} text-white`}>Auction Details</CardTitle>
                <CardDescription className={`${poppins.className} text-[#EC38BC]`}>
                  Fill in the details for your new auction item.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className={`${poppins.className} text-white`}>Item Title</Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="Enter a title for your item"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="bg-[#090214]/50 border-[#EC38BC]/20 text-white placeholder:text-white/50 focus:border-[#EC38BC] focus:ring-[#EC38BC]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className={`${poppins.className} text-white`}>Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Describe your item in detail"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    className="min-h-[120px] bg-[#090214]/50 border-[#EC38BC]/20 text-white placeholder:text-white/50 focus:border-[#EC38BC] focus:ring-[#EC38BC]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category" className={`${poppins.className} text-white`}>Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                    required
                  >
                    <SelectTrigger id="category" name="category" className="bg-[#090214]/50 border-[#EC38BC]/20 text-white focus:border-[#EC38BC] focus:ring-[#EC38BC]">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1C043C] border-[#EC38BC]/20">
                      <SelectItem value="digital-art" className="text-white hover:bg-[#EC38BC]/20">Digital Art</SelectItem>
                      <SelectItem value="collectible" className="text-white hover:bg-[#EC38BC]/20">Collectible</SelectItem>
                      <SelectItem value="virtual-land" className="text-white hover:bg-[#EC38BC]/20">Virtual Land</SelectItem>
                      <SelectItem value="avatar" className="text-white hover:bg-[#EC38BC]/20">Avatar</SelectItem>
                      <SelectItem value="game-asset" className="text-white hover:bg-[#EC38BC]/20">Game Asset</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="starting-bid" className={`${poppins.className} text-white`}>Starting Bid (AVAX)</Label>
                  <Input
                    id="starting-bid"
                    name="startingBid"
                    type="number"
                    min="1"
                    step="1"
                    value={formData.startingBid}
                    onChange={(e) => setFormData({ ...formData, startingBid: Number.parseInt(e.target.value) })}
                    required
                    className="bg-[#090214]/50 border-[#EC38BC]/20 text-white placeholder:text-white/50 focus:border-[#EC38BC] focus:ring-[#EC38BC]"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="duration" className={`${poppins.className} text-white`}>Auction Duration</Label>
                    <span className={`${poppins.className} text-sm text-[#EC38BC]`}>{formData.duration} days</span>
                  </div>
                  <Slider
                    id="duration"
                    min={1}
                    max={30}
                    step={1}
                    value={[formData.duration]}
                    onValueChange={(value) => setFormData({ ...formData, duration: value[0] })}
                    className="[&_[role=slider]]:bg-[#EC38BC] [&_[role=track]]:bg-[#EC38BC]/20"
                  />
                  <div className="flex justify-between text-xs text-[#EC38BC]">
                    <span>1 day</span>
                    <span>30 days</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image" className={`${poppins.className} text-white`}>Item Image</Label>
                  <div className="flex flex-col items-center gap-4">
                    <div
                      className={`relative flex h-40 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed ${
                        imagePreview ? "border-[#EC38BC]" : "border-[#EC38BC]/20"
                      } bg-[#090214]/50 px-6 py-10 text-center transition-all duration-300 hover:bg-[#090214]`}
                    >
                      <input
                        id="image"
                        name="image"
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 cursor-pointer opacity-0"
                        onChange={handleImageChange}
                        required
                      />
                      {imagePreview ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <img
                            src={imagePreview || "/placeholder.jpg"}
                            alt="Preview"
                            className="h-full w-full rounded-lg object-contain p-2"
                          />
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <Upload className="h-8 w-8 text-[#EC38BC]" />
                          <div className="text-sm text-[#EC38BC]">
                            Click to upload or drag and drop
                          </div>
                          <div className="text-xs text-[#EC38BC]/70">
                            PNG, JPG, GIF up to 10MB
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#8B5CF6] to-[#EC38BC] hover:from-[#9414d1] hover:to-[#FF3CAC] group"
                >
                  Create Auction
                  <Sparkles className="ml-2 h-4 w-4 transition-transform group-hover:scale-110" />
                </Button>
              </CardFooter>
            </Card>
          </form>
        )}
      </div>
    </div>
  )
}
