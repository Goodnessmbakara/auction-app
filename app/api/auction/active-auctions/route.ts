// app/api/auction/active-auction/route.ts
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

async function fetchWithRetry(url: string, retries = 3, timeout = 15000): Promise<Response> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      const response = await fetch(url, {
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (response.ok) return response;
      console.warn(`Fetch attempt ${attempt} failed for ${url}: ${response.statusText}`);
    } catch (error) {
      console.error(`Fetch attempt ${attempt} error for ${url}:`, error);
      if (attempt === retries) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
  throw new Error(`Failed to fetch ${url} after ${retries} attempts`);
}

export async function GET() {
  try {
    // Fetch pinned items with auction type metadata
    const { rows } = await pinata.pinList({
      status: 'pinned',
      metadata: {
        keyvalues: {
          type: {
            value: 'auction',
            op: 'eq',
          },
        },
      },
    });
    console.log("FETCHING HERE", rows);

    // Get current time once for all comparisons
    const currentTime = new Date();

    // Process and filter auctions
    const activeAuctions = await Promise.all(
      rows.map(async auction => {
        console.log('MAPPING TO AUCTION HERE', auction);
        try {
          // Try Pinata gateway with retries
          let response;
          try {
            response = await fetchWithRetry(`https://gateway.pinata.cloud/ipfs/${auction.ipfs_pin_hash}`);
          } catch (pinataError) {
            console.warn(`Pinata gateway failed for ${auction.ipfs_pin_hash}:`, pinataError);
            response = await fetchWithRetry(`https://ipfs.io/ipfs/${auction.ipfs_pin_hash}`);
          }

          const metadata = await response.json();
          console.log('METADATA FETCHED', metadata);

          // Skip if no metadata or invalid structure
          if (!metadata || !metadata.attributes) {
            console.error(`Invalid metadata structure for ${auction.ipfs_pin_hash}`, metadata);
            return null;
          }

          const endTimeStr = metadata.attributes.endTime;
          if (!endTimeStr || typeof endTimeStr !== 'string') {
            console.error(`Invalid endTime for ${auction.ipfs_pin_hash}: ${endTimeStr}`);
            return null;
          }

          const endTime = new Date(endTimeStr);
          if (isNaN(endTime.getTime())) {
            console.error(`Invalid endTime format for ${auction.ipfs_pin_hash}: ${endTimeStr}`);
            return null;
          }

          // Skip expired auctions
          if (endTime <= currentTime) {
            console.log(`Expired auction for ${auction.ipfs_pin_hash}: endTime=${endTimeStr}`);
            return null;
          }

          // Construct the auction object
          return {
            id: auction.ipfs_pin_hash,
            title: metadata.name || 'Untitled Auction',
            description: metadata.description || '',
            category: metadata.attributes.category || 'Uncategorized',
            startingBid: Number(metadata.attributes.startingBid) || 0,
            currentBid: Number(metadata.attributes.currentBid) || Number(metadata.attributes.startingBid) || 0,
            seller: {
              address: metadata.attributes.sellerAddress || '',
              name: metadata.attributes.sellerName || '',
              verified: metadata.attributes.sellerVerified || false,
            },
            created: metadata.attributes.created || new Date().toISOString(),
            endTime: endTimeStr,
            image: metadata.image?.startsWith('ipfs://')
              ? `https://gateway.pinata.cloud/ipfs/${metadata.image.replace('ipfs://', '')}`
              : metadata.image || `https://gateway.pinata.cloud/ipfs/${auction.ipfs_pin_hash}`,
            bids: metadata.attributes.bids || [],
            status: 'active',
          };
        } catch (error) {
          console.error(`Error processing auction ${auction.ipfs_pin_hash}:`, error);
          return null;
        }
      })
    );

    // Filter out null values and return
    const filteredAuctions = activeAuctions.filter(Boolean);
    console.log('ACTIVE AUCTIONS', filteredAuctions);
    return NextResponse.json(filteredAuctions);
  } catch (error) {
    console.error("Failed to fetch auctions:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch auctions",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}