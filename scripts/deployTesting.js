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

  const impersonatedSigner1 = await hre.ethers.getImpersonatedSigner("0xA510dDcCBE476D17C2b0fc0Fdf5E462202a5417e");
  
  await titanx.connect(impersonatedSigner1).transfer(owner, await titanx.balanceOf(impersonatedSigner1.address));

  const impersonatedSigner2 = await hre.ethers.getImpersonatedSigner("0x5Cd26e40FA19D1D812d822348867AD29921D3248");
  
  await titanx.connect(impersonatedSigner2).transfer(owner, await titanx.balanceOf(impersonatedSigner2.address));

  const impersonatedSigner3 = await hre.ethers.getImpersonatedSigner("0xFb93031c5761b9126f17085E1c5DE1706Fb50EBB");
  
  await titanx.connect(impersonatedSigner3).transfer(owner, await titanx.balanceOf(impersonatedSigner3.address));
  
  const impersonatedSigner4 = await hre.ethers.getImpersonatedSigner("0xAf5A5cd6Da86838EfAC0eA91a712857D6ACA53AC");
  
  await titanx.connect(impersonatedSigner4).transfer(owner, await titanx.balanceOf(impersonatedSigner4.address));
  
  const impersonatedSigner5 = await hre.ethers.getImpersonatedSigner("0x9D7aD2D86beAE9F82F35B1F3FA9A246a5e6FF7FC");
  
  await titanx.connect(impersonatedSigner5).transfer(owner, await titanx.balanceOf(impersonatedSigner5.address));
  
  const impersonatedSigner6 = await hre.ethers.getImpersonatedSigner("0xfA22325f59c7C5152C0C3d2fA2028920cB65472a");
  
  await titanx.connect(impersonatedSigner6).transfer(owner, await titanx.balanceOf(impersonatedSigner6.address));

    const impersonatedSigner7 = await hre.ethers.getImpersonatedSigner("0xe5e0C13133782d967B002B3400E6Ebea5d9814C0");
  
  await titanx.connect(impersonatedSigner7).transfer(owner, await titanx.balanceOf(impersonatedSigner7.address));


  const buy_and_burn = await ethers.getContractFactory("BuyAndBurn");

      const BuyAndBurn = await buy_and_burn.deploy();

      const treasuryContract = await ethers.getContractFactory("Treasury");

      const Treasury = await treasuryContract.deploy(owner.address);

      const Helios = await ethers.getContractFactory("HELIOS");

      const helios = await Helios.deploy(
        owner.address,
        BuyAndBurn.target,
        titanx.target,
        Treasury.target,
        owner.address
      );
      

      await BuyAndBurn.setHlxAddress(helios.target);
      await BuyAndBurn.createInitialPool();
      await Treasury.setHlxContractAddress(helios.target);
      await Treasury.setHlxBuyAndBurnAddress(BuyAndBurn.target);

      updateContractAddresses(
        {
          Helios: helios.target,
          BuyAndBurn: BuyAndBurn.target,
          Treasury: Treasury.target,
        },
        network
      );


  await titanx.transfer(BuyAndBurn.target, hre.ethers.parseEther("16000000000"));
  console.log(
    "BuyAndBurn TitanX Balance Before Adding Initial Liquidity: ",
    ethers.formatEther(await BuyAndBurn.getTitanXBalance())
  );

  await BuyAndBurn.createInitialLiquidity();

  console.log("Owner Balance : ", hre.ethers.formatEther(await titanx.balanceOf(owner.address)));

  await titanx.connect(owner).transfer(otherAccount, hre.ethers.parseEther("10000000000"));
  await titanx.connect(owner).transfer(goodUser, hre.ethers.parseEther("10000000000"));
  await titanx.connect(owner).transfer(anotherUser, hre.ethers.parseEther("10000000000"));
  await titanx.connect(owner).transfer(secondlast, hre.ethers.parseEther("10000000000"));
  await titanx.connect(owner).transfer(lastUser, hre.ethers.parseEther("10000000000"));
  await titanx.connect(owner).transfer(oneMore, hre.ethers.parseEther("10000000000"));
  await titanx.connect(owner).transfer(twoMore, hre.ethers.parseEther("10000000000"));
  await titanx.connect(owner).transfer(threeMore,hre.ethers.parseEther("10000000000"));



  console.log("User 1 balance: ", hre.ethers.formatEther(await titanx.balanceOf(otherAccount.address)));
  console.log("User 2 balance: ", hre.ethers.formatEther(await titanx.balanceOf(goodUser.address)));
  console.log("User 3 balance: ", hre.ethers.formatEther(await titanx.balanceOf(anotherUser.address)));
  console.log("User 4 balance: ", hre.ethers.formatEther(await titanx.balanceOf(secondlast.address)));
  console.log("User 5 balance: ", hre.ethers.formatEther(await titanx.balanceOf(lastUser.address)));
  console.log("User 6 balance: ", hre.ethers.formatEther(await titanx.balanceOf(oneMore.address)));
  console.log("User 7 balance: ", hre.ethers.formatEther(await titanx.balanceOf(twoMore.address)));
  console.log("User 8 balance: ", hre.ethers.formatEther(await titanx.balanceOf(threeMore.address)));


  console.log(
    "BuyAndBurn TitanX Balance After Adding Liquidity : ",
    ethers.formatEther(await BuyAndBurn.getTitanXBalance())
  );
  console.log(
    "BuyAndBurn Helios Balance: ",
    ethers.formatEther(await BuyAndBurn.getHlxBalance())
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
