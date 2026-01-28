// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.10;

import "../libs/constant.sol";
import "../libs/enum.sol";

/**
 * @title BurnInfo
 * @dev this contract is meant to be inherited into main contract
 * @notice It has the variables and functions specifically for tracking burn amount and reward
 */

abstract contract BurnInfo {
    //Variables
    //track the total helios burn amount
    uint256 private s_totalHlxBurned;

    //mappings
    //track wallet address -> total helios burn amount
    mapping(address => uint256) private s_userBurnAmount;
    //track contract/project address -> total helios burn amount
    mapping(address => uint256) private s_project_BurnAmount;
    //track contract/project address, wallet address -> total helios burn amount
    mapping(address => mapping(address => uint256))
        private s_projectUser_BurnAmount;

    //events
    /** @dev log user burn helios event
     * project can be address(0) if user burns helios directly from helios contract
     * burnPoolCycleIndex is the cycle 28 index, which reuse the same index as Day 28 cycle index
     * helioSource 0=Liquid, 1=Mint, 2=Stake
     */
    event HlxBurned(
        address indexed user,
        address indexed project,
        uint256 amount,
        BurnSource helioSource
    );

    //functions
    /** @dev update the burn amount in each 28-cylce for user and project (if any)
     * @param user wallet address
     * @param project contract address
     * @param amount helios amount burned
     */
    function _updateBurnAmount(
        address user,
        address project,
        uint256 amount,
        BurnSource source
    ) internal {
        s_userBurnAmount[user] += amount;
        s_totalHlxBurned += amount;

        if (project != address(0)) {
            s_project_BurnAmount[project] += amount;
            s_projectUser_BurnAmount[project][user] += amount;
        }

        emit HlxBurned(user, project, amount, source);
    }

    /** @dev returned value is in 18 decimals, need to divide it by 1e18 and 100 (percentage) when using this value for reward calculation
     * The burn amplifier percentage is applied to all future mints. Capped at MAX_BURN_AMP_PERCENT (8%)
     * @param user wallet address
     * @return percentage returns percentage value in 18 decimals
     */
    function getUserBurnAmplifierBonus(
        address user
    ) public view returns (uint256) {
        uint256 userBurnTotal = getUserBurnTotal(user);
        if (userBurnTotal == 0) return 0;
        if (userBurnTotal >= MAX_BURN_AMP_BASE) return MAX_BURN_AMP_PERCENT;
        return (MAX_BURN_AMP_PERCENT * userBurnTotal) / MAX_BURN_AMP_BASE;
    }

    //views
    /** @notice return total burned helios amount from all users burn or projects burn
     * @return totalBurnAmount returns entire burned helios
     */
    function getTotalBurnTotal() public view returns (uint256) {
        return s_totalHlxBurned;
    }

    /** @notice return user address total burned helios
     * @return userBurnAmount returns user address total burned helios
     */
    function getUserBurnTotal(address user) public view returns (uint256) {
        return s_userBurnAmount[user];
    }

    /** @notice return project address total burned helios amount
     * @return projectTotalBurnAmount returns project total burned helios
     */
    function getProjectBurnTotal(
        address contractAddress
    ) public view returns (uint256) {
        return s_project_BurnAmount[contractAddress];
    }

    /** @notice return user address total burned helios amount via a project address
     * @param contractAddress project address
     * @param user user address
     * @return projectUserTotalBurnAmount returns user address total burned helios via a project address
     */
    function getProjectUserBurnTotal(
        address contractAddress,
        address user
    ) public view returns (uint256) {
        return s_projectUser_BurnAmount[contractAddress][user];
    }
}
