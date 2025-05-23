import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract, Signer } from "ethers";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("Auction", function () {
  let auction: Contract;
  let auctionFactory: Contract;
  let owner: Signer;
  let seller: Signer;
  let bidder1: Signer;
  let bidder2: Signer;
  let bidder3: Signer;
  let ownerAddress: string;
  let sellerAddress: string;
  let bidder1Address: string;
  let bidder2Address: string;
  let bidder3Address: string;

  const title = "Test Auction";
  const ipfsImageHash = "QmTest123";
  const metadataCID = "QmMetadata123";
  const startingBid = ethers.parseEther("1.0");
  const duration = 7 * 24 * 60 * 60; // 7 days in seconds

  beforeEach(async function () {
    [owner, seller, bidder1, bidder2, bidder3] = await ethers.getSigners();
    ownerAddress = await owner.getAddress();
    sellerAddress = await seller.getAddress();
    bidder1Address = await bidder1.getAddress();
    bidder2Address = await bidder2.getAddress();
    bidder3Address = await bidder3.getAddress();

    // Deploy AuctionFactory
    const AuctionFactory = await ethers.getContractFactory("AuctionFactory");
    auctionFactory = await AuctionFactory.deploy();

    // Create new auction
    const tx = await auctionFactory.connect(seller).createAuction(
      title,
      ipfsImageHash,
      startingBid,
      duration
    );

    const receipt = await tx.wait();
    const event = receipt?.logs.find(
      (log: any) => log.fragment?.name === 'AuctionCreated'
    );
    const auctionAddress = event?.args[0];

    auction = await ethers.getContractAt("Auction", auctionAddress);
  });

  describe("Deployment", function () {
    it("Should set the correct initial values", async function () {
      expect(await auction.seller()).to.equal(sellerAddress);
      expect(await auction.title()).to.equal(title);
      expect(await auction.ipfsImageHash()).to.equal(ipfsImageHash);
      expect(await auction.startingBid()).to.equal(startingBid);
      expect(await auction.ended()).to.be.false;
      expect(await auction.highestBidder()).to.equal(ethers.ZeroAddress);
      expect(await auction.highestBid()).to.equal(0);
    });

    it("Should set the correct end time", async function () {
      const blockTimestamp = await time.latest();
      const endTime = await auction.endTime();
      expect(endTime).to.equal(blockTimestamp + duration);
    });
  });

  describe("Metadata Management", function () {
    it("Should allow seller to set metadata", async function () {
      await expect(auction.connect(seller).setMetadata(metadataCID))
        .to.emit(auction, "MetadataUpdated")
        .withArgs(metadataCID);
      
      expect(await auction.metadataCID()).to.equal(metadataCID);
    });

    it("Should not allow non-seller to set metadata", async function () {
      await expect(auction.connect(bidder1).setMetadata(metadataCID))
        .to.be.revertedWith("Only seller");
    });

    it("Should not allow empty metadata CID", async function () {
      await expect(auction.connect(seller).setMetadata(""))
        .to.be.revertedWith("Invalid metadata CID");
    });
  });

  describe("Ownership Management", function () {
    it("Should allow seller to transfer ownership", async function () {
      await expect(auction.connect(seller).transferOwnership(bidder1Address))
        .to.emit(auction, "OwnershipTransferred")
        .withArgs(sellerAddress, bidder1Address);
    });

    it("Should not allow non-seller to transfer ownership", async function () {
      await expect(auction.connect(bidder1).transferOwnership(bidder2Address))
        .to.be.revertedWith("Only seller");
    });

    it("Should not allow transfer to zero address", async function () {
      await expect(auction.connect(seller).transferOwnership(ethers.ZeroAddress))
        .to.be.revertedWith("Invalid new owner");
    });

    it("Should not allow transfer to current owner", async function () {
      await expect(auction.connect(seller).transferOwnership(sellerAddress))
        .to.be.revertedWith("Already owner");
    });
  });

  describe("Bidding", function () {
    it("Should accept valid bid", async function () {
      const bidAmount = ethers.parseEther("1.5");
      await expect(auction.connect(bidder1).bid({ value: bidAmount }))
        .to.emit(auction, "NewHighestBid")
        .withArgs(bidder1Address, bidAmount);

      expect(await auction.highestBidder()).to.equal(bidder1Address);
      expect(await auction.highestBid()).to.equal(bidAmount);
    });

    it("Should not accept bid below starting bid", async function () {
      const bidAmount = ethers.parseEther("0.5");
      await expect(auction.connect(bidder1).bid({ value: bidAmount }))
        .to.be.revertedWith("Below starting bid");
    });

    it("Should not accept bid from seller", async function () {
      const bidAmount = ethers.parseEther("2.0");
      await expect(auction.connect(seller).bid({ value: bidAmount }))
        .to.be.revertedWith("Seller cannot bid");
    });

    it("Should not accept bid after auction end", async function () {
      await time.increase(duration + 1);
      const bidAmount = ethers.parseEther("2.0");
      await expect(auction.connect(bidder1).bid({ value: bidAmount }))
        .to.be.revertedWith("Auction ended");
    });

    it("Should track multiple bids correctly", async function () {
      const bid1 = ethers.parseEther("1.5");
      const bid2 = ethers.parseEther("2.0");
      const bid3 = ethers.parseEther("2.5");

      await auction.connect(bidder1).bid({ value: bid1 });
      await auction.connect(bidder2).bid({ value: bid2 });
      await auction.connect(bidder3).bid({ value: bid3 });

      expect(await auction.highestBidder()).to.equal(bidder3Address);
      expect(await auction.highestBid()).to.equal(bid3);
      expect(await auction.bids(bidder1Address)).to.equal(bid1);
      expect(await auction.bids(bidder2Address)).to.equal(bid2);
      expect(await auction.bids(bidder3Address)).to.equal(bid3);
    });
  });

  describe("Auction Ending", function () {
    it("Should allow seller to end auction after duration", async function () {
      await time.increase(duration + 1);
      await expect(auction.connect(seller).endAuction())
        .to.emit(auction, "AuctionEnded")
        .withArgs(ethers.ZeroAddress, 0);

      expect(await auction.ended()).to.be.true;
    });

    it("Should not allow non-seller to end auction", async function () {
      await time.increase(duration + 1);
      await expect(auction.connect(bidder1).endAuction())
        .to.be.revertedWith("Only seller");
    });

    it("Should not allow ending auction before duration", async function () {
      await expect(auction.connect(seller).endAuction())
        .to.be.revertedWith("Auction not ended");
    });

    it("Should not allow ending auction twice", async function () {
      await time.increase(duration + 1);
      await auction.connect(seller).endAuction();
      await expect(auction.connect(seller).endAuction())
        .to.be.revertedWith("Already ended");
    });
  });

  describe("Withdrawals", function () {
    it("Should allow bidders to withdraw after auction end", async function () {
      const bidAmount = ethers.parseEther("1.5");
      await auction.connect(bidder1).bid({ value: bidAmount });
      await auction.connect(bidder2).bid({ value: ethers.parseEther("2.0") });

      await time.increase(duration + 1);
      await auction.connect(seller).endAuction();

      const initialBalance = await ethers.provider.getBalance(bidder1Address);
      await auction.connect(bidder1).withdraw();
      const finalBalance = await ethers.provider.getBalance(bidder1Address);

      expect(finalBalance - initialBalance).to.equal(bidAmount);
    });

    it("Should not allow withdrawal before auction end", async function () {
      await auction.connect(bidder1).bid({ value: ethers.parseEther("1.5") });
      await expect(auction.connect(bidder1).withdraw())
        .to.be.revertedWith("Auction not ended");
    });

    it("Should not allow withdrawal with no funds", async function () {
      await time.increase(duration + 1);
      await auction.connect(seller).endAuction();
      await expect(auction.connect(bidder1).withdraw())
        .to.be.revertedWith("No funds");
    });
  });

  describe("Auction Details", function () {
    it("Should return correct auction details", async function () {
      const details = await auction.getAuctionDetails();
      expect(details[0]).to.equal(sellerAddress); // seller
      expect(details[1]).to.equal(title); // title
      expect(details[2]).to.equal(ipfsImageHash); // ipfsImageHash
      expect(details[3]).to.equal(""); // metadataCID (empty initially)
      expect(details[4]).to.equal(startingBid); // startingBid
      expect(details[5]).to.equal(await auction.endTime()); // endTime
      expect(details[6]).to.be.false; // ended
      expect(details[7]).to.equal(ethers.ZeroAddress); // highestBidder
      expect(details[8]).to.equal(0); // highestBid
    });

    it("Should return correct bidder count", async function () {
      expect(await auction.getBiddersCount()).to.equal(0);
      await auction.connect(bidder1).bid({ value: ethers.parseEther("1.5") });
      expect(await auction.getBiddersCount()).to.equal(1);
      await auction.connect(bidder2).bid({ value: ethers.parseEther("2.0") });
      expect(await auction.getBiddersCount()).to.equal(2);
    });
  });
}); 