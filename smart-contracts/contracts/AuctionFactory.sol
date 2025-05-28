// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "./Auction.sol";

contract AuctionFactory {
    // Event emitted when a new auction is created
    event AuctionCreated(address indexed auction, address indexed seller);
    // Add new event for value logging
    event ValueDetails(uint256 msgValue, uint256 startingBid);

    // Creates a new Auction contract and returns its address
    function createAuction(
        string memory _title,
        string memory _ipfsImageHash,
        uint256 _startingBid,
        uint256 _duration
    ) external payable returns (address) {
        // Emit the value details before the require check
        emit ValueDetails(msg.value, _startingBid);
        
        require(msg.value == _startingBid, "Incorrect starting bid amount");
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(bytes(_ipfsImageHash).length > 0, "IPFS hash cannot be empty");
        require(_startingBid > 0, "Starting bid must be greater than 0");
        require(_duration > 0, "Duration must be greater than 0");
        require(_duration <= 30 days, "Duration cannot exceed 30 days");
        
        Auction auction = new Auction(
            msg.sender,
            _title,
            _ipfsImageHash,
            _startingBid,
            _duration
        );
        
        // Transfer the starting bid to the auction contract
        (bool success, ) = address(auction).call{value: _startingBid}("");
        require(success, "Failed to transfer starting bid");
        
        emit AuctionCreated(address(auction), msg.sender);
        return address(auction);
    }
}