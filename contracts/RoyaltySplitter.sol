// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title RoyaltySplitter
 * @dev Splits royalties and payments between multiple collaborating artists
 * @notice Deploy one splitter per collaboration, or use the factory pattern
 */
contract RoyaltySplitter is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    struct Split {
        address payable recipient;
        uint256 share; // Basis points (100 = 1%)
    }

    // Platform configuration
    address public constant DEFAULT_FEE_RECIPIENT = 0xA73bF67c81C466baDE9cF2f0f34de6632D021C5F;
    uint256 public platformFeeRate = 100; // 1% platform fee
    uint256 public constant MAX_FEE_RATE = 500; // 5% max
    uint256 public constant BASIS_POINTS = 10000;

    // Split configuration
    Split[] public splits;
    uint256 public totalShares;
    string public splitName;
    bool public immutable isLocked; // If true, splits cannot be modified

    // Tracking
    mapping(address => uint256) public ethReleased;
    mapping(IERC20 => mapping(address => uint256)) public erc20Released;
    uint256 public totalEthReceived;

    // Events
    event PaymentReceived(address indexed from, uint256 amount);
    event PaymentReleased(address indexed to, uint256 amount);
    event ERC20PaymentReleased(IERC20 indexed token, address indexed to, uint256 amount);
    event SplitCreated(string name, uint256 recipientCount);
    event PlatformFeeCollected(uint256 amount);

    /**
     * @dev Constructor for creating a new royalty splitter
     * @param _name Name/description of this split (e.g., "Track: Summer Vibes")
     * @param _recipients Array of recipient addresses
     * @param _shares Array of shares in basis points (must total 10000)
     * @param _locked If true, splits cannot be modified after creation
     */
    constructor(
        string memory _name,
        address payable[] memory _recipients,
        uint256[] memory _shares,
        bool _locked
    ) Ownable(msg.sender) {
        require(_recipients.length > 0, "No recipients");
        require(_recipients.length == _shares.length, "Length mismatch");
        require(_recipients.length <= 10, "Too many recipients");

        splitName = _name;
        isLocked = _locked;

        uint256 _totalShares = 0;
        for (uint256 i = 0; i < _recipients.length; i++) {
            require(_recipients[i] != address(0), "Invalid recipient");
            require(_shares[i] > 0, "Share must be > 0");
            
            splits.push(Split({
                recipient: _recipients[i],
                share: _shares[i]
            }));
            _totalShares += _shares[i];
        }

        require(_totalShares == BASIS_POINTS, "Shares must total 10000");
        totalShares = _totalShares;

        emit SplitCreated(_name, _recipients.length);
    }

    /**
     * @dev Receive ETH payments
     */
    receive() external payable {
        totalEthReceived += msg.value;
        emit PaymentReceived(msg.sender, msg.value);
    }

    /**
     * @dev Fallback function
     */
    fallback() external payable {
        totalEthReceived += msg.value;
        emit PaymentReceived(msg.sender, msg.value);
    }

    /**
     * @dev Release all pending ETH to all recipients
     */
    function releaseAll() external nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to release");

        // Calculate and send platform fee
        uint256 platformFee = (balance * platformFeeRate) / BASIS_POINTS;
        if (platformFee > 0) {
            (bool feeSuccess, ) = payable(DEFAULT_FEE_RECIPIENT).call{value: platformFee}("");
            require(feeSuccess, "Fee transfer failed");
            emit PlatformFeeCollected(platformFee);
        }

        uint256 distributable = balance - platformFee;

        // Distribute to all recipients
        for (uint256 i = 0; i < splits.length; i++) {
            uint256 payment = (distributable * splits[i].share) / BASIS_POINTS;
            if (payment > 0) {
                ethReleased[splits[i].recipient] += payment;
                (bool success, ) = splits[i].recipient.call{value: payment}("");
                require(success, "Transfer failed");
                emit PaymentReleased(splits[i].recipient, payment);
            }
        }
    }

    /**
     * @dev Release pending ETH to a specific recipient
     * @param index Index of the recipient in the splits array
     */
    function release(uint256 index) external nonReentrant {
        require(index < splits.length, "Invalid index");
        
        Split storage split = splits[index];
        uint256 balance = address(this).balance;
        uint256 payment = (balance * split.share) / BASIS_POINTS;
        
        require(payment > 0, "No payment due");

        ethReleased[split.recipient] += payment;
        (bool success, ) = split.recipient.call{value: payment}("");
        require(success, "Transfer failed");
        
        emit PaymentReleased(split.recipient, payment);
    }

    /**
     * @dev Release all pending ERC20 tokens to all recipients
     * @param token The ERC20 token to release
     */
    function releaseAllERC20(IERC20 token) external nonReentrant {
        uint256 balance = token.balanceOf(address(this));
        require(balance > 0, "No token balance");

        // Calculate and send platform fee
        uint256 platformFee = (balance * platformFeeRate) / BASIS_POINTS;
        if (platformFee > 0) {
            token.safeTransfer(DEFAULT_FEE_RECIPIENT, platformFee);
            emit PlatformFeeCollected(platformFee);
        }

        uint256 distributable = balance - platformFee;

        // Distribute to all recipients
        for (uint256 i = 0; i < splits.length; i++) {
            uint256 payment = (distributable * splits[i].share) / BASIS_POINTS;
            if (payment > 0) {
                erc20Released[token][splits[i].recipient] += payment;
                token.safeTransfer(splits[i].recipient, payment);
                emit ERC20PaymentReleased(token, splits[i].recipient, payment);
            }
        }
    }

    /**
     * @dev Get split details for a recipient
     * @param index Index of the recipient
     */
    function getSplit(uint256 index) external view returns (address recipient, uint256 share) {
        require(index < splits.length, "Invalid index");
        Split storage split = splits[index];
        return (split.recipient, split.share);
    }

    /**
     * @dev Get total number of recipients
     */
    function getRecipientCount() external view returns (uint256) {
        return splits.length;
    }

    /**
     * @dev Get all splits at once
     */
    function getAllSplits() external view returns (address[] memory recipients, uint256[] memory shares) {
        recipients = new address[](splits.length);
        shares = new uint256[](splits.length);
        
        for (uint256 i = 0; i < splits.length; i++) {
            recipients[i] = splits[i].recipient;
            shares[i] = splits[i].share;
        }
    }

    /**
     * @dev Calculate pending payment for a recipient
     * @param index Index of the recipient
     */
    function pendingPayment(uint256 index) external view returns (uint256) {
        require(index < splits.length, "Invalid index");
        uint256 balance = address(this).balance;
        uint256 afterFee = balance - ((balance * platformFeeRate) / BASIS_POINTS);
        return (afterFee * splits[index].share) / BASIS_POINTS;
    }

    /**
     * @dev Update platform fee rate (owner only)
     * @param newRate New fee rate in basis points
     */
    function setPlatformFeeRate(uint256 newRate) external onlyOwner {
        require(newRate <= MAX_FEE_RATE, "Fee too high");
        platformFeeRate = newRate;
    }
}

