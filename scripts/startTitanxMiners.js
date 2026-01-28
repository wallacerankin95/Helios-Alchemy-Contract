// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
const network = hre.hardhatArguments.network;
const { updateContractAddresses } = require("../utils/contractsManagement");

async function main() {
  const [
    owner,
    otherAccount,
    goodUser,
    anotherUser,
    secondlast,
    lastUser,
    oneMore,
    twoMore,
    threeMore,
  ] = await hre.ethers.getSigners();

  const titanx = await hre.ethers.getContractAt(
    "TITANX",
    "0xF19308F923582A6f7c465e5CE7a9Dc1BEC6665B1",
    owner
  );

    await titanx.batchMint(100, 250, 10, {
        value: ethers.parseEther("500"),
      });
    await titanx.connect(otherAccount).batchMint(100, 250, 10, {
        value: ethers.parseEther("500"),
      });
    await titanx.connect(goodUser).batchMint(100, 250, 10, {
        value: ethers.parseEther("500"),
      });

    console.log("TITANX 8 Miners Started");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
