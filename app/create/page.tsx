"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { ArrowLeft, Upload, Sparkles, Loader2 } from "lucide-react"
import { useAccount } from "wagmi"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"
import { ConnectWalletButton } from "@/components/connect-wallet-button"
import { compressImage } from '@/lib/image-compression'
import { raleway, poppins } from '@/lib/fonts'
import { createAuctionContract } from '@/lib/contracts'
import type { FormData } from '@/types/auction'
import { useRouter } from "next/navigation"

export default function CreateAuctionPage() {
  const { toast } = useToast()
  const { address, isConnected } = useAccount()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [transactionStatus, setTransactionStatus] = useState<{
    step: 'uploading' | 'creating' | 'complete' | null
    message: string
  }>({ step: null, message: '' })

  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    category: "",
    startingBid: 0,
    duration: 7,
    image: null,
  })

  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  const router = useRouter()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'startingBid' ? Math.max(0, Number(value) || 0) : value
    }));
  };

  const handleImageChange = async (file: File | null) => {
    if (!file) {
      setFormData(prev => ({ ...prev, image: null }));
      setImagePreview(null);
      return;
    }

    try {
      const compressedFile = await compressImage(file);
      setFormData(prev => ({ ...prev, image: compressedFile }));

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Data = reader.result as string;
        setImagePreview(base64Data);
      };
      reader.readAsDataURL(compressedFile);
    } catch (error) {
      console.error("Error processing image:", error);
      toast({
        title: "Error",
        description: "Failed to process image. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      await handleImageChange(file);
    } else {
      toast({
        title: "Invalid File",
        description: "Please drop an image file.",
        variant: "destructive",
      });
    }
  };

  const isFormValid = () => {
    return (
      formData.title.trim() !== "" &&
      formData.description.trim() !== "" &&
      formData.category !== "" &&
      formData.startingBid > 0 &&
      formData.image instanceof File
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected || !address) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to create an auction.",
        variant: "destructive",
      });
      return;
    }

    if (!isFormValid()) {
      toast({
        title: "Form Incomplete",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // First, handle blockchain interaction
      setTransactionStatus({ step: 'creating', message: 'Creating auction on blockchain...' });
      
      try {
        // Create auction contract on blockchain first
        const auctionAddress = await createAuctionContract(
          formData.title,
          'temp-cid', // We'll update this after IPFS upload
          formData.startingBid,
          formData.duration,
          window.ethereum
        );

        // Now upload to IPFS
        setTransactionStatus({ step: 'uploading', message: 'Uploading image to IPFS...' });

        const formDataToSend = new FormData();
        formDataToSend.append('title', formData.title);
        formDataToSend.append('description', formData.description);
        formDataToSend.append('category', formData.category);
        formDataToSend.append('startingBid', formData.startingBid.toString());
        formDataToSend.append('duration', formData.duration.toString());
        formDataToSend.append('sellerAddress', address);
        formDataToSend.append('auctionAddress', auctionAddress);
        if (formData.image) {
          formDataToSend.append('image', formData.image);
        }
        
        const response = await fetch("/api/auction/create-auction", {
          method: "POST",
          body: formDataToSend,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to upload auction data");
        }

        setTransactionStatus({ step: 'complete', message: 'Auction created successfully!' });

        toast({
          title: "Success!",
          description: "Your auction has been created successfully. Redirecting to dashboard...",
        });

        // Use router for navigation
        router.push('/dashboard');
      } catch (error) {
        console.error("Transaction failed:", error);
        toast({
          title: "Transaction Failed",
          description: error instanceof Error ? error.message : "Failed to create auction",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error creating auction:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create auction",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setTransactionStatus({ step: null, message: '' });
    }
  };

  if (!isMounted) {
    return null;
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
          <div className="text-center py-12">
            <p className="text-white mb-4">Please connect your wallet to create an auction</p>
            <ConnectWalletButton />
          </div>
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
                    onChange={handleInputChange}
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
                    onChange={handleInputChange}
                    required
                    className="min-h-[120px] bg-[#090214]/50 border-[#EC38BC]/20 text-white placeholder:text-white/50 focus:border-[#EC38BC] focus:ring-[#EC38BC]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category" className={`${poppins.className} text-white`}>Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
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
                    onChange={handleInputChange}
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
                    onValueChange={(value) => setFormData(prev => ({ ...prev, duration: value[0] }))}
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
                      } ${
                        isDragging ? "bg-[#090214] border-[#EC38BC]" : "bg-[#090214]/50"
                      } px-6 py-10 text-center transition-all duration-300 hover:bg-[#090214]`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <input
                        id="image"
                        name="image"
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 cursor-pointer opacity-0"
                        onChange={(e) => handleImageChange(e.target.files?.[0] || null)}
                        required={!imagePreview}
                      />
                      {imagePreview ? (
                        <div className="absolute inset-0 flex items-center justify-center group">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="h-full w-full rounded-lg object-contain p-2"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="text-sm text-white">
                              Click or drag to change image
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <Upload className="h-8 w-8 text-[#EC38BC]" />
                          <div className="text-sm text-[#EC38BC]">
                            {isDragging ? "Drop image here" : "Click to upload or drag and drop"}
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
            </Card>

            <Button
              type="submit"
              className="w-full mt-4 bg-gradient-to-r from-purple-600 to-blue-600"
              disabled={isSubmitting || !isFormValid()}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Auction...
                </>
              ) : !isFormValid() ? (
                "Fill in all required fields"
              ) : (
                "Create Auction"
              )}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}