import axios from 'axios'

export async function storeBidToIPFS(bidData: any, auctionId: string) {
  const fileName = `bid-${auctionId}-${Date.now()}.json`

  const res = await axios.post(
    'https://api.pinata.cloud/pinning/pinJSONToIPFS',
    {
      pinataMetadata: {
        name: fileName,
      },
      pinataContent: bidData,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.PINATA_JWT}`, // store your JWT securely in .env
      },
    }
  )

  return res.data.IpfsHash // or full URL: `https://gateway.pinata.cloud/ipfs/${res.data.IpfsHash}`
}
