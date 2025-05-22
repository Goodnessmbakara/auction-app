import { NextResponse } from "next/server";
import { ethers } from 'ethers';
import { getAuctionContract } from '@/lib/blockchain';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { winnerAddress } = await request.json();
    const auctionId = params.id;

    // Get auction contract
    const auctionContract = await getAuctionContract(auctionId);
    
    // Get auction details to verify winner and status
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

    // Verify winner
    if (highestBidder.toLowerCase() !== winnerAddress.toLowerCase()) {
      return NextResponse.json(
        { error: "Only the winning bidder can claim the item" },
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

    // Verify there was a winning bid
    if (highestBid.eq(0)) {
      return NextResponse.json(
        { error: "No winning bid found" },
        { status: 400 }
      );
    }

    // Get the transaction hash
    const tx = await auctionContract.claimItem();
    const receipt = await tx.wait();

    // Verify ownership transfer
    const newOwner = await auctionContract.ownerOf(auctionId);
    if (newOwner.toLowerCase() !== winnerAddress.toLowerCase()) {
      throw new Error("Ownership transfer failed");
    }

    // Get the NFT contract to verify the transfer
    const nftContract = await auctionContract.nftContract();
    const nftOwner = await nftContract.ownerOf(auctionId);
    
    if (nftOwner.toLowerCase() !== winnerAddress.toLowerCase()) {
      throw new Error("NFT ownership transfer failed");
    }

    return NextResponse.json({
      success: true,
      transactionHash: receipt.hash,
      itemId: auctionId,
      newOwner: newOwner,
      nftOwner: nftOwner
    });
  } catch (error) {
    console.error("Error claiming item:", error);
    return NextResponse.json(
      {
        error: "Failed to claim item",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
} 