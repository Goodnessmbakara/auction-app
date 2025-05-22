// app/api/auction/user-auctions/route.ts
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
    bids?: Array<{ amount: number; bidder: string; timestamp: string }>;
  };
}

interface AuctionResponse {
  id: string;
  title: string;
  image: string;
  currentBid: number;
  bids: number; // Number of bids
  endTime: string;
  status: string;
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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    if (!address) {
      return NextResponse.json({ error: "Address is required" }, { status: 400 });
    }

    const { rows } = await pinata.pinList({
      status: 'pinned',
      metadata: {
        keyvalues: {
          type: { value: 'auction', op: 'eq' }, // Match previous metadata
        },
      },
    });
    console.log("FETCHING USER AUCTIONS", rows);

    const currentTime = new Date();

    const userAuctions = await Promise.all(
      rows.map(async auction => {
        console.log('MAPPING TO AUCTION HERE', auction);
        try {
          // Ensure keyvalues is a plain object
          if (auction.metadata.keyvalues instanceof Set) {
            console.error(`Set detected in keyvalues for ${auction.ipfs_pin_hash}`);
            auction.metadata.keyvalues = Object.fromEntries(auction.metadata.keyvalues);
          }

          let response;
          try {
            response = await fetchWithRetry(`https://gateway.pinata.cloud/ipfs/${auction.ipfs_pin_hash}`);
          } catch (pinataError) {
            console.warn(`Pinata gateway failed for ${auction.ipfs_pin_hash}:`, pinataError);
            response = await fetchWithRetry(`https://ipfs.io/ipfs/${auction.ipfs_pin_hash}`);
          }

          const metadata: AuctionMetadata = await response.json();
          console.log('METADATA FETCHED', metadata);

          if (!metadata || !metadata.attributes) {
            console.error(`Invalid metadata structure for ${auction.ipfs_pin_hash}`, metadata);
            return null;
          }

          // Filter by sellerAddress
          if (metadata.attributes.sellerAddress.toLowerCase() !== address.toLowerCase()) {
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

          return {
            id: auction.ipfs_pin_hash,
            title: metadata.name || 'Untitled Auction',
            image: metadata.image?.startsWith('ipfs://')
              ? `https://gateway.pinata.cloud/ipfs/${metadata.image.replace('ipfs://', '')}`
              : metadata.image || `https://gateway.pinata.cloud/ipfs/${auction.ipfs_pin_hash}`,
            currentBid: Number(metadata.attributes.currentBid) || Number(metadata.attributes.startingBid) || 0,
            bids: metadata.attributes.bids?.length || 0,
            endTime: endTimeStr,
            status: endTime <= currentTime ? 'ended' : 'active',
          };
        } catch (error) {
          console.error(`Error processing auction ${auction.ipfs_pin_hash}:`, error);
          return null;
        }
      })
    );

    const filteredAuctions = userAuctions.filter(Boolean);
    console.log('USER AUCTIONS', filteredAuctions);
    return NextResponse.json(filteredAuctions);
  } catch (error) {
    console.error("Failed to fetch user auctions:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch user auctions",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}