import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function createBidMetadata(data: {
  auctionId: string
  bidderAddress: string
  bidAmount: string
  txHash: string
  ipfsHash: string
  timestamp: string
}) {
  return prisma.bid.create({
    data: {
      auctionId: data.auctionId,
      bidderAddress: data.bidderAddress,
      bidAmount: data.bidAmount,
      txHash: data.txHash,
      ipfsHash: data.ipfsHash,
      timestamp: new Date(data.timestamp),
    },
  })
}
