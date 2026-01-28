// Importing the Hardhat Runtime Environment (HRE). This allows the script to be run either through Hardhat commands or standalone with node.
// The HRE provides access to Hardhat's functionalities such as running tasks, scripts, and interacting with the blockchain.
const hre = require("hardhat");

// Extracting the network name from the Hardhat arguments to know which blockchain network the script will interact with.
const network = hre.hardhatArguments.network;

// Importing a utility function for contract address management. This is useful for keeping track of deployed contracts.
const { updateContractAddresses } = require("../utils/contractsManagement");

// The main function where the deployment logic resides. Using async to allow await expressions within.
async function main() {
  // Getting signers from the Hardhat environment. Signers are accounts that can sign transactions and interact with the blockchain.
  const [
    owner
  ] = await hre.ethers.getSigners();

  // Address of the TitanX token. This is presumably a token that will interact with your contracts.
  const titanx = "0xF19308F923582A6f7c465e5CE7a9Dc1BEC6665B1";

  // Deploying the BuyAndBurn contract. This contract is likely intended to purchase and burn tokens to reduce supply.
  const buy_and_burn = await ethers.getContractFactory("BuyAndBurn");
  const BuyAndBurn = await buy_and_burn.deploy();

  // Deploying the Treasury contract, which might manage funds or tokens for the project.
  const treasuryContract = await ethers.getContractFactory("Treasury");
  const Treasury = await treasuryContract.deploy(owner.address);

  // Deploying the Helios contract. The purpose of Helios is not described, but it's interacting with the previously mentioned contracts.
  const Helios = await ethers.getContractFactory("HELIOS");
  const helios = await Helios.deploy(
    owner.address,
    BuyAndBurn.target,
    titanx,
    Treasury.target,
    owner.address
  );

  // Setting the Helios (HLX) address in the BuyAndBurn contract. This establishes a connection between the two.
  await BuyAndBurn.setHlxAddress(helios.target);

  // Calling a function to create an initial pool, possibly for liquidity purposes.
  await BuyAndBurn.createInitialPool();

  // Configuring the Treasury contract with the Helios contract address, linking the two for operational purposes.
  await Treasury.setHlxContractAddress(helios.target);

  // Informing the Treasury contract about the BuyAndBurn contract, enabling integrated functionality between them.
  await Treasury.setHlxBuyAndBurnAddress(BuyAndBurn.target);

  // Updating a local or off-chain storage with the addresses of the deployed contracts. Useful for tracking deployed contracts on different networks.
  updateContractAddresses(
    {
      Helios: helios.target,
      BuyAndBurn: BuyAndBurn.target,
      Treasury: Treasury.target,
    },
    network
  );
}

// This pattern allows us to use async/await at the top level and handles any errors that might occur during the execution of main().
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
