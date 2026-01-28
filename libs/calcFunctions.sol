// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.10;

import "./constant.sol";
import "./enum.sol";

/** @notice get mint cost
 * @param mintPower mint power (1 - 100)
 * @param mintCost cost of mint
 * @return mintCost total mint cost
 */
function getMintCost(
    uint256 mintPower,
    uint256 mintCost
) pure returns (uint256) {
    return (mintCost * mintPower) / MAX_MINT_POWER_CAP;
}

//MintInfo

/** @notice the formula to calculate mint reward at create new mint
 * @param mintPower mint power 1 - 100,000
 * @param numOfDays mint length 1 - 250
 * @param mintableHlx current contract day mintable helios
 * @param EAABonus current contract day EAA Bonus
 * @param burnAmpBonus user burn amplifier bonus from getUserBurnAmplifierBonus(user)
 * @return reward base helios amount
 */
function calculateMintReward(
    uint256 mintPower,
    uint256 numOfDays,
    uint256 mintableHlx,
    uint256 EAABonus,
    uint256 burnAmpBonus,
    uint256 percentageBonus
) pure returns (uint256 reward) {
    uint256 baseReward = (mintableHlx * mintPower * numOfDays);
    if (numOfDays != 1)
        baseReward -= (baseReward * MINT_DAILY_REDUCTION * (numOfDays - 1)) / PERCENT_BPS;

    reward = baseReward;
    if (EAABonus != 0) {
        //EAA Bonus has 1e6 scaling, so here divide by 1e6
        reward += ((baseReward * EAABonus) / 100 / SCALING_FACTOR_1e6);
    }

    if (burnAmpBonus != 0) {
        //burnAmpBonus has 1e18 scaling
        reward += (baseReward * burnAmpBonus) / 100 / SCALING_FACTOR_1e18;
    }

    // Apply the percentage bonus
    if (percentageBonus != 0) {
        
        percentageBonus = percentageBonus > BURN_MINT_AMP ? BURN_MINT_AMP : percentageBonus;
        // Convert the bonus to a percentage (1000 represents 10%, so divide by 10000)
        uint256 additionalReward = (reward * percentageBonus) / 10000;
        reward += additionalReward;
    }

    reward /= MAX_MINT_POWER_CAP;
}

/** @notice the formula to calculate bonus reward
 * heavily influenced by the difference between current global mint power and user mint's global mint power
 * @param mintPowerBonus mint power bonus from mintinfo
 * @param mintPower mint power 1 - 100,000 from mintinfo
 * @param gMintPower global mint power from mintinfo
 * @param globalMintPower current global mint power
 * @return bonus bonus amount in helios
 */
function calculateMintPowerBonus(
    uint256 mintPowerBonus,
    uint256 mintPower,
    uint256 gMintPower,
    uint256 globalMintPower
) pure returns (uint256 bonus) {
    if (globalMintPower <= gMintPower) return 0;
    bonus = (((mintPowerBonus * mintPower * (globalMintPower - gMintPower)) * SCALING_FACTOR_1e18) /
        MAX_MINT_POWER_CAP);
}

/** @notice Return max mint length
 * @return maxMintLength max mint length
 */
function getMaxMintDays() pure returns (uint256) {
    return MAX_MINT_LENGTH;
}

/** @notice Return max mints per wallet
 * @return maxMintPerWallet max mints per wallet
 */
function getMaxMintsPerWallet() pure returns (uint256) {
    return MAX_MINT_PER_WALLET;
}

/**
 * @dev Return penalty percentage based on number of days late after the grace period of 7 days
 * @param secsLate seconds late (block timestamp - maturity timestamp)
 * @return penalty penalty in percentage
 */
