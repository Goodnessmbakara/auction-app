import { buildModule } from "@nomicfoundation/ignition-core";

export default buildModule("AuctionModule", (m) => {
  // Don't pass duration here since it's dynamic — frontend should handle deployment with args
  const auction = m.contract("Auction");

  return { auction };
});
