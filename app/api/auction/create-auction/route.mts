import { NextRequest, NextResponse } from "next/server";
import formidable from "formidable";
import fs from "fs";
import pinataSDK from '@pinata/sdk';

// Initialize Pinata client
const pinata = new pinataSDK(
  process.env.PINATA_API_KEY!,
  process.env.PINATA_SECRET_API_KEY!
);

export const config = { 
  api: { 
    bodyParser: false 
  } 
};

async function parseForm(req: NextRequest): Promise<{ fields: any; files: any }> {
  console.log("[CreateAuctionAPI] Starting form parsing");
  return new Promise((resolve, reject) => {
    const form = formidable({
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB max file size
    });

    form.parse(req as any, (err, fields, files) => {
      if (err) {
        console.error("[CreateAuctionAPI] Form parsing error:", err);
        reject(err);
      } else {
        console.log("[CreateAuctionAPI] Form parsed successfully:", {
          fields: {
            ...fields,
            image: "FILE_DATA", // Don't log actual file data
          },
          files: {
            image: files.image
              ? {
                  name: files.image[0].originalFilename,
                  size: files.image[0].size,
                  type: files.image[0].mimetype,
                }
              : null,
          },
        });
        resolve({ fields, files });
      }
    });
  });
}

async function uploadToPinata(file: formidable.File): Promise<string> {
  console.log("[CreateAuctionAPI] Starting Pinata upload for file:", {
    name: file.originalFilename,
    size: file.size,
    type: file.mimetype,
    filepath: file.filepath,
  });

  try {
    // Verify file exists and is readable
    if (!fs.existsSync(file.filepath)) {
      throw new Error(`File not found at path: ${file.filepath}`);
    }

    const fileStats = fs.statSync(file.filepath);
    console.log("[CreateAuctionAPI] File stats:", {
      size: fileStats.size,
      isFile: fileStats.isFile(),
      permissions: fileStats.mode,
    });

    // Create readable stream from file
    const fileStream = fs.createReadStream(file.filepath);
    const options = {
      pinataMetadata: {
        name: file.originalFilename || 'auction-image',
      },
    };

    console.log("[CreateAuctionAPI] Starting Pinata upload");
    const { IpfsHash } = await pinata.pinFileToIPFS(fileStream, options);
    console.log("[CreateAuctionAPI] Pinata upload successful. CID:", IpfsHash);

    // Clean up the temporary file
    try {
      fs.unlinkSync(file.filepath);
      console.log("[CreateAuctionAPI] Temporary file cleaned up");
    } catch (cleanupError) {
      console.warn("[CreateAuctionAPI] Failed to clean up temporary file:", cleanupError);
    }

    return IpfsHash;
  } catch (error) {
    console.error("[CreateAuctionAPI] Pinata upload failed:", error);
    // Clean up the temporary file even if upload fails
    try {
      if (fs.existsSync(file.filepath)) {
        fs.unlinkSync(file.filepath);
        console.log("[CreateAuctionAPI] Temporary file cleaned up after error");
      }
    } catch (cleanupError) {
      console.warn("[CreateAuctionAPI] Failed to clean up temporary file after error:", cleanupError);
    }
    throw error;
  }
}

export async function POST(req: NextRequest) {
  console.log("[CreateAuctionAPI] Received auction creation request");

  try {
    console.log("[CreateAuctionAPI] Parsing form data");
    const { fields, files } = await parseForm(req);

    if (!files.image?.[0]) {
      console.error("[CreateAuctionAPI] No image file provided");
      return NextResponse.json(
        { error: "No image file provided" },
        { status: 400 }
      );
    }

    console.log("[CreateAuctionAPI] Uploading image to Pinata");
    const imageCID = await uploadToPinata(files.image[0]);

    // Create and pin metadata
    const metadata = {
      name: fields.title?.[0] || 'Untitled Auction',
      description: fields.description?.[0] || '',
      image: `ipfs://${imageCID}`,
      attributes: {
        category: fields.category?.[0],
        startingBid: fields.startingBid?.[0],
        duration: fields.duration?.[0],
        sellerAddress: fields.sellerAddress?.[0],
      }
    };

    const { IpfsHash: metadataCID } = await pinata.pinJSONToIPFS(metadata);
    console.log("[CreateAuctionAPI] Metadata pinned to IPFS:", metadataCID);

    console.log("[CreateAuctionAPI] Auction creation successful", {
      imageCID,
      metadataCID,
      sellerAddress: fields.sellerAddress,
      title: fields.title,
      category: fields.category,
      startingBid: fields.startingBid,
      duration: fields.duration,
    });

    return NextResponse.json({
      success: true,
      imageCID,
      metadataCID,
      metadata: {
        title: fields.title?.[0],
        description: fields.description?.[0],
        category: fields.category?.[0],
        startingBid: fields.startingBid?.[0],
        duration: fields.duration?.[0],
        sellerAddress: fields.sellerAddress?.[0],
      },
    });
  } catch (err) {
    console.error("[CreateAuctionAPI] Error in auction creation:", err);
    return NextResponse.json(
      {
        error: "Failed to create auction",
        details: err instanceof Error ? err.message : "Unknown error",
        stack: process.env.NODE_ENV === "development" ? (err instanceof Error ? err.stack : undefined) : undefined,
      },
      { status: 500 }
    );
  }
}