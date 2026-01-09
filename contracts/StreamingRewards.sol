// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title StreamingRewards
 * @dev Rewards listeners with $ABASE tokens based on listening time
 * @notice Integrates with off-chain listening data from the platform
 */
contract StreamingRewards is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // Platform configuration
    address public constant DEFAULT_FEE_RECIPIENT = 0xA73bF67c81C466baDE9cF2f0f34de6632D021C5F;
    
    // Reward token (AudioBase token)
    IERC20 public rewardToken;
    
    // Reward configuration
    uint256 public rewardPerMinute = 1e16; // 0.01 tokens per minute of listening
    uint256 public minClaimAmount = 1e18; // Minimum 1 token to claim
    uint256 public dailyRewardCap = 100e18; // Max 100 tokens per user per day
    
    // Tracking
    mapping(address => uint256) public pendingRewards;
    mapping(address => uint256) public totalClaimed;
    mapping(address => uint256) public lastClaimDay;
    mapping(address => uint256) public dailyClaimed;
    
    // Authorized reporters (backend services that report listening time)
    mapping(address => bool) public authorizedReporters;
    
    // Stats
    uint256 public totalRewardsDistributed;
    uint256 public totalListeningMinutes;
    
    // Events
    event RewardAccrued(address indexed listener, uint256 minutes, uint256 reward);
    event RewardClaimed(address indexed listener, uint256 amount);
    event ReporterUpdated(address indexed reporter, bool authorized);
    event RewardRateUpdated(uint256 newRate);
    event RewardTokenUpdated(address indexed token);

    constructor() Ownable(msg.sender) {}

    /**
     * @dev Set the reward token address
     * @param _token Address of the ERC20 reward token
     */
    function setRewardToken(address _token) external onlyOwner {
        require(_token != address(0), "Invalid token");
        rewardToken = IERC20(_token);
        emit RewardTokenUpdated(_token);
    }

    /**
     * @dev Add or remove an authorized reporter
     * @param reporter Address of the reporter
     * @param authorized Whether the reporter is authorized
     */
    function setReporter(address reporter, bool authorized) external onlyOwner {
        authorizedReporters[reporter] = authorized;
        emit ReporterUpdated(reporter, authorized);
    }

    /**
     * @dev Report listening time for a user (called by authorized backend)
     * @param listener Address of the listener
     * @param minutes Number of minutes listened
     */
    function reportListening(address listener, uint256 minutes) external {
        require(authorizedReporters[msg.sender], "Not authorized");
        require(listener != address(0), "Invalid listener");
        require(minutes > 0, "No listening time");
        require(minutes <= 1440, "Exceeds daily max"); // Max 24 hours
        
        uint256 reward = minutes * rewardPerMinute;
        
        pendingRewards[listener] += reward;
        totalListeningMinutes += minutes;
        
        emit RewardAccrued(listener, minutes, reward);
    }

    /**
     * @dev Report listening time for multiple users (batch)
     * @param listeners Array of listener addresses
     * @param minutesArray Array of minutes listened per user
     */
    function reportListeningBatch(
        address[] calldata listeners,
        uint256[] calldata minutesArray
    ) external {
        require(authorizedReporters[msg.sender], "Not authorized");
        require(listeners.length == minutesArray.length, "Length mismatch");
        require(listeners.length <= 100, "Batch too large");
        
        for (uint256 i = 0; i < listeners.length; i++) {
            if (listeners[i] != address(0) && minutesArray[i] > 0 && minutesArray[i] <= 1440) {
                uint256 reward = minutesArray[i] * rewardPerMinute;
                pendingRewards[listeners[i]] += reward;
                totalListeningMinutes += minutesArray[i];
                
                emit RewardAccrued(listeners[i], minutesArray[i], reward);
            }
        }
    }

    /**
     * @dev Claim pending rewards
     */
    function claimRewards() external nonReentrant {
        uint256 pending = pendingRewards[msg.sender];
        require(pending >= minClaimAmount, "Below minimum claim");
        require(address(rewardToken) != address(0), "Reward token not set");
        
        // Check daily cap
        uint256 today = block.timestamp / 1 days;
        if (lastClaimDay[msg.sender] != today) {
            lastClaimDay[msg.sender] = today;
            dailyClaimed[msg.sender] = 0;
        }
        
        uint256 claimable = pending;
        if (dailyClaimed[msg.sender] + claimable > dailyRewardCap) {
            claimable = dailyRewardCap - dailyClaimed[msg.sender];
        }
        require(claimable > 0, "Daily cap reached");
        
        // Update state
        pendingRewards[msg.sender] -= claimable;
        totalClaimed[msg.sender] += claimable;
        dailyClaimed[msg.sender] += claimable;
        totalRewardsDistributed += claimable;
        
        // Transfer rewards
        rewardToken.safeTransfer(msg.sender, claimable);
        
        emit RewardClaimed(msg.sender, claimable);
    }

    /**
     * @dev Get pending rewards for a user
     * @param user Address of the user
     */
    function getPendingRewards(address user) external view returns (uint256) {
        return pendingRewards[user];
    }

    /**
     * @dev Get user stats
     * @param user Address of the user
     */
    function getUserStats(address user) external view returns (
        uint256 pending,
        uint256 claimed,
        uint256 dailyRemaining
    ) {
        pending = pendingRewards[user];
        claimed = totalClaimed[user];
        
        uint256 today = block.timestamp / 1 days;
        if (lastClaimDay[user] == today) {
            dailyRemaining = dailyRewardCap > dailyClaimed[user] 
                ? dailyRewardCap - dailyClaimed[user] 
                : 0;
        } else {
            dailyRemaining = dailyRewardCap;
        }
    }

    /**
     * @dev Update reward rate (owner only)
     * @param newRate New reward per minute in wei
     */
    function setRewardPerMinute(uint256 newRate) external onlyOwner {
        require(newRate > 0, "Rate must be > 0");
        require(newRate <= 1e18, "Rate too high"); // Max 1 token per minute
        rewardPerMinute = newRate;
        emit RewardRateUpdated(newRate);
    }

    /**
     * @dev Update minimum claim amount
     */
    function setMinClaimAmount(uint256 amount) external onlyOwner {
        minClaimAmount = amount;
    }

    /**
     * @dev Update daily reward cap
     */
    function setDailyRewardCap(uint256 cap) external onlyOwner {
        dailyRewardCap = cap;
    }

    /**
     * @dev Fund the contract with reward tokens
     * @param amount Amount of tokens to deposit
     */
    function fundRewards(uint256 amount) external {
        require(address(rewardToken) != address(0), "Reward token not set");
        rewardToken.safeTransferFrom(msg.sender, address(this), amount);
    }

    /**
     * @dev Get contract reward balance
     */
    function getRewardBalance() external view returns (uint256) {
        if (address(rewardToken) == address(0)) return 0;
        return rewardToken.balanceOf(address(this));
    }

    /**
     * @dev Emergency withdraw (owner only)
     */
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        IERC20(token).safeTransfer(DEFAULT_FEE_RECIPIENT, amount);
    }
}
