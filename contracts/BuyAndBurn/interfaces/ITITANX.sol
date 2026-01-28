// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.7.6;

interface ITITANX {
    function balanceOf(address account) external view returns (uint256);

    function getBalance() external;

    function mintLPTokens() external;

    function burnLPTokens() external;

    function startStake(uint256 amount, uint256 numOfDays) external;

    function claimUserAvailableETHPayouts() external;
}