/**
 * @title RoyaltySplitterFactory
 * @dev Factory for creating RoyaltySplitter contracts
 */
contract RoyaltySplitterFactory is Ownable {
    
    event SplitterCreated(address indexed splitter, string name, address indexed creator);
    
    address[] public allSplitters;
    mapping(address => address[]) public userSplitters;

    constructor() Ownable(msg.sender) {}

    /**
     * @dev Create a new royalty splitter
     * @param name Name/description of this split
     * @param recipients Array of recipient addresses
     * @param shares Array of shares in basis points (must total 10000)
     * @param locked If true, splits cannot be modified after creation
     */
    function createSplitter(
        string memory name,
        address payable[] memory recipients,
        uint256[] memory shares,
        bool locked
    ) external returns (address) {
        RoyaltySplitter splitter = new RoyaltySplitter(name, recipients, shares, locked);
        
        // Transfer ownership to the creator
        splitter.transferOwnership(msg.sender);
        
        allSplitters.push(address(splitter));
        userSplitters[msg.sender].push(address(splitter));
        
        emit SplitterCreated(address(splitter), name, msg.sender);
        
        return address(splitter);
    }

    /**
     * @dev Get all splitters created by a user
     */
    function getUserSplitters(address user) external view returns (address[] memory) {
        return userSplitters[user];
    }

    /**
     * @dev Get total number of splitters created
     */
    function getSplitterCount() external view returns (uint256) {
        return allSplitters.length;
    }
}
