// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title ArtistTipping
 * @dev Contract for tipping artists with ETH on BASE network
 * @notice AudioBASE Platform - Phase 2 Contract
 */
contract ArtistTipping is Ownable, ReentrancyGuard {
    
    struct Tip {
        address tipper;
        address artist;
        uint256 amount;
        string message;
        uint256 timestamp;
        string tipId;
    }

    uint256 public platformFeeRate = 100; // 1% = 100 basis points
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
    
    event FeeRateUpdated(uint256 newRate);
    event FeeRecipientUpdated(address newRecipient);

    constructor() Ownable(msg.sender) {
        feeRecipient = msg.sender;
    }

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

        artistEarnings[artist] += artistAmount;
        totalTipsReceived[artist] += msg.value;
        tipCount[artist]++;

        tips.push(Tip({
            tipper: msg.sender,
            artist: artist,
            amount: msg.value,
            message: message,
            timestamp: block.timestamp,
            tipId: tipId
        }));

        if (platformFee > 0) {
            (bool feeSuccess, ) = payable(feeRecipient).call{value: platformFee}("");
            require(feeSuccess, "Platform fee transfer failed");
        }
        (bool artistSuccess, ) = artist.call{value: artistAmount}("");
        require(artistSuccess, "Artist payment failed");

        emit TipSent(msg.sender, artist, msg.value, message, tipId, block.timestamp);
    }

    function getArtistStats(address artist) external view returns (
        uint256 earnings,
        uint256 totalTips,
        uint256 count
    ) {
        return (
            artistEarnings[artist],
            totalTipsReceived[artist],
            tipCount[artist]
        );
    }

    function getTipCount() external view returns (uint256) {
        return tips.length;
    }

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

    function setPlatformFeeRate(uint256 newRate) external onlyOwner {
        require(newRate <= MAX_FEE_RATE, "Fee rate too high");
        platformFeeRate = newRate;
        emit FeeRateUpdated(newRate);
    }

    function setFeeRecipient(address newRecipient) external onlyOwner {
        require(newRecipient != address(0), "Invalid recipient address");
        feeRecipient = newRecipient;
        emit FeeRecipientUpdated(newRecipient);
    }

    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdraw failed");
    }
}
