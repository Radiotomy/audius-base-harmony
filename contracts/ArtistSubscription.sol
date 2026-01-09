// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title ArtistSubscription
 * @dev Enables fan subscriptions to artists with tiered membership levels
 * @notice Artists can create subscription tiers, fans pay recurring in ETH or tokens
 */
contract ArtistSubscription is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // Platform configuration
    address public constant DEFAULT_FEE_RECIPIENT = 0xA73bF67c81C466baDE9cF2f0f34de6632D021C5F;
    uint256 public platformFeeRate = 250; // 2.5% platform fee
    uint256 public constant MAX_FEE_RATE = 1000; // 10% max
    uint256 public constant BASIS_POINTS = 10000;

    struct Tier {
        string name;
        string description;
        uint256 pricePerMonth; // In wei (ETH) or token units
        bool isActive;
        bool acceptsEth;
        address paymentToken; // address(0) for ETH only
    }

    struct Subscription {
        uint256 tierId;
        uint256 startedAt;
        uint256 expiresAt;
        bool autoRenew;
    }

    // Artist => Tier ID => Tier
    mapping(address => mapping(uint256 => Tier)) public artistTiers;
    mapping(address => uint256) public artistTierCount;
    
    // Artist => Subscriber => Subscription
    mapping(address => mapping(address => Subscription)) public subscriptions;
    
    // Artist => subscriber list
    mapping(address => address[]) public artistSubscribers;
    mapping(address => mapping(address => bool)) public isSubscriber;
    
    // Artist earnings
    mapping(address => uint256) public artistEthEarnings;
    mapping(address => mapping(address => uint256)) public artistTokenEarnings;
    
    // Stats
    uint256 public totalSubscriptions;
    uint256 public totalRevenue;

    // Events
    event TierCreated(address indexed artist, uint256 tierId, string name, uint256 price);
    event TierUpdated(address indexed artist, uint256 tierId);
    event Subscribed(address indexed artist, address indexed subscriber, uint256 tierId, uint256 expiresAt);
    event SubscriptionRenewed(address indexed artist, address indexed subscriber, uint256 expiresAt);
    event SubscriptionCancelled(address indexed artist, address indexed subscriber);
    event EarningsWithdrawn(address indexed artist, uint256 amount);

    constructor() Ownable(msg.sender) {}

    /**
     * @dev Create a new subscription tier (called by artists)
     * @param name Tier name (e.g., "Silver", "Gold", "Platinum")
     * @param description Tier description/benefits
     * @param pricePerMonth Monthly price in wei or token units
     * @param acceptsEth Whether this tier accepts ETH payments
     * @param paymentToken Token address for payments (address(0) if ETH only)
     */
    function createTier(
        string memory name,
        string memory description,
        uint256 pricePerMonth,
        bool acceptsEth,
        address paymentToken
    ) external returns (uint256) {
        require(bytes(name).length > 0, "Name required");
        require(pricePerMonth > 0, "Price must be > 0");
        require(acceptsEth || paymentToken != address(0), "Must accept ETH or token");
        
        uint256 tierId = artistTierCount[msg.sender];
        
        artistTiers[msg.sender][tierId] = Tier({
            name: name,
            description: description,
            pricePerMonth: pricePerMonth,
            isActive: true,
            acceptsEth: acceptsEth,
            paymentToken: paymentToken
        });
        
        artistTierCount[msg.sender]++;
        
        emit TierCreated(msg.sender, tierId, name, pricePerMonth);
        
        return tierId;
    }

    /**
     * @dev Update tier status
     */
    function setTierActive(uint256 tierId, bool active) external {
        require(tierId < artistTierCount[msg.sender], "Invalid tier");
        artistTiers[msg.sender][tierId].isActive = active;
        emit TierUpdated(msg.sender, tierId);
    }

    /**
     * @dev Subscribe to an artist's tier with ETH
     * @param artist Address of the artist
     * @param tierId ID of the subscription tier
     * @param months Number of months to subscribe
     */
    function subscribeWithEth(
        address artist,
        uint256 tierId,
        uint256 months
    ) external payable nonReentrant {
        require(months > 0 && months <= 12, "1-12 months only");
        
        Tier storage tier = artistTiers[artist][tierId];
        require(tier.isActive, "Tier not active");
        require(tier.acceptsEth, "ETH not accepted");
        
        uint256 totalPrice = tier.pricePerMonth * months;
        require(msg.value >= totalPrice, "Insufficient payment");
        
        // Calculate fees
        uint256 platformFee = (totalPrice * platformFeeRate) / BASIS_POINTS;
        uint256 artistAmount = totalPrice - platformFee;
        
        // Update artist earnings
        artistEthEarnings[artist] += artistAmount;
        
        // Send platform fee
        if (platformFee > 0) {
            (bool feeSuccess, ) = payable(DEFAULT_FEE_RECIPIENT).call{value: platformFee}("");
            require(feeSuccess, "Fee transfer failed");
        }
        
        // Update subscription
        _updateSubscription(artist, msg.sender, tierId, months);
        
        totalRevenue += totalPrice;
        
        // Refund excess
        if (msg.value > totalPrice) {
            (bool refundSuccess, ) = payable(msg.sender).call{value: msg.value - totalPrice}("");
            require(refundSuccess, "Refund failed");
        }
    }

    /**
     * @dev Subscribe to an artist's tier with ERC20 tokens
     */
    function subscribeWithToken(
        address artist,
        uint256 tierId,
        uint256 months
    ) external nonReentrant {
        require(months > 0 && months <= 12, "1-12 months only");
        
        Tier storage tier = artistTiers[artist][tierId];
        require(tier.isActive, "Tier not active");
        require(tier.paymentToken != address(0), "Token not accepted");
        
        uint256 totalPrice = tier.pricePerMonth * months;
        
        // Transfer tokens from subscriber
        IERC20(tier.paymentToken).safeTransferFrom(msg.sender, address(this), totalPrice);
        
        // Calculate fees
        uint256 platformFee = (totalPrice * platformFeeRate) / BASIS_POINTS;
        uint256 artistAmount = totalPrice - platformFee;
        
        // Update artist earnings
        artistTokenEarnings[artist][tier.paymentToken] += artistAmount;
        
        // Send platform fee
        if (platformFee > 0) {
            IERC20(tier.paymentToken).safeTransfer(DEFAULT_FEE_RECIPIENT, platformFee);
        }
        
        // Update subscription
        _updateSubscription(artist, msg.sender, tierId, months);
        
        totalRevenue += totalPrice;
    }

    /**
     * @dev Internal function to update subscription
     */
    function _updateSubscription(
        address artist,
        address subscriber,
        uint256 tierId,
        uint256 months
    ) internal {
        Subscription storage sub = subscriptions[artist][subscriber];
        
        uint256 startTime = block.timestamp;
        if (sub.expiresAt > block.timestamp) {
            // Extend existing subscription
            startTime = sub.expiresAt;
        } else if (!isSubscriber[artist][subscriber]) {
            // New subscriber
            artistSubscribers[artist].push(subscriber);
            isSubscriber[artist][subscriber] = true;
            totalSubscriptions++;
        }
        
        sub.tierId = tierId;
        sub.startedAt = block.timestamp;
        sub.expiresAt = startTime + (months * 30 days);
        sub.autoRenew = false;
        
        emit Subscribed(artist, subscriber, tierId, sub.expiresAt);
    }

    /**
     * @dev Check if a user has an active subscription
     */
    function hasActiveSubscription(address artist, address subscriber) external view returns (bool) {
        return subscriptions[artist][subscriber].expiresAt > block.timestamp;
    }

    /**
     * @dev Get subscription details
     */
    function getSubscription(address artist, address subscriber) external view returns (
        uint256 tierId,
        uint256 startedAt,
        uint256 expiresAt,
        bool isActive
    ) {
        Subscription storage sub = subscriptions[artist][subscriber];
        return (
            sub.tierId,
            sub.startedAt,
            sub.expiresAt,
            sub.expiresAt > block.timestamp
        );
    }

    /**
     * @dev Get artist's tier details
     */
    function getTier(address artist, uint256 tierId) external view returns (
        string memory name,
        string memory description,
        uint256 pricePerMonth,
        bool isActive,
        bool acceptsEth,
        address paymentToken
    ) {
        Tier storage tier = artistTiers[artist][tierId];
        return (
            tier.name,
            tier.description,
            tier.pricePerMonth,
            tier.isActive,
            tier.acceptsEth,
            tier.paymentToken
        );
    }

    /**
     * @dev Get subscriber count for an artist
     */
    function getSubscriberCount(address artist) external view returns (uint256) {
        return artistSubscribers[artist].length;
    }

    /**
     * @dev Withdraw ETH earnings (called by artists)
     */
    function withdrawEthEarnings() external nonReentrant {
        uint256 amount = artistEthEarnings[msg.sender];
        require(amount > 0, "No earnings");
        
        artistEthEarnings[msg.sender] = 0;
        
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Transfer failed");
        
        emit EarningsWithdrawn(msg.sender, amount);
    }

    /**
     * @dev Withdraw token earnings (called by artists)
     */
    function withdrawTokenEarnings(address token) external nonReentrant {
        uint256 amount = artistTokenEarnings[msg.sender][token];
        require(amount > 0, "No earnings");
        
        artistTokenEarnings[msg.sender][token] = 0;
        
        IERC20(token).safeTransfer(msg.sender, amount);
        
        emit EarningsWithdrawn(msg.sender, amount);
    }

    /**
     * @dev Update platform fee rate (owner only)
     */
    function setPlatformFeeRate(uint256 newRate) external onlyOwner {
        require(newRate <= MAX_FEE_RATE, "Fee too high");
        platformFeeRate = newRate;
    }
}
