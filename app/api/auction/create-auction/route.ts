import { NextRequest, NextResponse } from "next/server";
import formidable from "formidable";
import fs from "fs";
import { create } from "ipfs-http-client";
import { Buffer } from "buffer";

// Initialize IPFS client
const ipfs = create({
  url: "http://localhost:5001/api/v0",
  headers: {
    authorization: "Basic " + Buffer.from("ipfs:ipfs").toString("base64"),
  },
});

export const config = { api: { bodyParser: false } };

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

async function uploadToIPFS(file: formidable.File): Promise<string> {
  console.log("[CreateAuctionAPI] Starting IPFS upload for file:", {
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

    // Read file as buffer
    const fileBuffer = fs.readFileSync(file.filepath);
    console.log("[CreateAuctionAPI] File read as buffer, size:", fileBuffer.length);

    console.log("[CreateAuctionAPI] Starting IPFS add operation");
    const result = await ipfs.add(fileBuffer);
    console.log("[CreateAuctionAPI] IPFS upload successful. CID:", result.cid.toString());

    // Clean up the temporary file
    try {
      fs.unlinkSync(file.filepath);
      console.log("[CreateAuctionAPI] Temporary file cleaned up");
    } catch (cleanupError) {
      console.warn("[CreateAuctionAPI] Failed to clean up temporary file:", cleanupError);
    }

    return result.cid.toString();
  } catch (error) {
    console.error("[CreateAuctionAPI] IPFS upload failed:", error);
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

    console.log("[CreateAuctionAPI] Uploading image to IPFS");
    const imageCID = await uploadToIPFS(files.image[0]);

    console.log("[CreateAuctionAPI] Auction creation successful", {
      imageCID,
      sellerAddress: fields.sellerAddress,
      title: fields.title,
      category: fields.category,
      startingBid: fields.startingBid,
      duration: fields.duration,
    });

    return NextResponse.json({
      success: true,
      imageCID,
      metadata: {
        title: fields.title,
        description: fields.description,
        category: fields.category,
        startingBid: fields.startingBid,
        duration: fields.duration,
        sellerAddress: fields.sellerAddress,
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