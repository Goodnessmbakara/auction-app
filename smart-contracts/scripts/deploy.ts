import { ethers } from "hardhat";

async function main() {
  console.log("Deploying AuctionFactory...");

  // Get the signer
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.provider?.getBalance(deployer.address))?.toString());

  // Get the contract factory
  const AuctionFactory = await ethers.getContractFactory("AuctionFactory");

  // Deploy the contract
  const auctionFactory = await AuctionFactory.deploy();
  console.log("Waiting for deployment transaction...");
  await auctionFactory.waitForDeployment();

  const address = await auctionFactory.getAddress();
  console.log(`AuctionFactory deployed to: ${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});