// app/api/auction/user-transactions/route.ts
import { NextResponse } from "next/server";
import pinataSDK from '@pinata/sdk';

if (!process.env.PINATA_API_KEY || !process.env.PINATA_SECRET_API_KEY) {
  throw new Error("Pinata credentials are not configured");
}

const pinata = new pinataSDK(
  process.env.PINATA_API_KEY,
  process.env.PINATA_SECRET_API_KEY
);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address");

  if (!address) {
    return NextResponse.json({ error: "Missing address" }, { status: 400 });
  }

  try {
    // Fetch all auctions
    const { rows } = await pinata.pinList({
      status: 'pinned',
      metadata: {
        keyvalues: {
          type: { value: "auction-metadata", op: "eq" }
        }
      }
    });

    // Collect all transactions involving the user
    let transactions: any[] = [];
    await Promise.all(
      rows.map(async (row) => {
        const res = await fetch(`https://gateway.pinata.cloud/ipfs/${row.ipfs_pin_hash}`);
        if (!res.ok) return;
        const metadata = await res.json();
        // Example: collect all bids by user
        if (metadata.attributes?.bids) {
          metadata.attributes.bids.forEach((bid: any) => {
            if (bid.bidder?.toLowerCase() === address.toLowerCase()) {
              transactions.push({
                auctionId: row.ipfs_pin_hash,
                auctionTitle: metadata.name,
                ...bid,
              });
            }
          });
        }
        // Add more transaction types as needed
      })
    );

    return NextResponse.json(transactions);
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch user transactions" }, { status: 500 });
  }
}