// app/api/auction/route.ts
import { NextResponse } from "next/server";
import pinataSDK from '@pinata/sdk';

// Initialize Pinata with proper error handling for missing credentials
if (!process.env.PINATA_API_KEY || !process.env.PINATA_SECRET_API_KEY) {
  throw new Error("Pinata credentials are not configured");
}

const pinata = new pinataSDK(
  process.env.PINATA_API_KEY,
  process.env.PINATA_SECRET_API_KEY
);

interface AuctionMetadata {
  name: string;
  description: string;
  image: string;
  attributes: {
    category: string;
    startingBid: number;
    currentBid?: number;
    endTime: string;
    created: string;
    sellerAddress: string;
    sellerName?: string;
    sellerVerified?: boolean;
    bids?: Array<{
      amount: number;
      bidder: string;
      timestamp: string;
    }>;
  };
}

interface AuctionResponse {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  currentBid: number;
  startingBid: number;
  endTime: string;
  created: string;
  seller: {
    address: string;
    name: string;
    verified: boolean;
  };
  bids: Array<{
    amount: number;
    bidder: string;
    timestamp: string;
  }>;
}

export async function GET() {
  try {
    // Fetch pinned items with auction type metadata
    const { rows } = await pinata.pinList({
      status: 'pinned',
      metadata: {
        keyvalues: {
            type: { value: "auction-metadata", op: "eq" }
        }
      }
    });

    if (!rows || rows.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    // Process auctions in parallel with error handling for individual items
    const activeAuctions = await Promise.all(
      rows.map(async (auction) => {
        try {
          // Skip if no IPFS hash
          if (!auction.ipfs_pin_hash) return null;

          // Get current time once for all comparisons
          const currentTime = new Date();
          const endTime = new Date(auction.metadata?.keyvalues?.endTime);

          // Skip expired auctions
          if (endTime <= currentTime) return null;

          // Fetch metadata from IPFS
          const metadataResponse = await fetch(
            `https://gateway.pinata.cloud/ipfs/${auction.ipfs_pin_hash}`
          );
          

          if (!metadataResponse.ok) {
            console.warn(`Failed to fetch metadata for ${auction.ipfs_pin_hash}`);
            return null;
          }

          const metadata: AuctionMetadata = await metadataResponse.json();

          // Construct response object
          return {
            id: auction.ipfs_pin_hash,
            title: metadata.name,
            description: metadata.description,
            image: `https://gateway.pinata.cloud/ipfs/${metadata.image.replace('ipfs://', '')}`,
            category: metadata.attributes.category,
            currentBid: metadata.attributes.currentBid || metadata.attributes.startingBid,
            startingBid: metadata.attributes.startingBid,
            endTime: metadata.attributes.endTime,
            created: metadata.attributes.created,
            seller: {
              address: metadata.attributes.sellerAddress,
              name: metadata.attributes.sellerName || "Anonymous",
              verified: metadata.attributes.sellerVerified || false,
            },
            bids: metadata.attributes.bids || [],
          } as AuctionResponse;
        } catch (error) {
          console.error(`Error processing auction ${auction.ipfs_pin_hash}:`, error);
          return null;
        }
      })
    );

    // Filter out null values and return successful results
    const validAuctions = activeAuctions.filter(auction => auction !== null) as AuctionResponse[];
    
    return NextResponse.json(validAuctions, { status: 200 });

  } catch (error) {
    console.error("Failed to fetch auctions:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch auctions",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}