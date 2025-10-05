import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  console.log("Compiling contracts...");
  
  const artifactsPath = path.join(__dirname, "../artifacts/contracts");
  
  const contracts = [
    "ArtistTipping",
    "MusicNFTFactory", 
    "EventTicketing",
    "NFTMarketplace"
  ];

  const bytecodes: Record<string, string> = {};
  const abis: Record<string, any> = {};

  for (const contractName of contracts) {
    try {
      const artifact = await import(`../artifacts/contracts/${contractName}.sol/${contractName}.json`);
      bytecodes[contractName] = artifact.bytecode;
      abis[contractName] = artifact.abi;
      console.log(`✓ ${contractName} compiled successfully`);
    } catch (error) {
      console.error(`✗ Failed to compile ${contractName}:`, error);
    }
  }

  // Write bytecodes to a file that can be copied to the edge function
  const output = `// Generated on ${new Date().toISOString()}
// Copy this to supabase/functions/deploy-contracts/index.ts

export const contractBytecodes: Record<string, string> = ${JSON.stringify(bytecodes, null, 2)};

export const contractABIs: Record<string, any> = ${JSON.stringify(abis, null, 2)};
`;

  fs.writeFileSync(
    path.join(__dirname, "../compiled-contracts.ts"),
    output
  );

  console.log("\n✓ Compilation complete!");
  console.log("✓ Bytecodes saved to compiled-contracts.ts");
  console.log("\nNext steps:");
  console.log("1. Copy the bytecodes from compiled-contracts.ts");
  console.log("2. Update supabase/functions/deploy-contracts/index.ts with the real bytecodes");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
