import { ethers } from 'ethers';
import AuctionFactory from '../smart-contracts/artifacts/contracts/AuctionFactory.sol/AuctionFactory.json';

// Initialize provider and contract
const provider = new ethers.JsonRpcProvider(process.env.AVALANCHE_RPC_URL);
const factoryContract = new ethers.Contract(
  process.env.AUCTION_FACTORY_ADDRESS!,
  AuctionFactory.abi,
  provider
);

export async function createAuctionContract(
  title: string,
  ipfsImageHash: string,
  startingBid: number,
  duration: number,
  ethereum: any
) {
  try {
    // Create a provider and signer from the client's wallet
    const provider = new ethers.BrowserProvider(ethereum);
    const signer = await provider.getSigner();
    
    // Connect the contract with the signer
    const contractWithSigner = factoryContract.connect(signer);
    
    // Convert starting bid to wei
    const startingBidWei = ethers.parseEther(startingBid.toString());
    
    // Convert duration to seconds
    const durationSeconds = duration * 24 * 60 * 60;
    
    // Create the auction
    const tx = await contractWithSigner.createAuction(
      title,
      ipfsImageHash,
      startingBidWei,
      durationSeconds
    );
    
    // Wait for transaction to be mined
    const receipt = await tx.wait();
    
    // Get the AuctionCreated event
    const event = receipt?.logs.find(
      (log: any) => log.fragment?.name === 'AuctionCreated'
    );
    
    if (!event) {
      throw new Error('AuctionCreated event not found');
    }
    
    // Return the auction contract address
    return event.args[0];
  } catch (error) {
    console.error('Error creating auction contract:', error);
    throw error;
  }
}

export async function getAuctionContract(address: string) {
  return new ethers.Contract(
    address,
    AuctionFactory.abi,
    provider
  );
} 