// app/api/auction/[id]/route.ts
import { NextResponse } from "next/server";
import pinataSDK from '@pinata/sdk';
import { ethers } from 'ethers';
import { getAuctionContract } from '@/lib/contracts';

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
    auctionAddress?: string;
    transactionHash?: string;
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
  highestBidder?: string;
  owner?: string;
  auctionAddress?: string;
  transactionHash?: string;
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
  const auctionId = params.id;

  try {
    // 1. Fetch metadata from IPFS
    const ipfsResponse = await fetch(`https://ipfs.io/ipfs/${auctionId}`);
    if (!ipfsResponse.ok) {
      throw new Error('Failed to fetch IPFS metadata');
    }

    const metadata = await ipfsResponse.json();
    console.log('METADATA FETCHED:', metadata);

    // 2. Get contract address from metadata
    const auctionAddress = metadata.attributes.auctionAddress;
    if (!auctionAddress) {
      throw new Error('Auction contract address not found in metadata');
    }

    // 3. Fetch contract data
    let contractData;
    try {
      const provider = new ethers.JsonRpcProvider(process.env.AVALANCHE_RPC_URL);
      const auctionContract = new ethers.Contract(
        auctionAddress,
        Auction.abi,
        provider
      );
      contractData = await auctionContract.getAuctionDetails();
      console.log('CONTRACT DATA:', contractData);
    } catch (error) {
      console.error(`Failed to fetch contract data for ${auctionId}:`, error);
      // Continue with IPFS data if contract fetch fails
    }

    // 4. Combine IPFS and contract data
    const auction = {
      id: auctionId,
      title: metadata.name,
      description: metadata.description,
      category: metadata.attributes.category,
      startingBid: metadata.attributes.startingBid,
      currentBid: contractData?.currentBid || metadata.attributes.currentBid,
      sellerAddress: metadata.attributes.sellerAddress,
      createdAt: metadata.attributes.created,
      endTime: metadata.attributes.endTime,
      imageUrl: metadata.image.replace('ipfs://', 'https://ipfs.io/ipfs/'),
      status: contractData?.status || 'active',
      highestBidder: contractData?.highestBidder,
      owner: contractData?.owner,
      bids: metadata.attributes.bids,
      auctionAddress: auctionAddress,
      transactionHash: metadata.attributes.transactionHash
    };

    return NextResponse.json(auction);
  } catch (error) {
    console.error(`Error fetching auction ${auctionId}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch auction' },
      { status: 500 }
    );
  }
}