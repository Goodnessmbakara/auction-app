// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Auction {
    address public owner;
    string public title;
    string public ipfsImageHash;
    uint256 public startingBid;
    uint256 public endTime;
    bool public ended;
    address public highestBidder;
    uint256 public highestBid;
    string public metadataCid;

    event NewHighestBid(address bidder, uint256 amount);

    constructor(
        address _owner,
        string memory _title,
        string memory _ipfsImageHash,
        uint256 _startingBid,
        uint256 _duration
    ) {
        owner = _owner;
        title = _title;
        ipfsImageHash = _ipfsImageHash;
        startingBid = _startingBid;
        endTime = block.timestamp + _duration;
        ended = false;
        highestBidder = address(0);
        highestBid = 0;
    }

    function bid() external payable {
        require(block.timestamp <= endTime, "Auction has ended");
        require(!ended, "Auction has ended");
        require(msg.value > highestBid, "Bid must be higher than current highest bid");

        if (highestBidder != address(0)) {
            // Return the previous highest bid
            (bool success, ) = highestBidder.call{value: highestBid}("");
            require(success, "Transfer failed");
        }

        highestBidder = msg.sender;
        highestBid = msg.value;

        emit NewHighestBid(msg.sender, msg.value);
    }

    function endAuction() external {
        require(msg.sender == owner, "Only owner can end auction");
        require(block.timestamp >= endTime, "Auction has not ended");
        require(!ended, "Auction already ended");

        ended = true;
    }

    function withdraw() external {
        require(msg.sender == owner, "Only owner can withdraw");
        require(block.timestamp >= endTime, "Auction has not ended");
        require(!ended, "Auction already ended");
        require(highestBidder != address(0), "No bids placed");

        ended = true;
        uint256 amount = highestBid;
        highestBid = 0;

        (bool success, ) = owner.call{value: amount}("");
        require(success, "Transfer failed");
    }

    function setMetadata(string memory _cid) external {
        require(msg.sender == owner, "Only owner can set metadata");
        metadataCid = _cid;
    }

    function transferOwnership(address newOwner) external {
        require(msg.sender == owner, "Only owner can transfer ownership");
        owner = newOwner;
    }

    function getAuctionDetails() external view returns (
        address _owner,
        string memory _title,
        string memory _ipfsImageHash,
        uint256 _startingBid,
        uint256 _endTime,
        bool _ended,
        address _highestBidder,
        uint256 _highestBid
    ) {
        return (
            owner,
            title,
            ipfsImageHash,
            startingBid,
            endTime,
            ended,
            highestBidder,
            highestBid
        );
    }

    // Function to receive AVAX
    receive() external payable {
        // Accept AVAX transfers
    }

    // Fallback function to handle any other calls
    fallback() external payable {
        // Accept AVAX transfers
    }
} 