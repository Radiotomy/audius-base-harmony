// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title AudioBaseTreasury
 * @dev Platform treasury contract for holding and managing $ABASE tokens and ETH
 * @notice Supports authorized spenders for controlled fund distribution
 */
contract AudioBaseTreasury is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    
    mapping(address => bool) public authorizedSpenders;
    
    event SpenderAuthorized(address indexed spender);
    event SpenderRevoked(address indexed spender);
    event ETHWithdrawn(address indexed to, uint256 amount);
    event TokenWithdrawn(address indexed token, address indexed to, uint256 amount);
    event ETHReceived(address indexed from, uint256 amount);
    
    constructor() Ownable(msg.sender) {
        authorizedSpenders[msg.sender] = true;
    }
    
    receive() external payable {
        emit ETHReceived(msg.sender, msg.value);
    }
    
    modifier onlyAuthorized() {
        require(authorizedSpenders[msg.sender] || msg.sender == owner(), "Not authorized");
        _;
    }
    
    /**
     * @dev Authorize an address to withdraw funds
     * @param spender Address to authorize
     */
    function authorizeSpender(address spender) external onlyOwner {
        require(spender != address(0), "Invalid address");
        authorizedSpenders[spender] = true;
        emit SpenderAuthorized(spender);
    }
    
    /**
     * @dev Revoke spending authorization
     * @param spender Address to revoke
     */
    function revokeSpender(address spender) external onlyOwner {
        authorizedSpenders[spender] = false;
        emit SpenderRevoked(spender);
    }
    
    /**
     * @dev Withdraw ETH from treasury
     * @param to Recipient address
     * @param amount Amount of ETH to withdraw
     */
    function withdrawETH(address payable to, uint256 amount) external onlyAuthorized nonReentrant {
        require(to != address(0), "Invalid recipient");
        require(address(this).balance >= amount, "Insufficient ETH");
        (bool success, ) = to.call{value: amount}("");
        require(success, "ETH transfer failed");
        emit ETHWithdrawn(to, amount);
    }
    
    /**
     * @dev Withdraw ERC20 tokens from treasury
     * @param token Token contract address
     * @param to Recipient address
     * @param amount Amount of tokens to withdraw
     */
    function withdrawToken(address token, address to, uint256 amount) external onlyAuthorized nonReentrant {
        require(to != address(0), "Invalid recipient");
        IERC20(token).safeTransfer(to, amount);
        emit TokenWithdrawn(token, to, amount);
    }
    
    /**
     * @dev Get ETH balance of treasury
     */
    function getETHBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    /**
     * @dev Get token balance of treasury
     * @param token Token contract address
     */
    function getTokenBalance(address token) external view returns (uint256) {
        return IERC20(token).balanceOf(address(this));
    }
    
    /**
     * @dev Check if an address is an authorized spender
     * @param spender Address to check
     */
    function isAuthorizedSpender(address spender) external view returns (bool) {
        return authorizedSpenders[spender] || spender == owner();
    }
}
