// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.10;

import "../interfaces/ITitanOnBurn.sol";


// ===================== common ==========================================
uint256 constant SECONDS_IN_DAY = 86400;
uint256 constant SCALING_FACTOR_1e3 = 1e3;
uint256 constant SCALING_FACTOR_1e6 = 1e6;
uint256 constant SCALING_FACTOR_1e7 = 1e7;
uint256 constant SCALING_FACTOR_1e11 = 1e11;
uint256 constant SCALING_FACTOR_1e18 = 1e18;

// ===================== Helios ==========================================
uint256 constant PERCENT_TO_BUY_AND_BURN_FINAL = 0;
uint256 constant PERCENT_TO_CYCLE_PAYOUTS = 28_00;
uint256 constant PERCENT_TO_TREASURY_FINAL = 70_00;
uint256 constant PERCENT_CHANGE = 50;
uint256 constant PERCENT_TO_GENESIS = 2_00;

uint256 constant INCENTIVE_FEE_PERCENT = 3_000; //0.3%  
uint256 constant INCENTIVE_FEE_PERCENT_BASE = 1_000_000;

uint256 constant INITAL_LP_TOKENS = 1_600_000_000 ether; 

// ===================== globalInfo ==========================================
//Helios Supply Variables
uint256 constant START_MAX_MINTABLE_PER_DAY = 4_200_000_000 ether;
uint256 constant CAPPED_MIN_DAILY_HLX_MINTABLE = 420_000 ether;
uint256 constant DAILY_SUPPLY_MINTABLE_REDUCTION = 99_65;


//10% - 0% linear for 69 days
//EAA Variables
uint256 constant EAA_START = 10 * SCALING_FACTOR_1e6;
uint256 constant EAA_BONUSE_FIXED_REDUCTION_PER_DAY = 144_927;
uint256 constant EAA_END = 0;
uint256 constant MAX_BONUS_DAY = 69;

//Mint Cost Variables
uint256 constant START_MAX_MINT_COST = 420_000_000_000 ether;
uint256 constant CAPPED_MAX_MINT_COST = 2_000_000_000_000 ether;
uint256 constant DAILY_MINT_COST_INCREASE_STEP = 100_10;//0.1%

// 1000 to 0.1 HLX -0.35% Daily
//mintPower Bonus Variables
uint256 constant START_MINTPOWER_INCREASE_BONUS = 10_000 * SCALING_FACTOR_1e7; //starts at 10_000 with 1e7 scaling factor
uint256 constant CAPPED_MIN_MINTPOWER_BONUS = 10_000 * SCALING_FACTOR_1e3; //capped min of 0.1 * 1e7 = 10_000 * 1e3
uint256 constant DAILY_MINTPOWER_INCREASE_BONUS_REDUCTION = 99_65;

//Share Rate Variables
uint256 constant START_SHARE_RATE = 420 ether;

//Cycle Variables
uint256 constant DAY22 = 22;
uint256 constant DAY69 = 69;
uint256 constant DAY420 = 420;
uint256 constant CYCLE_22_PERCENT = 35_00;
uint256 constant CYCLE_69_PERCENT = 30_00;
uint256 constant CYCLE_420_PERCENT = 35_00;
uint256 constant PERCENT_BPS = 100_00;

// ===================== mintInfo ==========================================
uint256 constant MAX_MINT_POWER_CAP = 100_000;
uint256 constant MAX_MINT_LENGTH = 250;
uint256 constant CLAIM_MINT_GRACE_PERIOD = 7;
uint256 constant MAX_MINT_PER_WALLET = 1000;
uint256 constant MAX_BURN_AMP_BASE = 80 * 1e9 * 1 ether;
uint256 constant MAX_BURN_AMP_PERCENT = 8 ether;
uint256 constant MINT_DAILY_REDUCTION = 11; 

// ===================== stakeInfo ==========================================
uint256 constant MAX_STAKE_PER_WALLET = 1000;
uint256 constant MIN_STAKE_LENGTH = 30;
uint256 constant MAX_STAKE_LENGTH = 830;
uint256 constant END_STAKE_GRACE_PERIOD = 7;



// 0%-200% linear 1-830 days
/* Stake Longer Pays Better bonus */
uint256 constant LPB_MAX_DAYS = 830;
uint256 constant LPB_PER_PERCENT = 400;

//20%
/* Burn Stake Amplifier */
uint256 constant BURN_STAKE_AMP = 2000;

//10% 
/* Burn Mint Amplifier */
uint256 constant BURN_MINT_AMP = 1000;


// ===================== burnInfo ==========================================
uint256 constant MAX_BURN_REWARD_PERCENT = 8;

// ===================== Treasury ==========================================
uint256 constant PERCENT_TO_STAKERS = 10_00;
uint256 constant PERCENT_TO_BUYANDBURNHELIOS = 70_00;
uint16 constant STAKE_DURATION = 3500;

uint24 constant POOLFEE1PERCENT = 10000; //1% Fee
uint160 constant MIN_SQRT_RATIO = 4295128739;
uint160 constant MAX_SQRT_RATIO = 1461446703485210103287273052203988822378723970342;

address constant TITANX = 0xF19308F923582A6f7c465e5CE7a9Dc1BEC6665B1;
address constant UNISWAPV3FACTORY = 0x1F98431c8aD98523631AE4a59f267346ea31F984;
address constant WETH9 = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
address constant TITANX_WETH_POOL = 0xc45A81BC23A64eA556ab4CdF08A86B61cdcEEA8b;
address constant NONFUNGIBLEPOSITIONMANAGER = 0xC36442b4a4522E871399CD717aBDD847Ab11FE88;

uint8 constant BURN_REWARD_PERCENT_EACH = 4;

uint256 constant TREASURY_INCENTIVE_FEE_PERCENT = 1000;

uint256 constant INCENTIVE_FEE_CAP_ETH = 0.1 ether;

uint256 constant PERCENT_BASE = 10_000;

/*
    bytes4(keccak256('supportsInterface(bytes4)')) == 0x01ffc9a7
*/
bytes4 constant INTERFACE_ID_ERC165 = 0x01ffc9a7;

// ERC-165 Interface ID for ITitanOnBurn
bytes4 constant INTERFACE_ID_ITITANONBURN =
    type(ITitanOnBurn).interfaceId;
