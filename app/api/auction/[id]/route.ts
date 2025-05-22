// app/api/auction/[id]/route.ts
import { NextResponse } from "next/server";
import pinataSDK from '@pinata/sdk';
import { ethers } from 'ethers';
import { getAuctionContract } from '@/lib/blockchain';

// Initialize Pinata with proper error handling
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
  description: string;
  category: string;
  startingBid: number;
  currentBid: number;
  sellerAddress: string;
  createdAt: string;
  endTime: string;
  imageUrl: string;
  status: string;
  bids: Array<{ amount: number; bidder: string; timestamp: string }>;
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

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const auctionId = params.id;
    console.log(`Fetching auction with ID: ${auctionId}`);

    // 1. Get auction metadata from Pinata
    const { rows } = await pinata.pinList({
      status: 'pinned',
      metadata: {
        keyvalues: {
          type: { value: 'auction', op: 'eq' }, // Match create-auction metadata
        },
      },
    });
    console.log('PINATA PIN LIST:', rows);

    const auctionPin = rows.find(row => row.ipfs_pin_hash === auctionId);
    if (!auctionPin) {
      console.error(`Auction not found in Pinata for ID: ${auctionId}`);
      return NextResponse.json(
        { error: "Auction not found" },
        { status: 404 }
      );
    }

    // Ensure keyvalues is a plain object
    if (auctionPin.metadata.keyvalues instanceof Set) {
      console.error(`Set detected in keyvalues for ${auctionId}`);
      auctionPin.metadata.keyvalues = Object.fromEntries(auctionPin.metadata.keyvalues);
    }

    // 2. Fetch metadata from IPFS
    let metadata: AuctionMetadata;
    try {
      const response = await fetchWithRetry(`https://gateway.pinata.cloud/ipfs/${auctionId}`);
      metadata = await response.json();
      console.log('METADATA FETCHED:', metadata);
    } catch (error) {
      console.error(`Failed to fetch metadata for ${auctionId}:`, error);
      return NextResponse.json(
        { error: "Failed to fetch auction metadata" },
        { status: 500 }
      );
    }

    if (!metadata || !metadata.attributes) {
      console.error(`Invalid metadata structure for ${auctionId}:`, metadata);
      return NextResponse.json(
        { error: "Invalid auction metadata" },
        { status: 400 }
      );
    }

    // 3. Get auction contract data
    let contractData;
    try {
      const auctionContract = await getAuctionContract(auctionId);
      contractData = await auctionContract.getAuctionDetails();
      console.log('CONTRACT DATA:', contractData);
    } catch (error) {
      console.error(`Failed to fetch contract data for ${auctionId}:`, error);
      // Proceed with metadata only if contract data is unavailable
      contractData = null;
    }

    // 4. Combine Pinata and blockchain data
    const auction: AuctionResponse = {
      id: auctionId,
      title: metadata.name || 'Untitled Auction',
      description: metadata.description || '',
      category: metadata.attributes.category || 'Uncategorized',
      startingBid: Number(metadata.attributes.startingBid) || 0,
      currentBid: Number(metadata.attributes.currentBid) || Number(metadata.attributes.startingBid) || 0,
      sellerAddress: metadata.attributes.sellerAddress || '',
      createdAt: metadata.attributes.created || new Date().toISOString(),
      endTime: metadata.attributes.endTime || new Date().toISOString(),
      imageUrl: metadata.image?.startsWith('ipfs://')
        ? `https://gateway.pinata.cloud/ipfs/${metadata.image.replace('ipfs://', '')}`
        : metadata.image || `https://gateway.pinata.cloud/ipfs/${auctionId}`,
      status: new Date(metadata.attributes.endTime) <= new Date() ? 'ended' : 'active',
      bids: metadata.attributes.bids?.map(bid => ({
        amount: Number(bid.amount) || 0,
        bidder: bid.bidder || '',
        timestamp: bid.timestamp || '',
      })) || [],
    };

    // Override with contract data if available
    if (contractData) {
      const [
        seller,
        title,
        ipfsImageHash,
        startingBid,
        endTime,
        ended,
        highestBidder,
        highestBid,
      ] = contractData;
      auction.title = title || auction.title;
      auction.sellerAddress = seller || auction.sellerAddress;
      auction.startingBid = Number(ethers.formatEther(startingBid)) || auction.startingBid;
      auction.currentBid = Number(ethers.formatEther(highestBid)) || auction.currentBid;
      auction.endTime = new Date(Number(endTime) * 1000).toISOString() || auction.endTime;
      auction.status = ended ? 'ended' : 'active';
      auction.imageUrl = ipfsImageHash
        ? `https://gateway.pinata.cloud/ipfs/${ipfsImageHash}`
        : auction.imageUrl;
    }

    return NextResponse.json(auction);
  } catch (error) {
    console.error(`Error fetching auction ${params.id}:`, error);
    return NextResponse.json(
      {
        error: "Failed to fetch auction",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}