function calculateClaimMintPenalty(uint256 secsLate) pure returns (uint256 penalty) {
    if (secsLate <= CLAIM_MINT_GRACE_PERIOD * SECONDS_IN_DAY) return 0;
    if (secsLate <= (CLAIM_MINT_GRACE_PERIOD + 1) * SECONDS_IN_DAY) return 1;
    if (secsLate <= (CLAIM_MINT_GRACE_PERIOD + 2) * SECONDS_IN_DAY) return 3;
    if (secsLate <= (CLAIM_MINT_GRACE_PERIOD + 3) * SECONDS_IN_DAY) return 8;
    if (secsLate <= (CLAIM_MINT_GRACE_PERIOD + 4) * SECONDS_IN_DAY) return 17;
    if (secsLate <= (CLAIM_MINT_GRACE_PERIOD + 5) * SECONDS_IN_DAY) return 35;
    if (secsLate <= (CLAIM_MINT_GRACE_PERIOD + 6) * SECONDS_IN_DAY) return 72;
    return 99;
}

//StakeInfo

error Helios_AtLeastHalfMaturity();

/** @notice get max stake length
 * @return maxStakeLength max stake length
 */
function getMaxStakeLength() pure returns (uint256) {
    return MAX_STAKE_LENGTH;
}

/** @notice calculate shares and shares bonus
 * @param amount helios amount
 * @param noOfDays stake length
 * @param shareRate current contract share rate
 * @return shares calculated shares in 18 decimals
 */
function calculateShares(
    uint256 amount,
    uint256 noOfDays,
    uint256 shareRate
) pure returns (uint256) {
    uint256 shares = amount;
    shares += (shares * calculateShareBonus(noOfDays)) / SCALING_FACTOR_1e11;
    shares /= (shareRate / SCALING_FACTOR_1e18);
    return shares;
}

/** @notice calculate share bonus
 * @param noOfDays stake length
 * @return shareBonus calculated shares bonus in 11 decimals
 */
function calculateShareBonus(uint256 noOfDays) pure returns (uint256 shareBonus) {
    if (noOfDays <= MIN_STAKE_LENGTH) {
        
        return SCALING_FACTOR_1e6; // no bonus
    }

    uint256 effectiveDays = noOfDays - MIN_STAKE_LENGTH;
    uint256 cappedEffectiveDays = effectiveDays <= (LPB_MAX_DAYS - MIN_STAKE_LENGTH) ? effectiveDays : (LPB_MAX_DAYS - MIN_STAKE_LENGTH);
    shareBonus = ((cappedEffectiveDays * SCALING_FACTOR_1e11) / LPB_PER_PERCENT);
    return shareBonus;
}


/** @notice calculate end stake penalty
 * @param stakeStartTs start stake timestamp
 * @param maturityTs  maturity timestamp
 * @param currentBlockTs current block timestamp
 * @param action end stake or burn stake
 * @return penalty penalty in percentage
 */
function calculateEndStakePenalty(
    uint256 stakeStartTs,
    uint256 maturityTs,
    uint256 currentBlockTs,
    StakeAction action
) view returns (uint256) {
    //Matured, then calculate and return penalty
    if (currentBlockTs >= maturityTs) {
        uint256 lateSec = currentBlockTs - maturityTs;
        uint256 gracePeriodSec = END_STAKE_GRACE_PERIOD * SECONDS_IN_DAY;
        if (lateSec <= gracePeriodSec) return 0;
        return max((min((lateSec - gracePeriodSec), 1) / SECONDS_IN_DAY) + 1, 99);
    }

    //burn stake is excluded from penalty
    //if not matured and action is burn stake then return 0
    if (action == StakeAction.BURN) return 0;

    //Emergency End Stake
    //Not allow to EES below 50% maturity
    if (block.timestamp < stakeStartTs + (maturityTs - stakeStartTs) / 2)
        revert Helios_AtLeastHalfMaturity();

    //50% penalty for EES before maturity timestamp
    return 50;
}

//a - input to check against b
//b - minimum number
function min(uint256 a, uint256 b) pure returns (uint256) {
    if (a > b) return a;
    return b;
}

//a - input to check against b
//b - maximum number
function max(uint256 a, uint256 b) pure returns (uint256) {
    if (a > b) return b;
    return a;
}