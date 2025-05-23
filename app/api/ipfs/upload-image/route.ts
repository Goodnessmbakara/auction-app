import { NextResponse } from 'next/server';
import pinataSDK from '@pinata/sdk';
import { Readable } from 'stream';

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
    const formData = await request.formData();
    const image = formData.get('image') as File;
    
    if (!image) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }

    // Convert File to Buffer
    const buffer = Buffer.from(await image.arrayBuffer());
    const readable = Readable.from(buffer);

    // Upload to Pinata
    const { IpfsHash } = await pinata.pinFileToIPFS(readable, {
      pinataMetadata: {
        name: image.name || 'auction-image',
        keyvalues: {
          type: 'auction-image'
        }
      }
    });

    return NextResponse.json({ cid: IpfsHash });
  } catch (error) {
    console.error('Error uploading image to IPFS:', error);
    return NextResponse.json(
      { error: 'Failed to upload image to IPFS' },
      { status: 500 }
    );
  }
} 