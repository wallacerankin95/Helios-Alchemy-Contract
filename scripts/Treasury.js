const hre = require("hardhat");
const network = hre.hardhatArguments.network;
var fs = require("fs");
const { setBalance } = require("@nomicfoundation/hardhat-network-helpers");
const { stderr } = require("process");

async function main() {
  const [
    owner,
  ] = await hre.ethers.getSigners();

  var json = JSON.parse(fs.readFileSync("./config.json").toString());
  const { Helios, Treasury, BuyAndBurn } = json[network];

  const addresses = [
    "0x929636092eDb084C406bc4754B13D17643e183d2",
    "0x5D66bdB3C4bb2d76eBA37ceE1851B827C2FdE692",
    "0x88b67A11fD89A8Fcd5a1a1B2225D4a08C2a5Ad36",
    "0x5175F9DB43445713d45B546c0A90Cff5aaCf562D",
    "0x6149e004211852a0300a44A1Dd07c442E7A53BB2",
    "0x8D2096664D3D74Ec68d076C06D47569C96DCB065",
    "0x0d90968868137dD25a6c88f2e9116D5BC4092d10",
    "0x166d06DE9bbD9374457e2FB67C726081237ef3b6",
    "0x2F4c2c96f097347fC45B3F303Fe98ab4C756aD97",
    "0xC7fc283A21078eD345D86Ab41A216EeB1dd6Aefb",
    "0x19291751BC77dc04777Cdcda28C74D656645776F",
    "0x76534921593a045a6eA169B4663F99139Ddb2e32",
    "0x0689d535e924c795B4679342fbF21f2396DaC34d",
    "0x3d8224Fb80C54926753E91De6a57181e3E3bbC66",
    "0x868C4cD4b7D5264C44A15a82CBa07AE454E4D7DB",
    "0xC0bf07a9a6688f8CeD2f4962F55C3e3543f5e694",
    "0x4B0A33d7C6E2098A586aDab6176fDbCd2e56E044",
    "0xC0F716D40ea9B5aA791D6B279c6Ba19e533Ee417",
    "0x35180070FF3e2F7A6EF468456c1FfEB81f5F28d1",
    "0xF4Bf5226d75ab41B9B588383C65549157B50F397",
    "0x9229afE9E0170c2d387c5b0F087F7E7888E40033",
    "0x06114F14F690CD3516EFA36fcCB7715BA030D9C6",
    "0xc1Ee7308b04B2dE3485E74Fbe45094c52C83a165",
    "0xA5a22069fFaec44D52ff787124B7c35D71020fE7",
    "0x988A7057c33702127174Ae3671a87D9C0c9fdf50",
    "0x63B5B3c3455c3b379c7CF47d22bD219E237b57E4",
    "0xB011885577514427FEB838Af68F7383673E0e0e9",
    "0xb01D57340b061ffA1589F810D017143915Eaff40",
    "0xB2BACCaE0f5E08C6D13054d78Dd2da0134381b8d",
    "0x253aBf20130Fd395B589AbB2ED9d0A48497eBc83",
    "0x9470b035E1235143F4a4Ce4E31487c82382dA173",
    "0xc48172A5A5B4e2eEf49923E4565123d9BC3f337E",
    "0x6962d791a0a6Df1B9C8759D9751544C99a621f05",
    "0x22352bC23568A4429D2516B720e6C0437D7CB63e",
    "0x32933afd3bf7B3Bf1363014A9c10fcf75a66c34E",
    "0xD859110e6eb1454ccCab8371640fb5a23951081b",
    "0xF3CfF6b30302eFD7d8195111aF4DbFa00Afb3562",
    "0xe5e0C13133782d967B002B3400E6Ebea5d9814C0",
    "0x96a5399D07896f757Bd4c6eF56461F58DB951862",
    "0xf42b95fe325a17C56dea0a3bB808dD0EBcdAe076",
    "0xbd7582f860dA27c651176ccBEDae3Fbb331A30fB",
    "0x7825cb81A9036e22e6077149593AEEc4FdFFD100",
  ];

  const titanx = await hre.ethers.getContractAt(
    "TITANX",
    "0xF19308F923582A6f7c465e5CE7a9Dc1BEC6665B1",
    owner
  );

  for (let index = 0; index < addresses.length; index++) {
    const impersonatedSigner = await hre.ethers.getImpersonatedSigner(
      addresses[index]
    );

    await setBalance(impersonatedSigner.address, hre.ethers.parseEther("100"));

    await titanx
      .connect(impersonatedSigner)
      .transfer(owner, await titanx.balanceOf(impersonatedSigner.address));
  }

  console.log(
    "Owner TitanX Balance: ",
    hre.ethers.formatEther(await titanx.balanceOf(owner.address))
  );

  const helios = await hre.ethers.getContractAt("HELIOS", Helios, owner);

  const treasury = await hre.ethers.getContractAt("Treasury", Treasury, owner);

  await setStakeInterval(treasury, 3600);

  console.log("Tresury Stake Interval: ", await treasury.getStakeInterval());

  await setMinStakeAmount(treasury, 100000);

  console.log(
    "Treasury Minimum Stake Amount: ",
    await treasury.getMinStakeAmount()
  );

  // Add Thousand Stakes
  // await addThousandStakes(treasury, titanx, "100000");

  // Simple Stake
  // await transferTitanx(titanx, "100000", treasury.target);
  // await stake(treasury);

  const stakeContractAddress = await getDeployedStakeContractAddress(treasury);

  const stakeContract = await hre.ethers.getContractAt(
    "HlxStake",
    stakeContractAddress,
    owner
  );

  console.log("Active Stake Contract: ", stakeContract.target);

  console.log(
    "Claimable ETH: ",
    hre.ethers.formatEther(await claimableEth(stakeContract))
  );

  console.log(
    "ETH Balance After claim: ",
    await hre.ethers.provider.getBalance(owner.address)
  );

  // await claimReward(treasury);

  //Incentive Fee will be added
  console.log(
    "ETH Balance After claim: ",
    await hre.ethers.provider.getBalance(owner.address)
  );

  console.log("Stake Reached Maturity: ", await checkMaturity(stakeContract));

  // await endStake(stakeContract, 1);

  // To Set Treasury balance With 500 ETH 

  await setEthBalance(treasury.target);

  console.log(
    "Treasury Eth Balance: ",
    await hre.ethers.provider.getBalance(treasury.target)
  );
}

async function setStakeInterval(contract, value) {
  await contract.setStakeInterval(value);
}

async function setMinStakeAmount(contract, value) {
  await contract.setMinStakeAmount(value);
}

async function stake(contract) {
  await contract.stakeTITANX();
}

async function transferTitanx(contract, amount, address) {
  await contract.transfer(address, hre.ethers.parseEther(amount));
}

async function addThousandStakes(contract, titanx, amount) {
  for (let index = 0; index < 1000; index++) {
    await transferTitanx(titanx, amount, contract.target);

    await stake(contract);
  }
}

async function claimReward(contract) {
  await contract.claimReward();
}

async function deployNewInstance(contract) {
  await contract.deployNewHlxStakeInstance();
}

async function getDeployedStakeContractAddress(contract) {
  return await contract.activeHlxStakeContract();
}

async function claimableEth(contract) {
  return await contract.totalEthClaimable();
}

async function checkMaturity(contract) {
  return await contract.stakeReachedMaturity();
}

async function endStake(contract, stakeId) {
  await contract.endStakeAfterMaturity(stakeId);
}

async function setEthBalance(address) {
  await setBalance(address, hre.ethers.parseEther("500"));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
