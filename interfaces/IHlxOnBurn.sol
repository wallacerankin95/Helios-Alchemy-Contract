// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.10;

interface IHlxOnBurn {
    function onBurn(address user, uint256 amount) external;
}