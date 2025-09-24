// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";

/**
 * @title MusicNFTCollection
 * @dev ERC721 contract for music NFTs with royalties
 */
contract MusicNFTCollection is ERC721, ERC721Enumerable, ERC721URIStorage, ERC2981, Ownable, ReentrancyGuard {
    uint256 private _nextTokenId = 1;
    uint256 public maxSupply;
    uint256 public mintPrice;
    
    string public collectionDescription;
    string public collectionSymbol;
    address public artist;
    
    mapping(uint256 => string) public trackIds; // NFT token ID to music track ID
    mapping(uint256 => uint256) public mintTimestamps;
    
    event NFTMinted(
        address indexed to,
        uint256 indexed tokenId,
        string tokenURI,
        string trackId,
        uint256 price
    );

    constructor(
        string memory name,
        string memory symbol,
        string memory description,
        address _artist,
        uint256 _maxSupply,
        uint256 _mintPrice,
        uint96 _royaltyFeeBps // Basis points (e.g., 500 = 5%)
    ) ERC721(name, symbol) Ownable(_artist) {
        collectionDescription = description;
        collectionSymbol = symbol;
        artist = _artist;
        maxSupply = _maxSupply;
        mintPrice = _mintPrice;
        
        // Set default royalty for the artist
        _setDefaultRoyalty(_artist, _royaltyFeeBps);
    }

    /**
     * @dev Mint a new music NFT
     */
    function mintNFT(
        address to,
        string memory tokenURI,
        string memory trackId
    ) external payable nonReentrant returns (uint256) {
        require(msg.value >= mintPrice, "Insufficient payment");
        require(_nextTokenId <= maxSupply, "Max supply reached");
        require(to != address(0), "Invalid recipient");
        
        uint256 tokenId = _nextTokenId++;
        
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);
        
        trackIds[tokenId] = trackId;
        mintTimestamps[tokenId] = block.timestamp;
        
        // Transfer payment to artist
        if (msg.value > 0) {
            payable(artist).transfer(msg.value);
        }
        
        emit NFTMinted(to, tokenId, tokenURI, trackId, msg.value);
        
        return tokenId;
    }

    /**
     * @dev Get NFT details
     */
    function getNFTDetails(uint256 tokenId) external view returns (
        string memory tokenURI,
        string memory trackId,
        address owner,
        uint256 mintTimestamp
    ) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        
        return (
            tokenURI(tokenId),
            trackIds[tokenId],
            ownerOf(tokenId),
            mintTimestamps[tokenId]
        );
    }

    /**
     * @dev Update mint price (only artist/owner)
     */
    function setMintPrice(uint256 newPrice) external onlyOwner {
        mintPrice = newPrice;
    }

    /**
     * @dev Update royalty info (only artist/owner)
     */
    function setRoyaltyInfo(address receiver, uint96 feeBasisPoints) external onlyOwner {
        _setDefaultRoyalty(receiver, feeBasisPoints);
    }

    /**
     * @dev Get collection stats
     */
    function getCollectionStats() external view returns (
        uint256 totalSupply_,
        uint256 maxSupply_,
        uint256 mintPrice_,
        address artist_
    ) {
        return (totalSupply(), maxSupply, mintPrice, artist);
    }

    // Required overrides
    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, value);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, ERC721URIStorage, ERC2981)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}

/**
 * @title MusicNFTFactory
 * @dev Factory contract for creating music NFT collections
 */
contract MusicNFTFactory is Ownable, ReentrancyGuard {
    struct CollectionInfo {
        address contractAddress;
        address artist;
        string name;
        string symbol;
        uint256 createdAt;
        bool isActive;
    }
    
    mapping(address => address[]) public artistCollections;
    mapping(address => CollectionInfo) public collections;
    address[] public allCollections;
    
    uint256 public creationFee = 0.001 ether; // Fee to create a collection
    address public feeRecipient;
    
    event CollectionCreated(
        address indexed artist,
        address indexed collectionAddress,
        string name,
        string symbol,
        uint256 maxSupply
    );

    constructor(address _feeRecipient) Ownable(msg.sender) {
        feeRecipient = _feeRecipient;
    }

    /**
     * @dev Create a new music NFT collection
     */
    function createCollection(
        string memory name,
        string memory symbol,
        string memory description,
        uint256 maxSupply,
        uint256 mintPrice,
        uint96 royaltyFeeBps
    ) external payable nonReentrant returns (address) {
        require(msg.value >= creationFee, "Insufficient creation fee");
        require(bytes(name).length > 0, "Name cannot be empty");
        require(bytes(symbol).length > 0, "Symbol cannot be empty");
        require(maxSupply > 0, "Max supply must be greater than 0");
        require(royaltyFeeBps <= 1000, "Royalty fee too high"); // Max 10%

        // Deploy new collection contract
        MusicNFTCollection newCollection = new MusicNFTCollection(
            name,
            symbol,
            description,
            msg.sender,
            maxSupply,
            mintPrice,
            royaltyFeeBps
        );

        address collectionAddress = address(newCollection);
        
        // Store collection info
        collections[collectionAddress] = CollectionInfo({
            contractAddress: collectionAddress,
            artist: msg.sender,
            name: name,
            symbol: symbol,
            createdAt: block.timestamp,
            isActive: true
        });
        
        artistCollections[msg.sender].push(collectionAddress);
        allCollections.push(collectionAddress);
        
        // Transfer creation fee
        if (msg.value > 0) {
            payable(feeRecipient).transfer(msg.value);
        }
        
        emit CollectionCreated(msg.sender, collectionAddress, name, symbol, maxSupply);
        
        return collectionAddress;
    }

    /**
     * @dev Get artist's collections
     */
    function getArtistCollections(address artist) external view returns (address[] memory) {
        return artistCollections[artist];
    }

    /**
     * @dev Get all collections
     */
    function getAllCollections() external view returns (address[] memory) {
        return allCollections;
    }

    /**
     * @dev Get collection info
     */
    function getCollectionInfo(address collectionAddress) external view returns (CollectionInfo memory) {
        return collections[collectionAddress];
    }

    /**
     * @dev Update creation fee (only owner)
     */
    function setCreationFee(uint256 newFee) external onlyOwner {
        creationFee = newFee;
    }

    /**
     * @dev Update fee recipient (only owner)
     */
    function setFeeRecipient(address newRecipient) external onlyOwner {
        require(newRecipient != address(0), "Invalid recipient");
        feeRecipient = newRecipient;
    }
}