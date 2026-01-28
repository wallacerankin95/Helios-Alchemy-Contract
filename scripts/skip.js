// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  let _days = 10;
  let _hours = 2;

  let daysInSeconds = _days * 24 * 60 * 60 + _hours * 60 * 60;

  console.log("Skiping Time: ", _days, " Days");

  await hre.ethers.provider.send("evm_increaseTime", [daysInSeconds]);
  await hre.ethers.provider.send("evm_mine");

  console.log("Time Skipped: ", _days, " Days");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
