"use client"

import { useState, useEffect } from "react"
import axios from "axios";
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { AuctionCountdown } from "@/components/auction-countdown"
import { Search, SlidersHorizontal, X } from "lucide-react"



export default function ExplorePage() {
  const [auctions, setAuctions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<number[]>([0, 10000]);
  const [sortBy, setSortBy] = useState("ending-soon");
  const [showEnded, setShowEnded] = useState(false);
  const [filteredAuctions, setFilteredAuctions] = useState([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

   // Fetch auctions on mount
   useEffect(() => {
    async function fetchAuctions() {
      const res = await axios.get("/api/auction/active-auctions");
      setAuctions(res.data);

      // Extract unique categories from auctions
      const uniqueCategories = Array.from(
        new Set(res.data.map((a: any) => a.category))
      ).map((cat) => ({
        id: cat.toLowerCase().replace(/\s+/g, "-"),
        name: cat,
      }));
      setCategories(uniqueCategories);
    }
    fetchAuctions();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...auctions];

    if (searchQuery) {
      filtered = filtered.filter((auction) =>
        auction.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategories.length > 0) {
      filtered = filtered.filter((auction) =>
        selectedCategories.includes(
          auction.category.toLowerCase().replace(/\s+/g, "-")
        )
      );
    }

    filtered = filtered.filter(
      (auction) =>
        auction.currentBid >= priceRange[0] &&
        auction.currentBid <= priceRange[1]
    );

    if (!showEnded) {
      filtered = filtered.filter(
        (auction) => new Date(auction.endTime).getTime() > Date.now()
      );
    }

    // Sort
    switch (sortBy) {
      case "ending-soon":
        filtered.sort((a, b) => a.endTime.getTime() - b.endTime.getTime())
        break
      case "price-high-low":
        filtered.sort((a, b) => b.currentBid - a.currentBid)
        break
      case "price-low-high":
        filtered.sort((a, b) => a.currentBid - b.currentBid)
        break
      case "recently-added":
        // In a real app, you would sort by creation date
        filtered.sort((a, b) => Number.parseInt(b.id) - Number.parseInt(a.id))
        break
    }

    setFilteredAuctions(filtered)
  }, [searchQuery, selectedCategories, priceRange, sortBy, showEnded])

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId],
    )
  }

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedCategories([])
    setPriceRange([0, 10000])
    setSortBy("ending-soon")
    setShowEnded(false)
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Explore Auctions</h1>

      {/* Search and Filter Bar */}
      <div className="flex flex-col gap-4 mb-8 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search auctions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ending-soon">Ending Soon</SelectItem>
              <SelectItem value="price-high-low">Price: High to Low</SelectItem>
              <SelectItem value="price-low-high">Price: Low to High</SelectItem>
              <SelectItem value="recently-added">Recently Added</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={() => setIsFilterOpen(!isFilterOpen)} className="md:hidden">
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[250px_1fr]">
        {/* Filters Sidebar - Desktop */}
        <div className="hidden md:block">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Filters</h3>
              <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 px-2 text-xs">
                Clear All
              </Button>
            </div>

            <Accordion type="multiple" defaultValue={["categories", "price"]}>
              <AccordionItem value="categories">
                <AccordionTrigger>Categories</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <div key={category.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`category-${category.id}`}
                          checked={selectedCategories.includes(category.id)}
                          onCheckedChange={() => toggleCategory(category.id)}
                        />
                        <Label htmlFor={`category-${category.id}`}>{category.name}</Label>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="price">
                <AccordionTrigger>Price Range</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>{priceRange[0]} LSK</span>
                      <span>{priceRange[1]} LSK</span>
                    </div>
                    <Slider min={0} max={10000} step={100} value={priceRange} onValueChange={setPriceRange} />
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="status">
                <AccordionTrigger>Status</AccordionTrigger>
                <AccordionContent>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="show-ended"
                      checked={showEnded}
                      onCheckedChange={(checked) => setShowEnded(checked === true)}
                    />
                    <Label htmlFor="show-ended">Show ended auctions</Label>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>

        {/* Mobile Filters Drawer */}
        {isFilterOpen && (
          <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm md:hidden">
            <div className="fixed bottom-0 left-0 right-0 top-0 z-50 h-[80vh] w-full overflow-hidden rounded-t-xl bg-background p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Filters</h3>
                <Button variant="ghost" size="icon" onClick={() => setIsFilterOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="mt-4 space-y-4">
                <Accordion type="multiple" defaultValue={["categories", "price", "status"]}>
                  <AccordionItem value="categories">
                    <AccordionTrigger>Categories</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        {categories.map((category) => (
                          <div key={category.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`mobile-category-${category.id}`}
                              checked={selectedCategories.includes(category.id)}
                              onCheckedChange={() => toggleCategory(category.id)}
                            />
                            <Label htmlFor={`mobile-category-${category.id}`}>{category.name}</Label>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="price">
                    <AccordionTrigger>Price Range</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span>{priceRange[0]} LSK</span>
                          <span>{priceRange[1]} LSK</span>
                        </div>
                        <Slider min={0} max={10000} step={100} value={priceRange} onValueChange={setPriceRange} />
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="status">
                    <AccordionTrigger>Status</AccordionTrigger>
                    <AccordionContent>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="mobile-show-ended"
                          checked={showEnded}
                          onCheckedChange={(checked) => setShowEnded(checked === true)}
                        />
                        <Label htmlFor="mobile-show-ended">Show ended auctions</Label>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>

              <div className="absolute bottom-0 left-0 right-0 flex gap-2 border-t bg-background p-4">
                <Button variant="outline" className="flex-1" onClick={clearFilters}>
                  Clear All
                </Button>
                <Button className="flex-1" onClick={() => setIsFilterOpen(false)}>
                  Apply Filters
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Auctions Grid */}
        <div>
          {filteredAuctions.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
              <p className="mb-4 text-lg font-semibold">No auctions found</p>
              <p className="mb-6 text-muted-foreground">Try adjusting your filters or search query.</p>
              <Button onClick={clearFilters}>Clear Filters</Button>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredAuctions.map((auction) => (
                <Link key={auction.id} href={`/auction/${auction.id}`}>
                  <Card className="overflow-hidden transition-all hover:shadow-md hover:shadow-purple-500/10 hover:-translate-y-1">
                    <div className="relative aspect-square overflow-hidden">
                      <Badge className="absolute left-2 top-2 z-10">{auction.category}</Badge>
                      <Image
                        src={auction.image || "/placeholder.jpg"}
                        alt={auction.title}
                        width={400}
                        height={400}
                        className="h-full w-full object-cover transition-transform hover:scale-105"
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold line-clamp-1">{auction.title}</h3>
                      <div className="mt-2 flex items-baseline justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground">Current Bid</p>
                          <p className="font-semibold">{auction.currentBid} LSK</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Ends in</p>
                          <AuctionCountdown endTime={auction.endTime} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
