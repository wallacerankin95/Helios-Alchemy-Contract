// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.10;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/interfaces/IERC165.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "@openzeppelin/contracts/utils/Create2.sol";
import "hardhat/console.sol";

import "../libs/TransferHelper.sol";
import "../libs/calcFunctions.sol";
import "../libs/Oracle.sol";
import "../libs/TickMath.sol";

import "./OwnerInfo.sol";
import "./HlxStake.sol";

import "../interfaces/IWETH9.sol";
import "../interfaces/ITITANX.sol";

contract Treasury is ReentrancyGuard, OwnerInfo {
    /** Storage Variables*/

    /** @dev stores Helios contract address */
    address private s_hlxAddress;

    /** @dev stores Helios BuyAndBurn contract address */
    address private s_buyAndBurnHlxAddress;

    /** @dev stores investment pool address */
    address private s_investmentAddress;

    /** @dev stores total Staked titan Amount */
    uint256 private s_totalTitanStaked;

    /** @dev stores latest staked time */
    uint256 public lastStakedTime;

    /** @dev interval after staking function can be called after */
    uint256 public s_stakeInterval = 7 days;

    /** @dev available amount for staking */
    uint256 public s_minStakeAmount = 1e11;

    // Last stake ID
    uint256 private s_lastStakeId = 0;

    /**
     * @notice The number of HlxStake contracts that have been deployed.
     * Tracks how many HlxStake contracts exist within the system.
     */
    uint256 public numHlxStakeContracts;

    /**
     * @notice The address of the currently active HlxStake contract instance.
     * This contract is used for initiating new TitanX stakes.
     */
    address public activeHlxStakeContract;

    /**
     * @notice A mapping from an ID to a deployed instance of the HlxStake contract.
     * The index starts at zero. Use a loop to iterate through instances, e.g., for(uint256 idx = 0; idx < numHlxStakeContracts; idx++).
     */
    mapping(uint256 => address) public hlxStakeContracts;

    /**
     * @dev Mapping of address to bool indicating if an address is a HlxStake instance
     */
    mapping(address => bool) private _hlxStakeAllowlist;

    /**
     * @dev Amount of Eth Claim as Reward from Stakes
     */
    uint256 private s_totalEthClaimed;

    /**
     * @dev Amount of Titan from Stakes
     */
    uint256 private s_totalTitanUnstaked;

    /** Event */
    event StakedTitanFromTreasury(
        uint256 indexed amount,
        uint16 indexed numOfdays,
        uint256 indexed stakedTime
    );

    event FallBackCalled(address indexed amount, bytes data);

    event ETHDistributed(address indexed caller, uint256 indexed amount);

    event HlxStakeInstanceCreated(
        uint256 indexed stakeContractId,
        address indexed stakeContractAddress
    );

    event TitanStakeEnded(
        address indexed hlxStakeAddress,
        uint256 sId,
        uint256 amount
    );

    /**
     * @dev Modifier to restrict function access to allowed HlxStake contracts.
     *
     * This modifier ensures that the function can only be called by addresses that are
     * present in the `_hlxStakeAllowlist`. If the calling address is not on the stakeallowlist,
     * the transaction will revert with the message "not allowed".
     * @notice Use this modifier to restrict function access to specific addresses only.
     */
    modifier onlyHlxStake() {
        require(_hlxStakeAllowlist[_msgSender()], "not allowed");
        _;
    }

    constructor(address invesmentAddress) {
        require(invesmentAddress != address(0), "Invalid address");
        s_investmentAddress = invesmentAddress;
        _deployHlxStakeInstance();
        lastStakedTime = block.timestamp;
    }

    // receive ETH
    receive() external payable {}

    fallback() external payable {
        emit FallBackCalled(_msgSender(), msg.data);
    }

    /**** User Functions *****/
    /** @notice stake the treasury TITANX to the protocol
     */
    function stakeTITANX() external nonReentrant {
        HlxStake hlxStake = HlxStake(payable(activeHlxStakeContract));

        if (hlxStake.openedStakes() >= MAX_STAKE_PER_WALLET) {
            revert("NoAdditionalStakesAllowed");
        }

        uint256 titanxAmount = getTitanBalance(); // get the treasury titanx amount

        //check the condition for function calling(more than s_minStakeAmount or called function is more than Stake Interval)
        require(
            titanxAmount >= (s_minStakeAmount * 1e18) ||
                (block.timestamp - lastStakedTime) > s_stakeInterval,
            "Can't be called"
        );

        //calculate the incentiveFee for this function calling
        uint256 incentiveFee = _calculateIncentiveFee(titanxAmount, false); // Approve the titanx
        //transfer fee to user
        TransferHelper.safeTransfer(TITANX, msg.sender, incentiveFee);

        titanxAmount = titanxAmount - incentiveFee;

        // Transfer TitanX tokens to the active HlxStake contract
        TransferHelper.safeTransfer(
            TITANX,
            activeHlxStakeContract,
            titanxAmount
        );

        hlxStake.stake();

        // save the lastStakedTime
        lastStakedTime = block.timestamp;

        s_lastStakeId++;

        s_totalTitanStaked += titanxAmount;

        //call the event
        emit StakedTitanFromTreasury(
            titanxAmount,
            STAKE_DURATION,
            lastStakedTime
        );
    }

    /** @notice claim ETH rewards by staked
     */
    function claimReward()
        external
        nonReentrant
        returns (uint256 claimedAmount)
    {
        //prevent contract accounts (bots) from calling this function
        if (msg.sender != tx.origin) {
            revert("Invalid Caller");
        }

        // Trigger payouts on TitanX
        // This potentially sends an incentive fee to Treasury
        // The incentive fee is transparently forwarded to the caller
        uint256 ethBalanceBefore = address(this).balance;
        ITITANX(TITANX).triggerPayouts();
        uint256 triggerPayoutsIncentiveFee = address(this).balance -
            ethBalanceBefore;

        // Retrieve the total claimable ETH amount.
        for (uint256 idx; idx < numHlxStakeContracts; idx++) {
            HlxStake hlxStake = HlxStake(payable(hlxStakeContracts[idx]));
            claimedAmount += hlxStake.claim();
        }

        // Check if there is any claimable ETH, revert if none.
        if (claimedAmount == 0) {
            revert("NoEthClaimable");
        }

        s_totalEthClaimed += claimedAmount;

        //send the incentive fee to caller
        _sendViaCall(
            payable(msg.sender),
            _calculateIncentiveFee(claimedAmount, true) +
                triggerPayoutsIncentiveFee
        );

        //distribute ETH to the right places
        _distributeEth();
    }

    /**
     * @dev Updates the state when a TitanX stake has ended and the tokens are unstaked.
     *
     * This function should be called after unstaking TitanX tokens. It updates the total amount of TitanX tokens that have been unstaked. This function can only
     * be called by an address that is allowed to end stakes (enforced by the `onlyHlxStake` modifier).
     *
     * @param sId The Id of Stake that is ended
     * @param amountUnstaked The amount of TitanX tokens that have been unstaked.
     * @notice This function is callable externally but restricted to allowed addresses (HlxStake contracts).
     * @notice It emits the `TitanStakeEnded` event after updating the total unstaked amount.
     */
    function stakeEnded(
        uint256 sId,
        uint256 amountUnstaked
    ) external onlyHlxStake {
        // Update state
        s_totalTitanUnstaked += amountUnstaked;

        // Emit event
        emit TitanStakeEnded(_msgSender(), sId, amountUnstaked);
    }

    /**
     * @notice Factory function to deploy a new Treasury contract instance.
     * @dev This function deploys a new HlxStake instance if the number of open stakes in the current
     *      active instance exceeds the maximum allowed per wallet.
     *      Only callable externally.
     */
    function deployNewHlxStakeInstance() external {
        HlxStake hlxStake = HlxStake(payable(activeHlxStakeContract));

        // Check if the maximum number of stakes per wallet has been reached
        if (hlxStake.openedStakes() < MAX_STAKE_PER_WALLET) {
            revert("NoNeedForNewHlxStakeInstance");
        }

        // Deploy a new HlxStake instance
        _deployHlxStakeInstance();
    }

    /**
     * @dev Private function to deploy a HlxStake contract instance.
     */
    function _deployHlxStakeInstance() private {
        // Deploy an instance of Hlx staking contract
        bytes memory bytecode = type(HlxStake).creationCode;
        uint256 stakeContractId = numHlxStakeContracts;

        // Create a unique salt for deployment
        bytes32 salt = keccak256(
            abi.encodePacked(address(this), stakeContractId)
        );

        // Deploy a new HlxStake contract instance
        address newHlxStakeContract = Create2.deploy(0, salt, bytecode);

        // Set new contract as active
        activeHlxStakeContract = newHlxStakeContract;

        // Update storage
        hlxStakeContracts[stakeContractId] = newHlxStakeContract;

        // For functions limited to hlxStake
        _hlxStakeAllowlist[newHlxStakeContract] = true;

        // Emit an event to track the creation of a new stake contract
        emit HlxStakeInstanceCreated(stakeContractId, newHlxStakeContract);

        // Increment the counter for HlxStake contracts
        numHlxStakeContracts += 1;
    }

    /**** View Functions *****/
    /** @notice get titan balance for treasury address
     */
    function getTitanBalance() public view returns (uint256) {
        return ITITANX(TITANX).balanceOf(address(this));
    }

    /** @notice returns Investment Address
     */
    function getInvestmentPoolAddress() public view returns (address) {
        return s_investmentAddress;
    }

    /** @notice get Last Stake Id
     */
    function getLastStakeId() public view returns (uint256) {
        return s_lastStakeId;
    }

    /** @notice get Minimum StakeAmount
     */
    function getMinStakeAmount() public view returns (uint256) {
        return s_minStakeAmount;
    }

    /** @notice get last calling time
     */
    function getLastStakedTime() public view returns (uint256) {
        return lastStakedTime;
    }

    /** @notice get total Amount of Titan Staked
     */
    function getTotalTitanStaked() public view returns (uint256) {
        return s_totalTitanStaked;
    }

    /** @notice get total Eth Claimed as reward */
    function getTotalEthClaimed() public view returns (uint256) {
        return s_totalEthClaimed;
    }

    /** @notice get Stake Interval */
    function getStakeInterval() public view returns (uint256) {
        return s_stakeInterval;
    }

    /** @notice get total TitanX unstaked from stakes */
    function getTotalTitanUnstaked() public view returns (uint256) {
        return s_totalTitanUnstaked;
    }

    /**** Owner Functions *****/

    /** @notice set Helios address. Only callable by owner address.
     * @param hlxAddress titanx contract address
     */
    function setHlxContractAddress(address hlxAddress) external onlyOwner {
        require(hlxAddress != address(0), "InvalidAddress");
        s_hlxAddress = hlxAddress;
    }

    /** @notice set Helios BuyAndBurn contract address. Only callable by owner address.
     * @param buyAndBurnHlxAddress Hlx BuyAndBurn contract address
     */
    function setHlxBuyAndBurnAddress(
        address buyAndBurnHlxAddress
    ) external onlyOwner {
        require(buyAndBurnHlxAddress != address(0), "InvalidAddress");
        s_buyAndBurnHlxAddress = buyAndBurnHlxAddress;
    }

    /** @notice set investment pool address. Only callable by owner address.
     * @param newAddress newAddress
     */
    function setInvestmentPoolAddress(address newAddress) external onlyOwner {
        require(newAddress != address(0), "InvalidAddress");
        s_investmentAddress = newAddress;
    }

    /** @notice set stake interval of calling function
     * @param interval duration time for calling
     */
    function setStakeInterval(uint256 interval) external onlyOwner {
        require(interval > 0, "InvalidInterval");
        s_stakeInterval = interval;
    }

    /** @notice set min available amount for staking
     * @param minAmount min amount of titanx staking
     */
    function setMinStakeAmount(uint256 minAmount) external onlyOwner {
        s_minStakeAmount = minAmount;
    }

    /**** Extra Functions *****/
    /** @dev Recommended method to use to send native coins.
     * @param to receiving address.
     * @param amount in wei.
     */
    function _sendViaCall(address payable to, uint256 amount) private {
        require(to != address(0), "Invalid address");
        (bool sent, ) = to.call{value: amount}("");
        require(sent, "Failed to send");
    }

    /**
     * @notice Calculate the incentive fee amount.
     * @param amount The total amount for which the incentive is calculated.
     * @param isEth True if the incentive is calculated for ETH, false otherwise.
     * @return incentiveFeeAmount The calculated incentive fee amount.
     */
    function _calculateIncentiveFee(
        uint256 amount,
        bool isEth
    ) private pure returns (uint256 incentiveFeeAmount) {
        if (isEth) {
            // Calculate incentive fee for ETH with a cap
            uint256 fee = (amount * TREASURY_INCENTIVE_FEE_PERCENT) /
                INCENTIVE_FEE_PERCENT_BASE;
            return fee > INCENTIVE_FEE_CAP_ETH ? INCENTIVE_FEE_CAP_ETH : fee;
        } else {
            // Calculate standard incentive fee for other tokens
            return
                (amount * TREASURY_INCENTIVE_FEE_PERCENT) /
                INCENTIVE_FEE_PERCENT_BASE;
        }
    }

    /** @notice distribute ETH to the pools
     */
    function _distributeEth() private {
        //get the total ETH balance of treasury
        uint256 totalBalance = address(this).balance;

        uint256 ethToStakers = (totalBalance * PERCENT_TO_STAKERS) /
            PERCENT_BASE;
        uint256 ethToBurnHlx = (totalBalance * PERCENT_TO_BUYANDBURNHELIOS) /
            PERCENT_BASE;
        uint256 ethToInvestment = totalBalance - ethToStakers - ethToBurnHlx;
        // distribute ETH
        _sendViaCall(payable(s_hlxAddress), ethToStakers);
        _sendViaCall(payable(s_buyAndBurnHlxAddress), ethToBurnHlx);
        _sendViaCall(payable(s_investmentAddress), ethToInvestment);

        emit ETHDistributed(_msgSender(), totalBalance);
    }
}
