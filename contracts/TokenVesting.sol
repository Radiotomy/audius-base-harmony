// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title TokenVesting
 * @dev Vesting contract for team, advisors, and other stakeholders
 * @notice Supports cliff periods and linear vesting with optional revocability
 */
contract TokenVesting is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    
    IERC20 public immutable token;
    
    struct VestingSchedule {
        uint256 totalAmount;      // Total tokens to vest
        uint256 startTime;        // Vesting start timestamp
        uint256 cliffDuration;    // Cliff period in seconds
        uint256 vestingDuration;  // Total vesting duration in seconds
        uint256 amountClaimed;    // Amount already claimed
        bool revocable;           // Can be revoked by owner
        bool revoked;             // Has been revoked
    }
    
    mapping(address => VestingSchedule) public vestingSchedules;
    address[] public beneficiaries;
    
    event VestingCreated(
        address indexed beneficiary, 
        uint256 amount, 
        uint256 startTime,
        uint256 cliffDuration,
        uint256 vestingDuration
    );
    event TokensClaimed(address indexed beneficiary, uint256 amount);
    event VestingRevoked(address indexed beneficiary, uint256 refunded);
    
    constructor(address _token) Ownable(msg.sender) {
        require(_token != address(0), "Invalid token address");
        token = IERC20(_token);
    }
    
    /**
     * @dev Create a vesting schedule for a beneficiary
     * @param beneficiary Address to receive vested tokens
     * @param amount Total amount of tokens to vest
     * @param startTime Vesting start timestamp
     * @param cliffDuration Duration of cliff period in seconds
     * @param vestingDuration Total vesting duration in seconds
     * @param revocable Whether the vesting can be revoked
     */
    function createVesting(
        address beneficiary,
        uint256 amount,
        uint256 startTime,
        uint256 cliffDuration,
        uint256 vestingDuration,
        bool revocable
    ) external onlyOwner {
        require(beneficiary != address(0), "Invalid beneficiary");
        require(amount > 0, "Amount must be > 0");
        require(vestingDuration > 0, "Duration must be > 0");
        require(vestingSchedules[beneficiary].totalAmount == 0, "Vesting already exists");
        require(cliffDuration <= vestingDuration, "Cliff > duration");
        
        vestingSchedules[beneficiary] = VestingSchedule({
            totalAmount: amount,
            startTime: startTime,
            cliffDuration: cliffDuration,
            vestingDuration: vestingDuration,
            amountClaimed: 0,
            revocable: revocable,
            revoked: false
        });
        
        beneficiaries.push(beneficiary);
        
        token.safeTransferFrom(msg.sender, address(this), amount);
        
        emit VestingCreated(beneficiary, amount, startTime, cliffDuration, vestingDuration);
    }
    
    /**
     * @dev Claim vested tokens
     */
    function claim() external nonReentrant {
        VestingSchedule storage schedule = vestingSchedules[msg.sender];
        require(schedule.totalAmount > 0, "No vesting schedule");
        require(!schedule.revoked, "Vesting revoked");
        
        uint256 claimable = _calculateClaimable(schedule);
        require(claimable > 0, "Nothing to claim");
        
        schedule.amountClaimed += claimable;
        token.safeTransfer(msg.sender, claimable);
        
        emit TokensClaimed(msg.sender, claimable);
    }
    
    /**
     * @dev Calculate claimable amount for a schedule
     */
    function _calculateClaimable(VestingSchedule memory schedule) internal view returns (uint256) {
        if (block.timestamp < schedule.startTime + schedule.cliffDuration) {
            return 0;
        }
        
        uint256 elapsed = block.timestamp - schedule.startTime;
        uint256 vested;
        
        if (elapsed >= schedule.vestingDuration) {
            vested = schedule.totalAmount;
        } else {
            vested = (schedule.totalAmount * elapsed) / schedule.vestingDuration;
        }
        
        return vested - schedule.amountClaimed;
    }
    
    /**
     * @dev Revoke a vesting schedule (only for revocable schedules)
     * @param beneficiary Address whose vesting to revoke
     */
    function revoke(address beneficiary) external onlyOwner {
        VestingSchedule storage schedule = vestingSchedules[beneficiary];
        require(schedule.totalAmount > 0, "No vesting schedule");
        require(schedule.revocable, "Not revocable");
        require(!schedule.revoked, "Already revoked");
        
        uint256 claimable = _calculateClaimable(schedule);
        uint256 remaining = schedule.totalAmount - schedule.amountClaimed - claimable;
        
        schedule.revoked = true;
        
        // Send vested tokens to beneficiary
        if (claimable > 0) {
            schedule.amountClaimed += claimable;
            token.safeTransfer(beneficiary, claimable);
        }
        
        // Return unvested tokens to owner
        if (remaining > 0) {
            token.safeTransfer(owner(), remaining);
        }
        
        emit VestingRevoked(beneficiary, remaining);
    }
    
    /**
     * @dev Get claimable amount for an address
     * @param beneficiary Address to check
     */
    function getClaimable(address beneficiary) external view returns (uint256) {
        VestingSchedule memory schedule = vestingSchedules[beneficiary];
        if (schedule.revoked) return 0;
        return _calculateClaimable(schedule);
    }
    
    /**
     * @dev Get vesting info for an address
     * @param beneficiary Address to check
     */
    function getVestingInfo(address beneficiary) external view returns (
        uint256 totalAmount,
        uint256 amountClaimed,
        uint256 claimable,
        uint256 vestingEnd,
        bool revoked
    ) {
        VestingSchedule memory schedule = vestingSchedules[beneficiary];
        return (
            schedule.totalAmount,
            schedule.amountClaimed,
            schedule.revoked ? 0 : _calculateClaimable(schedule),
            schedule.startTime + schedule.vestingDuration,
            schedule.revoked
        );
    }
    
    /**
     * @dev Get total number of beneficiaries
     */
    function getBeneficiaryCount() external view returns (uint256) {
        return beneficiaries.length;
    }
}
