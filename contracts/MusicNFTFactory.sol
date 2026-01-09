// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./MusicNFTCollection.sol";

/**
 * @title MusicNFTFactory
 * @dev Factory contract for creating music NFT collections
 * @notice AudioBASE Platform - Phase 2 Contract
 * @dev Deploy THIS contract (no constructor arguments required)
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
