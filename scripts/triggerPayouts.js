const hre = require("hardhat");
const titanxObj = require("../artifacts/contracts/TitanX/TITANX.sol/TITANX.json")
async function main() {
    const [
    owner,
  ] = await hre.ethers.getSigners();
  // Replace 'TitanXContractAddress' with the actual address of your TitanX contract
  const titanxAddress = "0xF19308F923582A6f7c465e5CE7a9Dc1BEC6665B1";

  // Get the contract instance
  const titanx = await hre.ethers.getContractAt("TITANX", titanxAddress, owner);

  console.log("ETH to Distribute: ", hre.ethers.formatEther(await titanx.getUndistributedEth()));

  const manualUpdateTx = await titanx.manualDailyUpdate();
  await manualUpdateTx.wait(); 

  // // Call the triggerPayouts() function
  const triggerPayoutsTx = await titanx.triggerPayouts();
  await triggerPayoutsTx.wait(); // Wait for the transaction to be mined

  console.log("ETH to Distribute After Trigger Payouts: ", hre.ethers.formatEther(await titanx.getUndistributedEth()));


  console.log("triggerPayouts() called successfully");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
