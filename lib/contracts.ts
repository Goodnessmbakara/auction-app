import { ethers } from 'ethers';
import AuctionFactoryABI from '../smart-contracts/artifacts/contracts/AuctionFactory.sol/AuctionFactory.json';

// Make sure this matches your deployed contract address
const AUCTION_FACTORY_ADDRESS = process.env.AUCTION_FACTORY_ADDRESS;

export async function createAuctionContract(
  title: string,
  metadataCID: string,
  startingBid: number,
  duration: number,
  ethereum: any
): Promise<string> {
  try {
    if (!AUCTION_FACTORY_ADDRESS) {
      throw new Error('Auction Factory contract address not configured');
    }

    // Create provider and signer
    const provider = new ethers.BrowserProvider(ethereum);
    const signer = await provider.getSigner();

    // Create contract instance
    const auctionFactory = new ethers.Contract(
      AUCTION_FACTORY_ADDRESS,
      AuctionFactoryABI.abi,
      signer
    );

    // Deploy contract
    const tx = await auctionFactory.createAuction(
      title,
      metadataCID,
      ethers.parseEther(startingBid.toString()),
      duration * 24 * 60 * 60 // Convert days to seconds
    );

    // Wait for transaction to be mined
    const receipt = await tx.wait();

    // Get the AuctionCreated event
    const event = receipt.logs.find(
      (log: any) => log.fragment?.name === 'AuctionCreated'
    );

    if (!event) {
      throw new Error('AuctionCreated event not found');
    }

    // Return the new auction address
    return event.args[0];
  } catch (error) {
    console.error('Error creating auction contract:', error);
    throw error;
  }
} 