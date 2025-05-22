import { NextResponse } from "next/server";
import { ethers } from 'ethers';
import { getAuctionContract } from '@/lib/blockchain';
import { Server as SocketIOServer } from 'socket.io';
import { Server as NetServer } from 'http';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { bidder, bidAmount } = await request.json();
    const auctionId = params.id;

    // Get auction contract
    const auctionContract = await getAuctionContract(auctionId);
    
    // Get auction details
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

    // Verify auction hasn't ended
    if (ended) {
      return NextResponse.json(
        { error: "Auction has ended" },
        { status: 400 }
      );
    }

    // Verify bid amount is higher than current bid
    if (bidAmount <= Number(ethers.formatEther(highestBid))) {
      return NextResponse.json(
        { error: "Bid must be higher than current bid" },
        { status: 400 }
      );
    }

    // Place bid
    const tx = await auctionContract.placeBid({
      value: ethers.parseEther(bidAmount.toString())
    });
    const receipt = await tx.wait();

    // Get the server instance
    const server = (global as any).server as NetServer;
    const io = (server as any).io as SocketIOServer;

    if (io) {
      // Emit new bid event to all clients in the auction room
      io.to(`auction-${auctionId}`).emit('new-bid', {
        bidder,
        amount: bidAmount,
        time: new Date().toISOString(),
      });

      // Emit auction update
      io.to(`auction-${auctionId}`).emit('auction-update', {
        status: 'active',
        highestBidder: bidder,
        currentBid: bidAmount,
      });
    }

    return NextResponse.json({
      success: true,
      transactionHash: receipt.hash,
      bidAmount,
    });
  } catch (error) {
    console.error("Error placing bid:", error);
    return NextResponse.json(
      {
        error: "Failed to place bid",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
} 