// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./Auction.sol";

contract AuctionFactory {
    // Event emitted when a new auction is created
    event AuctionCreated(address indexed auction, address indexed seller);

    // Creates a new Auction contract and returns its address
    function createAuction(
        string memory _title,
        string memory _ipfsImageHash,
        uint256 _startingBid,
        uint256 _duration
    ) external returns (address) {
        Auction auction = new Auction(
            msg.sender,
            _title,
            _ipfsImageHash,
            _startingBid,
            _duration
        );
        emit AuctionCreated(address(auction), msg.sender);
        return address(auction);
    }
}