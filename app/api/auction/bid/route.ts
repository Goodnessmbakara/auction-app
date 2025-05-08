import { NextResponse } from 'next/server'
import { placeBidOnLisk } from '@/lib/lisk-sdk' // your Lisk blockchain logic
import { z } from 'zod'

// Define the expected body format
const BidSchema = z.object({
  auctionId: z.string(),
  bidderAddress: z.string(),
  bidAmount: z.string(), // use string to avoid precision loss in JS numbers
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { auctionId, bidderAddress, bidAmount } = BidSchema.parse(body)

    // Optional: Save to DB or validate auction state here
    // await saveBidToDatabase(auctionId, bidderAddress, bidAmount)

    // Call Lisk blockchain function to place the bid
    const txResult = await placeBidOnLisk({ auctionId, bidderAddress, bidAmount })

    return NextResponse.json({
      success: true,
      message: 'Bid placed successfully on Lisk',
      data: txResult,
    })
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message ?? 'Unknown error' },
      { status: 400 }
    )
  }
}
