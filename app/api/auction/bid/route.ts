import { NextResponse } from 'next/server'
import { z } from 'zod'
import { placeBidOnAvalanche } from '@/lib/avalanche-sdk'

// Define the expected body format
const BidSchema = z.object({
  auctionId: z.string(),
  bidderAddress: z.string(),
  bidAmount: z.string()
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validatedData = BidSchema.parse(body)

    const result = await placeBidOnAvalanche({
      auctionId: validatedData.auctionId,
      bidderAddress: validatedData.bidderAddress,
      bidAmount: validatedData.bidAmount
    })

    return NextResponse.json({
      success: true,
      message: 'Bid placed successfully',
      data: result
    })
  } catch (error) {
    console.error('Error placing bid:', error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to place bid'
      },
      { status: 400 }
    )
  }
}
