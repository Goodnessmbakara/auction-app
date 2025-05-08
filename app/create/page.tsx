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
import { ArrowLeft, ImageIcon } from "lucide-react"
import Link from "next/link"

declare global {
  interface Window {
    ethereum: any;
  }
}

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
  const [isConnected, setIsConnected] = useState(false)

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

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        await window.ethereum.request({ method: "eth_requestAccounts" })
        setIsConnected(true)
      } catch (err) {
        console.error("Error connecting wallet:", err)
      }
    } else {
      alert("Please install MetaMask to connect your wallet.")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.image) {
      alert("Please upload an image.")
      return
    }

    const payload = new FormData()
    payload.append("title", formData.title)
    payload.append("description", formData.description)
    payload.append("category", formData.category)
    payload.append("startingBid", String(formData.startingBid))
    payload.append("duration", String(formData.duration))
    payload.append("image", formData.image)

    try {
      const res = await fetch("/api/auctions/create", {
        method: "POST",
        body: payload,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || "Something went wrong")
      }

      alert("Auction created successfully!")
    } catch (err) {
      console.error(err)
      alert("Failed to create auction")
    }
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
              <Button onClick={connectWallet} className="bg-gradient-to-r from-purple-600 to-blue-600">
                Connect Wallet
              </Button>
            </CardContent>
          </Card>
        ) : (
          <form onSubmit={handleSubmit} encType="multipart/form-data">
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
                    name="title"
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
                    name="description"
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
                    <SelectTrigger id="category" name="category">
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
                    name="startingBid"
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
