// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title NFTMarketplace
 * @dev A marketplace for trading music NFTs
 * @notice AudioBASE Platform - Phase 2 Contract
 */
contract NFTMarketplace is ReentrancyGuard, Ownable {
    
    struct Listing {
        uint256 tokenId;
        address nftContract;
        address seller;
        uint256 price;
        bool isActive;
        uint256 listedAt;
        uint256 expiresAt;
    }
    
    struct Offer {
        address bidder;
        uint256 amount;
        uint256 expiresAt;
        bool isActive;
    }
    
    mapping(bytes32 => Listing) public listings;
    mapping(bytes32 => Offer[]) public offers;
    mapping(address => bool) public approvedCollections;
    
    uint256 public platformFeeRate = 250; // 2.5%
    uint256 public constant MAX_FEE_RATE = 1000; // 10%
    address public feeRecipient;
    
    bool public paused;
    
    event ItemListed(
        bytes32 indexed listingId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address seller,
        uint256 price
    );
    
    event ItemSold(
        bytes32 indexed listingId,
        address indexed buyer,
        address indexed seller,
        uint256 price
    );
    
    event OfferMade(
        bytes32 indexed listingId,
        address indexed bidder,
        uint256 amount
    );
    
    event ListingCanceled(bytes32 indexed listingId);
    
    modifier whenNotPaused() {
        require(!paused, "Contract is paused");
        _;
    }
    
    constructor() Ownable(msg.sender) {
        feeRecipient = msg.sender;
        paused = false;
    }
    
    function createListing(
        address nftContract,
        uint256 tokenId,
        uint256 price,
        uint256 duration
    ) external whenNotPaused nonReentrant {
        require(approvedCollections[nftContract], "Collection not approved");
        require(price > 0, "Price must be greater than 0");
        require(duration > 0, "Duration must be greater than 0");
        
        IERC721 nft = IERC721(nftContract);
        require(nft.ownerOf(tokenId) == msg.sender, "Not token owner");
        require(nft.isApprovedForAll(msg.sender, address(this)) || 
                nft.getApproved(tokenId) == address(this), "Marketplace not approved");
        
        bytes32 listingId = keccak256(abi.encodePacked(nftContract, tokenId, msg.sender, block.timestamp));
        
        listings[listingId] = Listing({
            tokenId: tokenId,
            nftContract: nftContract,
            seller: msg.sender,
            price: price,
            isActive: true,
            listedAt: block.timestamp,
            expiresAt: block.timestamp + duration
        });
        
        emit ItemListed(listingId, nftContract, tokenId, msg.sender, price);
    }
    
    function buyItem(bytes32 listingId) external payable whenNotPaused nonReentrant {
        Listing storage listing = listings[listingId];
        require(listing.isActive, "Listing not active");
        require(block.timestamp <= listing.expiresAt, "Listing expired");
        require(msg.value >= listing.price, "Insufficient payment");
        
        listing.isActive = false;
        
        IERC721 nft = IERC721(listing.nftContract);
        require(nft.ownerOf(listing.tokenId) == listing.seller, "Seller no longer owns token");
        
        uint256 platformFee = (listing.price * platformFeeRate) / 10000;
        uint256 sellerAmount = listing.price - platformFee;
        
        nft.safeTransferFrom(listing.seller, msg.sender, listing.tokenId);
        
        if (platformFee > 0) {
            (bool feeSuccess, ) = payable(feeRecipient).call{value: platformFee}("");
            require(feeSuccess, "Platform fee transfer failed");
        }
        (bool sellerSuccess, ) = payable(listing.seller).call{value: sellerAmount}("");
        require(sellerSuccess, "Seller payment failed");
        
        if (msg.value > listing.price) {
            (bool refundSuccess, ) = payable(msg.sender).call{value: msg.value - listing.price}("");
            require(refundSuccess, "Refund failed");
        }
        
        emit ItemSold(listingId, msg.sender, listing.seller, listing.price);
    }
    
    function cancelListing(bytes32 listingId) external {
        Listing storage listing = listings[listingId];
        require(listing.seller == msg.sender || msg.sender == owner(), "Not authorized");
        require(listing.isActive, "Listing not active");
        
        listing.isActive = false;
        emit ListingCanceled(listingId);
    }
    
    function makeOffer(bytes32 listingId, uint256 expiresAt) external payable whenNotPaused {
        require(msg.value > 0, "Offer must be greater than 0");
        require(expiresAt > block.timestamp, "Invalid expiration");
        
        Listing storage listing = listings[listingId];
        require(listing.isActive, "Listing not active");
        
        offers[listingId].push(Offer({
            bidder: msg.sender,
            amount: msg.value,
            expiresAt: expiresAt,
            isActive: true
        }));
        
        emit OfferMade(listingId, msg.sender, msg.value);
    }
    
    function getListing(bytes32 listingId) external view returns (Listing memory) {
        return listings[listingId];
    }
    
    function getOffers(bytes32 listingId) external view returns (Offer[] memory) {
        return offers[listingId];
    }
    
    function approveCollection(address collection) external onlyOwner {
        approvedCollections[collection] = true;
    }
    
    function removeCollection(address collection) external onlyOwner {
        approvedCollections[collection] = false;
    }
    
    function setPlatformFeeRate(uint256 newRate) external onlyOwner {
        require(newRate <= MAX_FEE_RATE, "Fee too high");
        platformFeeRate = newRate;
    }
    
    function setFeeRecipient(address newRecipient) external onlyOwner {
        require(newRecipient != address(0), "Invalid address");
        feeRecipient = newRecipient;
    }
    
    function pause() external onlyOwner {
        paused = true;
    }
    
    function unpause() external onlyOwner {
        paused = false;
    }
    
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance");
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdraw failed");
    }
}
