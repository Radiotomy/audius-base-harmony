// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title PlaylistCuration
 * @dev Rewards curators based on playlist performance and engagement
 * @notice Curators earn tokens when their playlists drive listens
 */
contract PlaylistCuration is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // Platform configuration
    address public constant DEFAULT_FEE_RECIPIENT = 0xA73bF67c81C466baDE9cF2f0f34de6632D021C5F;
    
    // Reward token
    IERC20 public rewardToken;
    
    // Reward rates
    uint256 public rewardPerPlay = 1e15; // 0.001 tokens per play from playlist
    uint256 public rewardPerFollower = 1e16; // 0.01 tokens per new follower
    uint256 public minPayoutThreshold = 1e18; // 1 token minimum
    
    struct Playlist {
        address curator;
        string playlistId; // Off-chain playlist ID
        uint256 totalPlays;
        uint256 totalFollowers;
        uint256 totalEarned;
        bool isActive;
        uint256 createdAt;
    }
    
    // Playlist tracking
    mapping(bytes32 => Playlist) public playlists;
    mapping(address => bytes32[]) public curatorPlaylists;
    
    // Curator earnings
    mapping(address => uint256) public pendingRewards;
    mapping(address => uint256) public totalWithdrawn;
    
    // Authorized reporters
    mapping(address => bool) public authorizedReporters;
    
    // Stats
    uint256 public totalPlaylistsRegistered;
    uint256 public totalRewardsDistributed;

    // Events
    event PlaylistRegistered(bytes32 indexed playlistHash, address indexed curator, string playlistId);
    event PlaysRecorded(bytes32 indexed playlistHash, uint256 plays, uint256 reward);
    event FollowersRecorded(bytes32 indexed playlistHash, uint256 followers, uint256 reward);
    event RewardsClaimed(address indexed curator, uint256 amount);
    event ReporterUpdated(address indexed reporter, bool authorized);

    constructor() Ownable(msg.sender) {}

    /**
     * @dev Set the reward token
     */
    function setRewardToken(address _token) external onlyOwner {
        require(_token != address(0), "Invalid token");
        rewardToken = IERC20(_token);
    }

    /**
     * @dev Add or remove an authorized reporter
     */
    function setReporter(address reporter, bool authorized) external onlyOwner {
        authorizedReporters[reporter] = authorized;
        emit ReporterUpdated(reporter, authorized);
    }

    /**
     * @dev Register a playlist for rewards
     * @param playlistId Off-chain playlist identifier
     */
    function registerPlaylist(string memory playlistId) external returns (bytes32) {
        require(bytes(playlistId).length > 0, "Invalid playlist ID");
        
        bytes32 playlistHash = keccak256(abi.encodePacked(msg.sender, playlistId));
        require(playlists[playlistHash].createdAt == 0, "Already registered");
        
        playlists[playlistHash] = Playlist({
            curator: msg.sender,
            playlistId: playlistId,
            totalPlays: 0,
            totalFollowers: 0,
            totalEarned: 0,
            isActive: true,
            createdAt: block.timestamp
        });
        
        curatorPlaylists[msg.sender].push(playlistHash);
        totalPlaylistsRegistered++;
        
        emit PlaylistRegistered(playlistHash, msg.sender, playlistId);
        
        return playlistHash;
    }

    /**
     * @dev Record plays for a playlist (called by authorized reporter)
     * @param playlistHash Hash of the playlist
     * @param plays Number of new plays
     */
    function recordPlays(bytes32 playlistHash, uint256 plays) external {
        require(authorizedReporters[msg.sender], "Not authorized");
        
        Playlist storage playlist = playlists[playlistHash];
        require(playlist.createdAt > 0, "Playlist not found");
        require(playlist.isActive, "Playlist not active");
        require(plays > 0, "No plays");
        
        uint256 reward = plays * rewardPerPlay;
        
        playlist.totalPlays += plays;
        playlist.totalEarned += reward;
        pendingRewards[playlist.curator] += reward;
        
        emit PlaysRecorded(playlistHash, plays, reward);
    }

    /**
     * @dev Record new followers for a playlist
     * @param playlistHash Hash of the playlist
     * @param newFollowers Number of new followers
     */
    function recordFollowers(bytes32 playlistHash, uint256 newFollowers) external {
        require(authorizedReporters[msg.sender], "Not authorized");
        
        Playlist storage playlist = playlists[playlistHash];
        require(playlist.createdAt > 0, "Playlist not found");
        require(playlist.isActive, "Playlist not active");
        require(newFollowers > 0, "No followers");
        
        uint256 reward = newFollowers * rewardPerFollower;
        
        playlist.totalFollowers += newFollowers;
        playlist.totalEarned += reward;
        pendingRewards[playlist.curator] += reward;
        
        emit FollowersRecorded(playlistHash, newFollowers, reward);
    }

    /**
     * @dev Batch record plays for multiple playlists
     */
    function recordPlaysBatch(
        bytes32[] calldata playlistHashes,
        uint256[] calldata playsArray
    ) external {
        require(authorizedReporters[msg.sender], "Not authorized");
        require(playlistHashes.length == playsArray.length, "Length mismatch");
        require(playlistHashes.length <= 50, "Batch too large");
        
        for (uint256 i = 0; i < playlistHashes.length; i++) {
            Playlist storage playlist = playlists[playlistHashes[i]];
            if (playlist.createdAt > 0 && playlist.isActive && playsArray[i] > 0) {
                uint256 reward = playsArray[i] * rewardPerPlay;
                playlist.totalPlays += playsArray[i];
                playlist.totalEarned += reward;
                pendingRewards[playlist.curator] += reward;
                
                emit PlaysRecorded(playlistHashes[i], playsArray[i], reward);
            }
        }
    }

    /**
     * @dev Claim pending rewards
     */
    function claimRewards() external nonReentrant {
        uint256 pending = pendingRewards[msg.sender];
        require(pending >= minPayoutThreshold, "Below minimum");
        require(address(rewardToken) != address(0), "Token not set");
        
        pendingRewards[msg.sender] = 0;
        totalWithdrawn[msg.sender] += pending;
        totalRewardsDistributed += pending;
        
        rewardToken.safeTransfer(msg.sender, pending);
        
        emit RewardsClaimed(msg.sender, pending);
    }

    /**
     * @dev Get curator stats
     */
    function getCuratorStats(address curator) external view returns (
        uint256 playlistCount,
        uint256 pending,
        uint256 withdrawn
    ) {
        return (
            curatorPlaylists[curator].length,
            pendingRewards[curator],
            totalWithdrawn[curator]
        );
    }

    /**
     * @dev Get playlist details
     */
    function getPlaylist(bytes32 playlistHash) external view returns (
        address curator,
        string memory playlistId,
        uint256 totalPlays,
        uint256 totalFollowers,
        uint256 totalEarned,
        bool isActive
    ) {
        Playlist storage p = playlists[playlistHash];
        return (
            p.curator,
            p.playlistId,
            p.totalPlays,
            p.totalFollowers,
            p.totalEarned,
            p.isActive
        );
    }

    /**
     * @dev Get all playlists for a curator
     */
    function getCuratorPlaylists(address curator) external view returns (bytes32[] memory) {
        return curatorPlaylists[curator];
    }

    /**
     * @dev Deactivate a playlist (curator only)
     */
    function deactivatePlaylist(bytes32 playlistHash) external {
        Playlist storage playlist = playlists[playlistHash];
        require(playlist.curator == msg.sender, "Not curator");
        playlist.isActive = false;
    }

    /**
     * @dev Update reward rates (owner only)
     */
    function setRewardRates(
        uint256 _rewardPerPlay,
        uint256 _rewardPerFollower
    ) external onlyOwner {
        rewardPerPlay = _rewardPerPlay;
        rewardPerFollower = _rewardPerFollower;
    }

    /**
     * @dev Update minimum payout threshold
     */
    function setMinPayoutThreshold(uint256 threshold) external onlyOwner {
        minPayoutThreshold = threshold;
    }

    /**
     * @dev Fund the contract with reward tokens
     */
    function fundRewards(uint256 amount) external {
        require(address(rewardToken) != address(0), "Token not set");
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
