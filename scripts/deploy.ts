import hre from "hardhat";
const { ethers } = hre;
import * as fs from "fs";
import * as path from "path";

async function updateEnvFile(filePath: string, contractAddress: string, chainId: string, rpcUrl: string, explorerUrl: string, symbol: string) {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, "utf-8");
    content = content.replace(/NEXT_PUBLIC_CONTRACT_ADDRESS="[^"]*"/, `NEXT_PUBLIC_CONTRACT_ADDRESS="${contractAddress}"`);
    content = content.replace(/NEXT_PUBLIC_CHAIN_ID="[^"]*"/, `NEXT_PUBLIC_CHAIN_ID="${chainId}"`);
    content = content.replace(/NEXT_PUBLIC_RPC_URL="[^"]*"/, `NEXT_PUBLIC_RPC_URL="${rpcUrl}"`);
    content = content.replace(/NEXT_PUBLIC_BLOCK_EXPLORER_URL="[^"]*"/, `NEXT_PUBLIC_BLOCK_EXPLORER_URL="${explorerUrl}"`);
    content = content.replace(/NEXT_PUBLIC_CURRENCY_SYMBOL="[^"]*"/, `NEXT_PUBLIC_CURRENCY_SYMBOL="${symbol}"`);
    fs.writeFileSync(filePath, content, "utf-8");
    console.log(`Updated ${path.basename(filePath)} with contract address and network parameters`);
  }
}

async function main() {
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();
  const chainId = network.chainId.toString();

  const isMainnet = chainId === "677";
  const networkName = isMainnet ? "Botchain Mainnet" : "Botchain Testnet";
  const currencySymbol = isMainnet ? "BOT" : "BOHR";
  const rpcUrl = isMainnet ? "https://rpc.botchain.ai" : "https://rpc.bohr.life";
  const explorerUrl = isMainnet ? "https://scan.botchain.ai" : "https://scan.bohr.life";

  console.log("==================================================");
  console.log(`Deploying QueueTab smart contract to ${networkName} (Chain ID: ${chainId})...`);
  console.log("==================================================");

  if (!deployer) {
    throw new Error("No deployer signer found. Please check PRIVATE_KEY in .env");
  }

  console.log("Deployer Address:", deployer.address);
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`Deployer Balance: ${ethers.formatEther(balance)} ${currencySymbol}`);

  const feeData = await ethers.provider.getFeeData();
  const gasPrice = feeData.gasPrice || ethers.parseUnits("20", "gwei");
  console.log(`Current Gas Price: ${ethers.formatUnits(gasPrice, "gwei")} gwei`);

  const QueueTab = await ethers.getContractFactory("QueueTab");
  const deployTx = await QueueTab.getDeployTransaction();
  const estimatedGas = await ethers.provider.estimateGas(deployTx);
  const estimatedCost = estimatedGas * gasPrice;

  console.log(`Estimated Deployment Gas: ${estimatedGas.toString()}`);
  console.log(`Estimated Cost: ${ethers.formatEther(estimatedCost)} ${currencySymbol}`);

  if (balance < estimatedCost) {
    const deficit = estimatedCost - balance;
    console.error("--------------------------------------------------");
    console.error(`ERROR: Insufficient funds to deploy on ${networkName}!`);
    console.error(`Current Balance:   ${ethers.formatEther(balance)} ${currencySymbol}`);
    console.error(`Required Balance:  ${ethers.formatEther(estimatedCost)} ${currencySymbol}`);
    console.error(`Shortfall Deficit: ${ethers.formatEther(deficit)} ${currencySymbol}`);
    console.error(`Please send at least ${ethers.formatEther(deficit)} ${currencySymbol} (e.g. 0.01 or 0.02 ${currencySymbol}) to ${deployer.address}`);
    console.error("--------------------------------------------------");
    process.exit(1);
  }

  console.log("Broadcasting deployment transaction at lowest safe gas price...");
  const queueTab = await QueueTab.deploy({ gasPrice });
  await queueTab.waitForDeployment();

  const contractAddress = await queueTab.getAddress();
  console.log("--------------------------------------------------");
  console.log("SUCCESS! QueueTab deployed to:", contractAddress);
  console.log(`Block Explorer: ${explorerUrl}/address/${contractAddress}`);
  console.log("--------------------------------------------------");

  // Update src/config/contractAddress.json
  const configDir = path.join(__dirname, "../src/config");
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(configDir, "contractAddress.json"),
    JSON.stringify(
      {
        address: contractAddress,
        chainId,
        network: networkName,
        rpcUrl,
        explorerUrl,
        symbol: currencySymbol,
        deployedAt: new Date().toISOString(),
      },
      null,
      2
    )
  );

  // Update .env and .env.local
  const rootDir = path.join(__dirname, "..");
  await updateEnvFile(path.join(rootDir, ".env"), contractAddress, chainId, rpcUrl, explorerUrl, currencySymbol);
  await updateEnvFile(path.join(rootDir, ".env.local"), contractAddress, chainId, rpcUrl, explorerUrl, currencySymbol);
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});
