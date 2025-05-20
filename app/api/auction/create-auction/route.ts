import { NextResponse } from "next/server";
import { Readable } from "stream";
import pinataSDK, { PinataPinOptions, PinataMetadata } from '@pinata/sdk';

// Validate environment variables
if (!process.env.PINATA_API_KEY || !process.env.PINATA_SECRET_API_KEY) {
  throw new Error("Pinata credentials are not configured");
}

const pinata = new pinataSDK(
  process.env.PINATA_API_KEY,
  process.env.PINATA_SECRET_API_KEY
);

interface AuctionFormFields {
  title: string;
  description: string;
  category: string;
  startingBid: string;
  duration: string;
  sellerAddress: string;
}

interface AuctionMetadataContent {
  name: string;
  description: string;
  image: string;
  attributes: {
    category: string;
    startingBid: number;
    duration: number;
    sellerAddress: string;
    createdAt: string;
    endTime: string;
  };
}

export const config = {
  api: {
    bodyParser: false,
  },
};

async function parseFormData(request: Request) {
  const formData = await request.formData();
  const entries = Object.fromEntries(formData.entries());
  
  const fields: Partial<AuctionFormFields> = {};
  const files: Record<string, File> = {};
  
  for (const [key, value] of Object.entries(entries)) {
    if (value instanceof File) {
      files[key] = value;
    } else {
      fields[key as keyof AuctionFormFields] = value.toString();
    }
  }
  
  if (!fields.title || !fields.description || !fields.category || 
      !fields.startingBid || !fields.duration || !fields.sellerAddress) {
    throw new Error("Missing required fields");
  }
  
  return { 
    fields: fields as Required<AuctionFormFields>, 
    files 
  };
}

async function uploadToPinata(file: File, sellerAddress: string): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const readable = Readable.from(buffer);
  
  const metadata: PinataMetadata = {
    name: file.name || 'auction-image',
    keyvalues: {
      type: 'auction',
      seller: sellerAddress,
      uploadedAt: new Date().toISOString(),
      status: 'active'
    }
  };

  const options: PinataPinOptions = {
    pinataMetadata: metadata,
    pinataOptions: {
      cidVersion: 1
    }
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

    const startingBid = parseFloat(fields.startingBid);
    const duration = parseInt(fields.duration);
    
    if (isNaN(startingBid) || startingBid <= 0) {
      return NextResponse.json(
        { error: "Invalid starting bid amount (must be greater than 0)" },
        { status: 400 }
      );
    }
    
    if (isNaN(duration) || duration < 1 || duration > 30) {
      return NextResponse.json(
        { error: "Invalid duration (must be between 1-30 days)" },
        { status: 400 }
      );
    }

    const imageCID = await uploadToPinata(files.image, fields.sellerAddress);
    const endTime = new Date();
    endTime.setDate(endTime.getDate() + duration);

    const metadataContent: AuctionMetadataContent = {
      name: fields.title,
      description: fields.description,
      image: `ipfs://${imageCID}`,
      attributes: {
        category: fields.category,
        startingBid: startingBid,
        duration: duration,
        sellerAddress: fields.sellerAddress,
        createdAt: new Date().toISOString(),
        endTime: endTime.toISOString()
      }
    };

    const metadataOptions: PinataPinOptions = {
      pinataMetadata: {
        name: `${fields.title}-metadata`,
        keyvalues: {
          type: 'auction-metadata',
          auctionId: imageCID,
          seller: fields.sellerAddress,
          category: fields.category,
          status: 'active',
          startTime: new Date().toISOString(),
          endTime: endTime.toISOString()
        }
      },
      pinataOptions: {
        cidVersion: 1
      }
    };

    const { IpfsHash: metadataCID } = await pinata.pinJSONToIPFS(metadataContent, metadataOptions);

    return NextResponse.json({
      success: true,
      data: {
        id: metadataCID,
        imageCID,
        metadataCID,
        title: fields.title,
        description: fields.description,
        category: fields.category,
        startingBid: startingBid,
        currentBid: startingBid, // Initial bid equals starting bid
        duration: duration,
        sellerAddress: fields.sellerAddress,
        createdAt: metadataContent.attributes.createdAt,
        endTime: metadataContent.attributes.endTime,
        imageUrl: `https://gateway.pinata.cloud/ipfs/${imageCID}`,
        metadataUrl: `https://gateway.pinata.cloud/ipfs/${metadataCID}`,
        status: 'active'
      }
    }, { status: 201 });

  } catch (err) {
    console.error("Auction creation error:", err);
    const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
    
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create auction",
        details: errorMessage,
      },
      { 
        status: errorMessage.includes("Missing") ? 400 : 500 
      }
    );
  }
}