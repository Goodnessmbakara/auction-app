import { NextRequest, NextResponse } from "next/server";
import formidable from "formidable";
import fs from "fs";
import { create } from "ipfs-http-client";
import { Readable } from "stream";

export const config = { api: { bodyParser: false } };

const ipfs = create({ url: "https://ipfs.io" });

async function parseForm(req: NextRequest): Promise<{ fields: any; files: any }> {
  return new Promise((resolve, reject) => {
    const form = formidable({ keepExtensions: true });
    form.parse(req as any, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
}

async function uploadToIPFS(file: formidable.File): Promise<string> {
  const stream = fs.createReadStream(file.filepath);
  const result = await ipfs.add(Readable.from(stream));
  return result.path;
}

export async function POST(req: NextRequest) {
  try {
    const { fields, files } = await parseForm(req);
    const imageCID = await uploadToIPFS(files.image[0]);

    // Return IPFS hash to frontend, so it can be used in a transaction
    return NextResponse.json({ success: true, imageCID });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
  }
}
