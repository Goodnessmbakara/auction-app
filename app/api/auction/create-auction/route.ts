import { NextResponse } from "next/server";
import { Readable } from "stream";
import pinataSDK from '@pinata/sdk';

const pinata = new pinataSDK(
  process.env.PINATA_API_KEY!,
  process.env.PINATA_SECRET_API_KEY!
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

    const imageCID = await uploadToPinata(files.image);

    const metadata = {
      name: fields.title || 'Untitled Auction',
      description: fields.description || '',
      image: `ipfs://${imageCID}`,
      attributes: {
        category: fields.category,
        startingBid: fields.startingBid,
        duration: fields.duration,
        sellerAddress: fields.sellerAddress,
      }
    };

    const { IpfsHash: metadataCID } = await pinata.pinJSONToIPFS(metadata);

    return NextResponse.json({
      success: true,
      imageCID,
      metadataCID,
      metadata: {
        ...fields,
        imageCID,
        metadataCID,
      },
    });
  } catch (err) {
    console.error("Error in auction creation:", err);
    return NextResponse.json(
      {
        error: "Failed to create auction",
        details: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}