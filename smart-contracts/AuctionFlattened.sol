// Sources flattened with hardhat v2.23.0 https://hardhat.org

// SPDX-License-Identifier: MIT

// File @openzeppelin/contracts/security/ReentrancyGuard.sol@v4.9.3

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v4.9.0) (security/ReentrancyGuard.sol)

pragma solidity ^0.8.0;

/**
 * @dev Contract module that helps prevent reentrant calls to a function.
 *
 * Inheriting from `ReentrancyGuard` will make the {nonReentrant} modifier
 * available, which can be applied to functions to make sure there are no nested
 * (reentrant) calls to them.
 *
 * Note that because there is a single `nonReentrant` guard, functions marked as
 * `nonReentrant` may not call one another. This can be worked around by making
 * those functions `private`, and then adding `external` `nonReentrant` entry
 * points to them.
 *
 * TIP: If you would like to learn more about reentrancy and alternative ways
 * to protect against it, check out our blog post
 * https://blog.openzeppelin.com/reentrancy-after-istanbul/[Reentrancy After Istanbul].
 */
abstract contract ReentrancyGuard {
    // Booleans are more expensive than uint256 or any type that takes up a full
    // word because each write operation emits an extra SLOAD to first read the
    // slot's contents, replace the bits taken up by the boolean, and then write
    // back. This is the compiler's defense against contract upgrades and
    // pointer aliasing, and it cannot be disabled.

    // The values being non-zero value makes deployment a bit more expensive,
    // but in exchange the refund on every call to nonReentrant will be lower in
    // amount. Since refunds are capped to a percentage of the total
    // transaction's gas, it is best to keep them low in cases like this one, to
    // increase the likelihood of the full refund coming into effect.
    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;

    uint256 private _status;

    constructor() {
        _status = _NOT_ENTERED;
    }

    /**
     * @dev Prevents a contract from calling itself, directly or indirectly.
     * Calling a `nonReentrant` function from another `nonReentrant`
     * function is not supported. It is possible to prevent this from happening
     * by making the `nonReentrant` function external, and making it call a
     * `private` function that does the actual work.
     */
    modifier nonReentrant() {
        _nonReentrantBefore();
        _;
        _nonReentrantAfter();
    }

    function _nonReentrantBefore() private {
        // On the first call to nonReentrant, _status will be _NOT_ENTERED
        require(_status != _ENTERED, "ReentrancyGuard: reentrant call");

        // Any calls to nonReentrant after this point will fail
        _status = _ENTERED;
    }

    function _nonReentrantAfter() private {
        // By storing the original value once again, a refund is triggered (see
        // https://eips.ethereum.org/EIPS/eip-2200)
        _status = _NOT_ENTERED;
    }

    /**
     * @dev Returns true if the reentrancy guard is currently set to "entered", which indicates there is a
     * `nonReentrant` function in the call stack.
     */
    function _reentrancyGuardEntered() internal view returns (bool) {
        return _status == _ENTERED;
    }
}


// File contracts/Auction.sol

// Original license: SPDX_License_Identifier: MIT
pragma solidity ^0.8.8;

contract Auction is ReentrancyGuard {
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
        require(_seller != address(0), "Invalid seller address");
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(bytes(_ipfsImageHash).length > 0, "IPFS hash cannot be empty");
        require(_startingBid > 0, "Starting bid must be greater than 0");
        require(_duration > 0, "Duration must be greater than 0");
        
        seller = _seller;
        title = _title;
        ipfsImageHash = _ipfsImageHash;
        startingBid = _startingBid;
        endTime = block.timestamp + _duration;
        
        // Set initial highest bid
        highestBid = _startingBid;
        highestBidder = _seller;
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

    function endAuction() external nonReentrant onlySeller {
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

    function withdraw() external nonReentrant {
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


// File contracts/AuctionFactory.sol

// Original license: SPDX_License_Identifier: MIT
pragma solidity ^0.8.8;

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
