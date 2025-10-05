# Contract Compilation Guide

## Prerequisites
- Node.js installed
- Terminal access to your project

## Steps to Compile Contracts

### 1. Install Dependencies
```bash
npm install
```

### 2. Compile the Contracts
```bash
npx hardhat compile
```

This will create an `artifacts/` directory with compiled contract JSON files.

### 3. Extract Bytecode (Option A - Using Script)
```bash
npx hardhat run scripts/compile-contracts.ts
```

This generates `compiled-contracts.ts` with all bytecodes ready to copy.

### 4. Extract Bytecode (Option B - Manual)
Find the compiled artifacts in:
```
artifacts/contracts/ArtistTipping.sol/ArtistTipping.json
artifacts/contracts/MusicNFTFactory.sol/MusicNFTFactory.json
artifacts/contracts/EventTicketing.sol/EventTicketing.json
artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json
```

Each JSON file contains:
- `bytecode`: The deployment bytecode (what you need)
- `abi`: The contract interface

### 5. Update Edge Function
Copy the bytecode from each contract and update:
`supabase/functions/deploy-contracts/index.ts`

Replace the placeholder strings in `contractBytecodes` with real bytecode:

```typescript
const contractBytecodes: Record<string, string> = {
  ArtistTipping: "0x608060405234801561001...", // Real bytecode here
  MusicNFTFactory: "0x608060405234801561001...", // Real bytecode here
  EventTicketing: "0x608060405234801561001...", // Real bytecode here
};
```

## Alternative: Using Remix IDE

If you prefer not to install tools locally:

1. Go to https://remix.ethereum.org
2. Upload each `.sol` file from the `contracts/` directory
3. Click "Compile" for each contract
4. In the "Compilation Details", find the "BYTECODE" section
5. Copy the "object" field (this is your bytecode)
6. Update the edge function with this bytecode

## Constructor Arguments

Some contracts may require constructor arguments. Update the `deployContract` function in the edge function to pass the correct arguments:

```typescript
// Example for ArtistTipping (no constructor args needed)
// Example for MusicNFTFactory (may need initial parameters)
```

Check each contract's constructor in the `.sol` files to see what's needed.

## Verification

After deployment, you can verify the contract addresses on BaseScan:
https://basescan.org/address/{contract-address}

## Gas Estimation

Current estimates with placeholders: ~0.0009 ETH total
Real contract deployment may vary based on actual bytecode size.
