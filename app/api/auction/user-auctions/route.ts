// app/api/auction/user-auctions/route.ts
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
    // Fetch all auctions where seller matches address
    const { rows } = await pinata.pinList({
      status: 'pinned',
      metadata: {
        keyvalues: {
          seller: { value: address, op: "eq" },
          type: { value: "auction-metadata", op: "eq" }
        }
      }
    });

    // Fetch metadata for each auction
    const auctions = await Promise.all(
      rows.map(async (row) => {
        const res = await fetch(`https://gateway.pinata.cloud/ipfs/${row.ipfs_pin_hash}`);
        if (!res.ok) return null;
        const metadata = await res.json();
        return {
          id: row.ipfs_pin_hash,
          ...metadata,
        };
      })
    );

    return NextResponse.json(auctions.filter(Boolean));
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch user auctions" }, { status: 500 });
  }
}