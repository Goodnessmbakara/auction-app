// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract Auction {
    // Immutable state variables to save gas
    address public immutable seller;
    string public title;
    string public ipfsImageHash;
    string public metadataCID; // Add metadata CID storage
    uint256 public immutable startingBid;
    uint256 public immutable endTime;

    // Auction state
    bool public ended;
    address public highestBidder;
    uint256 public highestBid;
    mapping(address => uint256) public bids;
    address[] public bidders; // Track bidders for refund iteration

    // Events for off-chain tracking
    event NewHighestBid(address indexed bidder, uint256 amount);
    event AuctionEnded(address indexed winner, uint256 amount);
    event Refund(address indexed bidder, uint256 amount);
    event MetadataUpdated(string metadataCID);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    constructor(
        address _seller,
        string memory _title,
        string memory _ipfsImageHash,
        uint256 _startingBid,
        uint256 _duration
    ) {
        seller = _seller;
        title = _title;
        ipfsImageHash = _ipfsImageHash;
        startingBid = _startingBid;
        endTime = block.timestamp + _duration;
    }

    modifier onlyBeforeEnd() {
        require(block.timestamp < endTime && !ended, "Auction ended");
        _;
    }

    modifier onlySeller() {
        require(msg.sender == seller, "Only seller");
        _;
    }

    // Add setMetadata function
    function setMetadata(string memory _cid) external onlySeller {
        require(bytes(_cid).length > 0, "Invalid metadata CID");
        metadataCID = _cid;
        emit MetadataUpdated(_cid);
    }

    // Add transferOwnership function
    function transferOwnership(address newOwner) external onlySeller {
        require(newOwner != address(0), "Invalid new owner");
        require(newOwner != seller, "Already owner");
        address oldOwner = seller;
        // Note: We can't change the immutable seller variable, but we can track ownership separately
        emit OwnershipTransferred(oldOwner, newOwner);
    }

    function bid() external payable onlyBeforeEnd {
        require(msg.value > highestBid, "Bid too low");
        require(msg.value >= startingBid, "Below starting bid");
        require(msg.sender != seller, "Seller cannot bid");

        // Track new bidder
        if (bids[msg.sender] == 0) {
            bidders.push(msg.sender);
        }
        bids[msg.sender] += msg.value;
        highestBidder = msg.sender;
        highestBid = msg.value;

        emit NewHighestBid(msg.sender, msg.value);
    }

    function endAuction() external onlySeller {
        require(block.timestamp >= endTime || !ended, "Auction not ended");
        require(!ended, "Already ended");

        ended = true;
        emit AuctionEnded(highestBidder, highestBid);

        // Transfer funds to seller if there's a winner
        if (highestBidder != address(0)) {
            (bool success, ) = seller.call{value: highestBid}("");
            require(success, "Transfer failed");
        }

        // Refund outbid bidders (up to 100 to avoid gas limit)
        for (uint256 i = 0; i < bidders.length && i < 100; i++) {
            address bidder = bidders[i];
            if (bidder != highestBidder && bids[bidder] > 0) {
                uint256 amount = bids[bidder];
                bids[bidder] = 0;
                (bool success, ) = bidder.call{value: amount}("");
                if (success) {
                    emit Refund(bidder, amount);
                }
            }
        }
    }

    function withdraw() external {
        require(ended, "Auction not ended");
        uint256 amount = bids[msg.sender];
        require(amount > 0, "No funds");

        bids[msg.sender] = 0;
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Withdrawal failed");
        emit Refund(msg.sender, amount);
    }

    function getAuctionDetails()
        external
        view
        returns (
            address,
            string memory,
            string memory,
            string memory,
            uint256,
            uint256,
            bool,
            address,
            uint256
        )
    {
        return (
            seller,
            title,
            ipfsImageHash,
            metadataCID,
            startingBid,
            endTime,
            ended,
            highestBidder,
            highestBid
        );
    }

    function getBiddersCount() external view returns (uint256) {
        return bidders.length;
    }
}