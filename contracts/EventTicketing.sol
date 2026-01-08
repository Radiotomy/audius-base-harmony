// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title EventTicketing
 * @dev ERC1155 contract for event tickets with multiple ticket types
 */
contract EventTicketing is ERC1155, Ownable, ReentrancyGuard {
    using Strings for uint256;

    struct Event {
        address artist;
        string name;
        string description;
        uint256 eventDate;
        uint256 maxCapacity;
        uint256 currentSold;
        bool isActive;
        string metadataURI;
        mapping(uint256 => TicketType) ticketTypes; // ticketTypeId => TicketType
        uint256 ticketTypeCount;
    }

    struct TicketType {
        string name;
        uint256 price;
        uint256 maxSupply;
        uint256 currentSupply;
        bool isActive;
        string description;
    }

    struct Purchase {
        address buyer;
        uint256 eventId;
        uint256 ticketTypeId;
        uint256 quantity;
        uint256 totalPaid;
        uint256 purchaseTime;
        bool isUsed;
    }

    uint256 public nextEventId = 1;
    uint256 public platformFeeRate = 250; // 2.5%
    address public feeRecipient;

    mapping(uint256 => Event) public events;
    mapping(uint256 => Purchase[]) public eventPurchases; // eventId => purchases
    mapping(address => mapping(uint256 => uint256[])) public userTickets; // user => eventId => tokenIds
    
    // Encoding: eventId * 1000000 + ticketTypeId
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
    
    event TicketUsed(
        uint256 indexed eventId,
        uint256 indexed tokenId,
        address indexed user
    );

    constructor(address _feeRecipient) ERC1155("") Ownable(msg.sender) {
        feeRecipient = _feeRecipient;
    }

    /**
     * @dev Create a new event
     */
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
        
        Event storage newEvent = events[eventId];
        newEvent.artist = msg.sender;
        newEvent.name = name;
        newEvent.description = description;
        newEvent.eventDate = eventDate;
        newEvent.maxCapacity = maxCapacity;
        newEvent.currentSold = 0;
        newEvent.isActive = true;
        newEvent.metadataURI = metadataURI;
        newEvent.ticketTypeCount = 0;

        emit EventCreated(eventId, msg.sender, name, eventDate, maxCapacity);
        
        return eventId;
    }

    /**
     * @dev Add a ticket type to an event
     */
    function addTicketType(
        uint256 eventId,
        string memory typeName,
        string memory description,
        uint256 price,
        uint256 maxSupply
    ) external returns (uint256) {
        Event storage eventData = events[eventId];
        require(eventData.artist == msg.sender, "Only event artist can add ticket types");
        require(eventData.isActive, "Event is not active");
        require(maxSupply > 0, "Max supply must be greater than 0");

        uint256 ticketTypeId = eventData.ticketTypeCount++;
        
        eventData.ticketTypes[ticketTypeId] = TicketType({
            name: typeName,
            price: price,
            maxSupply: maxSupply,
            currentSupply: 0,
            isActive: true,
            description: description
        });

        emit TicketTypeAdded(eventId, ticketTypeId, typeName, price, maxSupply);
        
        return ticketTypeId;
    }

    /**
     * @dev Purchase tickets
     */
    function purchaseTickets(
        uint256 eventId,
        uint256 ticketTypeId,
        uint256 quantity
    ) external payable nonReentrant {
        Event storage eventData = events[eventId];
        require(eventData.isActive, "Event is not active");
        require(eventData.eventDate > block.timestamp, "Event has already occurred");
        require(quantity > 0, "Quantity must be greater than 0");

        TicketType storage ticketType = eventData.ticketTypes[ticketTypeId];
        require(ticketType.isActive, "Ticket type is not active");
        require(ticketType.currentSupply + quantity <= ticketType.maxSupply, "Not enough tickets available");
        require(eventData.currentSold + quantity <= eventData.maxCapacity, "Event capacity exceeded");

        uint256 totalPrice = ticketType.price * quantity;
        require(msg.value >= totalPrice, "Insufficient payment");

        // Calculate fees
        uint256 platformFee = (totalPrice * platformFeeRate) / 10000;
        uint256 artistAmount = totalPrice - platformFee;

        // Update supplies
        ticketType.currentSupply += quantity;
        eventData.currentSold += quantity;

        // Generate unique token ID for each ticket
        for (uint256 i = 0; i < quantity; i++) {
            uint256 tokenId = eventId * 1000000 + ticketTypeId * 1000 + ticketType.currentSupply - quantity + i;
            tokenToEvent[tokenId] = eventId;
            tokenToTicketType[tokenId] = ticketTypeId;
            userTickets[msg.sender][eventId].push(tokenId);
        }

        // Mint tickets
        _mint(msg.sender, eventId * 1000000 + ticketTypeId * 1000, quantity, "");

        // Record purchase
        eventPurchases[eventId].push(Purchase({
            buyer: msg.sender,
            eventId: eventId,
            ticketTypeId: ticketTypeId,
            quantity: quantity,
            totalPaid: totalPrice,
            purchaseTime: block.timestamp,
            isUsed: false
        }));

        // Transfer payments
        if (platformFee > 0) {
            payable(feeRecipient).transfer(platformFee);
        }
        payable(eventData.artist).transfer(artistAmount);

        // Refund excess payment
        if (msg.value > totalPrice) {
            payable(msg.sender).transfer(msg.value - totalPrice);
        }

        emit TicketPurchased(eventId, ticketTypeId, msg.sender, quantity, totalPrice);
    }

    /**
     * @dev Use a ticket (mark as used)
     */
    function useTicket(uint256 tokenId, address user) external {
        uint256 eventId = tokenToEvent[tokenId];
        Event storage eventData = events[eventId];
        require(eventData.artist == msg.sender, "Only event artist can use tickets");
        require(balanceOf(user, tokenId) > 0, "User does not own this ticket");

        // Burn the ticket
        _burn(user, tokenId, 1);

        emit TicketUsed(eventId, tokenId, user);
    }

    /**
     * @dev Get event details
     */
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
        Event storage eventData = events[eventId];
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

    /**
     * @dev Get ticket type details
     */
    function getTicketType(uint256 eventId, uint256 ticketTypeId) external view returns (
        string memory name,
        uint256 price,
        uint256 maxSupply,
        uint256 currentSupply,
        bool isActive,
        string memory description
    ) {
        TicketType storage ticketType = events[eventId].ticketTypes[ticketTypeId];
        return (
            ticketType.name,
            ticketType.price,
            ticketType.maxSupply,
            ticketType.currentSupply,
            ticketType.isActive,
            ticketType.description
        );
    }

    /**
     * @dev Get user tickets for an event
     */
    function getUserTickets(address user, uint256 eventId) external view returns (uint256[] memory) {
        return userTickets[user][eventId];
    }

    /**
     * @dev Set platform fee rate (only owner)
     */
    function setPlatformFeeRate(uint256 newRate) external onlyOwner {
        require(newRate <= 1000, "Fee rate too high"); // Max 10%
        platformFeeRate = newRate;
    }

    /**
     * @dev Set fee recipient (only owner)
     */
    function setFeeRecipient(address newRecipient) external onlyOwner {
        require(newRecipient != address(0), "Invalid recipient");
        feeRecipient = newRecipient;
    }

    /**
     * @dev Override URI function
     */
    function uri(uint256 tokenId) public view override returns (string memory) {
        uint256 eventId = tokenToEvent[tokenId];
        Event storage eventData = events[eventId];
        return string(abi.encodePacked(eventData.metadataURI, tokenId.toString()));
    }
}