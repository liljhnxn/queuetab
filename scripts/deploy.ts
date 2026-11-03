import hre from "hardhat";
const { ethers } = hre;
import * as fs from "fs";
import * as path from "path";

async function updateEnvFile(filePath: string, contractAddress: string) {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, "utf-8");
    const regex = /NEXT_PUBLIC_CONTRACT_ADDRESS="[^"]*"/;
    if (regex.test(content)) {
      content = content.replace(regex, `NEXT_PUBLIC_CONTRACT_ADDRESS="${contractAddress}"`);
    } else {
      content += `\nNEXT_PUBLIC_CONTRACT_ADDRESS="${contractAddress}"\n`;
    }
    fs.writeFileSync(filePath, content, "utf-8");
    console.log(`Updated ${path.basename(filePath)} with contract address`);
  }
}

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("==================================================");
  console.log("Deploying QueueTab smart contract to Botchain Testnet...");
  console.log("==================================================");

  if (!deployer) {
    throw new Error("No deployer signer found. Please check PRIVATE_KEY in .env");
  }

  console.log("Deployer Address:", deployer.address);
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Deployer Balance:", ethers.formatEther(balance), "BOHR");

  if (balance === 0n) {
    console.warn("WARNING: Deployer balance is 0 BOHR. Deployment may fail due to lack of gas.");
  }

  const QueueTab = await ethers.getContractFactory("QueueTab");
  const queueTab = await QueueTab.deploy();
  await queueTab.waitForDeployment();

  const contractAddress = await queueTab.getAddress();
  console.log("--------------------------------------------------");
  console.log("SUCCESS! QueueTab deployed to:", contractAddress);
  console.log("Block Explorer: https://scan.bohr.life/address/" + contractAddress);
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
        chainId: "968",
        network: "Botchain Testnet",
        deployedAt: new Date().toISOString(),
      },
      null,
      2
    )
  );

  // Update .env and .env.local
  const rootDir = path.join(__dirname, "..");
  await updateEnvFile(path.join(rootDir, ".env"), contractAddress);
  await updateEnvFile(path.join(rootDir, ".env.local"), contractAddress);
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});
