# Quick Contract Deployment

## Option 1: Remix IDE (5 minutes, no installation)

1. **Go to https://remix.ethereum.org**

2. **Upload your contracts:**
   - Create new files for each contract
   - Copy content from `/contracts` folder
   - Upload these OpenZeppelin files (or Remix will auto-import):

3. **Compile each contract:**
   - Click "Solidity Compiler" tab (left sidebar)
   - Select compiler version: 0.8.20
   - Enable optimization: 200 runs
   - Click "Compile [ContractName].sol"

4. **Copy the bytecode:**
   - After compilation, click "Compilation Details"
   - Find the "BYTECODE" section
   - Copy the "object" field (starts with 0x...)
   - **DO THIS FOR ALL 3 CONTRACTS**

5. **Share the bytecode with me:**
   - Paste the 3 bytecode strings in chat
   - Format: 
     ```
     ArtistTipping: 0x...
     MusicNFTFactory: 0x...
     EventTicketing: 0x...
     ```

## Option 2: Local Compilation (if you prefer)

```bash
npx hardhat compile
npx hardhat run scripts/compile-contracts.ts
```

Then share the content of `compiled-contracts.ts` with me.

## What Happens Next

Once you share the bytecode:
1. I'll update the edge function with real bytecode
2. You'll connect your "AudioBASE Dev" MetaMask wallet
3. Click "Deploy All Contracts" on `/contracts` page
4. Contracts deploy to Base mainnet
5. Done! ✅
