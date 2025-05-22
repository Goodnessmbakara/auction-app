import { NextResponse } from "next/server";
import { parseFormData } from "@/lib/form-data";
import { uploadToPinata } from "@/lib/pinata";
import pinataSDK from '@pinata/sdk';
import { Readable } from 'stream';

if (!process.env.PINATA_API_KEY || !process.env.PINATA_SECRET_API_KEY) {
  throw new Error("Pinata credentials are not configured");
}

const pinata = new pinataSDK(
  process.env.PINATA_API_KEY,
  process.env.PINATA_SECRET_API_KEY
);

export const config = {
  api: {
    bodyParser: false, // Disable default body parsing
  },
};

async function parseFormData(request: Request) {
  const formData = await request.formData();
  const entries = Object.fromEntries(formData.entries());
  
  // Extract fields and files
  const fields: Record<string, string> = {};
  const files: Record<string, File> = {};
  
  for (const [key, value] of Object.entries(entries)) {
    if (value instanceof File) {
      files[key] = value;
    } else {
      fields[key] = value.toString();
    }
  }
  
  return { fields, files };
}

async function uploadToPinata(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const readable = Readable.from(buffer);
  
  const options = {
    pinataMetadata: {
      name: file.name || 'auction-image',
    },
  };

  const { IpfsHash } = await pinata.pinFileToIPFS(readable, options);
  return IpfsHash;
}

export async function POST(request: Request) {
  try {
    const { fields, files } = await parseFormData(request);

    if (!files.image) {
      return NextResponse.json(
        { error: "No image file provided" },
        { status: 400 }
      );
    }

    // 1. Upload image to Pinata
    const imageCID = await uploadToPinata(files.image);

    // 2. Create metadata for Pinata
    const metadata = {
      name: fields.title || 'Untitled Auction',
      description: fields.description || '',
      image: `ipfs://${imageCID}`,
      attributes: {
        category: fields.category,
        startingBid: Number(fields.startingBid),
        currentBid: Number(fields.startingBid),
        endTime: new Date(Date.now() + Number(fields.duration) * 24 * 60 * 60 * 1000).toISOString(),
        created: new Date().toISOString(),
        sellerAddress: fields.sellerAddress,
        sellerName: '', // Can be updated later
        sellerVerified: false, // Can be updated later
        bids: [] // Will be updated as bids come in
      }
    };

    // 3. Upload metadata to Pinata with proper metadata structure
    const { IpfsHash: metadataCID } = await pinata.pinJSONToIPFS(metadata, {
      pinataMetadata: {
        name: 'auction-metadata.json',
        keyvalues: {
          type: 'auction',
          status: 'active'
        }
      }
    });

    // 4. Return the data needed for client-side blockchain interaction
    return NextResponse.json({
      success: true,
      imageCID,
      metadataCID,
    });
  } catch (err) {
    console.error("Error in auction creation:", err);
    return NextResponse.json(
      {
        error: "Failed to upload auction data",
        details: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}