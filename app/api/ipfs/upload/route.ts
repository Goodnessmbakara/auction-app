import { NextResponse } from 'next/server';
import pinataSDK from '@pinata/sdk';

// Initialize Pinata with proper error handling
if (!process.env.PINATA_API_KEY || !process.env.PINATA_SECRET_API_KEY) {
  throw new Error("Pinata credentials are not configured");
}

const pinata = new pinataSDK(
  process.env.PINATA_API_KEY,
  process.env.PINATA_SECRET_API_KEY
);

export async function POST(request: Request) {
  try {
    const metadata = await request.json();

    // Upload metadata to Pinata with proper metadata structure
    const { IpfsHash } = await pinata.pinJSONToIPFS(metadata, {
      pinataMetadata: {
        name: 'auction-metadata.json',
        keyvalues: {
          type: 'auction',
          status: 'active'
        }
      }
    });

    // Return the IPFS hash (CID)
    return NextResponse.json({ cid: IpfsHash });
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    return NextResponse.json(
      { error: 'Failed to upload to IPFS' },
      { status: 500 }
    );
  }
} 