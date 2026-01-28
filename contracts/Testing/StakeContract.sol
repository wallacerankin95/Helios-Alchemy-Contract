// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.10;

interface IHelios {
    function startStake(
        uint256 amount,
        uint256 numOfDays,
        uint256 titanToBurn
    ) external;

    function endStake(uint256 id) external;

    function claimUserAvailablePayouts() external;
}

interface ITitanx {
    function approve(address spender, uint256 amount) external;
}

contract StakeContract {
    address public titanXAddress;
    address public heliosAddress;

    constructor(address titanx, address helios) {
        titanXAddress = titanx;
        heliosAddress = helios;
    }

    function startStake(
        uint256 amount,
        uint256 numOfDays,
        uint256 titanToBurn
    ) public {
        if (titanToBurn > 0) {
            ITitanx(titanXAddress);
        }

        IHelios(heliosAddress).startStake(amount, numOfDays, titanToBurn);
    }

    function endStake(uint256 stakeId) external {
        IHelios(heliosAddress).endStake(stakeId);
    }

    function claimUserPayouts() external {
        IHelios(heliosAddress).claimUserAvailablePayouts();
    }
}
