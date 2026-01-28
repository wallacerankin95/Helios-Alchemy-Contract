// Import the Hardhat Runtime Environment to access Hardhat's functionalities for script execution and blockchain interaction.
const hre = require("hardhat");
// Extract the target network from Hardhat's arguments to determine where the contracts will be deployed or interacted with.
const network = hre.hardhatArguments.network;
// Node.js File System module to work with the file system on your computer.
var fs = require("fs");

async function main() {
  // Retrieve the first signer from the Hardhat environment to use as the contract owner.
  const [owner] = await hre.ethers.getSigners();

  // Load configuration from a JSON file, which includes addresses of already deployed contracts per network.
  var json = JSON.parse(fs.readFileSync("./config.json").toString());
  const { Helios, Treasury, BuyAndBurn } = json[network];

  // Get an instance of the TITANX contract using its ABI, address, and assigning the owner as the signer.
  const titanx = await hre.ethers.getContractAt(
    "TITANX",
    "0xF19308F923582A6f7c465e5CE7a9Dc1BEC6665B1",
    owner
  );

  // Similarly, get instances of the HELIOS contract using the address from the config and the owner as the signer.
  const helios = await hre.ethers.getContractAt("HELIOS", Helios, owner);

  // Minting HELIOS tokens by invoking a function on the HELIOS contract. Adjust the 'mintId' for repeated runs.
  await mintHelios(helios, titanx, owner, (mintId = 1));

  // Deploy a new StakeContract, passing in the addresses of the TITANX and HELIOS contracts.
  const stakeContract = await deployStakeContract(titanx.target, helios.target);

  // Transfer all HELIOS tokens owned by the deployer to the newly deployed StakeContract.
  await helios.transfer(
    stakeContract.target,
    await helios.balanceOf(owner.address)
  );

  // Whitelist the StakeContract in the HELIOS contract, enabling it to interact with HELIOS tokens.
  await whiteList(helios, stakeContract.target, true);

  // Log whether the StakeContract is whitelisted.
  console.log(
    "Is Contract WhiteListed: ",
    await isWhitelisted(helios, stakeContract.target)
  );

  // Log the HELIOS balance of the StakeContract before staking occurs.
  console.log(
    "Contract Helios Balance Before Stake: ",
    hre.ethers.formatEther(await helios.balanceOf(stakeContract.target))
  );

  // Initiate staking using the StakeContract.
  await stakeUsingStakeContract(stakeContract, helios, owner.address);

  // Log the HELIOS balance of the StakeContract after staking occurs.
  console.log(
    "Contract Helios Balance After Stake: ",
    hre.ethers.formatEther(await helios.balanceOf(stakeContract.target))
  );

  // Uncomment this function to set new investment address
  await setInvestmentAddress(helios, owner.address);

  // Uncomment the following lines to enable functionality for burning HELIOS tokens or ending stakes.
  // await burnLiquidHelios(helios, hre.ethers.parseEther("1000"));
  // console.log("User Helios Balance After burn: ", hre.ethers.formatEther(await helios.balanceOf(owner.address)));
  // await burnMint(helios, mintId = 1);
  // await burnStake(helios, stakeId = 1);
}

// Helper function to check if an address is whitelisted in a contract.
async function isWhitelisted(contract, address) {
  return await contract.isWhiteListed(address);
}

// Helper function to whitelist or remove an address from a contract's whitelist.
async function whiteList(contract, address, permit) {
  return await contract.whiteList(address, permit);
}

// Function to deploy a new StakeContract, taking TITANX and HELIOS contract addresses as parameters.
async function deployStakeContract(titanx, helios) {
  const Stake = await hre.ethers.getContractFactory("StakeContract");
  const stake = await Stake.deploy(titanx, helios);
  console.log("Stake deployed to:", stake.target);
  return stake;
}

// Function to transfer TITANX tokens from one address to another.
async function sendTitanX(titanx, address, amount) {
  await titanx.transfer(address, amount);
}

// Function to mint HELIOS tokens, approve the HELIOS contract to spend TITANX, and claim the mint.
async function mintHelios(helios, titanx, caller, mintId) {
  await titanx.approve(helios.target, await titanx.balanceOf(caller.address));
  await helios.startMint(1000, 1, 0); // Start the minting process with specified parameters.

  // Simulate time passing on the blockchain to allow for minting conditions to be met.
  let _1day = 1 * 24 * 60 * 60;
  await ethers.provider.send("evm_increaseTime", [_1day]);
  await ethers.provider.send("evm_mine");

  // Claim the mint, completing the process, and log the user's HELIOS balance post-mint.
  const tx = await helios.claimMint(mintId);
  await tx.wait();
  console.log(
    "User Helios Balance After Mint: ",
    hre.ethers.formatEther(await helios.balanceOf(user))
  );
}

// Function to initiate staking through the StakeContract.
async function stakeUsingStakeContract(stakeContract, helios, address) {
  await stakeContract.startStake(await helios.balanceOf(stakeContract.target), 30, 0);
}


async function endContractStake(stakeContract, stakeId) {
  await stakeContract.endStake(stakeId);
  console.log("Stake Ended");
}

async function claimPayouts(stakeContract) {
  await stakeContract.claimUserPayouts();
}

async function setInvestmentAddress(helios, address) {
  await helios.setNewInvestmentAddress(address);
}

async function burnLiquidHelios(helios, amount) {
  await helios.userBurnTokens(amount);
}

async function burnMint(helios, mintId) {
  await helios.userBurnMint(mintId);
}

async function burnStake(helios, stakeId) {
  await helios.userBurnStake(stakeId);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
