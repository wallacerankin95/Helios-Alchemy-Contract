require("@nomicfoundation/hardhat-toolbox");
const ethers = require("ethers");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.10",
        settings: {
          optimizer: {
            enabled: true,
            runs: 0,
          },
        },
      },
      {
        version: "0.7.6",
        settings: {
          optimizer: {
            enabled: true,
            runs: 0,
          },
        },
      },
      {
        version: "0.5.0",
        settings: {
          optimizer: {
            enabled: true,
            runs: 0,
          },
        },
      },
    ],
  },
  networks: {
    hardhat: {
      forking: {
        url: "https://eth-mainnet.g.alchemy.com/v2/NwNXWXeT_7jbY3e0MhYg7HbDkZFMYIu5",
        blockNumber: 19291817,
      },
      gas: "auto",
      mining: {
        auto: false,
        interval: [1, 10],
        mempool: {
          order: "fifo",
        },
      },
      accounts: [
        {
          privateKey: `0x${"aa3d66bcaddc1295226194c8bea765e394bd4192be8d87729feba8beed9808f2"}`,
          balance: ethers.parseEther("100000").toString(),
        },
        {
          privateKey: `0x${"2c9bc453e636845ffa79f8f71ddef5129ced5f25cfae7aa2d995593a4b0b7d75"}`,
          balance: ethers.parseEther("100000").toString(),
        },
        {
          privateKey: `0x${"0a1fe14dd7263d1de47c0c388d1d4b035bd3a4c362f6e85e17844c545c9ea358"}`,
          balance: ethers.parseEther("100000").toString(),
        },
        {
          privateKey: `0x${"2a1e9a6f7a471cf0ebf1db4e244916693a2dd45931991b1599d27c75f4afd1f6"}`,
          balance: ethers.parseEther("100000").toString(),
        },
        {
          privateKey: `0x${"586a442ce7f03804f34425c4b9867cb4ae19ccb2c5767dc0afbcee296f1bfb0d"}`,
          balance: ethers.parseEther("10000").toString(),
        },
        {
          privateKey: `0x${"5011476e59231840873a200962603e214190a5cebc91026754546fb7aca1ed1a"}`,
          balance: ethers.parseEther("10000").toString(),
        },
        {
          privateKey: `0x${"1c7337556a6fa12244c452b2916359ad0064c0d3b40ffd61f6b127fb23adc16a"}`,
          balance: ethers.parseEther("10000").toString(),
        },
        {
          privateKey: `0x${"819c6cbab0704abdebdad26c40d9099efa47353e8c42541b52af7ba1e8cdf4e4"}`,
          balance: ethers.parseEther("10000").toString(),
        },
        {
          privateKey: `0x${"50064ce5c4835c90c983261af44a605263654afc7c871c96b8bbde8f904cd297"}`,
          balance: ethers.parseEther("10000").toString(),
        },
      ],
    },
    mainnet: {
      url: "https://eth-mainnet.g.alchemy.com/v2/lRMsx20J5y-EEw-RAVZGzuZk7lcQDzy0",
      accounts: [
        `0x${"aa3d66bcaddc1295226194c8bea765e394bd4192be8d87729feba8beed9808f2"}`,
      ],
    },
  },
  mocha: {
    timeout: 100000000,
  },
  allowUnlimitedContractSize: true,
};
