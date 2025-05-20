"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { ArrowLeft, Upload, Sparkles } from "lucide-react"
import { useAccount } from "wagmi"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

export default function CreateAuctionPage() {
  const { isConnected, address } = useAccount()
  const { toast } = useToast()
  const router = useRouter()

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    startingBid: 100,
    duration: 7,
    image: null as File | null,
  })
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    if (!isConnected || !address) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to create an auction.",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    if (!formData.image) {
      toast({
        title: "Image Required",
        description: "Please upload an image for your auction.",
        variant: "destructive",
      })
      setIsSubmitting(false)
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

    try {
      const res = await fetch("/api/auction/create-auction", {
        method: "POST",
        body: payload,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || data.message || "Failed to create auction")
      }

      toast({
        title: "Success",
        description: "Auction created successfully!",
      })

      // Redirect to the new auction page
      router.push(`/auction/${data.data.id}`)
    } catch (err) {
      console.error("Error creating auction:", err)
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to create auction",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
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
          <h1 className="text-3xl font-bold text-[#1C043C]">Create New Auction</h1>
        </div>

        {!isConnected ? (
          <Card className="bg-[#1C043C]/50 backdrop-blur border-[#EC38BC]/20">
            <CardHeader>
              <CardTitle className="text-white">Connect Your Wallet</CardTitle>
              <CardDescription className="text-[#EC38BC]">
                You need to connect your wallet to create an auction.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <form onSubmit={handleSubmit}>
            <Card className="bg-[#1C043C]/50 backdrop-blur border-[#EC38BC]/20">
              <CardHeader>
                <CardTitle className="text-white">Auction Details</CardTitle>
                <CardDescription className="text-[#EC38BC]">
                  Fill in the details for your new auction item.
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Title Field */}
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-white">Item Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="bg-[#090214]/50 border-[#EC38BC]/20 text-white"
                  />
                </div>

                {/* Description Field */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-white">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    className="min-h-[120px] bg-[#090214]/50 border-[#EC38BC]/20 text-white"
                  />
                </div>

                {/* Category Field */}
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-white">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                    required
                  >
                    <SelectTrigger className="bg-[#090214]/50 border-[#EC38BC]/20 text-white">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1C043C] border-[#EC38BC]/20">
                      <SelectItem value="digital-art">Digital Art</SelectItem>
                      <SelectItem value="collectible">Collectible</SelectItem>
                      <SelectItem value="virtual-land">Virtual Land</SelectItem>
                      <SelectItem value="avatar">Avatar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Starting Bid Field */}
                <div className="space-y-2">
                  <Label htmlFor="startingBid" className="text-white">Starting Bid (AVAX)</Label>
                  <Input
                    id="startingBid"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={formData.startingBid}
                    onChange={(e) => setFormData({ ...formData, startingBid: Number(e.target.value) })}
                    required
                    className="bg-[#090214]/50 border-[#EC38BC]/20 text-white"
                  />
                </div>

                {/* Duration Field */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="duration" className="text-white">Auction Duration</Label>
                    <span className="text-sm text-[#EC38BC]">{formData.duration} days</span>
                  </div>
                  <Slider
                    min={1}
                    max={30}
                    step={1}
                    value={[formData.duration]}
                    onValueChange={(value) => setFormData({ ...formData, duration: value[0] })}
                    className="[&_[role=slider]]:bg-[#EC38BC]"
                  />
                  <div className="flex justify-between text-xs text-[#EC38BC]">
                    <span>1 day</span>
                    <span>30 days</span>
                  </div>
                </div>

                {/* Image Upload */}
                <div className="space-y-2">
                  <Label htmlFor="image" className="text-white">Item Image</Label>
                  <div className="flex flex-col items-center gap-4">
                    <div className={`relative flex h-40 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed ${
                      imagePreview ? "border-[#EC38BC]" : "border-[#EC38BC]/20"
                    } bg-[#090214]/50 px-6 py-10 text-center`}>
                      <input
                        id="image"
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 cursor-pointer opacity-0"
                        onChange={handleImageChange}
                        required
                      />
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="h-full w-full rounded-lg object-contain p-2"
                        />
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
                  className="w-full bg-gradient-to-r from-[#8B5CF6] to-[#EC38BC] hover:from-[#9414d1] hover:to-[#FF3CAC]"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creating..." : "Create Auction"}
                  <Sparkles className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </form>
        )}
      </div>
    </div>
  )
}