// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title AudioBaseToken ($ABASE)
 * @dev ERC20 token for the AudioBASE music platform
 * @notice Fixed supply of 1 billion tokens, all minted to treasury on deployment
 * 
 * Features:
 * - Fixed 1B supply (deflationary via burn)
 * - ERC20Permit for gasless approvals
 * - Burnable for deflationary mechanics
 */
contract AudioBaseToken is ERC20, ERC20Burnable, ERC20Permit, Ownable {
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18; // 1 billion tokens
    
    event TokensMinted(address indexed treasury, uint256 amount);
    
    /**
     * @dev Constructor mints entire supply to treasury
     * @param treasury Address of the treasury contract to receive all tokens
     */
    constructor(address treasury) 
        ERC20("AudioBASE", "ABASE") 
        ERC20Permit("AudioBASE")
        Ownable(msg.sender)
    {
        require(treasury != address(0), "Invalid treasury address");
        _mint(treasury, MAX_SUPPLY);
        emit TokensMinted(treasury, MAX_SUPPLY);
    }
    
    /**
     * @dev Returns the number of decimals (18)
     */
    function decimals() public pure override returns (uint8) {
        return 18;
    }
    
    /**
     * @dev Returns circulating supply (total supply minus burned tokens)
     */
    function circulatingSupply() external view returns (uint256) {
        return totalSupply();
    }
    
    /**
     * @dev Returns amount of tokens burned
     */
    function burnedSupply() external view returns (uint256) {
        return MAX_SUPPLY - totalSupply();
    }
}
