# $ABASE Tokenomics

## Overview

**$ABASE** is the native utility token of the AudioBASE music platform, built on BASE (Ethereum L2). It powers the platform's economy, governance, and reward systems.

---

## Token Details

| Property | Value |
|----------|-------|
| **Name** | AudioBASE |
| **Symbol** | ABASE |
| **Network** | BASE (Ethereum L2) |
| **Standard** | ERC-20 |
| **Max Supply** | 1,000,000,000 (1 Billion) |
| **Decimals** | 18 |
| **Burnable** | Yes (deflationary) |

---

## Token Distribution

| Allocation | Percentage | Amount | Vesting Schedule |
|------------|------------|--------|------------------|
| **Community/Ecosystem** | 40% | 400,000,000 | Released over 4 years |
| **Staking Rewards** | 20% | 200,000,000 | Released over 5 years |
| **Team** | 15% | 150,000,000 | 1 year cliff, 3 year linear vest |
| **Advisors** | 5% | 50,000,000 | 6 month cliff, 2 year linear vest |
| **Treasury** | 10% | 100,000,000 | DAO controlled |
| **Initial Liquidity** | 5% | 50,000,000 | Immediate (DEX pools) |
| **Artist Grants** | 5% | 50,000,000 | Distributed to verified artists |

---

## Token Utility

### 1. Platform Fee Discounts
- **50% discount** on all platform fees when paying with $ABASE
- Applies to: NFT minting, marketplace fees, event ticket fees

### 2. Premium Features Access
- Exclusive artist tools and analytics
- Priority customer support
- Early access to new features

### 3. Artist Verification Staking
- Artists stake $ABASE to get verified status
- Minimum stake: 10,000 $ABASE
- Slashing for policy violations

### 4. Governance Voting (Future)
- Vote on platform decisions
- Propose new features
- Treasury spending approval

### 5. NFT & Event Benefits
- Discounted NFT minting costs
- VIP access to events
- Exclusive NFT drops for stakers

### 6. Staking Rewards
- Stake $ABASE to earn more $ABASE
- Variable APR based on total staked
- No lock-up period (flexible staking)

---

## Vesting Schedules

### Team Tokens (150M)
```
Cliff:     12 months (1 year)
Vesting:   36 months (3 years) linear
Total:     48 months until fully vested
Revocable: Yes (for departures)
```

### Advisor Tokens (50M)
```
Cliff:     6 months
Vesting:   24 months (2 years) linear
Total:     30 months until fully vested
Revocable: Yes
```

### Community/Ecosystem (400M)
```
Release Schedule:
- Year 1: 100M (25%)
- Year 2: 100M (25%)
- Year 3: 100M (25%)
- Year 4: 100M (25%)
```

---

## Staking Economics

### Reward Rate
- Initial: ~0.001 $ABASE per second per total staked
- Adjustable by governance

### Projected APR
| Total Staked | Estimated APR |
|--------------|---------------|
| 10M $ABASE | ~63% |
| 50M $ABASE | ~13% |
| 100M $ABASE | ~6% |
| 200M $ABASE | ~3% |

*APR decreases as more tokens are staked*

---

## Deflationary Mechanics

### Token Burns
1. **Platform Fee Burns**: 10% of platform fees collected in $ABASE are burned
2. **NFT Minting Burns**: 5% of $ABASE used for NFT minting is burned
3. **Voluntary Burns**: Users can burn tokens via ERC20Burnable

### Burn Tracking
- `burnedSupply()` function tracks total burned
- `circulatingSupply()` returns current circulating supply

---

## Treasury Management

### Treasury Address
- Holds all tokens at launch
- Multi-sig controlled
- Authorized spenders for controlled distribution

### Spending Categories
1. **Development**: Platform improvements, security audits
2. **Marketing**: User acquisition, partnerships
3. **Grants**: Artist onboarding incentives
4. **Liquidity**: DEX pool maintenance
5. **Operations**: Team salaries, infrastructure

---

## Launch Strategy

### Phase 1: Token Launch
1. Deploy Treasury contract
2. Deploy AudioBaseToken (mints 1B to treasury)
3. Deploy Vesting contract
4. Deploy Staking contract

### Phase 2: Distribution
1. Create team vesting schedules
2. Create advisor vesting schedules
3. Fund staking contract with rewards

### Phase 3: Liquidity
1. Create Uniswap/Aerodrome pool (ABASE/ETH)
2. Add initial liquidity (50M $ABASE)
3. Lock LP tokens

### Phase 4: Community
1. Airdrop to early users
2. Artist grant program launch
3. Staking incentive campaigns

---

## Contract Addresses

*To be filled after deployment*

| Contract | Address | Network |
|----------|---------|---------|
| AudioBaseToken | `TBD` | BASE Mainnet |
| Treasury | `TBD` | BASE Mainnet |
| TokenVesting | `TBD` | BASE Mainnet |
| Staking | `TBD` | BASE Mainnet |

---

## Security Considerations

1. **Audit Required**: All contracts should be audited before mainnet
2. **Multi-sig Treasury**: Use Gnosis Safe or similar
3. **Timelock**: Add timelock for sensitive operations (future)
4. **Rate Limiting**: Staking rate changes have cooldown

---

## Governance Roadmap

### Phase 1 (Current)
- Centralized team control
- Community feedback via Discord

### Phase 2 (6 months)
- Snapshot voting for proposals
- Treasury spending votes

### Phase 3 (12 months)
- On-chain governance (AudioBaseDAO)
- Timelock for execution
- Full decentralization

---

## Legal Disclaimer

$ABASE is a utility token for use within the AudioBASE platform. It is not intended as an investment vehicle. Token holders should not expect profits from the efforts of others. Please consult local regulations regarding cryptocurrency ownership in your jurisdiction.
