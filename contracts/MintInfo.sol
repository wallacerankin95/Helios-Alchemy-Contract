// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.10;

import "../libs/calcFunctions.sol";

//custom errors
error Helios_InvalidMintLength();
error Helios_InvalidMintPower();
error Helios_NoMintExists();
error Helios_MintHasClaimed();
error Helios_MintNotMature();
error Helios_MintHasBurned();

abstract contract MintInfo {
    //variables
    /** @dev track global hRank */
    uint256 private s_globalHRank;
    /** @dev track total mint claimed */
    uint256 private s_globalMintClaim;
    /** @dev track total mint burned */
    uint256 private s_globalMintBurn;
    /** @dev track total helios minting */
    uint256 private s_globalHlxMinting;
    /** @dev track total helios penalty */
    uint256 private s_globalHlxMintPenalty;
    /** @dev track global mint power */
    uint256 private s_globalMintPower;

    //mappings
    /** @dev track address => mintId */
    mapping(address => uint256) private s_addressMId;
    /** @dev track address, mintId => hRank info (gHrank, gMintPower) */
    mapping(address => mapping(uint256 => HRankInfo))
        private s_addressMIdToHRankInfo;
    /** @dev track global hRank => mintInfo*/
    mapping(uint256 => UserMintInfo) private s_hRankToMintInfo;

    //structs
    struct UserMintInfo {
        uint256 mintPower;
        uint16 numOfDays;
        uint256 mintableHlx;
        uint48 mintStartTs;
        uint48 maturityTs;
        uint256 mintPowerBonus;
        uint256 EAABonus;
        uint256 mintedHlx;
        uint256 mintCost;
        uint256 penalty;
        uint256 titanBurned;
        MintStatus status;
    }

    struct HRankInfo {
        uint256 hRank;
        uint256 gMintPower;
    }

    struct UserMint {
        uint256 mId;
        uint256 hRank;
        uint256 gMintPower;
        UserMintInfo mintInfo;
    }

    //events
    event MintStarted(
        address indexed user,
        uint256 indexed hRank,
        uint256 indexed gMintpower,
        UserMintInfo userMintInfo
    );

    event MintClaimed(
        address indexed user,
        uint256 indexed hRank,
        uint256 rewardMinted,
        uint256 indexed penalty,
        uint256 mintPenalty
    );

    //functions
    /** @dev create a new mint
     * @param user user address
     * @param mintPower mint power
     * @param numOfDays mint lenght
     * @param mintableHlx mintable helios
     * @param mintPowerBonus mint power bonus
     * @param EAABonus EAA bonus
     * @param burnAmpBonus burn amplifier bonus
     * @param gMintPower global mint power
     * @param currentHRank current global hRank
     * @param mintCost actual mint cost paid for a mint
     * @param titanAmount titan Burned amount
     */
    function _startMint(
        address user,
        uint256 mintPower,
        uint256 numOfDays,
        uint256 mintableHlx,
        uint256 mintPowerBonus,
        uint256 EAABonus,
        uint256 burnAmpBonus,
        uint256 gMintPower,
        uint256 currentHRank,
        uint256 mintCost,
        uint256 titanAmount
    ) internal returns (uint256 mintable) {
        if (numOfDays == 0 || numOfDays > MAX_MINT_LENGTH)
            revert Helios_InvalidMintLength();
        if (mintPower == 0 || mintPower > MAX_MINT_POWER_CAP)
            revert Helios_InvalidMintPower();

        uint256 percentage = 0;

        if (titanAmount > 0) {
            percentage = _calculateBonusPercentage(titanAmount, mintCost);
        }

        //calculate mint reward up front with the provided params
        mintable = calculateMintReward(
            mintPower,
            numOfDays,
            mintableHlx,
            EAABonus,
            burnAmpBonus,
            percentage
        );

        _storeMintInfo(
            user,
            mintPower,
            numOfDays,
            mintable,
            mintPowerBonus,
            EAABonus,
            currentHRank,
            gMintPower,
            mintCost,
            titanAmount
        );
    }

    function _calculateBonusPercentage(
        uint256 titanAmount,
        uint256 mintCost
    ) internal pure returns (uint256) {
        uint256 percentage = (titanAmount * 10000) / mintCost;

        return percentage;
    }

    function _storeMintInfo(
        address user,
        uint256 mintPower,
        uint256 numOfDays,
        uint256 mintable,
        uint256 mintPowerBonus,
        uint256 EAABonus,
        uint256 currentHRank,
        uint256 gMintPower,
        uint256 mintCost,
        uint256 titanAmount
    ) private {
        //store variables into mint info
        UserMintInfo memory userMintInfo = UserMintInfo({
            mintPower: mintPower,
            numOfDays: uint16(numOfDays),
            mintableHlx: mintable,
            mintPowerBonus: mintPowerBonus,
            EAABonus: EAABonus,
            mintStartTs: uint48(block.timestamp),
            maturityTs: uint48(block.timestamp + (numOfDays * SECONDS_IN_DAY)),
            mintedHlx: 0,
            mintCost: mintCost,
            penalty: 0,
            titanBurned: titanAmount,
            status: MintStatus.ACTIVE
        });

        /** s_addressMId[user] tracks mintId for each addrress
         * s_addressMIdToHRankInfo[user][id] tracks current mint hRank and gPowerMint
         *  s_hRankToMintInfo[currentHRank] stores mint info
         */
        uint256 id = ++s_addressMId[user];
        s_addressMIdToHRankInfo[user][id].hRank = currentHRank;
        s_addressMIdToHRankInfo[user][id].gMintPower = gMintPower;
        s_hRankToMintInfo[currentHRank] = userMintInfo;

        emit MintStarted(user, currentHRank, gMintPower, userMintInfo);
    }

    /** @dev update variables
     * @param currentHRank current hRank
     * @param gMintPower current global mint power
     * @param gMinting current global minting
     */
    function _updateMintStats(
        uint256 currentHRank,
        uint256 gMintPower,
        uint256 gMinting
    ) internal {
        s_globalHRank = currentHRank;
        s_globalMintPower = gMintPower;
        s_globalHlxMinting = gMinting;
    }

    /** @dev calculate reward for claim mint or burn mint.
     * Claim mint has maturity check while burn mint would bypass maturity check.
     * @param user user address
     * @param id mint id
     * @param action claim mint or burn mint
     * @return reward calculated final reward after all bonuses and penalty (if any)
     */
    function _claimMint(
        address user,
        uint256 id,
        MintAction action
    ) internal returns (uint256 reward) {
        uint256 hRank = s_addressMIdToHRankInfo[user][id].hRank;
        uint256 gMintPower = s_addressMIdToHRankInfo[user][id].gMintPower;
        if (hRank == 0) revert Helios_NoMintExists();

        UserMintInfo memory mint = s_hRankToMintInfo[hRank];
        if (mint.status == MintStatus.CLAIMED) revert Helios_MintHasClaimed();
        if (mint.status == MintStatus.BURNED) revert Helios_MintHasBurned();

        //Only check maturity for claim mint action, burn mint bypass this check
        if (mint.maturityTs > block.timestamp && action == MintAction.CLAIM)
            revert Helios_MintNotMature();

        s_globalHlxMinting -= mint.mintableHlx;
        reward = _calculateClaimReward(user, hRank, gMintPower, mint, action);
    }

    /** @dev calculate final reward with bonuses and penalty (if any)
     * @param user user address
     * @param hRank mint's hRank
     * @param gMintPower mint's gMintPower
     * @param userMintInfo mint's info
     * @param action claim mint or burn mint
     * @return reward calculated final reward after all bonuses and penalty (if any)
     */
    function _calculateClaimReward(
        address user,
        uint256 hRank,
        uint256 gMintPower,
        UserMintInfo memory userMintInfo,
        MintAction action
    ) private returns (uint256 reward) {
        if (action == MintAction.CLAIM)
            s_hRankToMintInfo[hRank].status = MintStatus.CLAIMED;
        if (action == MintAction.BURN)
            s_hRankToMintInfo[hRank].status = MintStatus.BURNED;

        uint256 penaltyAmount;
        uint256 penalty;
        uint256 bonus;

        //only calculate penalty when current block timestamp > maturity timestamp
        if (block.timestamp > userMintInfo.maturityTs) {
            penalty = calculateClaimMintPenalty(
                block.timestamp - userMintInfo.maturityTs
            );
        }

        //Only Claim action has mintPower bonus
        if (action == MintAction.CLAIM) {
            bonus = calculateMintPowerBonus(
                userMintInfo.mintPowerBonus,
                userMintInfo.mintPower,
                gMintPower,
                s_globalMintPower
            );
        }

        //mintPowerBonus has scaling factor of 1e7, so divide by 1e7
        reward =
            uint256(userMintInfo.mintableHlx) +
            (bonus / SCALING_FACTOR_1e7);
        penaltyAmount = (reward * penalty) / 100;
        reward -= penaltyAmount;

        if (action == MintAction.CLAIM) ++s_globalMintClaim;
        if (action == MintAction.BURN) ++s_globalMintBurn;
        if (penaltyAmount != 0) s_globalHlxMintPenalty += penaltyAmount;

        //only stored minted amount for claim mint
        if (action == MintAction.CLAIM) {
            s_hRankToMintInfo[hRank].mintedHlx = reward;
            s_hRankToMintInfo[hRank].penalty = penaltyAmount;
        }

        emit MintClaimed(user, hRank, reward, penalty, penaltyAmount);
    }

    //views
    /** @notice Returns the latest Mint Id of an address
     * @param user address
     * @return mId latest mint id
     */
    function getUserLatestMintId(address user) public view returns (uint256) {
        return s_addressMId[user];
    }

    /**
     * @dev Estimates the reward for a specific mint operation for a user, including any applicable bonuses and subtracting penalties for late claims.
     * This function calculates an estimate of the total reward a user can expect from a mint at the time of its maturity, based on the current state.
     *
     * @param user The address of the user who initiated the mint operation.
     * @param mintId The unique identifier of the mint operation for which the reward is being estimated.
     */
    function estimateMintReward(
        address user,
        uint256 mintId
    ) public view returns (uint256 baseReward) {
        uint256 hRank = s_addressMIdToHRankInfo[user][mintId].hRank;
        uint256 gMintPower = s_addressMIdToHRankInfo[user][mintId].gMintPower;
        if (hRank == 0) revert Helios_NoMintExists();

        UserMintInfo memory mint = s_hRankToMintInfo[hRank];
        // Base mintable HLX
        baseReward = mint.mintableHlx;

        // Calculate additional rewards here.
        uint256 bonus = calculateMintPowerBonus(
            mint.mintPowerBonus,
            mint.mintPower,
            gMintPower,
            s_globalMintPower
        );
        baseReward += baseReward + (bonus / SCALING_FACTOR_1e7); //hypothetical bonus
    }

    /** @notice Returns mint info of an address + mint id
     * @param user address
     * @param id mint id
     * @return mintInfo user mint info
     */
    function getUserMintInfo(
        address user,
        uint256 id
    ) public view returns (UserMintInfo memory mintInfo) {
        return s_hRankToMintInfo[s_addressMIdToHRankInfo[user][id].hRank];
    }

    /** @notice Return all mints info of an address
     * @param user address
     * @return mintInfos all mints info of an address including mint id, hRank and gMintPower
     */
    function getUserMints(
        address user
    ) public view returns (UserMint[] memory mintInfos) {
        uint256 count = s_addressMId[user];
        mintInfos = new UserMint[](count);

        for (uint256 i = 1; i <= count; i++) {
            mintInfos[i - 1] = UserMint({
                mId: i,
                hRank: s_addressMIdToHRankInfo[user][i].hRank,
                gMintPower: s_addressMIdToHRankInfo[user][i].gMintPower,
                mintInfo: getUserMintInfo(user, i)
            });
        }
    }

    /** @notice Return total mints burned
     * @return totalMintBurned total mints burned
     */
    function getTotalMintBurn() public view returns (uint256) {
        return s_globalMintBurn;
    }

    /** @notice Return current gobal hRank
     * @return globalHRank global hRank
     */
    function getGlobalHRank() public view returns (uint256) {
        return s_globalHRank;
    }

    /** @notice Return current gobal mint power
     * @return globalMintPower global mint power
     */
    function getGlobalMintPower() public view returns (uint256) {
        return s_globalMintPower;
    }

    /** @notice Return total mints claimed
     * @return totalMintClaimed total mints claimed
     */
    function getTotalMintClaim() public view returns (uint256) {
        return s_globalMintClaim;
    }

    /** @notice Return total active mints (exluded claimed and burned mints)
     * @return totalActiveMints total active mints
     */
    function getTotalActiveMints() public view returns (uint256) {
        return s_globalHRank - s_globalMintClaim - s_globalMintBurn;
    }

    /** @notice Return total minting helios
     * @return totalMinting total minting helios
     */
    function getTotalMinting() public view returns (uint256) {
        return s_globalHlxMinting;
    }

    /** @notice Return total helios penalty
     * @return totalHlxPenalty total helios penalty
     */
    function getTotalMintPenalty() public view returns (uint256) {
        return s_globalHlxMintPenalty;
    }
}
