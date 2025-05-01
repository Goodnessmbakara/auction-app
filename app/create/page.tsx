"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { ConnectWalletButton } from "@/components/connect-wallet-button"
import { ArrowLeft, ImageIcon } from "lucide-react"
import Link from "next/link"

export default function CreateAuctionPage() {
  const [isConnected, setIsConnected] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    startingBid: 100,
    duration: 7, // days
    image: null as File | null,
  })
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setFormData({ ...formData, image: file })

    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setImagePreview(null)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Simulate form submission
    alert("Auction created successfully!")
  }

  return (
    <div className="container py-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to auctions
      </Link>

      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold mb-6">Create New Auction</h1>

        {!isConnected ? (
          <Card>
            <CardHeader>
              <CardTitle>Connect Your Wallet</CardTitle>
              <CardDescription>You need to connect your wallet to create an auction.</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center py-6">
              <ConnectWalletButton />
            </CardContent>
          </Card>
        ) : (
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Auction Details</CardTitle>
                <CardDescription>Fill in the details for your new auction item.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Item Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter a title for your item"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your item in detail"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    className="min-h-[120px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                    required
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="digital-art">Digital Art</SelectItem>
                      <SelectItem value="collectible">Collectible</SelectItem>
                      <SelectItem value="virtual-land">Virtual Land</SelectItem>
                      <SelectItem value="avatar">Avatar</SelectItem>
                      <SelectItem value="game-asset">Game Asset</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="starting-bid">Starting Bid (LSK)</Label>
                  <Input
                    id="starting-bid"
                    type="number"
                    min="1"
                    step="1"
                    value={formData.startingBid}
                    onChange={(e) => setFormData({ ...formData, startingBid: Number.parseInt(e.target.value) })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="duration">Auction Duration</Label>
                    <span className="text-sm text-muted-foreground">{formData.duration} days</span>
                  </div>
                  <Slider
                    id="duration"
                    min={1}
                    max={30}
                    step={1}
                    value={[formData.duration]}
                    onValueChange={(value) => setFormData({ ...formData, duration: value[0] })}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>1 day</span>
                    <span>30 days</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image">Item Image</Label>
                  <div className="flex flex-col items-center gap-4">
                    <div
                      className={`relative flex h-40 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed ${
                        imagePreview ? "border-purple-500" : "border-border"
                      } bg-muted/50 px-6 py-10 text-center transition-colors hover:bg-muted`}
                    >
                      <input
                        id="image"
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 cursor-pointer opacity-0"
                        onChange={handleImageChange}
                        required
                      />

                      {imagePreview ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <img
                            src={imagePreview || "/placeholder.svg"}
                            alt="Preview"
                            className="h-full w-full rounded-lg object-contain p-2"
                          />
                        </div>
                      ) : (
                        <>
                          <div className="flex flex-col items-center gap-2">
                            <ImageIcon className="h-10 w-10 text-muted-foreground" />
                            <div className="flex flex-col gap-1">
                              <span className="text-sm font-medium">Click to upload or drag and drop</span>
                              <span className="text-xs text-muted-foreground">SVG, PNG, JPG or GIF (max. 10MB)</span>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-blue-600">
                  Create Auction
                </Button>
              </CardFooter>
            </Card>
          </form>
        )}
      </div>
    </div>
  )
}
