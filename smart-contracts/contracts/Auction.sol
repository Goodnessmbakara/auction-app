// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Auction {
    address public owner;
    uint256 public startTime;
    uint256 public duration;

    address public highestBidder;
    uint256 public highestBid;

    bool public ended;

    event AuctionStarted(uint256 startTime, uint256 duration);
    event BidPlaced(address bidder, uint256 amount);
    event AuctionEnded(address winner, uint256 amount);

    constructor(uint256 _duration) {
        owner = msg.sender;
        startTime = block.timestamp;
        duration = _duration;
        emit AuctionStarted(startTime, duration);
    }

    function placeBid() external payable {
        require(block.timestamp < startTime + duration, "Auction ended");
        require(msg.value > highestBid, "Bid too low");

        // Refund the previous highest bidder
        if (highestBidder != address(0)) {
            payable(highestBidder).transfer(highestBid);
        }

        highestBidder = msg.sender;
        highestBid = msg.value;

        emit BidPlaced(msg.sender, msg.value);
    }

    function endAuction() external {
        require(block.timestamp >= startTime + duration, "Auction not yet ended");
        require(!ended, "Auction already ended");

        ended = true;
        payable(owner).transfer(highestBid);
        emit AuctionEnded(highestBidder, highestBid);
    }
}
