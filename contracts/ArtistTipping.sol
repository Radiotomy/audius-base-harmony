// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title ArtistTipping
 * @dev Contract for tipping artists with ETH and tracking earnings
 */
contract ArtistTipping is Ownable, ReentrancyGuard {
    struct Tip {
        address tipper;
        address artist;
        uint256 amount;
        string message;
        uint256 timestamp;
        string tipId; // For linking with database
    }

    // Platform fee (1% = 100 basis points)
    uint256 public platformFeeRate = 100; // 1%
    uint256 public constant MAX_FEE_RATE = 500; // 5% max
    
    address public feeRecipient;
    
    mapping(address => uint256) public artistEarnings;
    mapping(address => uint256) public totalTipsReceived;
    mapping(address => uint256) public tipCount;
    
    Tip[] public tips;
    
    event TipSent(
        address indexed tipper,
        address indexed artist,
        uint256 amount,
        string message,
        string indexed tipId,
        uint256 timestamp
    );
    
    event EarningsWithdrawn(address indexed artist, uint256 amount);
    event FeeRateUpdated(uint256 newRate);
    event FeeRecipientUpdated(address newRecipient);

    constructor(address _feeRecipient) Ownable(msg.sender) {
        feeRecipient = _feeRecipient;
    }

    /**
     * @dev Send a tip to an artist
     * @param artist The artist's wallet address
     * @param message Optional message with the tip
     * @param tipId Database ID for linking
     */
    function tipArtist(
        address payable artist,
        string calldata message,
        string calldata tipId
    ) external payable nonReentrant {
        require(msg.value > 0, "Tip amount must be greater than 0");
        require(artist != address(0), "Invalid artist address");
        require(artist != msg.sender, "Cannot tip yourself");

        uint256 platformFee = (msg.value * platformFeeRate) / 10000;
        uint256 artistAmount = msg.value - platformFee;

        // Update artist stats
        artistEarnings[artist] += artistAmount;
        totalTipsReceived[artist] += msg.value;
        tipCount[artist]++;

        // Store tip record
        tips.push(Tip({
            tipper: msg.sender,
            artist: artist,
            amount: msg.value,
            message: message,
            timestamp: block.timestamp,
            tipId: tipId
        }));

        // Transfer amounts
        if (platformFee > 0) {
            payable(feeRecipient).transfer(platformFee);
        }
        artist.transfer(artistAmount);

        emit TipSent(msg.sender, artist, msg.value, message, tipId, block.timestamp);
    }

    /**
     * @dev Get artist statistics
     */
    function getArtistStats(address artist) external view returns (
        uint256 earnings,
        uint256 totalTips,
        uint256 tipCount_
    ) {
        return (
            artistEarnings[artist],
            totalTipsReceived[artist],
            tipCount[artist]
        );
    }

    /**
     * @dev Get total number of tips
     */
    function getTipCount() external view returns (uint256) {
        return tips.length;
    }

    /**
     * @dev Get tip by index
     */
    function getTip(uint256 index) external view returns (
        address tipper,
        address artist,
        uint256 amount,
        string memory message,
        uint256 timestamp,
        string memory tipId
    ) {
        require(index < tips.length, "Tip index out of bounds");
        Tip memory tip = tips[index];
        return (tip.tipper, tip.artist, tip.amount, tip.message, tip.timestamp, tip.tipId);
    }

    /**
     * @dev Update platform fee rate (only owner)
     */
    function setPlatformFeeRate(uint256 newRate) external onlyOwner {
        require(newRate <= MAX_FEE_RATE, "Fee rate too high");
        platformFeeRate = newRate;
        emit FeeRateUpdated(newRate);
    }

    /**
     * @dev Update fee recipient (only owner)
     */
    function setFeeRecipient(address newRecipient) external onlyOwner {
        require(newRecipient != address(0), "Invalid recipient address");
        feeRecipient = newRecipient;
        emit FeeRecipientUpdated(newRecipient);
    }

    /**
     * @dev Emergency withdraw (only owner)
     */
    function emergencyWithdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}