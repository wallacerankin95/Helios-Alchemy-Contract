const hre = require("hardhat");


async function main() {
  const [owner] = await hre.ethers.getSigners();

  const gasPrice = hre.ethers.toBigInt((await hre.ethers.provider.getFeeData()).gasPrice);
  console.log(`Current gas price: ${gasPrice.toString()}`);

  let totalGasUsed = hre.ethers.toBigInt(0);

  const titanxAddress = "0xF19308F923582A6f7c465e5CE7a9Dc1BEC6665B1";
  const buyAndBurnFactory = await hre.ethers.getContractFactory("BuyAndBurn");
  const treasuryContractFactory = await hre.ethers.getContractFactory("Treasury");
  const heliosFactory = await hre.ethers.getContractFactory("HELIOS");

  // Estimate gas for deploying BuyAndBurn
  const buyAndBurnGasTx = await buyAndBurnFactory.getDeployTransaction();
  const buyAndBurnGasEstimate = await hre.ethers.provider.estimateGas(buyAndBurnGasTx);
  console.log(`BuyAndBurn deployment gas estimate: ${hre.ethers.formatEther(hre.ethers.toBigInt(buyAndBurnGasEstimate)  * gasPrice)}`);
  totalGasUsed += hre.ethers.toBigInt(buyAndBurnGasEstimate);


  // Estimate gas for deploying Treasury
  const treasuryTx = await treasuryContractFactory.getDeployTransaction(owner.address);
  const treasuryGasEstimate = await hre.ethers.provider.estimateGas(treasuryTx);
  console.log(`Treasury deployment gas estimate: ${hre.ethers.formatEther(hre.ethers.toBigInt(treasuryGasEstimate) * gasPrice)}`);
  totalGasUsed += hre.ethers.toBigInt(treasuryGasEstimate);


  // Estimate gas for deploying HELIOS
  const heliosTx = await heliosFactory.getDeployTransaction(owner.address, owner.address, titanxAddress, titanxAddress, owner.address);
  const heliosGasEstimate = await hre.ethers.provider.estimateGas(heliosTx);
  console.log(`HELIOS deployment gas estimate: ${hre.ethers.formatEther(hre.ethers.toBigInt(heliosGasEstimate) * gasPrice)}`);
  totalGasUsed += hre.ethers.toBigInt(heliosGasEstimate);

  console.log(`Total estimated gas used for deployment : ${hre.ethers.formatEther(totalGasUsed * gasPrice)} ETH`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
