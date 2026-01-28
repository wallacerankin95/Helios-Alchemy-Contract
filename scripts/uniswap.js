// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
const { abi: IUniswapV3PoolABI } = require('@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json');
const BigNumber = require('bignumber.js');

async function main() {

const [
    owner,
  ] = await hre.ethers.getSigners();

  const BuynBurn = await hre.ethers.getContractAt(
    "BuyAndBurn",
    "0x23A91f96A3BA610f0b5268E9448080F4253f7D43",
    owner
  );
    
  const helios = await hre.ethers.getContractAt(
    "HELIOS",
    "0x94be7bD08E1f36eA1896769cfacB7922b977fa9c",
    owner
  );

  const titanx = await hre.ethers.getContractAt(
    "TITANX",
    "0xF19308F923582A6f7c465e5CE7a9Dc1BEC6665B1",
    owner
  );


  const poolAddress = await BuynBurn.getPoolAddress();

  const poolContract = await hre.ethers.getContractAt(IUniswapV3PoolABI, poolAddress, owner);

  console.log("TitanX Reserve: ", hre.ethers.formatEther(await titanx.balanceOf(poolContract.target)));
  console.log("Helios Reserve: ", hre.ethers.formatEther(await helios.balanceOf(poolContract.target)));
  
  const slot0 = await poolContract.slot0();

    // Calculate the price of token1 in terms of token0
    const price1PerToken0 = BigNumber(slot0.sqrtPriceX96).times(BigNumber(slot0.sqrtPriceX96)).div(BigNumber(2).pow(192));
    const price0PerToken1 = BigNumber(2).pow(192).div(BigNumber(slot0.sqrtPriceX96).times(BigNumber(slot0.sqrtPriceX96)));

    console.log(`Price of Helios in terms of Titanx: ${price1PerToken0}`);
    console.log(`Price of Titanx in terms of Helios: ${price0PerToken1}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
