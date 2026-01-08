// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title EventTicketing
 * @dev ERC1155 contract for event tickets with multiple ticket types
 * @notice AudioBASE Platform - Phase 2 Contract
 */
contract EventTicketing is ERC1155, Ownable, ReentrancyGuard {

    struct TicketType {
        string name;
        uint256 price;
        uint256 maxSupply;
        uint256 currentSupply;
        bool isActive;
    }

    struct EventData {
        address artist;
        string name;
        string description;
        uint256 eventDate;
        uint256 maxCapacity;
        uint256 currentSold;
        bool isActive;
        string metadataURI;
        uint256 ticketTypeCount;
    }

    uint256 public nextEventId = 1;
    uint256 public platformFeeRate = 250; // 2.5%
    address public feeRecipient;

    mapping(uint256 => EventData) public events;
    mapping(uint256 => mapping(uint256 => TicketType)) public ticketTypes;
    mapping(uint256 => uint256) public tokenToEvent;
    mapping(uint256 => uint256) public tokenToTicketType;
    
    event EventCreated(
        uint256 indexed eventId,
        address indexed artist,
        string name,
        uint256 eventDate,
        uint256 maxCapacity
    );
    
    event TicketTypeAdded(
        uint256 indexed eventId,
        uint256 indexed ticketTypeId,
        string name,
        uint256 price,
        uint256 maxSupply
    );
    
    event TicketPurchased(
        uint256 indexed eventId,
        uint256 indexed ticketTypeId,
        address indexed buyer,
        uint256 quantity,
        uint256 totalPaid
    );

    constructor() ERC1155("") Ownable(msg.sender) {
        feeRecipient = msg.sender;
    }

    function createEvent(
        string memory name,
        string memory description,
        uint256 eventDate,
        uint256 maxCapacity,
        string memory metadataURI
    ) external returns (uint256) {
        require(eventDate > block.timestamp, "Event date must be in the future");
        require(maxCapacity > 0, "Max capacity must be greater than 0");
        require(bytes(name).length > 0, "Event name cannot be empty");

        uint256 eventId = nextEventId++;
        
        events[eventId] = EventData({
            artist: msg.sender,
            name: name,
            description: description,
            eventDate: eventDate,
            maxCapacity: maxCapacity,
            currentSold: 0,
            isActive: true,
            metadataURI: metadataURI,
            ticketTypeCount: 0
        });

        emit EventCreated(eventId, msg.sender, name, eventDate, maxCapacity);
        
        return eventId;
    }

    function addTicketType(
        uint256 eventId,
        string memory typeName,
        uint256 price,
        uint256 maxSupply
    ) external returns (uint256) {
        EventData storage eventData = events[eventId];
        require(eventData.artist == msg.sender, "Only event artist can add ticket types");
        require(eventData.isActive, "Event is not active");
        require(maxSupply > 0, "Max supply must be greater than 0");

        uint256 ticketTypeId = eventData.ticketTypeCount++;
        
        ticketTypes[eventId][ticketTypeId] = TicketType({
            name: typeName,
            price: price,
            maxSupply: maxSupply,
            currentSupply: 0,
            isActive: true
        });

        emit TicketTypeAdded(eventId, ticketTypeId, typeName, price, maxSupply);
        
        return ticketTypeId;
    }

    function purchaseTickets(
        uint256 eventId,
        uint256 ticketTypeId,
        uint256 quantity
    ) external payable nonReentrant {
        EventData storage eventData = events[eventId];
        require(eventData.isActive, "Event is not active");
        require(eventData.eventDate > block.timestamp, "Event has already occurred");
        require(quantity > 0, "Quantity must be greater than 0");

        TicketType storage ticketType = ticketTypes[eventId][ticketTypeId];
        require(ticketType.isActive, "Ticket type is not active");
        require(ticketType.currentSupply + quantity <= ticketType.maxSupply, "Not enough tickets available");
        require(eventData.currentSold + quantity <= eventData.maxCapacity, "Event capacity exceeded");

        uint256 totalPrice = ticketType.price * quantity;
        require(msg.value >= totalPrice, "Insufficient payment");

        uint256 platformFee = (totalPrice * platformFeeRate) / 10000;
        uint256 artistAmount = totalPrice - platformFee;

        ticketType.currentSupply += quantity;
        eventData.currentSold += quantity;

        uint256 tokenId = eventId * 1000000 + ticketTypeId * 1000;
        tokenToEvent[tokenId] = eventId;
        tokenToTicketType[tokenId] = ticketTypeId;

        _mint(msg.sender, tokenId, quantity, "");

        if (platformFee > 0) {
            (bool feeSuccess, ) = payable(feeRecipient).call{value: platformFee}("");
            require(feeSuccess, "Platform fee transfer failed");
        }
        (bool artistSuccess, ) = payable(eventData.artist).call{value: artistAmount}("");
        require(artistSuccess, "Artist payment failed");

        if (msg.value > totalPrice) {
            (bool refundSuccess, ) = payable(msg.sender).call{value: msg.value - totalPrice}("");
            require(refundSuccess, "Refund failed");
        }

        emit TicketPurchased(eventId, ticketTypeId, msg.sender, quantity, totalPrice);
    }

    function getEvent(uint256 eventId) external view returns (
        address artist,
        string memory name,
        string memory description,
        uint256 eventDate,
        uint256 maxCapacity,
        uint256 currentSold,
        bool isActive,
        uint256 ticketTypeCount
    ) {
        EventData storage eventData = events[eventId];
        return (
            eventData.artist,
            eventData.name,
            eventData.description,
            eventData.eventDate,
            eventData.maxCapacity,
            eventData.currentSold,
            eventData.isActive,
            eventData.ticketTypeCount
        );
    }

    function getTicketType(uint256 eventId, uint256 ticketTypeId) external view returns (
        string memory name,
        uint256 price,
        uint256 maxSupply,
        uint256 currentSupply,
        bool isActive
    ) {
        TicketType storage ticketType = ticketTypes[eventId][ticketTypeId];
        return (
            ticketType.name,
            ticketType.price,
            ticketType.maxSupply,
            ticketType.currentSupply,
            ticketType.isActive
        );
    }

    function setPlatformFeeRate(uint256 newRate) external onlyOwner {
        require(newRate <= 1000, "Fee rate too high");
        platformFeeRate = newRate;
    }

    function setFeeRecipient(address newRecipient) external onlyOwner {
        require(newRecipient != address(0), "Invalid recipient");
        feeRecipient = newRecipient;
    }
}
