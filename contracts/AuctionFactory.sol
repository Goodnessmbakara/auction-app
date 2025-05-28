// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract AuctionFactory {
    event AuctionCreated(address auction, address seller);
    event TransferDebug(address from, address to, uint256 amount, bool success);
    event ContractDebug(address auction, uint256 balance);

    // Mapping to track auctions by seller
    mapping(address => address[]) public sellerAuctions;
    
    // Mapping to track if an address is a valid auction
    mapping(address => bool) public isAuction;

    function createAuction(
        string memory _title,
        string memory _ipfsImageHash,
        uint256 _startingBid,
        uint256 _duration
    ) external payable returns (address) {
        require(msg.value == _startingBid, "Starting bid must match msg.value");
        require(_duration > 0, "Duration must be greater than 0");
        require(_startingBid > 0, "Starting bid must be greater than 0");

        // Create new auction contract
        Auction auction = new Auction(
            msg.sender,
            _title,
            _ipfsImageHash,
            _startingBid,
            _duration
        );

        address auctionAddress = address(auction);
        emit ContractDebug(auctionAddress, address(this).balance);

        // Transfer the starting bid to the auction contract
        (bool success, ) = auctionAddress.call{value: _startingBid}("");
        emit TransferDebug(address(this), auctionAddress, _startingBid, success);
        require(success, "Failed to transfer starting bid");

        // Track the auction
        sellerAuctions[msg.sender].push(auctionAddress);
        isAuction[auctionAddress] = true;

        // Emit event
        emit AuctionCreated(auctionAddress, msg.sender);

        return auctionAddress;
    }

    // Function to get all auctions created by a seller
    function getSellerAuctions(address seller) external view returns (address[] memory) {
        return sellerAuctions[seller];
    }

    // Function to get the number of auctions created by a seller
    function getSellerAuctionCount(address seller) external view returns (uint256) {
        return sellerAuctions[seller].length;
    }

    // Function to check if an address is a valid auction
    function isValidAuction(address auctionAddress) external view returns (bool) {
        return isAuction[auctionAddress];
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