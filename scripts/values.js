const hre = require("hardhat");
const network = hre.hardhatArguments.network;
var fs = require("fs");

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

  var json = JSON.parse(fs.readFileSync("./config.json").toString());
  const { Helios, Treasury, BuyAndBurn } = json[network];

  const titanx = await hre.ethers.getContractAt(
    "TITANX",
    "0xF19308F923582A6f7c465e5CE7a9Dc1BEC6665B1",
    owner
  );

  const helios = await hre.ethers.getContractAt("HELIOS", Helios, owner);
  const treasury = await hre.ethers.getContractAt("Treasury", Treasury, owner);
  const buy_and_burn = await hre.ethers.getContractAt(
    "BuyAndBurn",
    BuyAndBurn,
    owner
  );

  // Fetch and print Helios token balances
  const balanceHeliosHelios = await helios.balanceOf(helios.target);
  const balanceHeliosTreasury = await helios.balanceOf(treasury.target);
  const balanceHeliosBuyAndBurn = await helios.balanceOf(buy_and_burn.target);
  console.log(
    `Helios Contract Helios Balance: ${hre.ethers.formatEther(
      balanceHeliosHelios
    )}`
  );
  console.log(
    `Treasury Contract Helios Balance: ${hre.ethers.formatEther(
      balanceHeliosTreasury
    )}`
  );
  console.log(
    `BuyAndBurn Contract Helios Balance: ${hre.ethers.formatEther(
      balanceHeliosBuyAndBurn
    )}`
  );

  // Fetch and print TITANX token balances
  const balanceTitanxHelios = await titanx.balanceOf(helios.target);
  const balanceTitanxTreasury = await titanx.balanceOf(treasury.target);
  const balanceTitanxBuyAndBurn = await titanx.balanceOf(buy_and_burn.target);
  console.log(
    `Helios Contract TITANX Balance: ${hre.ethers.formatEther(
      balanceTitanxHelios
    )}`
  );
  console.log(
    `Treasury Contract TITANX Balance: ${hre.ethers.formatEther(
      balanceTitanxTreasury
    )}`
  );
  console.log(
    `BuyAndBurn Contract TITANX Balance: ${hre.ethers.formatEther(
      balanceTitanxBuyAndBurn
    )}`
  );

  const balanceTitanXThreeMore = await titanx.balanceOf(threeMore.address);
  const balanceHeliosThreeMore = await helios.balanceOf(threeMore.address);

  // Logging balances
  console.log(
    `ThreeMore TitanX Balance: ${hre.ethers.formatEther(
      balanceTitanXThreeMore
    )} TITANX`
  );
  console.log(
    `ThreeMore Helios Balance: ${hre.ethers.formatEther(
      balanceHeliosThreeMore
    )} HELIOS`
  );

  // Fetching current mintableHlx and currentShareRate
  const currentMintableHlx = await helios.getCurrentMintableHlx();
  const currentShareRate = await helios.getCurrentShareRate();
  const currentMintCost = await helios.getCurrentMintCost();

  console.log(
    `Current Mintable HLX: ${hre.ethers.formatEther(currentMintableHlx)}`
  );

  console.log(
    `Current Share Rate: ${hre.ethers.formatEther(currentShareRate)}`
  );

  console.log(`Current Mint Cost: ${hre.ethers.formatEther(currentMintCost)}`);

  // Fetching global hRank
  const globalHRank = await helios.getGlobalHRank();

  // Logging global hRank
  console.log(`Global hRank: ${globalHRank.toString()}`);

  // Fetch and console the total TitanX staked and unstaked by the Treasury
  const totalTitanStaked = await treasury.getTotalTitanStaked();
  const totalTitanUnstaked = await treasury.getTotalTitanUnstaked();
  const stakeContract = await treasury.activeHlxStakeContract();

  // Calculate the net staked amount
  const netStakedTitan = totalTitanStaked - totalTitanUnstaked;
  console.log(
    `Net TitanX Staked by Treasury: ${hre.ethers.formatEther(netStakedTitan)}`
  );

  // Call getUserETHClaimableTotal with the Treasury address
  const ethClaimableByTreasury = await titanx.getUserETHClaimableTotal(
    stakeContract
  );
  console.log(
    `ETH Claimable by Treasury: ${hre.ethers.formatEther(
      ethClaimableByTreasury
    )}`
  );

  // Assuming the function is in the Helios contract and named getTotalBurnedByBuyAndBurn
  const burnedByBuyAndBurn = await buy_and_burn.getTotalTitanXBuyAndBurn();
  console.log(
    `TitanX Burned by BuyAndBurn: ${hre.ethers.formatEther(
      burnedByBuyAndBurn
    )} TitanX`
  );

  // Assuming the function is in the Helios contract and named getTotalBurnedByBuyAndBurn
  const burnedHeliosByBuyAndBurn = await buy_and_burn.getTotalHelioBuyAndBurn();
  console.log(
    `Helios Burned by BuyAndBurn: ${hre.ethers.formatEther(
      burnedHeliosByBuyAndBurn
    )} Helios`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
