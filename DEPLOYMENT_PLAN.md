# AudioBASE Contract Deployment Plan

## Complete 8-Contract Ecosystem

### Overview
AudioBASE is a Web3 music platform on BASE featuring artist tipping, music NFTs, event ticketing, and the $ABASE utility token ecosystem.

---

## Deployment Order (Remix IDE)

### Phase 1: Treasury & Token Infrastructure

#### Step 1: Treasury.sol
```
Constructor Args: (none)
Save as: TREASURY_ADDRESS
```
- Deploys the platform treasury
- Holds all platform funds
- Supports authorized spenders

#### Step 2: AudioBaseToken.sol
```
Constructor Args: TREASURY_ADDRESS
Save as: TOKEN_ADDRESS
```
- Mints 1 billion $ABASE to treasury
- ERC-20 with burn capability
- Gasless approvals via ERC20Permit

#### Step 3: TokenVesting.sol
```
Constructor Args: TOKEN_ADDRESS
Save as: VESTING_ADDRESS
```
- Team/advisor token vesting
- Cliff + linear vesting support
- Revocable schedules

#### Step 4: Staking.sol
```
Constructor Args: 
  - _stakingToken: TOKEN_ADDRESS
  - _rewardToken: TOKEN_ADDRESS  
  - _rewardRate: 1000000000000000 (0.001 tokens/sec)
Save as: STAKING_ADDRESS
```
- Stake $ABASE to earn $ABASE
- Continuous reward distribution
- No lock-up period

---

### Phase 2: Core Platform Contracts

#### Step 5: ArtistTipping.sol
```
Constructor Args: YOUR_WALLET_ADDRESS (fee recipient)
Save as: TIPPING_ADDRESS
```
- 1% platform fee on tips
- Direct fan-to-artist payments
- Message support

#### Step 6: MusicNFTFactory.sol
```
Constructor Args: YOUR_WALLET_ADDRESS (fee recipient)
Save as: NFT_FACTORY_ADDRESS
```
- Create music NFT collections
- ERC-721 with ERC-2981 royalties
- Adjustable creation fee

#### Step 7: EventTicketing.sol
```
Constructor Args: YOUR_WALLET_ADDRESS (fee recipient)
Save as: TICKETING_ADDRESS
```
- ERC-1155 event tickets
- Multiple ticket types per event
- Dynamic pricing support

---

### Phase 3: Marketplace (Optional)

#### Step 8: NFTMarketplace.sol
```
Constructor Args: YOUR_WALLET_ADDRESS (fee recipient)
Save as: MARKETPLACE_ADDRESS
```
- 2.5% marketplace fee
- Primary and secondary sales
- Offer/bidding system
- Approved collections

---

## Estimated Deployment Costs

| Contract | Estimated Gas | Cost @ 0.001 gwei |
|----------|---------------|-------------------|
| Treasury | ~800,000 | ~0.0008 ETH |
| AudioBaseToken | ~1,200,000 | ~0.0012 ETH |
| TokenVesting | ~1,500,000 | ~0.0015 ETH |
| Staking | ~1,800,000 | ~0.0018 ETH |
| ArtistTipping | ~600,000 | ~0.0006 ETH |
| MusicNFTFactory | ~3,500,000 | ~0.0035 ETH |
| EventTicketing | ~2,500,000 | ~0.0025 ETH |
| NFTMarketplace | ~2,000,000 | ~0.0020 ETH |
| **Total** | ~13,900,000 | **~0.014 ETH** |

*Actual costs may vary based on network conditions*

---

## Post-Deployment Checklist

### Immediate Actions
- [ ] Verify all contracts on BaseScan
- [ ] Save all contract addresses
- [ ] Update frontend configuration

### Token Distribution
- [ ] Create team vesting schedules (TokenVesting)
- [ ] Create advisor vesting schedules
- [ ] Fund staking contract with 200M $ABASE
- [ ] Transfer tokens for artist grants

### Liquidity Setup
- [ ] Add liquidity on Aerodrome/Uniswap
- [ ] Lock LP tokens
- [ ] Submit to DEX aggregators

### Platform Integration
- [ ] Update useContractAddresses hook
- [ ] Test all contract interactions
- [ ] Enable paymaster sponsorship

---

## Contract Addresses (Fill After Deployment)

| Contract | Address | Tx Hash |
|----------|---------|---------|
| Treasury | | |
| AudioBaseToken | | |
| TokenVesting | | |
| Staking | | |
| ArtistTipping | | |
| MusicNFTFactory | | |
| EventTicketing | | |
| NFTMarketplace | | |

---

## Remix Deployment Instructions

### Prerequisites
1. MetaMask connected to BASE Mainnet
2. Sufficient ETH for gas (~0.02 ETH recommended)
3. OpenZeppelin contracts imported

### Steps
1. Go to [Remix IDE](https://remix.ethereum.org)
2. Create new files for each contract
3. Compile with Solidity ^0.8.19
4. Connect MetaMask (Injected Provider)
5. Deploy in order listed above
6. Save each contract address

### OpenZeppelin Import
Add to Remix:
```solidity
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
// etc.
```
Remix will auto-fetch from npm.

---

## Security Notes

1. **Private Keys**: Never share deployer private key
2. **Verification**: Verify all contracts on BaseScan
3. **Multi-sig**: Consider Gnosis Safe for treasury
4. **Audit**: Get security audit before mainnet launch
5. **Timelock**: Add timelock for governance (future)

---

## Support

- GitHub: [AudioBASE Repository]
- Discord: [Community Server]
- Twitter: [@AudioBASE]
