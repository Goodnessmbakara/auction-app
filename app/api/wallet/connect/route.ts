// app/api/wallet/connect/route.ts

import { NextResponse } from 'next/server'
import { connectWalletWithPassphrase } from "@/lib/lisk-sdk"

export async function POST(req: Request) {
  try {
    const { passphrase } = await req.json()

    // Use the server-side Lisk SDK function to get the address and public key
    const wallet = connectWalletWithPassphrase(passphrase)

    return NextResponse.json(wallet)
  } catch (error) {
    console.error("Error connecting wallet:", error)
    return NextResponse.json({ error: "Failed to connect wallet" }, { status: 500 })
  }
}
