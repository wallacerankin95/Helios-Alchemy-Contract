const { expect } = require("chai");
const { ethers } = require("hardhat");
const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("HELIOS Contract", function () {
  // Fixture for deploying the contract
  async function deployContractFixture() {
    const [
      owner,
      otherAccount,
      donerAccount,
      goodUser,
      anotherUser,
      secondlast,
      lastUser,
      oneMore,
      twoMore,
    ] = await ethers.getSigners();

    const router_ABI = [
      {
        inputs: [
          { internalType: "address", name: "_factory", type: "address" },
          { internalType: "address", name: "_WETH9", type: "address" },
        ],
        stateMutability: "nonpayable",
        type: "constructor",
      },
      {
        inputs: [],
        name: "WETH9",
        outputs: [{ internalType: "address", name: "", type: "address" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          {
            components: [
              { internalType: "bytes", name: "path", type: "bytes" },
              { internalType: "address", name: "recipient", type: "address" },
              { internalType: "uint256", name: "deadline", type: "uint256" },
              { internalType: "uint256", name: "amountIn", type: "uint256" },
              {
                internalType: "uint256",
                name: "amountOutMinimum",
                type: "uint256",
              },
            ],
            internalType: "struct ISwapRouter.ExactInputParams",
            name: "params",
            type: "tuple",
          },
        ],
        name: "exactInput",
        outputs: [
          { internalType: "uint256", name: "amountOut", type: "uint256" },
        ],
        stateMutability: "payable",
        type: "function",
      },
      {
        inputs: [
          {
            components: [
              { internalType: "address", name: "tokenIn", type: "address" },
              { internalType: "address", name: "tokenOut", type: "address" },
              { internalType: "uint24", name: "fee", type: "uint24" },
              { internalType: "address", name: "recipient", type: "address" },
              { internalType: "uint256", name: "deadline", type: "uint256" },
              { internalType: "uint256", name: "amountIn", type: "uint256" },
              {
                internalType: "uint256",
                name: "amountOutMinimum",
                type: "uint256",
              },
              {
                internalType: "uint160",
                name: "sqrtPriceLimitX96",
                type: "uint160",
              },
            ],
            internalType: "struct ISwapRouter.ExactInputSingleParams",
            name: "params",
            type: "tuple",
          },
        ],
        name: "exactInputSingle",
        outputs: [
          { internalType: "uint256", name: "amountOut", type: "uint256" },
        ],
        stateMutability: "payable",
        type: "function",
      },
      {
        inputs: [
          {
            components: [
              { internalType: "bytes", name: "path", type: "bytes" },
              { internalType: "address", name: "recipient", type: "address" },
              { internalType: "uint256", name: "deadline", type: "uint256" },
              { internalType: "uint256", name: "amountOut", type: "uint256" },
              {
                internalType: "uint256",
                name: "amountInMaximum",
                type: "uint256",
              },
            ],
            internalType: "struct ISwapRouter.ExactOutputParams",
            name: "params",
            type: "tuple",
          },
        ],
        name: "exactOutput",
        outputs: [
          { internalType: "uint256", name: "amountIn", type: "uint256" },
        ],
        stateMutability: "payable",
        type: "function",
      },
      {
        inputs: [
          {
            components: [
              { internalType: "address", name: "tokenIn", type: "address" },
              { internalType: "address", name: "tokenOut", type: "address" },
              { internalType: "uint24", name: "fee", type: "uint24" },
              { internalType: "address", name: "recipient", type: "address" },
              { internalType: "uint256", name: "deadline", type: "uint256" },
              { internalType: "uint256", name: "amountOut", type: "uint256" },
              {
                internalType: "uint256",
                name: "amountInMaximum",
                type: "uint256",
              },
              {
                internalType: "uint160",
                name: "sqrtPriceLimitX96",
                type: "uint160",
              },
            ],
            internalType: "struct ISwapRouter.ExactOutputSingleParams",
            name: "params",
            type: "tuple",
          },
        ],
        name: "exactOutputSingle",
        outputs: [
          { internalType: "uint256", name: "amountIn", type: "uint256" },
        ],
        stateMutability: "payable",
        type: "function",
      },
      {
        inputs: [],
        name: "factory",
        outputs: [{ internalType: "address", name: "", type: "address" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [{ internalType: "bytes[]", name: "data", type: "bytes[]" }],
        name: "multicall",
        outputs: [
          { internalType: "bytes[]", name: "results", type: "bytes[]" },
        ],
        stateMutability: "payable",
        type: "function",
      },
      {
        inputs: [],
        name: "refundETH",
        outputs: [],
        stateMutability: "payable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "address", name: "token", type: "address" },
          { internalType: "uint256", name: "value", type: "uint256" },
          { internalType: "uint256", name: "deadline", type: "uint256" },
          { internalType: "uint8", name: "v", type: "uint8" },
          { internalType: "bytes32", name: "r", type: "bytes32" },
          { internalType: "bytes32", name: "s", type: "bytes32" },
        ],
        name: "selfPermit",
        outputs: [],
        stateMutability: "payable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "address", name: "token", type: "address" },
          { internalType: "uint256", name: "nonce", type: "uint256" },
          { internalType: "uint256", name: "expiry", type: "uint256" },
          { internalType: "uint8", name: "v", type: "uint8" },
          { internalType: "bytes32", name: "r", type: "bytes32" },
          { internalType: "bytes32", name: "s", type: "bytes32" },
        ],
        name: "selfPermitAllowed",
        outputs: [],
        stateMutability: "payable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "address", name: "token", type: "address" },
          { internalType: "uint256", name: "nonce", type: "uint256" },
          { internalType: "uint256", name: "expiry", type: "uint256" },
          { internalType: "uint8", name: "v", type: "uint8" },
          { internalType: "bytes32", name: "r", type: "bytes32" },
          { internalType: "bytes32", name: "s", type: "bytes32" },
        ],
        name: "selfPermitAllowedIfNecessary",
        outputs: [],
        stateMutability: "payable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "address", name: "token", type: "address" },
          { internalType: "uint256", name: "value", type: "uint256" },
          { internalType: "uint256", name: "deadline", type: "uint256" },
          { internalType: "uint8", name: "v", type: "uint8" },
          { internalType: "bytes32", name: "r", type: "bytes32" },
          { internalType: "bytes32", name: "s", type: "bytes32" },
        ],
        name: "selfPermitIfNecessary",
        outputs: [],
        stateMutability: "payable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "address", name: "token", type: "address" },
          { internalType: "uint256", name: "amountMinimum", type: "uint256" },
          { internalType: "address", name: "recipient", type: "address" },
        ],
        name: "sweepToken",
        outputs: [],
        stateMutability: "payable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "address", name: "token", type: "address" },
          { internalType: "uint256", name: "amountMinimum", type: "uint256" },
          { internalType: "address", name: "recipient", type: "address" },
          { internalType: "uint256", name: "feeBips", type: "uint256" },
          { internalType: "address", name: "feeRecipient", type: "address" },
        ],
        name: "sweepTokenWithFee",
        outputs: [],
        stateMutability: "payable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "int256", name: "amount0Delta", type: "int256" },
          { internalType: "int256", name: "amount1Delta", type: "int256" },
          { internalType: "bytes", name: "_data", type: "bytes" },
        ],
        name: "uniswapV3SwapCallback",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "uint256", name: "amountMinimum", type: "uint256" },
          { internalType: "address", name: "recipient", type: "address" },
        ],
        name: "unwrapWETH9",
        outputs: [],
        stateMutability: "payable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "uint256", name: "amountMinimum", type: "uint256" },
          { internalType: "address", name: "recipient", type: "address" },
          { internalType: "uint256", name: "feeBips", type: "uint256" },
          { internalType: "address", name: "feeRecipient", type: "address" },
        ],
        name: "unwrapWETH9WithFee",
        outputs: [],
        stateMutability: "payable",
        type: "function",
      },
      { stateMutability: "payable", type: "receive" },
    ];
    const titanx_ABI = [
      {
        inputs: [
          { internalType: "address", name: "genesisAddress", type: "address" },
          {
            internalType: "address",
            name: "buyAndBurnAddress",
            type: "address",
          },
        ],
        stateMutability: "nonpayable",
        type: "constructor",
      },
      { inputs: [], name: "TitanX_AtLeastHalfMaturity", type: "error" },
      { inputs: [], name: "TitanX_EmptyUndistributeFees", type: "error" },
      { inputs: [], name: "TitanX_FailedToSendAmount", type: "error" },
      { inputs: [], name: "TitanX_InsufficientBalance", type: "error" },
      { inputs: [], name: "TitanX_InsufficientBurnAllowance", type: "error" },
      { inputs: [], name: "TitanX_InsufficientProtocolFees", type: "error" },
      { inputs: [], name: "TitanX_InvalidAddress", type: "error" },
      { inputs: [], name: "TitanX_InvalidAmount", type: "error" },
      { inputs: [], name: "TitanX_InvalidBatchCount", type: "error" },
      { inputs: [], name: "TitanX_InvalidBurnRewardPercent", type: "error" },
      { inputs: [], name: "TitanX_InvalidMintLadderInterval", type: "error" },
      { inputs: [], name: "TitanX_InvalidMintLadderRange", type: "error" },
      { inputs: [], name: "TitanX_InvalidMintLength", type: "error" },
      { inputs: [], name: "TitanX_InvalidMintPower", type: "error" },
      { inputs: [], name: "TitanX_InvalidStakeLength", type: "error" },
      { inputs: [], name: "TitanX_LPTokensHasMinted", type: "error" },
      { inputs: [], name: "TitanX_MaxedWalletMints", type: "error" },
      { inputs: [], name: "TitanX_MaxedWalletStakes", type: "error" },
      { inputs: [], name: "TitanX_MintHasBurned", type: "error" },
      { inputs: [], name: "TitanX_MintHasClaimed", type: "error" },
      { inputs: [], name: "TitanX_MintNotMature", type: "error" },
      { inputs: [], name: "TitanX_NoCycleRewardToClaim", type: "error" },
      { inputs: [], name: "TitanX_NoMintExists", type: "error" },
      { inputs: [], name: "TitanX_NoSharesExist", type: "error" },
      { inputs: [], name: "TitanX_NoStakeExists", type: "error" },
      { inputs: [], name: "TitanX_NotAllowed", type: "error" },
      { inputs: [], name: "TitanX_NotOnwer", type: "error" },
      { inputs: [], name: "TitanX_NotSupportedContract", type: "error" },
      { inputs: [], name: "TitanX_RequireOneMinimumShare", type: "error" },
      { inputs: [], name: "TitanX_StakeHasBurned", type: "error" },
      { inputs: [], name: "TitanX_StakeHasEnded", type: "error" },
      { inputs: [], name: "TitanX_StakeNotMatured", type: "error" },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: "address",
            name: "owner",
            type: "address",
          },
          {
            indexed: true,
            internalType: "address",
            name: "spender",
            type: "address",
          },
          {
            indexed: false,
            internalType: "uint256",
            name: "value",
            type: "uint256",
          },
        ],
        name: "Approval",
        type: "event",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: "address",
            name: "user",
            type: "address",
          },
          {
            indexed: true,
            internalType: "address",
            name: "project",
            type: "address",
          },
          {
            indexed: true,
            internalType: "uint256",
            name: "amount",
            type: "uint256",
          },
        ],
        name: "ApproveBurnMints",
        type: "event",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: "address",
            name: "user",
            type: "address",
          },
          {
            indexed: true,
            internalType: "address",
            name: "project",
            type: "address",
          },
          {
            indexed: true,
            internalType: "uint256",
            name: "amount",
            type: "uint256",
          },
        ],
        name: "ApproveBurnStakes",
        type: "event",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: "address",
            name: "caller",
            type: "address",
          },
          {
            indexed: true,
            internalType: "uint256",
            name: "cycleNo",
            type: "uint256",
          },
          {
            indexed: true,
            internalType: "uint256",
            name: "reward",
            type: "uint256",
          },
          {
            indexed: false,
            internalType: "uint256",
            name: "burnReward",
            type: "uint256",
          },
        ],
        name: "CyclePayoutTriggered",
        type: "event",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: "address",
            name: "caller",
            type: "address",
          },
          {
            indexed: true,
            internalType: "uint256",
            name: "amount",
            type: "uint256",
          },
        ],
        name: "ETHDistributed",
        type: "event",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: "uint256",
            name: "day",
            type: "uint256",
          },
          {
            indexed: true,
            internalType: "uint256",
            name: "mintCost",
            type: "uint256",
          },
          {
            indexed: true,
            internalType: "uint256",
            name: "shareRate",
            type: "uint256",
          },
          {
            indexed: false,
            internalType: "uint256",
            name: "mintableTitan",
            type: "uint256",
          },
          {
            indexed: false,
            internalType: "uint256",
            name: "mintPowerBonus",
            type: "uint256",
          },
          {
            indexed: false,
            internalType: "uint256",
            name: "EAABonus",
            type: "uint256",
          },
        ],
        name: "GlobalDailyUpdateStats",
        type: "event",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: "address",
            name: "user",
            type: "address",
          },
          {
            indexed: true,
            internalType: "uint256",
            name: "tRank",
            type: "uint256",
          },
          {
            indexed: false,
            internalType: "uint256",
            name: "rewardMinted",
            type: "uint256",
          },
          {
            indexed: true,
            internalType: "uint256",
            name: "penalty",
            type: "uint256",
          },
          {
            indexed: false,
            internalType: "uint256",
            name: "mintPenalty",
            type: "uint256",
          },
        ],
        name: "MintClaimed",
        type: "event",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: "address",
            name: "user",
            type: "address",
          },
          {
            indexed: true,
            internalType: "uint256",
            name: "tRank",
            type: "uint256",
          },
          {
            indexed: true,
            internalType: "uint256",
            name: "gMintpower",
            type: "uint256",
          },
          {
            components: [
              { internalType: "uint8", name: "mintPower", type: "uint8" },
              { internalType: "uint16", name: "numOfDays", type: "uint16" },
              { internalType: "uint96", name: "mintableTitan", type: "uint96" },
              { internalType: "uint48", name: "mintStartTs", type: "uint48" },
              { internalType: "uint48", name: "maturityTs", type: "uint48" },
              {
                internalType: "uint32",
                name: "mintPowerBonus",
                type: "uint32",
              },
              { internalType: "uint32", name: "EAABonus", type: "uint32" },
              { internalType: "uint128", name: "mintedTitan", type: "uint128" },
              { internalType: "uint64", name: "mintCost", type: "uint64" },
              {
                internalType: "enum MintStatus",
                name: "status",
                type: "uint8",
              },
            ],
            indexed: false,
            internalType: "struct MintInfo.UserMintInfo",
            name: "userMintInfo",
            type: "tuple",
          },
        ],
        name: "MintStarted",
        type: "event",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: "address",
            name: "user",
            type: "address",
          },
          {
            indexed: true,
            internalType: "uint256",
            name: "day",
            type: "uint256",
          },
          {
            indexed: true,
            internalType: "uint256",
            name: "amount",
            type: "uint256",
          },
        ],
        name: "ProtocolFeeRecevied",
        type: "event",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: "address",
            name: "user",
            type: "address",
          },
          {
            indexed: true,
            internalType: "uint256",
            name: "reward",
            type: "uint256",
          },
        ],
        name: "RewardClaimed",
        type: "event",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: "address",
            name: "user",
            type: "address",
          },
          {
            indexed: true,
            internalType: "uint256",
            name: "globalStakeId",
            type: "uint256",
          },
          {
            indexed: false,
            internalType: "uint256",
            name: "titanAmount",
            type: "uint256",
          },
          {
            indexed: true,
            internalType: "uint256",
            name: "penalty",
            type: "uint256",
          },
          {
            indexed: false,
            internalType: "uint256",
            name: "penaltyAmount",
            type: "uint256",
          },
        ],
        name: "StakeEnded",
        type: "event",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: "address",
            name: "user",
            type: "address",
          },
          {
            indexed: true,
            internalType: "uint256",
            name: "globalStakeId",
            type: "uint256",
          },
          {
            indexed: false,
            internalType: "uint256",
            name: "numOfDays",
            type: "uint256",
          },
          {
            components: [
              { internalType: "uint152", name: "titanAmount", type: "uint152" },
              { internalType: "uint128", name: "shares", type: "uint128" },
              { internalType: "uint16", name: "numOfDays", type: "uint16" },
              { internalType: "uint48", name: "stakeStartTs", type: "uint48" },
              { internalType: "uint48", name: "maturityTs", type: "uint48" },
              {
                internalType: "enum StakeStatus",
                name: "status",
                type: "uint8",
              },
            ],
            indexed: true,
            internalType: "struct StakeInfo.UserStakeInfo",
            name: "userStakeInfo",
            type: "tuple",
          },
        ],
        name: "StakeStarted",
        type: "event",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: "address",
            name: "user",
            type: "address",
          },
          {
            indexed: true,
            internalType: "address",
            name: "project",
            type: "address",
          },
          {
            indexed: true,
            internalType: "uint256",
            name: "burnPoolCycleIndex",
            type: "uint256",
          },
          {
            indexed: false,
            internalType: "uint256",
            name: "amount",
            type: "uint256",
          },
          {
            indexed: false,
            internalType: "enum BurnSource",
            name: "titanSource",
            type: "uint8",
          },
        ],
        name: "TitanBurned",
        type: "event",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: "address",
            name: "from",
            type: "address",
          },
          {
            indexed: true,
            internalType: "address",
            name: "to",
            type: "address",
          },
          {
            indexed: false,
            internalType: "uint256",
            name: "value",
            type: "uint256",
          },
        ],
        name: "Transfer",
        type: "event",
      },
      {
        inputs: [
          { internalType: "address", name: "owner", type: "address" },
          { internalType: "address", name: "spender", type: "address" },
        ],
        name: "allowance",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          { internalType: "address", name: "user", type: "address" },
          { internalType: "address", name: "spender", type: "address" },
        ],
        name: "allowanceBurnMints",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          { internalType: "address", name: "user", type: "address" },
          { internalType: "address", name: "spender", type: "address" },
        ],
        name: "allowanceBurnStakes",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          { internalType: "address", name: "spender", type: "address" },
          { internalType: "uint256", name: "amount", type: "uint256" },
        ],
        name: "approve",
        outputs: [{ internalType: "bool", name: "", type: "bool" }],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "address", name: "spender", type: "address" },
          { internalType: "uint256", name: "amount", type: "uint256" },
        ],
        name: "approveBurnMints",
        outputs: [{ internalType: "bool", name: "", type: "bool" }],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "address", name: "spender", type: "address" },
          { internalType: "uint256", name: "amount", type: "uint256" },
        ],
        name: "approveBurnStakes",
        outputs: [{ internalType: "bool", name: "", type: "bool" }],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [{ internalType: "address", name: "account", type: "address" }],
        name: "balanceOf",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "batchClaimMint",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "uint256", name: "mintPower", type: "uint256" },
          { internalType: "uint256", name: "numOfDays", type: "uint256" },
          { internalType: "uint256", name: "count", type: "uint256" },
        ],
        name: "batchMint",
        outputs: [],
        stateMutability: "payable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "uint256", name: "mintPower", type: "uint256" },
          { internalType: "uint256", name: "minDay", type: "uint256" },
          { internalType: "uint256", name: "maxDay", type: "uint256" },
          { internalType: "uint256", name: "dayInterval", type: "uint256" },
          {
            internalType: "uint256",
            name: "countPerInterval",
            type: "uint256",
          },
        ],
        name: "batchMintLadder",
        outputs: [],
        stateMutability: "payable",
        type: "function",
      },
      {
        inputs: [],
        name: "burnLPTokens",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "address", name: "user", type: "address" },
          { internalType: "uint256", name: "id", type: "uint256" },
        ],
        name: "burnMint",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "address", name: "user", type: "address" },
          { internalType: "uint256", name: "id", type: "uint256" },
          {
            internalType: "uint256",
            name: "userRebatePercentage",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "rewardPaybackPercentage",
            type: "uint256",
          },
        ],
        name: "burnStake",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "address", name: "user", type: "address" },
          { internalType: "uint256", name: "id", type: "uint256" },
          {
            internalType: "uint256",
            name: "userRebatePercentage",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "rewardPaybackPercentage",
            type: "uint256",
          },
          {
            internalType: "address",
            name: "rewardPaybackAddress",
            type: "address",
          },
        ],
        name: "burnStakeToPayAddress",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "address", name: "user", type: "address" },
          { internalType: "uint256", name: "amount", type: "uint256" },
          {
            internalType: "uint256",
            name: "userRebatePercentage",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "rewardPaybackPercentage",
            type: "uint256",
          },
        ],
        name: "burnTokens",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "address", name: "user", type: "address" },
          { internalType: "uint256", name: "amount", type: "uint256" },
          {
            internalType: "uint256",
            name: "userRebatePercentage",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "rewardPaybackPercentage",
            type: "uint256",
          },
          {
            internalType: "address",
            name: "rewardPaybackAddress",
            type: "address",
          },
        ],
        name: "burnTokensToPayAddress",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [{ internalType: "uint256", name: "id", type: "uint256" }],
        name: "claimMint",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [],
        name: "claimUserAvailableETHBurnPool",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [],
        name: "claimUserAvailableETHPayouts",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [],
        name: "decimals",
        outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "distributeETH",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [],
        name: "enableBurnPoolReward",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [{ internalType: "uint256", name: "id", type: "uint256" }],
        name: "endStake",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "address", name: "user", type: "address" },
          { internalType: "uint256", name: "id", type: "uint256" },
        ],
        name: "endStakeForOthers",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [],
        name: "genesisTs",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "getBalance",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "getCurrentBlockTimeStamp",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "getCurrentContractDay",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [{ internalType: "uint256", name: "cycleNo", type: "uint256" }],
        name: "getCurrentCycleIndex",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "getCurrentEAABonus",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "getCurrentMintCost",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "getCurrentMintPowerBonus",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "getCurrentMintableTitan",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "getCurrentShareRate",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "getCurrentUserBurnCyclePercentage",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          { internalType: "uint256", name: "cycleIndex", type: "uint256" },
        ],
        name: "getCycleBurnPayoutPerToken",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "getCycleBurnPool",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          { internalType: "uint256", name: "cycleIndex", type: "uint256" },
        ],
        name: "getCycleBurnTotal",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [{ internalType: "uint256", name: "cycleNo", type: "uint256" }],
        name: "getCyclePayoutPool",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "getGlobalActiveShares",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "getGlobalActiveStakes",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "getGlobalExpiredShares",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "getGlobalMintPower",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "getGlobalPayoutTriggered",
        outputs: [
          { internalType: "enum PayoutTriggered", name: "", type: "uint8" },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "getGlobalShares",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "getGlobalStakeId",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "getGlobalTRank",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [{ internalType: "uint256", name: "cycleNo", type: "uint256" }],
        name: "getNextCyclePayoutDay",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          { internalType: "uint256", name: "cycleNo", type: "uint256" },
          { internalType: "uint256", name: "index", type: "uint256" },
        ],
        name: "getPayoutPerShare",
        outputs: [
          { internalType: "uint256", name: "", type: "uint256" },
          { internalType: "uint256", name: "", type: "uint256" },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          { internalType: "address", name: "contractAddress", type: "address" },
        ],
        name: "getProjectBurnTotal",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          { internalType: "address", name: "contractAddress", type: "address" },
          { internalType: "address", name: "user", type: "address" },
        ],
        name: "getProjectUserBurnTotal",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "getTotalActiveMints",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "getTotalBurnTotal",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "getTotalMintBurn",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "getTotalMintClaim",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "getTotalMintPenalty",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "getTotalMinting",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "getTotalPenalties",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "getTotalStakeBurn",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "getTotalStakeEnd",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "getTotalStakePenalty",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "getTotalTitanStaked",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "getUndistributedEth",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [{ internalType: "address", name: "user", type: "address" }],
        name: "getUserBurnAmplifierBonus",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [{ internalType: "address", name: "user", type: "address" }],
        name: "getUserBurnPoolETHClaimableTotal",
        outputs: [{ internalType: "uint256", name: "reward", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [{ internalType: "address", name: "user", type: "address" }],
        name: "getUserBurnTotal",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [{ internalType: "address", name: "user", type: "address" }],
        name: "getUserCurrentActiveShares",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [{ internalType: "address", name: "user", type: "address" }],
        name: "getUserCycleBurnTotal",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [{ internalType: "address", name: "user", type: "address" }],
        name: "getUserETHClaimableTotal",
        outputs: [{ internalType: "uint256", name: "reward", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          { internalType: "address", name: "user", type: "address" },
          { internalType: "uint256", name: "cycleNo", type: "uint256" },
        ],
        name: "getUserLastBurnClaimIndex",
        outputs: [
          { internalType: "uint256", name: "burnCycleIndex", type: "uint256" },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          { internalType: "address", name: "user", type: "address" },
          { internalType: "uint256", name: "cycleNo", type: "uint256" },
        ],
        name: "getUserLastClaimIndex",
        outputs: [
          { internalType: "uint256", name: "cycleIndex", type: "uint256" },
          { internalType: "uint256", name: "sharesIndex", type: "uint256" },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [{ internalType: "address", name: "user", type: "address" }],
        name: "getUserLatestMintId",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [{ internalType: "address", name: "user", type: "address" }],
        name: "getUserLatestShareIndex",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          { internalType: "address", name: "user", type: "address" },
          { internalType: "uint256", name: "id", type: "uint256" },
        ],
        name: "getUserMintInfo",
        outputs: [
          {
            components: [
              { internalType: "uint8", name: "mintPower", type: "uint8" },
              { internalType: "uint16", name: "numOfDays", type: "uint16" },
              { internalType: "uint96", name: "mintableTitan", type: "uint96" },
              { internalType: "uint48", name: "mintStartTs", type: "uint48" },
              { internalType: "uint48", name: "maturityTs", type: "uint48" },
              {
                internalType: "uint32",
                name: "mintPowerBonus",
                type: "uint32",
              },
              { internalType: "uint32", name: "EAABonus", type: "uint32" },
              { internalType: "uint128", name: "mintedTitan", type: "uint128" },
              { internalType: "uint64", name: "mintCost", type: "uint64" },
              {
                internalType: "enum MintStatus",
                name: "status",
                type: "uint8",
              },
            ],
            internalType: "struct MintInfo.UserMintInfo",
            name: "mintInfo",
            type: "tuple",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [{ internalType: "address", name: "user", type: "address" }],
        name: "getUserMints",
        outputs: [
          {
            components: [
              { internalType: "uint256", name: "mId", type: "uint256" },
              { internalType: "uint256", name: "tRank", type: "uint256" },
              { internalType: "uint256", name: "gMintPower", type: "uint256" },
              {
                components: [
                  { internalType: "uint8", name: "mintPower", type: "uint8" },
                  { internalType: "uint16", name: "numOfDays", type: "uint16" },
                  {
                    internalType: "uint96",
                    name: "mintableTitan",
                    type: "uint96",
                  },
                  {
                    internalType: "uint48",
                    name: "mintStartTs",
                    type: "uint48",
                  },
                  {
                    internalType: "uint48",
                    name: "maturityTs",
                    type: "uint48",
                  },
                  {
                    internalType: "uint32",
                    name: "mintPowerBonus",
                    type: "uint32",
                  },
                  { internalType: "uint32", name: "EAABonus", type: "uint32" },
                  {
                    internalType: "uint128",
                    name: "mintedTitan",
                    type: "uint128",
                  },
                  { internalType: "uint64", name: "mintCost", type: "uint64" },
                  {
                    internalType: "enum MintStatus",
                    name: "status",
                    type: "uint8",
                  },
                ],
                internalType: "struct MintInfo.UserMintInfo",
                name: "mintInfo",
                type: "tuple",
              },
            ],
            internalType: "struct MintInfo.UserMint[]",
            name: "mintInfos",
            type: "tuple[]",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          { internalType: "address", name: "user", type: "address" },
          { internalType: "uint256", name: "id", type: "uint256" },
        ],
        name: "getUserStakeInfo",
        outputs: [
          {
            components: [
              { internalType: "uint152", name: "titanAmount", type: "uint152" },
              { internalType: "uint128", name: "shares", type: "uint128" },
              { internalType: "uint16", name: "numOfDays", type: "uint16" },
              { internalType: "uint48", name: "stakeStartTs", type: "uint48" },
              { internalType: "uint48", name: "maturityTs", type: "uint48" },
              {
                internalType: "enum StakeStatus",
                name: "status",
                type: "uint8",
              },
            ],
            internalType: "struct StakeInfo.UserStakeInfo",
            name: "",
            type: "tuple",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [{ internalType: "address", name: "user", type: "address" }],
        name: "getUserStakes",
        outputs: [
          {
            components: [
              { internalType: "uint256", name: "sId", type: "uint256" },
              {
                internalType: "uint256",
                name: "globalStakeId",
                type: "uint256",
              },
              {
                components: [
                  {
                    internalType: "uint152",
                    name: "titanAmount",
                    type: "uint152",
                  },
                  { internalType: "uint128", name: "shares", type: "uint128" },
                  { internalType: "uint16", name: "numOfDays", type: "uint16" },
                  {
                    internalType: "uint48",
                    name: "stakeStartTs",
                    type: "uint48",
                  },
                  {
                    internalType: "uint48",
                    name: "maturityTs",
                    type: "uint48",
                  },
                  {
                    internalType: "enum StakeStatus",
                    name: "status",
                    type: "uint8",
                  },
                ],
                internalType: "struct StakeInfo.UserStakeInfo",
                name: "stakeInfo",
                type: "tuple",
              },
            ],
            internalType: "struct StakeInfo.UserStake[]",
            name: "",
            type: "tuple[]",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "isBurnPoolEnabled",
        outputs: [
          { internalType: "enum BurnPoolEnabled", name: "", type: "uint8" },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "manualDailyUpdate",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [],
        name: "mintLPTokens",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [],
        name: "name",
        outputs: [{ internalType: "string", name: "", type: "string" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "renounceOwnership",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "address", name: "contractAddress", type: "address" },
        ],
        name: "setBuyAndBurnContractAddress",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "address", name: "newAddress", type: "address" },
        ],
        name: "setNewGenesisAddress",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "uint256", name: "mintPower", type: "uint256" },
          { internalType: "uint256", name: "numOfDays", type: "uint256" },
        ],
        name: "startMint",
        outputs: [],
        stateMutability: "payable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "uint256", name: "amount", type: "uint256" },
          { internalType: "uint256", name: "numOfDays", type: "uint256" },
        ],
        name: "startStake",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [],
        name: "symbol",
        outputs: [{ internalType: "string", name: "", type: "string" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "totalSupply",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          { internalType: "address", name: "to", type: "address" },
          { internalType: "uint256", name: "amount", type: "uint256" },
        ],
        name: "transfer",
        outputs: [{ internalType: "bool", name: "", type: "bool" }],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "address", name: "from", type: "address" },
          { internalType: "address", name: "to", type: "address" },
          { internalType: "uint256", name: "amount", type: "uint256" },
        ],
        name: "transferFrom",
        outputs: [{ internalType: "bool", name: "", type: "bool" }],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "address", name: "newOwner", type: "address" },
        ],
        name: "transferOwnership",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [],
        name: "triggerPayouts",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [{ internalType: "uint256", name: "id", type: "uint256" }],
        name: "userBurnMint",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [{ internalType: "uint256", name: "id", type: "uint256" }],
        name: "userBurnStake",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [{ internalType: "uint256", name: "amount", type: "uint256" }],
        name: "userBurnTokens",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
    ];

    const titanXOwner = await ethers.getImpersonatedSigner(
      "0x10129f3Fe44dD32745D6E64E5d84cB84a524F114"
    );

    const swapRouter = await ethers.getContractAt(
      router_ABI,
      "0xE592427A0AEce92De3Edee1F18E0157C05861564",
      owner
    );

    const titanx = await ethers.getContractAt(
      titanx_ABI,
      "0xF19308F923582A6f7c465e5CE7a9Dc1BEC6665B1",
      owner
    );

    await donerAccount.sendTransaction({
      to: titanXOwner.address,
      value: ethers.parseEther("500"),
    });

    const buy_and_burn = await ethers.getContractFactory("BuyAndBurn");

    const BuyAndBurn = await buy_and_burn.deploy();

    const treasuryContract = await ethers.getContractFactory("Treasury");

    const Treasury = await treasuryContract.deploy(owner.address);

    const Helios = await ethers.getContractFactory("HELIOS");

    const helios = await Helios.deploy(
      owner.address,
      BuyAndBurn.target,
      titanx.target,
      Treasury.target
    );

    await BuyAndBurn.setHlxAddress(helios.target);
    await BuyAndBurn.createInitialPool();
    await Treasury.setHlxContractAddress(helios.target);
    await Treasury.setHlxBuyAndBurnAddress(BuyAndBurn.target);

    return {
      titanx,
      owner,
      otherAccount,
      helios,
      titanXOwner,
      BuyAndBurn,
      goodUser,
      anotherUser,
      Treasury,
      secondlast,
      lastUser,
      swapRouter,
      oneMore,
      twoMore,
    };
  }

  async function getCurrentBlockTimestamp() {
    try {
      // Get the latest block
      const block = await ethers.provider.getBlock("latest");

      // Access the timestamp of the block
      const timestamp = block.timestamp;

      return timestamp;
    } catch (error) {
      console.error(error);
    }
  }

  describe("Minting", function () {
    it("Should handle minting TitanX correctly", async function () {
      const { titanx, owner, helios } = await loadFixture(
        deployContractFixture
      );

      let _11days = 11 * 24 * 60 * 60;

      console.log(
        "Owner TitanX Balance Before : ",
        await titanx.balanceOf(owner.address)
      );

      const mintTx = await titanx.startMint(100, 10, {
        value: ethers.parseEther("1"),
      });
      await mintTx.wait();

      await ethers.provider.send("evm_increaseTime", [_11days]);
      await ethers.provider.send("evm_mine");

      await titanx.claimMint(1);

      console.log(
        "Owner TitanX Balance After Claim : ",
        ethers.formatEther(await titanx.balanceOf(owner.address)),
        "\n"
      );
    });
    it("Should handle minting Helios correctly", async function () {
      const { titanx, owner, helios } = await loadFixture(
        deployContractFixture
      );

      let _11days = 11 * 24 * 60 * 60;
      let _280days = 280 * 24 * 60 * 60;
      let mintPower = 100;
      let mintDays = 280;

      const mintTx = await titanx.startMint(mintPower, mintDays, {
        value: ethers.parseEther("1"),
      });
      await mintTx.wait();
      const mintTx2 = await titanx.startMint(mintPower, mintDays, {
        value: ethers.parseEther("1"),
      });
      await mintTx2.wait();

      await ethers.provider.send("evm_increaseTime", [_280days]);
      await ethers.provider.send("evm_mine");

      await titanx.claimMint(1);
      await titanx.claimMint(2);

      await titanx.approve(
        helios.target,
        await titanx.balanceOf(owner.address)
      );

      console.log(
        "Owner Helios Balance Before : ",
        ethers.formatEther(await helios.balanceOf(owner.address)),
        "\n "
      );
      console.log(
        "Owner TitanX Balance Before : ",
        ethers.formatEther(await titanx.balanceOf(owner.address)),
        "\n "
      );

      const heliosMintTx = await helios.startMint(
        100,
        10,
        ethers.parseEther("600000")
      );
      await heliosMintTx.wait();

      await ethers.provider.send("evm_increaseTime", [_11days]);
      await ethers.provider.send("evm_mine");

      await helios.claimMint(1);

      console.log(
        "Owner TitanX Balance After : ",
        ethers.formatEther(await titanx.balanceOf(owner.address)),
        "\n "
      );

      console.log(
        "Owner Helios Balance After Claim : ",
        ethers.formatUnits(await helios.balanceOf(owner.address), 18),
        "\n"
      );
    });
  });

  describe("Stake", function () {
    it("Should handle Staking and Recieving ETH Rewards correctly", async function () {
      const { titanx, owner } = await loadFixture(deployContractFixture);

      let _11days = 11 * 24 * 60 * 60;
      let _100days = 100 * 24 * 60 * 60;

      const mintTx = await titanx.startMint(100, 10, {
        value: ethers.parseEther("1"),
      });
      await mintTx.wait();

      await ethers.provider.send("evm_increaseTime", [_11days]);
      await ethers.provider.send("evm_mine");

      await titanx.claimMint(1);

      console.log(
        "Owner TitanX Balance Before Stake : ",
        ethers.formatUnits(await titanx.balanceOf(owner.address), 18),
        "\n"
      );

      const titanxStakeTx = await titanx.startStake(
        await titanx.balanceOf(owner.address),
        100
      );
      await titanxStakeTx.wait();

      console.log(
        "Owner ETH Balance Before End Stake : ",
        ethers.formatEther(await ethers.provider.getBalance(owner.address)),
        "\n"
      );

      await ethers.provider.send("evm_increaseTime", [_100days]);
      await ethers.provider.send("evm_mine");

      await titanx.triggerPayouts();

      console.log(
        "Owner ETH Balance After Payouts : ",
        ethers.formatUnits(await ethers.provider.getBalance(owner.address)),
        "\n"
      );

      await titanx.endStake(1);

      console.log(
        "Owner TitanX Balance After Stake : ",
        ethers.formatEther(await titanx.balanceOf(owner.address)),
        "\n"
      );

      await titanx.claimUserAvailableETHPayouts();

      console.log(
        "Owner ETH Balance After Eth Claim : ",
        ethers.formatEther(await ethers.provider.getBalance(owner.address)),
        "\n"
      );
    });
    it("Should handle Staking and Recieving TitanX Rewards correctly", async function () {
      const { titanx, owner, helios } = await loadFixture(
        deployContractFixture
      );

      let _11days = 11 * 24 * 60 * 60;
      let _280days = 280 * 24 * 60 * 60;
      let _100days = 100 * 24 * 60 * 60;

      let mintPower = 100;
      let mintDays = 280;

      const mintTx = await titanx.startMint(mintPower, mintDays, {
        value: ethers.parseEther("1"),
      });
      await mintTx.wait();
      const mintTx2 = await titanx.startMint(mintPower, mintDays, {
        value: ethers.parseEther("1"),
      });
      await mintTx2.wait();

      await ethers.provider.send("evm_increaseTime", [_280days]);
      await ethers.provider.send("evm_mine");

      await titanx.claimMint(1);
      await titanx.claimMint(2);

      await titanx.approve(
        helios.target,
        await titanx.balanceOf(owner.address)
      );

      const heliosMintTx = await helios.startMint(100, 10, 0);
      await heliosMintTx.wait();

      await ethers.provider.send("evm_increaseTime", [_11days]);
      await ethers.provider.send("evm_mine");

      await helios.claimMint(1);

      console.log(
        "Owner Helios Balance Before Stake : ",
        ethers.formatUnits(await helios.balanceOf(owner.address), 18),
        "\n"
      );

      console.log(
        "Owner TitanX Balance Before Stake : ",
        ethers.formatUnits(await titanx.balanceOf(owner.address), 18),
        "\n"
      );

      const heliosStakeTx = await helios.startStake(
        ethers.parseEther("2000"),
        100,
        ethers.parseEther("200")
      );
      await heliosStakeTx.wait();

      console.log(
        "Owner TitanX Balance Before End Stake : ",
        ethers.formatUnits(await titanx.balanceOf(owner.address), 18),
        "\n"
      );

      await ethers.provider.send("evm_increaseTime", [_100days]);
      await ethers.provider.send("evm_mine");

      await helios.triggerPayouts();

      console.log(
        "Owner TitanX Balance After Payouts : ",
        ethers.formatUnits(await titanx.balanceOf(owner.address), 18),
        "\n"
      );

      await helios.endStake(1);

      console.log(
        "Owner Helios Balance After Stake : ",
        ethers.formatUnits(await helios.balanceOf(owner.address), 18),
        "\n"
      );

      // await helios.claimUserAvailableTitanXPayouts();

      console.log(
        "Owner TitanX Balance After Stake : ",
        ethers.formatEther(await titanx.balanceOf(owner.address)),
        "\n"
      );
    });
  });

  describe("Burn Tokens", function () {
    it("Should handle Burn and check Rewards correctly", async function () {
      const { titanx, owner, titanXOwner } = await loadFixture(
        deployContractFixture
      );

      let _11days = 11 * 24 * 60 * 60;

      const mintTx = await titanx.startMint(100, 10, {
        value: ethers.parseEther("1"),
      });
      await mintTx.wait();

      await ethers.provider.send("evm_increaseTime", [_11days]);
      await ethers.provider.send("evm_mine");

      await titanx.claimMint(1);

      await titanx.connect(titanXOwner).enableBurnPoolReward();

      console.log(
        "Owner TitanX Balance Before Burn : ",
        ethers.formatUnits(await titanx.balanceOf(owner.address), 18),
        "\n"
      );

      await titanx.userBurnTokens(await titanx.balanceOf(owner.address));

      await titanx.triggerPayouts();

      console.log("Current Cycle Burn Pool: ", await titanx.getCycleBurnPool());

      console.log("Is Burn Pool Enabled :", await titanx.isBurnPoolEnabled());

      // console.log(
      //   "User Total Cycle Burned Tokens : ",
      //   await titanx.getUserCycleBurnTotal(owner.address)
      // );

      // console.log(
      //   "User Total Cycle Burn Percentage: ",
      //   await titanx.getCurrentUserBurnCyclePercentage()
      // );

      console.log(
        "Get User Burn Pool ETH Claimable Total",
        await titanx.getUserBurnPoolETHClaimableTotal(owner.address)
      );

      await titanx.claimUserAvailableETHBurnPool();

      console.log(
        "Get User Burn Pool ETH Claimable Total after claim",
        await titanx.getUserBurnPoolETHClaimableTotal(owner.address)
      );
    });
    it("Should handle Helios Burn and Recieving TitanX Rewards correctly", async function () {
      const { titanx, owner, helios, otherAccount } = await loadFixture(
        deployContractFixture
      );

      let _11days = 11 * 24 * 60 * 60;
      let _280days = 280 * 24 * 60 * 60;
      let _100days = 100 * 24 * 60 * 60;

      let mintPower = 100;
      let mintDays = 280;
      let stakeDays = 830;

      let _days = stakeDays * 24 * 60 * 60;
      const mintTx = await titanx.startMint(mintPower, mintDays, {
        value: ethers.parseEther("1"),
      });
      await mintTx.wait();
      const mintTx2 = await titanx.startMint(mintPower, mintDays, {
        value: ethers.parseEther("1"),
      });
      await mintTx2.wait();
      const mintTx3 = await titanx
        .connect(otherAccount)
        .startMint(mintPower, mintDays, {
          value: ethers.parseEther("1"),
        });
      await mintTx3.wait();
      const mintTx4 = await titanx
        .connect(otherAccount)
        .startMint(mintPower, mintDays, {
          value: ethers.parseEther("1"),
        });
      await mintTx4.wait();

      await ethers.provider.send("evm_increaseTime", [_280days]);
      await ethers.provider.send("evm_mine");

      await titanx.claimMint(1);
      await titanx.claimMint(2);

      await titanx.connect(otherAccount).claimMint(1);
      await titanx.connect(otherAccount).claimMint(2);

      await titanx.approve(
        helios.target,
        await titanx.balanceOf(owner.address)
      );

      await titanx
        .connect(otherAccount)
        .approve(helios.target, await titanx.balanceOf(owner.address));

      const heliosMintTx = await helios.startMint(100, 10, 0);
      await heliosMintTx.wait();

      const heliosMintOtherAccountTx = await helios
        .connect(otherAccount)
        .startMint(100, 10, 0);
      await heliosMintOtherAccountTx.wait();

      await ethers.provider.send("evm_increaseTime", [_11days]);
      await ethers.provider.send("evm_mine");

      await helios.claimMint(1);
      await helios.connect(otherAccount).claimMint(1);

      await owner.sendTransaction({
        to: helios.target,
        value: ethers.parseEther("100"),
      });

      const heliosStakeTx = await helios.startStake(
        await helios.balanceOf(owner.address),
        stakeDays,
        0
      );
      await heliosStakeTx.wait();
      const heliosStakeOtherAccountTx = await helios
        .connect(otherAccount)
        .startStake(await helios.balanceOf(otherAccount.address), stakeDays, 0);
      await heliosStakeOtherAccountTx.wait();

      await ethers.provider.send("evm_increaseTime", [_days]);
      await ethers.provider.send("evm_mine");

      await helios.triggerPayouts();

      await helios.endStake(1);
      await helios.connect(otherAccount).endStake(1);

      await helios.userBurnTokens(await helios.balanceOf(owner.address));

      console.log(
        "Owner Helios Balance After Burn : ",
        ethers.formatUnits(await helios.balanceOf(owner.address), 18),
        "\n"
      );

      console.log(
        "ETH Balance before :",
        ethers.formatEther(await ethers.provider.getBalance(helios.target))
      );
      console.log(
        "Get User 2 TitanX Claimable Total",
        ethers.formatEther(
          await helios.getUserTitanXClaimableTotal(otherAccount.address)
        )
      );

      console.log(
        "Get User 1 TitanX Claimable Total",
        ethers.formatEther(
          await helios.getUserTitanXClaimableTotal(owner.address)
        )
      );

      console.log(
        "Get User 2 ETH Claimable Total",
        ethers.formatEther(
          await helios.getUserETHClaimableTotal(otherAccount.address)
        )
      );
      console.log(
        "Get User 1 ETH Claimable Total",
        ethers.formatEther(await helios.getUserETHClaimableTotal(owner.address))
      );

      await helios.claimUserAvailablePayouts();

      await helios.connect(otherAccount).claimUserAvailablePayouts();

      console.log(
        "ETH Balance After :",
        ethers.formatEther(await ethers.provider.getBalance(helios.target))
      );
      console.log(
        "Get User TitanX Claimable Total",
        ethers.formatEther(
          await helios.getUserTitanXClaimableTotal(otherAccount.address)
        )
      );

      console.log(
        "Get User TitanX Claimable Total",
        ethers.formatEther(
          await helios.getUserTitanXClaimableTotal(owner.address)
        )
      );

      console.log(
        "Get User ETH Claimable Total",
        ethers.formatEther(
          await helios.getUserETHClaimableTotal(otherAccount.address)
        )
      );
      console.log(
        "Get User ETH Claimable Total",
        ethers.formatEther(await helios.getUserETHClaimableTotal(owner.address))
      );
    });
  });

  describe("BuyAndBurn Tokens", function () {
    it("Should handle Helios BuyandBurn settting up pool", async function () {
      const {
        titanx,
        owner,
        helios,
        otherAccount,
        BuyAndBurn,
        goodUser,
        anotherUser,
        secondlast,
        lastUser,
        oneMore,
        twoMore,
      } = await loadFixture(deployContractFixture);

      let _250days = 250 * 24 * 60 * 60;
      let _100days = 100 * 24 * 60 * 60;

      let mintPower = 100;
      let mintDays = 250;

      const users = [
        owner,
        otherAccount,
        goodUser,
        anotherUser,
        secondlast,
        lastUser,
        oneMore,
        twoMore,
      ];

      for (let index = 0; index < 8; index++) {
        for (const user of users) {
          const mintTx = await titanx
            .connect(user)
            .startMint(mintPower, mintDays, {
              value: ethers.parseEther("1"),
            });
          await mintTx.wait();

          const mintTx2 = await titanx
            .connect(user)
            .startMint(mintPower, mintDays, {
              value: ethers.parseEther("1"),
            });
          await mintTx2.wait();
        }

        await ethers.provider.send("evm_increaseTime", [_250days]);
        await ethers.provider.send("evm_mine");

        for (const user of users) {
          await titanx.connect(user).claimMint(1 + index * 2);
          await titanx.connect(user).claimMint(2 + index * 2);
        }
        await titanx.distributeETH();
      }

      await titanx
        .connect(goodUser)
        .transfer(owner.address, await titanx.balanceOf(goodUser.address));
      await titanx
        .connect(anotherUser)
        .transfer(
          otherAccount.address,
          await titanx.balanceOf(anotherUser.address)
        );
      await titanx
        .connect(secondlast)
        .transfer(owner.address, await titanx.balanceOf(secondlast.address));
      await titanx
        .connect(lastUser)
        .transfer(
          otherAccount.address,
          await titanx.balanceOf(lastUser.address)
        );
      await titanx
        .connect(oneMore)
        .transfer(owner.address, await titanx.balanceOf(oneMore.address));
      await titanx
        .connect(twoMore)
        .transfer(
          otherAccount.address,
          await titanx.balanceOf(twoMore.address)
        );

      await titanx.approve(
        helios.target,
        await titanx.balanceOf(owner.address)
      );

      await titanx
        .connect(otherAccount)
        .approve(helios.target, await titanx.balanceOf(owner.address));

      for (let index = 0; index < 4; index++) {
        const heliosMintTx = await helios.startMint(mintPower, mintDays, 0);
        await heliosMintTx.wait();

        const heliosMintOtherAccountTx = await helios
          .connect(otherAccount)
          .startMint(150, mintDays, 0);
        await heliosMintOtherAccountTx.wait();

        await ethers.provider.send("evm_increaseTime", [_250days]);
        await ethers.provider.send("evm_mine");

        await helios.claimMint(1 + index);
        await helios.connect(otherAccount).claimMint(1 + index);
      }

      const heliosStakeTx = await helios.startStake(
        ethers.parseEther("1350"),
        100,
        0
      );
      await heliosStakeTx.wait();

      const heliosStakeOtherAccountTx = await helios
        .connect(otherAccount)
        .startStake(await helios.balanceOf(otherAccount.address), 100, 0);
      await heliosStakeOtherAccountTx.wait();

      await ethers.provider.send("evm_increaseTime", [_100days]);
      await ethers.provider.send("evm_mine");

      await helios.endStake(1);

      await helios.triggerPayouts();

      await titanx.transfer(
        BuyAndBurn.target,
        await titanx.balanceOf(owner.address)
      );

      console.log(
        "BuyAndBurn TitanX Balance Before Adding Initial Liquidity: ",
        ethers.formatEther(await BuyAndBurn.getTitanXBalance())
      );

      await BuyAndBurn.createInitialLiquidity();

      console.log(
        "BuyAndBurn TitanX Balance: ",
        ethers.formatEther(await BuyAndBurn.getTitanXBalance())
      );
      console.log(
        "BuyAndBurn Helios Balance: ",
        ethers.formatEther(await BuyAndBurn.getHlxBalance())
      );
    });

    it("Should handle Helios BuyandBurn Function", async function () {
      const {
        titanx,
        owner,
        helios,
        otherAccount,
        BuyAndBurn,
        goodUser,
        anotherUser,
        secondlast,
        lastUser,
      } = await loadFixture(deployContractFixture);

      let _250days = 250 * 24 * 60 * 60;
      let _100days = 100 * 24 * 60 * 60;

      let mintPower = 100;
      let mintDays = 250;

      const users = [
        owner,
        otherAccount,
        goodUser,
        anotherUser,
        secondlast,
        lastUser,
      ];

      for (let index = 0; index < 8; index++) {
        for (const user of users) {
          const mintTx = await titanx
            .connect(user)
            .startMint(mintPower, mintDays, {
              value: ethers.parseEther("1"),
            });
          await mintTx.wait();

          const mintTx2 = await titanx
            .connect(user)
            .startMint(mintPower, mintDays, {
              value: ethers.parseEther("1"),
            });
          await mintTx2.wait();
        }

        await ethers.provider.send("evm_increaseTime", [_250days]);
        await ethers.provider.send("evm_mine");

        for (const user of users) {
          await titanx.connect(user).claimMint(1 + index * 2);
          await titanx.connect(user).claimMint(2 + index * 2);
        }
        await titanx.distributeETH();
      }

      await titanx
        .connect(goodUser)
        .transfer(owner.address, await titanx.balanceOf(goodUser.address));
      await titanx
        .connect(anotherUser)
        .transfer(
          otherAccount.address,
          await titanx.balanceOf(anotherUser.address)
        );
      await titanx
        .connect(secondlast)
        .transfer(owner.address, await titanx.balanceOf(secondlast.address));
      await titanx
        .connect(lastUser)
        .transfer(
          otherAccount.address,
          await titanx.balanceOf(lastUser.address)
        );

      await titanx.approve(
        helios.target,
        await titanx.balanceOf(owner.address)
      );

      await titanx
        .connect(otherAccount)
        .approve(helios.target, await titanx.balanceOf(owner.address));

      for (let index = 0; index < 4; index++) {
        const heliosMintTx = await helios.startMint(mintPower, mintDays, 0);
        await heliosMintTx.wait();

        const heliosMintOtherAccountTx = await helios
          .connect(otherAccount)
          .startMint(150, mintDays, 0);
        await heliosMintOtherAccountTx.wait();

        await ethers.provider.send("evm_increaseTime", [_250days]);
        await ethers.provider.send("evm_mine");

        await helios.claimMint(1 + index);
        await helios.connect(otherAccount).claimMint(1 + index);
      }
      const heliosStakeTx = await helios.startStake(
        await helios.balanceOf(owner.address),
        100,
        0
      );
      await heliosStakeTx.wait();

      const heliosStakeOtherAccountTx = await helios
        .connect(otherAccount)
        .startStake(await helios.balanceOf(otherAccount.address), 100, 0);
      await heliosStakeOtherAccountTx.wait();

      await ethers.provider.send("evm_increaseTime", [_100days]);
      await ethers.provider.send("evm_mine");

      await helios.endStake(1);
      await helios.triggerPayouts();

      await titanx.transfer(
        BuyAndBurn.target,
        await titanx.balanceOf(owner.address)
      );

      await BuyAndBurn.createInitialLiquidity();

      await BuyAndBurn.setCapPerSwap(ethers.parseEther("250000000"));

      console.log(
        "BuyAndBurn TitanX Balance Before BuyAndBurn Call :",
        ethers.formatEther(await BuyAndBurn.getTitanXBalance())
      );
      console.log(
        "BuyAndBurn Helios Balance Before BuyAndBurn Call : ",
        ethers.formatEther(await BuyAndBurn.getHlxBalance())
      );

      await BuyAndBurn.connect(goodUser).buynBurn();

      console.log(
        "BuyAndBurn TitanX Balance After BuyAndBurn Call :",
        ethers.formatEther(await BuyAndBurn.getTitanXBalance())
      );
      console.log(
        "BuyAndBurn Helios Balance After BuyAndBurn Call : ",
        ethers.formatEther(await BuyAndBurn.getHlxBalance())
      );
    });

    it("Should handle Helios BuyandBurn Collection of Fees", async function () {
      const {
        titanx,
        owner,
        helios,
        otherAccount,
        BuyAndBurn,
        goodUser,
        anotherUser,
        secondlast,
        lastUser,
        swapRouter,
      } = await loadFixture(deployContractFixture);

      let _250days = 250 * 24 * 60 * 60;
      let _100days = 100 * 24 * 60 * 60;

      let mintPower = 100;
      let mintDays = 250;

      const users = [
        owner,
        otherAccount,
        goodUser,
        anotherUser,
        secondlast,
        lastUser,
      ];

      for (let index = 0; index < 8; index++) {
        for (const user of users) {
          const mintTx = await titanx
            .connect(user)
            .startMint(mintPower, mintDays, {
              value: ethers.parseEther("1"),
            });
          await mintTx.wait();

          const mintTx2 = await titanx
            .connect(user)
            .startMint(mintPower, mintDays, {
              value: ethers.parseEther("1"),
            });
          await mintTx2.wait();
        }

        await ethers.provider.send("evm_increaseTime", [_250days]);
        await ethers.provider.send("evm_mine");

        for (const user of users) {
          await titanx.connect(user).claimMint(1 + index * 2);
          await titanx.connect(user).claimMint(2 + index * 2);
        }
        await titanx.distributeETH();
      }

      await titanx
        .connect(goodUser)
        .transfer(owner.address, await titanx.balanceOf(goodUser.address));
      await titanx
        .connect(anotherUser)
        .transfer(
          otherAccount.address,
          await titanx.balanceOf(anotherUser.address)
        );
      await titanx
        .connect(secondlast)
        .transfer(owner.address, await titanx.balanceOf(secondlast.address));
      await titanx
        .connect(lastUser)
        .transfer(
          otherAccount.address,
          await titanx.balanceOf(lastUser.address)
        );

      await titanx.approve(
        helios.target,
        await titanx.balanceOf(owner.address)
      );

      await titanx
        .connect(otherAccount)
        .approve(helios.target, await titanx.balanceOf(owner.address));

      for (let index = 0; index < 4; index++) {
        const heliosMintTx = await helios.startMint(mintPower, mintDays, 0);
        await heliosMintTx.wait();

        const heliosMintOtherAccountTx = await helios
          .connect(otherAccount)
          .startMint(150, mintDays, 0);
        await heliosMintOtherAccountTx.wait();

        await ethers.provider.send("evm_increaseTime", [_250days]);
        await ethers.provider.send("evm_mine");

        await helios.claimMint(1 + index);
        await helios.connect(otherAccount).claimMint(1 + index);
      }
      const heliosStakeTx = await helios.startStake(
        await helios.balanceOf(owner.address),
        100,
        0
      );
      await heliosStakeTx.wait();

      const heliosStakeOtherAccountTx = await helios
        .connect(otherAccount)
        .startStake(await helios.balanceOf(otherAccount.address), 100, 0);
      await heliosStakeOtherAccountTx.wait();

      await ethers.provider.send("evm_increaseTime", [_100days]);
      await ethers.provider.send("evm_mine");

      await helios.endStake(1);
      await helios.triggerPayouts();

      await titanx.transfer(
        BuyAndBurn.target,
        await titanx.balanceOf(owner.address)
      );

      await BuyAndBurn.createInitialLiquidity();
      await BuyAndBurn.setCapPerSwap(ethers.parseEther("250000000"));

      await BuyAndBurn.connect(goodUser).buynBurn();

      console.log("Helios Balance", await helios.balanceOf(owner.address));

      await helios.approve(
        swapRouter.target,
        await helios.balanceOf(owner.address)
      );

      const timestamp = await getCurrentBlockTimestamp();

      console.log("Current TimeStamp: ", timestamp + 600);

      const swapTx = await swapRouter.exactInputSingle({
        tokenIn: helios.target,
        tokenOut: titanx.target,
        fee: 10000,
        recipient: owner.address,
        deadline: timestamp + 600,
        amountIn: ethers.parseEther("1400"),
        amountOutMinimum: 1,
        sqrtPriceLimitX96: 0,
      });

      console.log(
        "BuyAndBurn TitanX Balance Before CollectFees :",
        ethers.formatEther(await BuyAndBurn.getTitanXBalance())
      );
      console.log(
        "BuyAndBurn Helios Balance before CollectFees : ",
        ethers.formatEther(await BuyAndBurn.getHlxBalance())
      );

      await BuyAndBurn.collectFees();

      console.log(
        "BuyAndBurn TitanX Fees Collected After CollectFees :",
        ethers.formatEther(await BuyAndBurn.getTitanXFeesBuyAndBurnFunds())
      );
      console.log(
        "BuyAndBurn Helios Fees Collected After CollectFees : ",
        ethers.formatEther(await BuyAndBurn.getHlxFeesBuyAndBurnFunds())
      );
    });

    it("Should handle Helios BuyandBurn Collection of Fees", async function () {
      const {
        titanx,
        owner,
        helios,
        otherAccount,
        BuyAndBurn,
        goodUser,
        anotherUser,
        secondlast,
        lastUser,
        Treasury,
      } = await loadFixture(deployContractFixture);

      let _250days = 250 * 24 * 60 * 60;
      let _100days = 100 * 24 * 60 * 60;

      let mintPower = 100;
      let mintDays = 250;

      const users = [
        owner,
        otherAccount,
        goodUser,
        anotherUser,
        secondlast,
        lastUser,
      ];

      for (let index = 0; index < 8; index++) {
        for (const user of users) {
          const mintTx = await titanx
            .connect(user)
            .startMint(mintPower, mintDays, {
              value: ethers.parseEther("1"),
            });
          await mintTx.wait();

          const mintTx2 = await titanx
            .connect(user)
            .startMint(mintPower, mintDays, {
              value: ethers.parseEther("1"),
            });
          await mintTx2.wait();
        }

        await ethers.provider.send("evm_increaseTime", [_250days]);
        await ethers.provider.send("evm_mine");

        for (const user of users) {
          await titanx.connect(user).claimMint(1 + index * 2);
          await titanx.connect(user).claimMint(2 + index * 2);
        }
        await titanx.distributeETH();
      }

      await titanx
        .connect(goodUser)
        .transfer(owner.address, await titanx.balanceOf(goodUser.address));
      await titanx
        .connect(anotherUser)
        .transfer(
          otherAccount.address,
          await titanx.balanceOf(anotherUser.address)
        );
      await titanx
        .connect(secondlast)
        .transfer(owner.address, await titanx.balanceOf(secondlast.address));
      await titanx
        .connect(lastUser)
        .transfer(
          otherAccount.address,
          await titanx.balanceOf(lastUser.address)
        );

      await titanx.approve(
        helios.target,
        await titanx.balanceOf(owner.address)
      );

      await titanx
        .connect(otherAccount)
        .approve(helios.target, await titanx.balanceOf(owner.address));

      for (let index = 0; index < 4; index++) {
        const heliosMintTx = await helios.startMint(mintPower, mintDays, 0);
        await heliosMintTx.wait();

        const heliosMintOtherAccountTx = await helios
          .connect(otherAccount)
          .startMint(150, mintDays, 0);
        await heliosMintOtherAccountTx.wait();

        await ethers.provider.send("evm_increaseTime", [_250days]);
        await ethers.provider.send("evm_mine");

        await helios.claimMint(1 + index);
        await helios.connect(otherAccount).claimMint(1 + index);
      }
      const heliosStakeTx = await helios.startStake(
        await helios.balanceOf(owner.address),
        100,
        0
      );
      await heliosStakeTx.wait();

      const heliosStakeOtherAccountTx = await helios
        .connect(otherAccount)
        .startStake(await helios.balanceOf(otherAccount.address), 100, 0);
      await heliosStakeOtherAccountTx.wait();

      await ethers.provider.send("evm_increaseTime", [_100days]);
      await ethers.provider.send("evm_mine");

      await helios.endStake(1);
      await helios.triggerPayouts();

      await titanx.transfer(
        BuyAndBurn.target,
        await titanx.balanceOf(owner.address)
      );

      await BuyAndBurn.createInitialLiquidity();
      await BuyAndBurn.setCapPerSwap(ethers.parseEther("250000000"));

      await otherAccount.sendTransaction({
        to: BuyAndBurn.target,
        value: ethers.parseEther("10"),
      });

      console.log(
        "BuyAndBurn TitanX Balance Before Double Swap :",
        ethers.formatEther(await BuyAndBurn.getTitanXBalance())
      );

      console.log(
        "BuyAndBurn TitanX Balance Before Double Swap :",
        ethers.formatEther(await BuyAndBurn.getWethBalance())
      );

      console.log(
        "BuyAndBurn TitanX Swapped Before Double Swap :",
        ethers.formatEther(await BuyAndBurn.getTitanXTreasuryBuyAndBurn())
      );
      console.log(
        "BuyAndBurn WETH Swaped Before Double Swap : ",
        ethers.formatEther(await BuyAndBurn.getETHTreasuryBuyAndBurn())
      );

      await BuyAndBurn.connect(goodUser).buynBurn();

      console.log(
        "BuyAndBurn TitanX Swapped After Double Swap :",
        ethers.formatEther(await BuyAndBurn.getTitanXTreasuryBuyAndBurn())
      );
      console.log(
        "BuyAndBurn WETH Swaped After Double Swap : ",
        ethers.formatEther(await BuyAndBurn.getETHTreasuryBuyAndBurn())
      );
      console.log(
        "Treasury Contract Balance Of titanX",
        ethers.formatEther(await titanx.balanceOf(Treasury.target))
      );
    });
  });

  describe.only("Treasury", function () {
    it("Should handle Staking token in treasury", async function () {
      const {
        titanx,
        owner,
        helios,
        otherAccount,
        BuyAndBurn,
        goodUser,
        anotherUser,
        secondlast,
        lastUser,
        Treasury,
      } = await loadFixture(deployContractFixture);

      let _250days = 250 * 24 * 60 * 60;
      let _100days = 100 * 24 * 60 * 60;

      let mintPower = 100;
      let mintDays = 250;

      const users = [
        owner,
        otherAccount,
        goodUser,
        anotherUser,
        secondlast,
        lastUser,
      ];

      for (let index = 0; index < 8; index++) {
        for (const user of users) {
          const mintTx = await titanx
            .connect(user)
            .startMint(mintPower, mintDays, {
              value: ethers.parseEther("1"),
            });
          await mintTx.wait();

          const mintTx2 = await titanx
            .connect(user)
            .startMint(mintPower, mintDays, {
              value: ethers.parseEther("1"),
            });
          await mintTx2.wait();
        }

        await ethers.provider.send("evm_increaseTime", [_250days]);
        await ethers.provider.send("evm_mine");

        for (const user of users) {
          await titanx.connect(user).claimMint(1 + index * 2);
          await titanx.connect(user).claimMint(2 + index * 2);
        }
        await titanx.distributeETH();
      }

      await titanx
        .connect(goodUser)
        .transfer(owner.address, await titanx.balanceOf(goodUser.address));
      await titanx
        .connect(anotherUser)
        .transfer(
          otherAccount.address,
          await titanx.balanceOf(anotherUser.address)
        );
      await titanx
        .connect(secondlast)
        .transfer(owner.address, await titanx.balanceOf(secondlast.address));
      await titanx
        .connect(lastUser)
        .transfer(
          otherAccount.address,
          await titanx.balanceOf(lastUser.address)
        );

      await titanx.approve(
        helios.target,
        await titanx.balanceOf(owner.address)
      );

      await titanx
        .connect(otherAccount)
        .approve(helios.target, await titanx.balanceOf(owner.address));

      for (let index = 0; index < 4; index++) {
        const heliosMintTx = await helios.startMint(mintPower, mintDays, 0);
        await heliosMintTx.wait();

        const heliosMintOtherAccountTx = await helios
          .connect(otherAccount)
          .startMint(150, mintDays, 0);
        await heliosMintOtherAccountTx.wait();

        await ethers.provider.send("evm_increaseTime", [_250days]);
        await ethers.provider.send("evm_mine");

        await helios.claimMint(1 + index);
        await helios.connect(otherAccount).claimMint(1 + index);
      }
      const heliosStakeTx = await helios.startStake(
        await helios.balanceOf(owner.address),
        100,
        0
      );
      await heliosStakeTx.wait();

      const heliosStakeOtherAccountTx = await helios
        .connect(otherAccount)
        .startStake(await helios.balanceOf(otherAccount.address), 100, 0);
      await heliosStakeOtherAccountTx.wait();

      await ethers.provider.send("evm_increaseTime", [_100days]);
      await ethers.provider.send("evm_mine");

      await helios.endStake(1);
      await helios.triggerPayouts();

      await titanx.transfer(
        BuyAndBurn.target,
        await titanx.balanceOf(owner.address)
      );

      await BuyAndBurn.createInitialLiquidity();
      await BuyAndBurn.setCapPerSwap(ethers.parseEther("250000000"));

      console.log(
        "Owner Address TitanX Balance Before :",
        ethers.formatEther(await titanx.balanceOf(owner.address))
      );

      // await titanx.transfer(
      //   Treasury.target,
      //   await titanx.balanceOf(owner.address)
      // );

      console.log(
        "Treasury TitanX Balance Before Stake :",
        ethers.formatEther(await Treasury.getTitanBalance())
      );

      // console.log(
      //   "Owner Address TitanX Balance After :",
      //   ethers.formatEther(await titanx.balanceOf(owner.address))
      // );

      await Treasury.stakeTITANX();

      console.log(
        "Treasury TitanX Balance After Stake :",
        ethers.formatEther(await Treasury.getTitanBalance())
      );
    });
    it("Should handle Claiming token Rewards in treasury treasury", async function () {
      const {
        titanx,
        owner,
        helios,
        otherAccount,
        BuyAndBurn,
        goodUser,
        anotherUser,
        secondlast,
        lastUser,
        Treasury,
      } = await loadFixture(deployContractFixture);

      let _1days = 1 * 24 * 60 * 60;
      let _7days = 7 * 24 * 60 * 60;
      let _250days = 250 * 24 * 60 * 60;
      let _100days = 100 * 24 * 60 * 60;
      let _3238days = 3238 * 24 * 60 * 60;

      let mintPower = 100;
      let mintDays = 250;

      const users = [
        owner,
        otherAccount,
        goodUser,
        anotherUser,
        secondlast,
        lastUser,
      ];

      for (let index = 0; index < 8; index++) {
        for (const user of users) {
          const mintTx = await titanx
            .connect(user)
            .startMint(mintPower, mintDays, {
              value: ethers.parseEther("1"),
            });
          await mintTx.wait();

          const mintTx2 = await titanx
            .connect(user)
            .startMint(mintPower, mintDays, {
              value: ethers.parseEther("1"),
            });
          await mintTx2.wait();
        }

        await ethers.provider.send("evm_increaseTime", [_250days]);
        await ethers.provider.send("evm_mine");

        for (const user of users) {
          await titanx.connect(user).claimMint(1 + index * 2);
          await titanx.connect(user).claimMint(2 + index * 2);
        }
        await titanx.distributeETH();
      }

      await titanx
        .connect(goodUser)
        .transfer(owner.address, await titanx.balanceOf(goodUser.address));
      await titanx
        .connect(anotherUser)
        .transfer(
          otherAccount.address,
          await titanx.balanceOf(anotherUser.address)
        );
      await titanx
        .connect(secondlast)
        .transfer(owner.address, await titanx.balanceOf(secondlast.address));
      await titanx
        .connect(lastUser)
        .transfer(
          otherAccount.address,
          await titanx.balanceOf(lastUser.address)
        );

      await titanx.approve(
        helios.target,
        await titanx.balanceOf(owner.address)
      );

      await titanx
        .connect(otherAccount)
        .approve(helios.target, await titanx.balanceOf(owner.address));

      for (let index = 0; index < 4; index++) {
        const heliosMintTx = await helios.startMint(mintPower, mintDays, 0);
        await heliosMintTx.wait();

        const heliosMintOtherAccountTx = await helios
          .connect(otherAccount)
          .startMint(150, mintDays, 0);
        await heliosMintOtherAccountTx.wait();

        await ethers.provider.send("evm_increaseTime", [_250days]);
        await ethers.provider.send("evm_mine");

        await helios.claimMint(1 + index);
        await helios.connect(otherAccount).claimMint(1 + index);
      }
      const heliosStakeTx = await helios.startStake(
        await helios.balanceOf(owner.address),
        100,
        0
      );
      await heliosStakeTx.wait();

      const heliosStakeOtherAccountTx = await helios
        .connect(otherAccount)
        .startStake(await helios.balanceOf(otherAccount.address), 100, 0);
      await heliosStakeOtherAccountTx.wait();

      await ethers.provider.send("evm_increaseTime", [_100days]);
      await ethers.provider.send("evm_mine");

      await helios.endStake(1);
      await helios.triggerPayouts();

      await titanx.transfer(
        BuyAndBurn.target,
        await titanx.balanceOf(owner.address)
      );

      await BuyAndBurn.createInitialLiquidity();
      await BuyAndBurn.setCapPerSwap(ethers.parseEther("250000000"));

      console.log(
        "Owner Address TitanX Balance Before :",
        ethers.formatEther(await titanx.balanceOf(owner.address))
      );

      console.log(
        "Treasury TitanX Balance Before Stake :",
        ethers.formatEther(await Treasury.getTitanBalance())
      );

      await Treasury.stakeTITANX();

      await ethers.provider.send("evm_increaseTime", [_7days]);
      await ethers.provider.send("evm_mine");

      await titanx.transfer(
        Treasury.target,
        await titanx.balanceOf(owner.address)
      );

      await Treasury.stakeTITANX();

      await titanx.triggerPayouts();

      await ethers.provider.send("evm_increaseTime", [_250days]);
      await ethers.provider.send("evm_mine");

      await titanx.triggerPayouts();

      await ethers.provider.send("evm_increaseTime", [_3238days]);
      await ethers.provider.send("evm_mine");

      await titanx.triggerPayouts();

      console.log(
        "Available Eth Payouts",
        ethers.formatEther(
          await titanx.getUserETHClaimableTotal(Treasury.target)
        )
      );

      await Treasury.claimReward();

      console.log(
        "Treasury TitanX Balance After Stake :",
        ethers.formatEther(await Treasury.getTitanBalance())
      );

      console.log(
        " TitanX Burned After ClaimReward :",
        ethers.formatEther(await Treasury.getTotalTitanXBurned())
      );
    });

    it("Should check Titanx burning for other treasury contracts ", async function () {
      const {
        titanx,
        owner,
        helios,
        otherAccount,
        BuyAndBurn,
        goodUser,
        anotherUser,
        secondlast,
        lastUser,
        Treasury,
      } = await loadFixture(deployContractFixture);

      let _1days = 1 * 24 * 60 * 60;
      let _7days = 7 * 24 * 60 * 60;
      let _250days = 250 * 24 * 60 * 60;
      let _100days = 100 * 24 * 60 * 60;
      let _3238days = 3238 * 24 * 60 * 60;

      let mintPower = 100;
      let mintDays = 250;

      const users = [
        owner,
        otherAccount,
        goodUser,
        anotherUser,
        secondlast,
        lastUser,
      ];

      for (let index = 0; index < 8; index++) {
        for (const user of users) {
          const mintTx = await titanx
            .connect(user)
            .startMint(mintPower, mintDays, {
              value: ethers.parseEther("1"),
            });
          await mintTx.wait();

          const mintTx2 = await titanx
            .connect(user)
            .startMint(mintPower, mintDays, {
              value: ethers.parseEther("1"),
            });
          await mintTx2.wait();
        }

        await ethers.provider.send("evm_increaseTime", [_250days]);
        await ethers.provider.send("evm_mine");

        for (const user of users) {
          await titanx.connect(user).claimMint(1 + index * 2);
          await titanx.connect(user).claimMint(2 + index * 2);
        }
        await titanx.distributeETH();
      }

      await titanx
        .connect(goodUser)
        .transfer(owner.address, await titanx.balanceOf(goodUser.address));
      await titanx
        .connect(anotherUser)
        .transfer(
          otherAccount.address,
          await titanx.balanceOf(anotherUser.address)
        );
      await titanx
        .connect(secondlast)
        .transfer(owner.address, await titanx.balanceOf(secondlast.address));
      await titanx
        .connect(lastUser)
        .transfer(
          otherAccount.address,
          await titanx.balanceOf(lastUser.address)
        );

      await titanx.approve(
        helios.target,
        await titanx.balanceOf(owner.address)
      );

      await titanx
        .connect(otherAccount)
        .approve(helios.target, await titanx.balanceOf(owner.address));

      for (let index = 0; index < 4; index++) {
        const heliosMintTx = await helios.startMint(mintPower, mintDays, 0);
        await heliosMintTx.wait();

        const heliosMintOtherAccountTx = await helios
          .connect(otherAccount)
          .startMint(150, mintDays, 0);
        await heliosMintOtherAccountTx.wait();

        await ethers.provider.send("evm_increaseTime", [_250days]);
        await ethers.provider.send("evm_mine");

        await helios.claimMint(1 + index);
        await helios.connect(otherAccount).claimMint(1 + index);
      }
      const heliosStakeTx = await helios.startStake(
        await helios.balanceOf(owner.address),
        100,
        0
      );
      await heliosStakeTx.wait();

      const heliosStakeOtherAccountTx = await helios
        .connect(otherAccount)
        .startStake(await helios.balanceOf(otherAccount.address), 100, 0);
      await heliosStakeOtherAccountTx.wait();

      await ethers.provider.send("evm_increaseTime", [_100days]);
      await ethers.provider.send("evm_mine");

      await helios.endStake(1);
      await helios.triggerPayouts();

      console.log(
        "TitanX Balance:",
        ethers.formatEther(await BuyAndBurn.getTitanXBalance())
      );

      console.log(
        "Owner Balance: ",
        ethers.formatEther(await titanx.balanceOf(owner.address))
      );

      await titanx.transfer(
        BuyAndBurn.target,
        await titanx.balanceOf(owner.address)
      );

      await BuyAndBurn.createInitialLiquidity();
      await BuyAndBurn.setCapPerSwap(ethers.parseEther("250000000"));

      console.log(
        "Owner Address TitanX Balance Before :",
        ethers.formatEther(await titanx.balanceOf(owner.address))
      );

      console.log(
        "Treasury TitanX Balance Before Stake :",
        ethers.formatEther(await Treasury.getTitanBalance())
      );

      await Treasury.stakeTITANX();

      await ethers.provider.send("evm_increaseTime", [_7days]);
      await ethers.provider.send("evm_mine");

      await titanx.transfer(
        Treasury.target,
        await titanx.balanceOf(owner.address)
      );

      await Treasury.stakeTITANX();

      await titanx.triggerPayouts();

      await ethers.provider.send("evm_increaseTime", [_250days]);
      await ethers.provider.send("evm_mine");

      await titanx.triggerPayouts();

      await ethers.provider.send("evm_increaseTime", [_3238days]);
      await ethers.provider.send("evm_mine");

      await titanx.triggerPayouts();

      console.log(
        "Available Eth Payouts",
        ethers.formatEther(
          await titanx.getUserETHClaimableTotal(Treasury.target)
        )
      );
      console.log(
        "Treasury TitanX Balance Before Claim Reward :",
        ethers.formatEther(await Treasury.getTitanBalance())
      );

      await Treasury.claimReward();

      console.log(
        "Treasury TitanX Balance After ClaimReward :",
        ethers.formatEther(await Treasury.getTitanBalance())
      );

      console.log(
        " TitanX Burned After ClaimReward :",
        ethers.formatEther(await Treasury.getTotalTitanXBurned())
      );

      await Treasury.burnTitanX({ value: ethers.parseEther("1") });

      console.log(
        " TitanX Burned After Burn Tokens :",
        ethers.formatEther(await Treasury.getTotalTitanXBurned())
      );
    });

    it.only("Should end stake in treasury contracts ", async function () {
      const {
        titanx,
        owner,
        helios,
        otherAccount,
        BuyAndBurn,
        goodUser,
        anotherUser,
        secondlast,
        lastUser,
        Treasury,
      } = await loadFixture(deployContractFixture);

      let _1days = 1 * 24 * 60 * 60;
      let _7days = 7 * 24 * 60 * 60;
      let _250days = 250 * 24 * 60 * 60;
      let _100days = 100 * 24 * 60 * 60;
      let _3238days = 3238 * 24 * 60 * 60;

      let mintPower = 100;
      let mintDays = 250;

      const users = [
        owner,
        otherAccount,
        goodUser,
        anotherUser,
        secondlast,
        lastUser,
      ];

      for (let index = 0; index < 8; index++) {
        for (const user of users) {
          const mintTx = await titanx
            .connect(user)
            .startMint(mintPower, mintDays, {
              value: ethers.parseEther("1"),
            });
          await mintTx.wait();

          const mintTx2 = await titanx
            .connect(user)
            .startMint(mintPower, mintDays, {
              value: ethers.parseEther("1"),
            });
          await mintTx2.wait();
        }

        await ethers.provider.send("evm_increaseTime", [_250days]);
        await ethers.provider.send("evm_mine");

        for (const user of users) {
          await titanx.connect(user).claimMint(1 + index * 2);
          await titanx.connect(user).claimMint(2 + index * 2);
        }
        await titanx.distributeETH();
      }

      await titanx
        .connect(goodUser)
        .transfer(owner.address, await titanx.balanceOf(goodUser.address));
      await titanx
        .connect(anotherUser)
        .transfer(
          otherAccount.address,
          await titanx.balanceOf(anotherUser.address)
        );
      await titanx
        .connect(secondlast)
        .transfer(owner.address, await titanx.balanceOf(secondlast.address));
      await titanx
        .connect(lastUser)
        .transfer(
          otherAccount.address,
          await titanx.balanceOf(lastUser.address)
        );

      await titanx.approve(
        helios.target,
        await titanx.balanceOf(owner.address)
      );

      await titanx
        .connect(otherAccount)
        .approve(helios.target, await titanx.balanceOf(owner.address));

      for (let index = 0; index < 4; index++) {
        const heliosMintTx = await helios.startMint(mintPower, mintDays, 0);
        await heliosMintTx.wait();

        const heliosMintOtherAccountTx = await helios
          .connect(otherAccount)
          .startMint(150, mintDays, 0);
        await heliosMintOtherAccountTx.wait();

        await ethers.provider.send("evm_increaseTime", [_250days]);
        await ethers.provider.send("evm_mine");

        await helios.claimMint(1 + index);
        await helios.connect(otherAccount).claimMint(1 + index);
      }
      const heliosStakeTx = await helios.startStake(
        await helios.balanceOf(owner.address),
        100,
        0
      );
      await heliosStakeTx.wait();

      const heliosStakeOtherAccountTx = await helios
        .connect(otherAccount)
        .startStake(await helios.balanceOf(otherAccount.address), 100, 0);
      await heliosStakeOtherAccountTx.wait();

      await ethers.provider.send("evm_increaseTime", [_100days]);
      await ethers.provider.send("evm_mine");

      await helios.endStake(1);
      await helios.triggerPayouts();

      console.log(
        "TitanX Balance:",
        ethers.formatEther(await BuyAndBurn.getTitanXBalance())
      );

      console.log(
        "Owner Balance: ",
        ethers.formatEther(await titanx.balanceOf(owner.address))
      );

      await titanx.transfer(
        BuyAndBurn.target,
        await titanx.balanceOf(owner.address)
      );

      await BuyAndBurn.createInitialLiquidity();
      await BuyAndBurn.setCapPerSwap(ethers.parseEther("250000000"));

      console.log(
        "Owner Address TitanX Balance Before :",
        ethers.formatEther(await titanx.balanceOf(owner.address))
      );

      console.log(
        "Treasury TitanX Balance Before Stake :",
        ethers.formatEther(await Treasury.getTitanBalance())
      );

      await titanx
        .connect(otherAccount)
        .transfer(
          Treasury.target,
          await titanx.balanceOf(otherAccount.address)
        );

      await Treasury.stakeTITANX();

      await ethers.provider.send("evm_increaseTime", [_7days]);
      await ethers.provider.send("evm_mine");

      await titanx.transfer(
        Treasury.target,
        await titanx.balanceOf(owner.address)
      );

      await Treasury.stakeTITANX();

      await titanx.triggerPayouts();

      await ethers.provider.send("evm_increaseTime", [_250days]);
      await ethers.provider.send("evm_mine");

      await titanx.triggerPayouts();

      await ethers.provider.send("evm_increaseTime", [_3238days]);
      await ethers.provider.send("evm_mine");

      console.log(
        "Total TitanX Staked: ",
        ethers.formatEther(await Treasury.getTotalTitanStaked())
      );

      console.log(
        "Treasury TitanX Balance Before Claim Reward :",
        ethers.formatEther(await Treasury.getTitanBalance())
      );

      await Treasury.claimReward();

      console.log(
        "Treasury TitanX Balance After ClaimReward :",
        ethers.formatEther(await Treasury.getTitanBalance())
      );

      console.log(
        "Treasury ETH Recieved In Rewards: ",
        ethers.formatEther(await Treasury.getTotalEthClaimed())
      );

      await ethers.provider.send("evm_increaseTime", [_100days]);
      await ethers.provider.send("evm_mine");

      console.log("Last Staked Id: ", await Treasury.getLastStakeId());

      let activeStakeContract = await Treasury.activeHlxStakeContract();

      const stakeContract = await ethers.getContractAt(
        "HlxStake",
        activeStakeContract,
        owner
      );

      await stakeContract.endStakeAfterMaturity(1);

      console.log(
        "Treasury TitanX Balance After EndStake :",
        ethers.formatEther(await Treasury.getTitanBalance())
      );

      console.log(
        "TitanX Unstaked Amount: ",
        ethers.formatEther(await Treasury.getTotalTitanUnstaked())
      );
    });
  });
});
