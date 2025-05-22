import { NextResponse } from "next/server";
import { ethers } from 'ethers';
import { getAuctionContract } from '@/lib/blockchain';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { sellerAddress } = await request.json();
    const auctionId = params.id;

    // Get auction contract
    const auctionContract = await getAuctionContract(auctionId);
    
    // Get auction details to verify seller and status
    const [
      seller,
      ,
      ,
      ,
      endTime,
      ended,
      highestBidder,
      highestBid
    ] = await auctionContract.getAuctionDetails();

    // Verify seller
    if (seller.toLowerCase() !== sellerAddress.toLowerCase()) {
      return NextResponse.json(
        { error: "Only the seller can claim funds" },
        { status: 403 }
      );
    }

    // Verify auction has ended
    if (!ended) {
      return NextResponse.json(
        { error: "Auction has not ended yet" },
        { status: 400 }
      );
    }

    // Verify there are funds to claim
    if (highestBid.eq(0)) {
      return NextResponse.json(
        { error: "No funds to claim" },
        { status: 400 }
      );
    }

    // Get the transaction hash
    const tx = await auctionContract.claimFunds();
    const receipt = await tx.wait();

    return NextResponse.json({
      success: true,
      transactionHash: receipt.hash,
      amount: ethers.formatEther(highestBid)
    });
  } catch (error) {
    console.error("Error claiming funds:", error);
    return NextResponse.json(
      {
        error: "Failed to claim funds",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
} 