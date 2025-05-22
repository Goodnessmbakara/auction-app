import { NextResponse } from "next/server";
import pinataSDK from '@pinata/sdk';
import { ethers } from 'ethers';
import { getAuctionContract } from '@/lib/blockchain';

const pinata = new pinataSDK(
  process.env.PINATA_API_KEY!,
  process.env.PINATA_SECRET_API_KEY!
);

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const auctionId = params.id;

    // 1. Get auction metadata from Pinata
    const { rows } = await pinata.pinList({
      status: 'pinned',
      metadata: {
        keyvalues: {
          type: { value: "auction-metadata", op: "eq" }
        }
      }
    });

    const auctionPin = rows.find(row => row.ipfs_pin_hash === auctionId);
    if (!auctionPin) {
      return NextResponse.json(
        { error: "Auction not found" },
        { status: 404 }
      );
    }

    // 2. Get auction contract data
    const auctionContract = await getAuctionContract(auctionId);
    const [
      seller,
      title,
      ipfsImageHash,
      startingBid,
      endTime,
      ended,
      highestBidder,
      highestBid
    ] = await auctionContract.getAuctionDetails();

    // 3. Combine Pinata and blockchain data
    const auction = {
      id: auctionId,
      title: title || auctionPin.metadata.name,
      description: auctionPin.metadata.description || '',
      category: auctionPin.metadata.attributes?.category || '',
      startingBid: Number(ethers.formatEther(startingBid)),
      currentBid: Number(ethers.formatEther(highestBid)),
      sellerAddress: seller,
      createdAt: auctionPin.metadata.attributes?.createdAt || new Date().toISOString(),
      endTime: new Date(Number(endTime) * 1000).toISOString(),
      imageUrl: `https://gateway.pinata.cloud/ipfs/${auctionPin.metadata.image?.replace('ipfs://', '')}`,
      status: ended ? 'ended' : 'active',
      bids: auctionPin.metadata.attributes?.bids || []
    };

    return NextResponse.json(auction);
  } catch (error) {
    console.error("Error fetching auction:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch auction",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
} 