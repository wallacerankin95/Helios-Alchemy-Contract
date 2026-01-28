// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.10;

interface ITITANX {

    // Enum for stake status
    enum StakeStatus {
        ACTIVE,
        ENDED,
        BURNED
    }

    // Struct for user stake information
    struct UserStakeInfo {
        uint152 titanAmount;
        uint128 shares;
        uint16 numOfDays;
        uint48 stakeStartTs;
        uint48 maturityTs;
        StakeStatus status;
    }

    struct UserStake {
        uint256 sId;
        uint256 globalStakeId;
        UserStakeInfo stakeInfo;
    }

    function balanceOf(address account) external view returns (uint256);

    function getBalance() external;

    function mintLPTokens() external;

    function burnLPTokens() external;

    function startStake(uint256 amount, uint256 numOfDays) external;

    function endStake(uint256 id) external;

    function claimUserAvailableETHPayouts() external;
     
    function burnTokensToPayAddress(
        address user,
        uint256 amount,
        uint256 userRebatePercentage,
        uint256 rewardPaybackPercentage,
        address rewardPaybackAddress
    ) external;

    /** @notice get stake info with stake id
     * @return stakeInfo stake info
     */
    function getUserStakeInfo(
        address user,
        uint256 id
    ) external view returns (UserStakeInfo memory);

    /**
     * @notice Calculates the total ETH claimable by a user for all cycles.
     * @dev This function sums up the rewards from various cycles based on user shares.
     * @param user The address of the user for whom to calculate the claimable ETH.
     * @return reward The total ETH reward claimable by the user.
     */
    function getUserETHClaimableTotal(
        address user
    ) external view returns (uint256 reward);

    /**
     * @notice Get all stake info of a given user address.
     * @param user The address of the user to query stake information for.
     * @return An array of UserStake structs containing all stake info for the given address.
     */
    function getUserStakes(
        address user
    ) external view returns (UserStake[] memory);

    /**
     * @notice Trigger cycle payouts for days 8, 28, 90, 369, 888, including the burn reward cycle 28.
     * Payouts can be triggered on or after the maturity day of each cycle (e.g., Cycle8 on day 8).
     */
    function triggerPayouts() external;
}
