// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title MerchandiseEscrow
 * @dev Escrow contract for merchandise purchases with dispute resolution
 * @notice Holds payment until delivery confirmation or dispute resolution
 */
contract MerchandiseEscrow is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    enum OrderStatus {
        Created,
        Paid,
        Shipped,
        Delivered,
        Completed,
        Disputed,
        Refunded,
        Cancelled
    }

    struct Order {
        uint256 orderId;
        address buyer;
        address payable seller;
        uint256 amount;
        address tokenAddress; // address(0) for ETH
        OrderStatus status;
        uint256 createdAt;
        uint256 shippedAt;
        uint256 deliveredAt;
        string trackingInfo;
        string disputeReason;
        bytes32 itemHash; // Hash of item details for verification
    }

    // Platform configuration
    address public constant DEFAULT_FEE_RECIPIENT = 0xA73bF67c81C466baDE9cF2f0f34de6632D021C5F;
    uint256 public platformFeeRate = 250; // 2.5% platform fee
    uint256 public constant MAX_FEE_RATE = 1000; // 10% max
    uint256 public constant BASIS_POINTS = 10000;
    
    // Timeouts
    uint256 public autoCompleteDelay = 14 days; // Auto-complete after delivery
    uint256 public disputeWindow = 7 days; // Time to dispute after delivery
    uint256 public refundWindow = 30 days; // Max time for refund after payment

    // Order storage
    uint256 public nextOrderId = 1;
    mapping(uint256 => Order) public orders;
    mapping(address => uint256[]) public buyerOrders;
    mapping(address => uint256[]) public sellerOrders;

    // Dispute arbitrators
    mapping(address => bool) public arbitrators;

    // Events
    event OrderCreated(uint256 indexed orderId, address indexed buyer, address indexed seller, uint256 amount);
    event OrderPaid(uint256 indexed orderId, address indexed buyer, uint256 amount);
    event OrderShipped(uint256 indexed orderId, string trackingInfo);
    event OrderDelivered(uint256 indexed orderId);
    event OrderCompleted(uint256 indexed orderId, uint256 sellerAmount, uint256 platformFee);
    event OrderDisputed(uint256 indexed orderId, string reason);
    event DisputeResolved(uint256 indexed orderId, bool refunded);
    event OrderRefunded(uint256 indexed orderId, uint256 amount);
    event OrderCancelled(uint256 indexed orderId);
    event ArbitratorAdded(address indexed arbitrator);
    event ArbitratorRemoved(address indexed arbitrator);

    constructor() Ownable(msg.sender) {
        arbitrators[msg.sender] = true;
    }

    modifier onlyArbitrator() {
        require(arbitrators[msg.sender] || msg.sender == owner(), "Not an arbitrator");
        _;
    }

    modifier onlyBuyer(uint256 orderId) {
        require(orders[orderId].buyer == msg.sender, "Not the buyer");
        _;
    }

    modifier onlySeller(uint256 orderId) {
        require(orders[orderId].seller == msg.sender, "Not the seller");
        _;
    }

    /**
     * @dev Create a new order and pay in ETH
     * @param seller Seller address
     * @param itemHash Hash of item details for verification
     */
    function createOrderETH(
        address payable seller,
        bytes32 itemHash
    ) external payable nonReentrant returns (uint256) {
        require(msg.value > 0, "Amount must be > 0");
        require(seller != address(0), "Invalid seller");
        require(seller != msg.sender, "Cannot buy from yourself");

        uint256 orderId = nextOrderId++;
        
        orders[orderId] = Order({
            orderId: orderId,
            buyer: msg.sender,
            seller: seller,
            amount: msg.value,
            tokenAddress: address(0),
            status: OrderStatus.Paid,
            createdAt: block.timestamp,
            shippedAt: 0,
            deliveredAt: 0,
            trackingInfo: "",
            disputeReason: "",
            itemHash: itemHash
        });

        buyerOrders[msg.sender].push(orderId);
        sellerOrders[seller].push(orderId);

        emit OrderCreated(orderId, msg.sender, seller, msg.value);
        emit OrderPaid(orderId, msg.sender, msg.value);

        return orderId;
    }

    /**
     * @dev Create a new order and pay in ERC20 tokens
     * @param seller Seller address
     * @param token ERC20 token address
     * @param amount Token amount
     * @param itemHash Hash of item details
     */
    function createOrderERC20(
        address payable seller,
        address token,
        uint256 amount,
        bytes32 itemHash
    ) external nonReentrant returns (uint256) {
        require(amount > 0, "Amount must be > 0");
        require(seller != address(0), "Invalid seller");
        require(token != address(0), "Invalid token");
        require(seller != msg.sender, "Cannot buy from yourself");

        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);

        uint256 orderId = nextOrderId++;
        
        orders[orderId] = Order({
            orderId: orderId,
            buyer: msg.sender,
            seller: seller,
            amount: amount,
            tokenAddress: token,
            status: OrderStatus.Paid,
            createdAt: block.timestamp,
            shippedAt: 0,
            deliveredAt: 0,
            trackingInfo: "",
            disputeReason: "",
            itemHash: itemHash
        });

        buyerOrders[msg.sender].push(orderId);
        sellerOrders[seller].push(orderId);

        emit OrderCreated(orderId, msg.sender, seller, amount);
        emit OrderPaid(orderId, msg.sender, amount);

        return orderId;
    }

    /**
     * @dev Mark order as shipped (seller only)
     * @param orderId Order ID
     * @param trackingInfo Shipping tracking information
     */
    function markShipped(uint256 orderId, string calldata trackingInfo) external onlySeller(orderId) {
        Order storage order = orders[orderId];
        require(order.status == OrderStatus.Paid, "Invalid status");

        order.status = OrderStatus.Shipped;
        order.shippedAt = block.timestamp;
        order.trackingInfo = trackingInfo;

        emit OrderShipped(orderId, trackingInfo);
    }

    /**
     * @dev Confirm delivery (buyer only)
     * @param orderId Order ID
     */
    function confirmDelivery(uint256 orderId) external onlyBuyer(orderId) {
        Order storage order = orders[orderId];
        require(order.status == OrderStatus.Shipped, "Not shipped yet");

        order.status = OrderStatus.Delivered;
        order.deliveredAt = block.timestamp;

        emit OrderDelivered(orderId);
    }

    /**
     * @dev Complete order and release funds to seller
     * @param orderId Order ID
     */
    function completeOrder(uint256 orderId) external nonReentrant {
        Order storage order = orders[orderId];
        require(
            order.status == OrderStatus.Delivered || 
            (order.status == OrderStatus.Shipped && block.timestamp > order.shippedAt + autoCompleteDelay),
            "Cannot complete yet"
        );
        require(order.status != OrderStatus.Disputed, "Order is disputed");
        require(msg.sender == order.buyer || msg.sender == order.seller || arbitrators[msg.sender], "Unauthorized");

        order.status = OrderStatus.Completed;

        // Calculate fees
        uint256 platformFee = (order.amount * platformFeeRate) / BASIS_POINTS;
        uint256 sellerAmount = order.amount - platformFee;

        // Transfer funds
        if (order.tokenAddress == address(0)) {
            // ETH
            (bool feeSuccess, ) = payable(DEFAULT_FEE_RECIPIENT).call{value: platformFee}("");
            require(feeSuccess, "Fee transfer failed");
            
            (bool sellerSuccess, ) = order.seller.call{value: sellerAmount}("");
            require(sellerSuccess, "Seller transfer failed");
        } else {
            // ERC20
            IERC20 token = IERC20(order.tokenAddress);
            token.safeTransfer(DEFAULT_FEE_RECIPIENT, platformFee);
            token.safeTransfer(order.seller, sellerAmount);
        }

        emit OrderCompleted(orderId, sellerAmount, platformFee);
    }

    /**
     * @dev Open a dispute (buyer only, within dispute window)
     * @param orderId Order ID
     * @param reason Reason for dispute
     */
    function openDispute(uint256 orderId, string calldata reason) external onlyBuyer(orderId) {
        Order storage order = orders[orderId];
        require(
            order.status == OrderStatus.Shipped || 
            order.status == OrderStatus.Delivered,
            "Cannot dispute"
        );
        require(bytes(reason).length > 0, "Reason required");
        
        if (order.status == OrderStatus.Delivered) {
            require(block.timestamp <= order.deliveredAt + disputeWindow, "Dispute window closed");
        }

        order.status = OrderStatus.Disputed;
        order.disputeReason = reason;

        emit OrderDisputed(orderId, reason);
    }

    /**
     * @dev Resolve dispute (arbitrator only)
     * @param orderId Order ID
     * @param refundBuyer True to refund buyer, false to pay seller
     */
    function resolveDispute(uint256 orderId, bool refundBuyer) external onlyArbitrator nonReentrant {
        Order storage order = orders[orderId];
        require(order.status == OrderStatus.Disputed, "Not disputed");

        if (refundBuyer) {
            order.status = OrderStatus.Refunded;
            _refund(order);
        } else {
            order.status = OrderStatus.Completed;
            
            uint256 platformFee = (order.amount * platformFeeRate) / BASIS_POINTS;
            uint256 sellerAmount = order.amount - platformFee;

            if (order.tokenAddress == address(0)) {
                (bool feeSuccess, ) = payable(DEFAULT_FEE_RECIPIENT).call{value: platformFee}("");
                require(feeSuccess, "Fee transfer failed");
                (bool sellerSuccess, ) = order.seller.call{value: sellerAmount}("");
                require(sellerSuccess, "Seller transfer failed");
            } else {
                IERC20 token = IERC20(order.tokenAddress);
                token.safeTransfer(DEFAULT_FEE_RECIPIENT, platformFee);
                token.safeTransfer(order.seller, sellerAmount);
            }
            
            emit OrderCompleted(orderId, sellerAmount, platformFee);
        }

        emit DisputeResolved(orderId, refundBuyer);
    }

    /**
     * @dev Cancel order and refund (seller only, before shipping)
     * @param orderId Order ID
     */
    function cancelOrder(uint256 orderId) external onlySeller(orderId) nonReentrant {
        Order storage order = orders[orderId];
        require(order.status == OrderStatus.Paid, "Cannot cancel");

        order.status = OrderStatus.Cancelled;
        _refund(order);

        emit OrderCancelled(orderId);
    }

    /**
     * @dev Request refund (buyer only, if not shipped within refund window)
     * @param orderId Order ID
     */
    function requestRefund(uint256 orderId) external onlyBuyer(orderId) nonReentrant {
        Order storage order = orders[orderId];
        require(order.status == OrderStatus.Paid, "Invalid status");
        require(block.timestamp > order.createdAt + refundWindow, "Refund window not open");

        order.status = OrderStatus.Refunded;
        _refund(order);
    }

    /**
     * @dev Internal refund function
     */
    function _refund(Order storage order) internal {
        if (order.tokenAddress == address(0)) {
            (bool success, ) = payable(order.buyer).call{value: order.amount}("");
            require(success, "Refund failed");
        } else {
            IERC20(order.tokenAddress).safeTransfer(order.buyer, order.amount);
        }
        emit OrderRefunded(order.orderId, order.amount);
    }

    // View functions

    function getOrder(uint256 orderId) external view returns (Order memory) {
        return orders[orderId];
    }

    function getBuyerOrders(address buyer) external view returns (uint256[] memory) {
        return buyerOrders[buyer];
    }

    function getSellerOrders(address seller) external view returns (uint256[] memory) {
        return sellerOrders[seller];
    }

    // Admin functions

    function addArbitrator(address arbitrator) external onlyOwner {
        arbitrators[arbitrator] = true;
        emit ArbitratorAdded(arbitrator);
    }

    function removeArbitrator(address arbitrator) external onlyOwner {
        arbitrators[arbitrator] = false;
        emit ArbitratorRemoved(arbitrator);
    }

    function setPlatformFeeRate(uint256 newRate) external onlyOwner {
        require(newRate <= MAX_FEE_RATE, "Fee too high");
        platformFeeRate = newRate;
    }

    function setAutoCompleteDelay(uint256 newDelay) external onlyOwner {
        require(newDelay >= 1 days && newDelay <= 30 days, "Invalid delay");
        autoCompleteDelay = newDelay;
    }

    function setDisputeWindow(uint256 newWindow) external onlyOwner {
        require(newWindow >= 1 days && newWindow <= 30 days, "Invalid window");
        disputeWindow = newWindow;
    }

    function setRefundWindow(uint256 newWindow) external onlyOwner {
        require(newWindow >= 7 days && newWindow <= 90 days, "Invalid window");
        refundWindow = newWindow;
    }
}
