// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title AudioBaseStaking
 * @dev Staking contract for $ABASE tokens with continuous reward distribution
 * @notice Stake $ABASE to earn more $ABASE rewards
 * @custom:token 0x2DeD753FfEA5AFb256Cc4f3865B867D1425F2134
 * @custom:network Base Mainnet
 */
contract AudioBaseStaking is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    
    // ============ HARDCODED CONFIGURATION ============
    // AudioBaseToken address on BASE mainnet
    address public constant ABASE_TOKEN = 0x2DeD753FfEA5AFb256Cc4f3865B867D1425F2134;
    
    // Default reward rate: 1e15 wei per second (~86.4 ABASE/day)
    uint256 public constant DEFAULT_REWARD_RATE = 1000000000000000;
    
    // ============ STATE VARIABLES ============
    IERC20 public immutable stakingToken;
    IERC20 public immutable rewardToken;
    
    uint256 public rewardRate;           // Rewards per second (in wei)
    uint256 public lastUpdateTime;       // Last time rewards were updated
    uint256 public rewardPerTokenStored; // Accumulated rewards per token
    uint256 public totalStaked;          // Total tokens staked
    uint256 public rewardsDuration;      // Duration of rewards (for UI display)
    
    mapping(address => uint256) public userStake;
    mapping(address => uint256) public userRewardPerTokenPaid;
    mapping(address => uint256) public rewards;
    
    // ============ EVENTS ============
    event Staked(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event RewardPaid(address indexed user, uint256 reward);
    event RewardRateUpdated(uint256 newRate);
    event RewardsFunded(uint256 amount);
    
    /**
     * @dev Constructor - NO ARGUMENTS NEEDED
     * Uses hardcoded ABASE token address and default reward rate
     */
    constructor() Ownable(msg.sender) {
        stakingToken = IERC20(ABASE_TOKEN);
        rewardToken = IERC20(ABASE_TOKEN);
        rewardRate = DEFAULT_REWARD_RATE;
        lastUpdateTime = block.timestamp;
        rewardsDuration = 365 days;
    }
    
    modifier updateReward(address account) {
        rewardPerTokenStored = rewardPerToken();
        lastUpdateTime = block.timestamp;
        
        if (account != address(0)) {
            rewards[account] = earned(account);
            userRewardPerTokenPaid[account] = rewardPerTokenStored;
        }
        _;
    }
    
    /**
     * @dev Calculate current reward per token
     */
    function rewardPerToken() public view returns (uint256) {
        if (totalStaked == 0) {
            return rewardPerTokenStored;
        }
        return rewardPerTokenStored + 
            ((block.timestamp - lastUpdateTime) * rewardRate * 1e18) / totalStaked;
    }
    
    /**
     * @dev Calculate earned rewards for an account
     * @param account Address to check
     */
    function earned(address account) public view returns (uint256) {
        return (userStake[account] * (rewardPerToken() - userRewardPerTokenPaid[account])) / 1e18 
            + rewards[account];
    }
    
    /**
     * @dev Stake tokens
     * @param amount Amount to stake
     */
    function stake(uint256 amount) external nonReentrant updateReward(msg.sender) {
        require(amount > 0, "Cannot stake 0");
        
        totalStaked += amount;
        userStake[msg.sender] += amount;
        
        stakingToken.safeTransferFrom(msg.sender, address(this), amount);
        emit Staked(msg.sender, amount);
    }
    
    /**
     * @dev Withdraw staked tokens
     * @param amount Amount to withdraw
     */
    function withdraw(uint256 amount) public nonReentrant updateReward(msg.sender) {
        require(amount > 0, "Cannot withdraw 0");
        require(userStake[msg.sender] >= amount, "Insufficient stake");
        
        totalStaked -= amount;
        userStake[msg.sender] -= amount;
        
        stakingToken.safeTransfer(msg.sender, amount);
        emit Withdrawn(msg.sender, amount);
    }
    
    /**
     * @dev Claim earned rewards
     */
    function claimReward() public nonReentrant updateReward(msg.sender) {
        uint256 reward = rewards[msg.sender];
        if (reward > 0) {
            rewards[msg.sender] = 0;
            rewardToken.safeTransfer(msg.sender, reward);
            emit RewardPaid(msg.sender, reward);
        }
    }
    
    /**
     * @dev Withdraw all staked tokens and claim rewards
     */
    function exit() external {
        withdraw(userStake[msg.sender]);
        claimReward();
    }
    
    /**
     * @dev Set new reward rate (owner only)
     * @param _rewardRate New reward rate per second
     */
    function setRewardRate(uint256 _rewardRate) external onlyOwner updateReward(address(0)) {
        rewardRate = _rewardRate;
        emit RewardRateUpdated(_rewardRate);
    }
    
    /**
     * @dev Fund the contract with reward tokens (owner only)
     * @param amount Amount of reward tokens to add
     */
    function fundRewards(uint256 amount) external onlyOwner {
        rewardToken.safeTransferFrom(msg.sender, address(this), amount);
        emit RewardsFunded(amount);
    }
    
    /**
     * @dev Get staking info for an account
     * @param account Address to check
     */
    function getStakingInfo(address account) external view returns (
        uint256 staked,
        uint256 earnedRewards,
        uint256 totalStakedInPool,
        uint256 currentRewardRate
    ) {
        return (
            userStake[account],
            earned(account),
            totalStaked,
            rewardRate
        );
    }
    
    /**
     * @dev Calculate APR based on current state
     * @return APR in basis points (10000 = 100%)
     */
    function getAPR() external view returns (uint256) {
        if (totalStaked == 0) return 0;
        
        uint256 yearlyRewards = rewardRate * 365 days;
        return (yearlyRewards * 10000) / totalStaked;
    }
    
    /**
     * @dev Get reward token balance available for distribution
     */
    function getRewardBalance() external view returns (uint256) {
        return rewardToken.balanceOf(address(this)) - totalStaked;
    }
}
