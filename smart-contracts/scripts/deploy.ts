import { ethers } from "hardhat";

async function main() {
  console.log("Deploying AuctionFactory...");
  const AuctionFactory = await ethers.getContractFactory("AuctionFactory");
  const auctionFactory = await AuctionFactory.deploy();
  await auctionFactory.waitForDeployment();

  const address = await auctionFactory.getAddress();
  console.log(`AuctionFactory deployed to: ${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});