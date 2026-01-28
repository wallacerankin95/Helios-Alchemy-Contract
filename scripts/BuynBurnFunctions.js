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

  const buy_and_burn = await hre.ethers.getContractAt(
    "BuyAndBurn",
    BuyAndBurn,
    owner
  );

//   await collectFees(buy_and_burn);

  await switchLiquidity(buy_and_burn);

  console.log("Liquidity: ", await getliquidity(buy_and_burn));
  
  await setBurnCap(buy_and_burn);

  console.log("Titanx Burn Cap: ", hre.ethers.formatEther(await getBurnCap(buy_and_burn)));

  await setEthBurnCap(buy_and_burn);

  console.log("Eth Burn Cap: ", hre.ethers.formatEther(await getEthBurnCap(buy_and_burn)));
  

  await setInterval(buy_and_burn);

  console.log("Interval: ", await getInterval(buy_and_burn));

  await setEthInterval(buy_and_burn);

  console.log("Eth Interval: ", await getBuynBurnEthInterval(buy_and_burn));

}

async function collectFees (buy_and_burn){
    await buy_and_burn.collectFees();
}

async function switchLiquidity (buy_and_burn){
    await buy_and_burn.addLiquidity();
}

async function getliquidity (buy_and_burn) {
    return await buy_and_burn.getAddLiquidity();
}

async function setBurnCap (buy_and_burn) {
    await buy_and_burn.setCapPerSwap(hre.ethers.parseEther("50000000"));
}

async function getBurnCap (buy_and_burn) {
    return await buy_and_burn.getBuyAndBurnCap();
}

async function getEthBurnCap (buy_and_burn) {
    return await buy_and_burn.getWethBuyAndBurnCap();
}

async function setEthBurnCap (buy_and_burn) {
    await buy_and_burn.setETHCapPerSwap(hre.ethers.parseEther("0.1"));
}

async function setInterval (buy_and_burn) {
    await buy_and_burn.setBuynBurnInterval(120);
}

async function getInterval (buy_and_burn) {
    return await buy_and_burn.getBuynBurnInterval();
}

async function setEthInterval (buy_and_burn) {
    await buy_and_burn.setETHBuynBurnInterval((120 * 60));
}

async function getBuynBurnEthInterval (buy_and_burn) {
    return await buy_and_burn.getBuynBurnEthInterval();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
