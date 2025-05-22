import { ethers } from 'ethers';
import AuctionABI from '../smart-contracts/artifacts/contracts/AuctionFactory.sol/AuctionFactory.json';

export async function createAuctionContract(
  title: string,
  metadataCID: string,
  startingBid: number,
  duration: number,
  ethereum: any
): Promise<string> {
  try {
    const provider = new ethers.BrowserProvider(ethereum);
    const signer = await provider.getSigner();
    
    // Create contract instance
    const auctionFactory = new ethers.ContractFactory(
      AuctionABI.abi,
      AuctionABI.bytecode,
      signer
    );

    // Deploy contract
    const auction = await auctionFactory.deploy(
      title,
      metadataCID,
      ethers.parseEther(startingBid.toString()),
      duration * 24 * 60 * 60 // Convert days to seconds
    );

    await auction.waitForDeployment();
    return await auction.getAddress();
  } catch (error) {
    console.error('Error creating auction contract:', error);
    throw new Error('Failed to create auction contract');
  }
} 