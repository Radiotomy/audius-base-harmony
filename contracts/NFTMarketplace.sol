// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title NFTMarketplace
 * @dev A comprehensive marketplace for trading music NFTs with royalty support
 * Phase 2 deployment for AudioBASE platform
 */
contract NFTMarketplace is ReentrancyGuard, Ownable, Pausable {
    // ============ HARDCODED CONFIGURATION ============
    address public constant DEFAULT_FEE_RECIPIENT = 0xA73bF67c81C466baDE9cF2f0f34de6632D021C5F;
    
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
    
    // State variables
    mapping(bytes32 => Listing) public listings;
    mapping(bytes32 => Offer[]) public offers;
    mapping(address => bool) public approvedCollections;
    
    uint256 public platformFeeRate = 250; // 2.5%
    uint256 public constant MAX_FEE_RATE = 1000; // 10%
    address public feeRecipient;
    
    // Events
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
    
    constructor() Ownable(msg.sender) {
        feeRecipient = DEFAULT_FEE_RECIPIENT;
    }
    
    /**
     * @dev Create a new listing for an NFT
     */
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
    
    /**
     * @dev Purchase an NFT from a listing
     */
    function buyItem(bytes32 listingId) external payable whenNotPaused nonReentrant {
        Listing storage listing = listings[listingId];
        require(listing.isActive, "Listing not active");
        require(block.timestamp <= listing.expiresAt, "Listing expired");
        require(msg.value >= listing.price, "Insufficient payment");
        
        listing.isActive = false;
        
        IERC721 nft = IERC721(listing.nftContract);
        require(nft.ownerOf(listing.tokenId) == listing.seller, "Seller no longer owns token");
        
        // Calculate fees and royalties
        uint256 platformFee = (listing.price * platformFeeRate) / 10000;
        uint256 sellerAmount = listing.price - platformFee;
        
        // Transfer NFT
        nft.safeTransferFrom(listing.seller, msg.sender, listing.tokenId);
        
        // Transfer payment
        if (platformFee > 0) {
            payable(feeRecipient).transfer(platformFee);
        }
        payable(listing.seller).transfer(sellerAmount);
        
        // Refund excess payment
        if (msg.value > listing.price) {
            payable(msg.sender).transfer(msg.value - listing.price);
        }
        
        emit ItemSold(listingId, msg.sender, listing.seller, listing.price);
    }
    
    /**
     * @dev Cancel a listing
     */
    function cancelListing(bytes32 listingId) external {
        Listing storage listing = listings[listingId];
        require(listing.seller == msg.sender || msg.sender == owner(), "Not authorized");
        require(listing.isActive, "Listing not active");
        
        listing.isActive = false;
        emit ListingCanceled(listingId);
    }
    
    /**
     * @dev Make an offer on a listing
     */
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
    
    /**
     * @dev Get listing details
     */
    function getListing(bytes32 listingId) external view returns (Listing memory) {
        return listings[listingId];
    }
    
    /**
     * @dev Get offers for a listing
     */
    function getOffers(bytes32 listingId) external view returns (Offer[] memory) {
        return offers[listingId];
    }
    
    // Admin functions
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
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    function emergencyWithdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}