// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title MusicNFTCollection
 * @dev ERC721 contract for music NFTs with royalties
 */
contract MusicNFTCollection is ERC721, ERC721Enumerable, ERC721URIStorage, ERC2981, Ownable, ReentrancyGuard {
    uint256 private _nextTokenId = 1;
    uint256 public maxSupply;
    uint256 public mintPrice;
    
    string public collectionDescription;
    address public artist;
    uint96 public royaltyFeeBps;
    
    mapping(uint256 => string) public trackIds;
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
        uint96 _royaltyFeeBps
    ) ERC721(name, symbol) Ownable(_artist) {
        require(_artist != address(0), "Invalid artist");
        require(_maxSupply > 0, "Max supply must be > 0");
        require(_royaltyFeeBps <= 1000, "Royalty fee too high");
        
        collectionDescription = description;
        artist = _artist;
        maxSupply = _maxSupply;
        mintPrice = _mintPrice;
        royaltyFeeBps = _royaltyFeeBps;
        
        _setDefaultRoyalty(_artist, _royaltyFeeBps);
    }

    function mintNFT(
        address to,
        string memory uri,
        string memory trackId
    ) external payable nonReentrant returns (uint256) {
        require(msg.value >= mintPrice, "Insufficient payment");
        require(_nextTokenId <= maxSupply, "Max supply reached");
        require(to != address(0), "Invalid recipient");
        
        uint256 tokenId = _nextTokenId++;
        
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        
        trackIds[tokenId] = trackId;
        mintTimestamps[tokenId] = block.timestamp;
        
        if (msg.value > 0) {
            (bool success, ) = payable(artist).call{value: msg.value}("");
            require(success, "Payment transfer failed");
        }
        
        emit NFTMinted(to, tokenId, uri, trackId, msg.value);
        
        return tokenId;
    }

    function setMintPrice(uint256 newPrice) external onlyOwner {
        mintPrice = newPrice;
    }

    function getCollectionStats() external view returns (
        uint256 currentSupply,
        uint256 maxSupplyValue,
        uint256 mintPriceValue,
        address artistAddress
    ) {
        return (totalSupply(), maxSupply, mintPrice, artist);
    }

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
 * @notice AudioBASE Platform - Phase 2 Contract
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
    
    uint256 public creationFee = 0.001 ether;
    address public feeRecipient;
    
    event CollectionCreated(
        address indexed artist,
        address indexed collectionAddress,
        string name,
        string symbol,
        uint256 maxSupply
    );

    constructor() Ownable(msg.sender) {
        feeRecipient = msg.sender;
    }

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
        require(royaltyFeeBps <= 1000, "Royalty fee too high");

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
        
        if (msg.value > 0) {
            (bool success, ) = payable(feeRecipient).call{value: msg.value}("");
            require(success, "Fee transfer failed");
        }
        
        emit CollectionCreated(msg.sender, collectionAddress, name, symbol, maxSupply);
        
        return collectionAddress;
    }

    function getArtistCollections(address artist) external view returns (address[] memory) {
        return artistCollections[artist];
    }

    function getAllCollections() external view returns (address[] memory) {
        return allCollections;
    }

    function getCollectionInfo(address collectionAddress) external view returns (CollectionInfo memory) {
        return collections[collectionAddress];
    }

    function setCreationFee(uint256 newFee) external onlyOwner {
        creationFee = newFee;
    }

    function setFeeRecipient(address newRecipient) external onlyOwner {
        require(newRecipient != address(0), "Invalid recipient");
        feeRecipient = newRecipient;
    }
}
