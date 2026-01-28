// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.10;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/interfaces/IERC165.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "../interfaces/IHlxOnBurn.sol";
import "../interfaces/ITITANX.sol";
import "../interfaces/ITitanOnBurn.sol";
import "../interfaces/IBuynBurn.sol";

import "../libs/calcFunctions.sol";

import "./GlobalInfo.sol";
import "./MintInfo.sol";
import "./StakeInfo.sol";
import "./BurnInfo.sol";
import "./OwnerInfo.sol";

//custom errors
error Helios_InvalidAmount();
error Helios_InsufficientBalance();
error Helios_NotSupportedContract();
error Helios_InsufficientProtocolFees();
error Helios_FailedToSendAmount();
error Helios_NotAllowed();
error Helios_NoCycleRewardToClaim();
error Helios_NoSharesExist();
error Helios_EmptyUndistributeFees();
error Helios_InvalidBurnRewardPercent();
error Helios_MaxedWalletMints();
error Helios_LPTokensHasMinted();
error Helios_InvalidAddress();
error Helios_InsufficientBurnAllowance();
error Helios_OnlyBuyAndBurn();
error Helios_OnlyWhiteListedProjects();

/** @title Helios */
contract HELIOS is
    ERC20,
    ReentrancyGuard,
    GlobalInfo,
    MintInfo,
    StakeInfo,
    BurnInfo,
    OwnerInfo,
    IERC165,
    ITitanOnBurn
{
    /** Storage Variables*/
    /** @dev stores genesis wallet address */
    address private s_genesisAddress;

    /** @dev stores Investment address */
    address private s_investmentAddress;

    /** @dev stores buy and burn contract address */
    address private s_buyAndBurnAddress;

    /** @dev stores treasury contract address */
    address private s_treasuryAddress;

    /** @dev stores TITANX contract address */
    address private s_titanxAddress;

    /** @dev tracks collected protocol fees until it is distributed */
    uint256 private s_undistributedTitanX;

    /** @dev tracks collected protocol fees until it is distributed */
    uint256 private s_undistributedETH;

    /** @dev stores total Titanx burned by Users  */
    uint256 private s_totalTitanBurned;

    // /** @dev tracks burn reward from distributeTitanX() until payout is triggered */
    // uint88 private s_cycleBurnReward;

    /** @dev tracks if initial LP tokens has minted or not */
    InitialLPMinted private s_initialLPMinted;

    // /** @dev trigger to turn on burn pool reward */
    // BurnPoolEnabled private s_burnPoolEnabled;

    /** @dev tracks user + project burn mints allowance */
    mapping(address => mapping(address => uint256))
        private s_allowanceBurnMints;

    /** @dev tracks projects whiteListed to stake on hlx */
    mapping(address => bool) private s_whiteList;

    /** @dev tracks user + project burn stakes allowance */
    mapping(address => mapping(address => uint256))
        private s_allowanceBurnStakes;

    struct MintParams {
        uint256 mintPower;
        uint256 numOfDays;
        uint256 titanToBurn;
        uint256 gMintPower;
        uint256 currentHRank;
        uint256 mintCost;
    }

    event ProtocolFeeRecevied(
        address indexed user,
        uint256 indexed day,
        uint256 indexed amount
    );
    event TitanXDistributed(address indexed caller, uint256 indexed amount);
    event CyclePayoutTriggered(
        address indexed caller,
        uint256 indexed cycleNo,
        uint256 indexed reward
        // uint256 burnReward
    );
    event RewardClaimed(
        address indexed user,
        uint256 indexed reward,
        uint256 indexed ethReward
    );
    event ApproveBurnStakes(
        address indexed user,
        address indexed project,
        uint256 indexed amount
    );
    event ApproveBurnMints(
        address indexed user,
        address indexed project,
        uint256 indexed amount
    );

    constructor(
        address genesisAddress,
        address buyAndBurnAddress,
        address titanxAddress,
        address treasuryAddress,
        address investmentAddress
    ) ERC20("HELIOS", "HLX") {
        if (genesisAddress == address(0)) revert Helios_InvalidAddress();
        if (buyAndBurnAddress == address(0)) revert Helios_InvalidAddress();
        if (titanxAddress == address(0)) revert Helios_InvalidAddress();
        if (treasuryAddress == address(0)) revert Helios_InvalidAddress();
        s_genesisAddress = genesisAddress;
        s_investmentAddress = investmentAddress;
        s_buyAndBurnAddress = buyAndBurnAddress;
        s_titanxAddress = titanxAddress;
        s_treasuryAddress = treasuryAddress;
    }

    modifier onlyBuyAndBurn() {
        if (_msgSender() != s_buyAndBurnAddress) revert Helios_OnlyBuyAndBurn();
        _;
    }

    function supportsInterface(
        bytes4 interfaceId
    ) external pure override returns (bool) {
        return
            interfaceId == INTERFACE_ID_ERC165 ||
            interfaceId == INTERFACE_ID_ITITANONBURN;
    }

    function onBurn(address, uint256 amount) external override {
        require(msg.sender == s_titanxAddress, "Only TitanX");
        s_totalTitanBurned += amount;
    }

    /**** Mint Functions *****/
    /** @notice create a new mint
     * @param mintPower 1 - 100,000
     * @param numOfDays mint length of 1 - 250
     */
    function startMint(
        uint256 mintPower,
        uint256 numOfDays,
        uint256 titanToBurn
    ) external payable nonReentrant dailyUpdate {
        if (getUserLatestMintId(_msgSender()) + 1 > MAX_MINT_PER_WALLET)
            revert Helios_MaxedWalletMints();

        if (titanToBurn > 0) _burnTitanX(titanToBurn);

        MintParams memory params = MintParams({
            mintPower: mintPower,
            numOfDays: numOfDays,
            titanToBurn: titanToBurn,
            gMintPower: getGlobalMintPower() + mintPower,
            currentHRank: getGlobalHRank() + 1,
            mintCost: getMintCost(mintPower, getCurrentMintCost())
        });

        uint256 gMinting = getTotalMinting() +
            _startMint(
                _msgSender(),
                params.mintPower,
                params.numOfDays,
                getCurrentMintableHlx(),
                getCurrentMintPowerBonus(),
                getCurrentEAABonus(),
                getUserBurnAmplifierBonus(_msgSender()),
                params.gMintPower,
                params.currentHRank,
                params.mintCost,
                params.titanToBurn
            );
        _updateMintStats(params.currentHRank, params.gMintPower, gMinting);
        _protocolFees(mintPower);
    }

    /** @notice claim a matured mint
     * @param id mint id
     */
    function claimMint(uint256 id) external dailyUpdate nonReentrant {
        _mintReward(_claimMint(_msgSender(), id, MintAction.CLAIM));
    }

    /**** Stake Functions *****/
    /** @notice start a new stake
     * @param amount Helios amount
     * @param numOfDays stake length
     * @param titanToBurn amount of titanX tokens to burn to get reward
     */
    function startStake(
        uint256 amount,
        uint256 numOfDays,
        uint256 titanToBurn
    ) external dailyUpdate nonReentrant {
        if (balanceOf(_msgSender()) < amount)
            revert Helios_InsufficientBalance();

        if (msg.sender != tx.origin) {
            // check if it's whitelisted
            require(s_whiteList[msg.sender], "Contract not whitelisted.");
        }

        if (titanToBurn > 0) _burnTitanX(titanToBurn);

        _burn(_msgSender(), amount);
        _initFirstSharesCycleIndex(
            _msgSender(),
            _startStake(
                _msgSender(),
                amount,
                numOfDays,
                getCurrentShareRate(),
                getCurrentContractDay(),
                getGlobalPayoutTriggered(),
                titanToBurn,
                titanToBurn > 0
                    ? IBuynBurn(s_buyAndBurnAddress).getCurrentTitanPrice()
                    : 0
            )
        );
    }

    /** @notice end a stake
     * @param id stake id
     */
    function endStake(uint256 id) external dailyUpdate nonReentrant {
        _mint(
            _msgSender(),
            _endStake(
                _msgSender(),
                id,
                getCurrentContractDay(),
                StakeAction.END,
                StakeAction.END_OWN,
                getGlobalPayoutTriggered()
            )
        );
    }

    /** @notice end a stake for others
     * @param user wallet address
     * @param id stake id
     */
    function endStakeForOthers(
        address user,
        uint256 id
    ) external dailyUpdate nonReentrant {
        _mint(
            user,
            _endStake(
                user,
                id,
                getCurrentContractDay(),
                StakeAction.END,
                StakeAction.END_OTHER,
                getGlobalPayoutTriggered()
            )
        );
    }

    /** @notice distribute the collected protocol fees into different pools/payouts
     * automatically send the incentive fee to caller, buyAndBurnFunds to BuyAndBurn contract, and genesis wallet
     */
    function distributeTitanX() external dailyUpdate nonReentrant {
        (
            uint256 incentiveFee,
            uint256 buyAndBurnFunds,
            uint256 treasuryReward,
            uint256 genesisWallet
        ) = _distributeTitanX();
        _sendFunds(
            incentiveFee,
            buyAndBurnFunds,
            treasuryReward,
            genesisWallet
        );
    }

    /** @notice trigger cylce payouts for day 22, 69, 420
     * As long as the cycle has met its maturiy day (eg. Cycle22 is day 22), payout can be triggered in any day onwards
     */
    function triggerPayouts() external dailyUpdate nonReentrant {
        uint256 globalActiveShares = getGlobalShares() -
            getGlobalExpiredShares();
        if (globalActiveShares < 1) revert Helios_NoSharesExist();

        uint256 incentiveFee;
        uint256 buyAndBurnFunds;
        uint256 genesisWallet;
        uint256 treasuryReward;

        if (s_undistributedTitanX != 0)
            (
                incentiveFee,
                buyAndBurnFunds,
                treasuryReward,
                genesisWallet
            ) = _distributeTitanX();

        uint256 currentContractDay = getCurrentContractDay();
        PayoutTriggered isTriggered = PayoutTriggered.NO;

        _triggerCyclePayout(DAY22, globalActiveShares, currentContractDay) ==
            PayoutTriggered.YES &&
            isTriggered == PayoutTriggered.NO
            ? isTriggered = PayoutTriggered.YES
            : isTriggered;
        _triggerCyclePayout(DAY69, globalActiveShares, currentContractDay) ==
            PayoutTriggered.YES &&
            isTriggered == PayoutTriggered.NO
            ? isTriggered = PayoutTriggered.YES
            : isTriggered;
        _triggerCyclePayout(DAY420, globalActiveShares, currentContractDay) ==
            PayoutTriggered.YES &&
            isTriggered == PayoutTriggered.NO
            ? isTriggered = PayoutTriggered.YES
            : isTriggered;

        if (isTriggered == PayoutTriggered.YES) {
            if (getGlobalPayoutTriggered() == PayoutTriggered.NO)
                _setGlobalPayoutTriggered();
        }

        if (incentiveFee != 0)
            _sendFunds(
                incentiveFee,
                buyAndBurnFunds,
                treasuryReward,
                genesisWallet
            );
    }

    /** @notice claim all user available TitanX/ETH payouts in one call */
    function claimUserAvailablePayouts() external dailyUpdate nonReentrant {
        uint256 totalTitanXReward = 0;
        uint256 totalEthReward = 0;

        (uint256 reward, uint256 ethReward) = _claimCyclePayout(DAY22);
        totalTitanXReward += reward;
        totalEthReward += ethReward;

        (reward, ethReward) = _claimCyclePayout(DAY69);
        totalTitanXReward += reward;
        totalEthReward += ethReward;

        (reward, ethReward) = _claimCyclePayout(DAY420);
        totalTitanXReward += reward;
        totalEthReward += ethReward;

        if (totalTitanXReward == 0 && totalEthReward == 0)
            revert Helios_NoCycleRewardToClaim();

        if (totalTitanXReward > 0) {
            _sendTitanX(_msgSender(), totalTitanXReward);
        }

        if (totalEthReward > 0) {
            _sendViaCall(payable(_msgSender()), totalEthReward);
        }
        emit RewardClaimed(_msgSender(), totalTitanXReward, totalEthReward);
    }

    /** @notice Set BuyAndBurn Contract Address - able to change to new contract that supports UniswapV4+
     * Only owner can call this function
     * @param contractAddress BuyAndBurn contract address
     */
    function setBuyAndBurnContractAddress(
        address contractAddress
    ) external onlyOwner {
        if (contractAddress == address(0)) revert Helios_InvalidAddress();
        s_buyAndBurnAddress = contractAddress;
    }

    /** @notice adds address to whitelist
     * Only owner can call this function
     * @param contractAddress project contract address
     * @param permit bool  True to allow
     */
    function whiteList(
        address contractAddress,
        bool permit
    ) external onlyOwner {
        if (contractAddress == address(0)) revert Helios_InvalidAddress();
        s_whiteList[contractAddress] = permit;
    }

    /** @notice Set Treasury Contract Address - able to change to new contract that supports UniswapV4+
     * Only owner can call this function
     * @param contractAddress Treasury contract address
     */
    function setTreasuryContractAddress(
        address contractAddress
    ) external onlyOwner {
        if (contractAddress == address(0)) revert Helios_InvalidAddress();
        s_treasuryAddress = contractAddress;
    }

    /** @notice Set TitanX Contract Address - able to change to new contract that supports UniswapV4+
     * Only owner can call this function
     * @param contractAddress TitanX contract address
     */
    function setTitanXContractAddress(
        address contractAddress
    ) external onlyOwner {
        if (contractAddress == address(0)) revert Helios_InvalidAddress();
        s_titanxAddress = contractAddress;
    }

    /** @notice Set to new genesis wallet. Only genesis wallet can call this function
     * @param newAddress new genesis wallet address
     */
    function setNewGenesisAddress(address newAddress) external {
        if (_msgSender() != s_genesisAddress) revert Helios_NotAllowed();
        if (newAddress == address(0)) revert Helios_InvalidAddress();
        s_genesisAddress = newAddress;
    }

    /** @notice Set to new Investment Address.
     * @param newAddress new Investment address
     */
    function setNewInvestmentAddress(address newAddress) external {
        if (_msgSender() != s_genesisAddress) revert Helios_NotAllowed();
        if (newAddress == address(0)) revert Helios_InvalidAddress();
        s_investmentAddress = newAddress;
    }

    /** @notice mint initial LP tokens. Only BuyAndBurn contract set by genesis wallet can call this function
     */
    function mintLPTokens() external {
        if (_msgSender() != s_buyAndBurnAddress) revert Helios_NotAllowed();
        if (s_initialLPMinted == InitialLPMinted.YES)
            revert Helios_LPTokensHasMinted();
        s_initialLPMinted = InitialLPMinted.YES;
        _mint(s_buyAndBurnAddress, INITAL_LP_TOKENS);
    }

    /** @notice burn all BuyAndBurn contract Helios */
    function burnLPTokens() external dailyUpdate onlyBuyAndBurn {
        _burn(s_buyAndBurnAddress, balanceOf(s_buyAndBurnAddress));
    }

    //private functions
    /** @dev mint reward to user and 1% to genesis wallet
     * @param reward helios amount
     */
    function _mintReward(uint256 reward) private {
        _mint(_msgSender(), reward);
        _mint(s_investmentAddress, (reward * 100) / PERCENT_BPS);
    }

    /** @dev burns given amount of titanX with giving reward to caller and genesis Wallet
     * @param titanAmount amount titanX to burn
     */
    function _burnTitanX(uint256 titanAmount) private {
        ITITANX(TITANX).burnTokensToPayAddress(
            _msgSender(),
            titanAmount,
            BURN_REWARD_PERCENT_EACH,
            BURN_REWARD_PERCENT_EACH,
            s_genesisAddress
        );
    }

    /** @dev send TitanX to respective parties
     * @param incentiveFee fees for caller to run distributeTitanX()
     * @param buyAndBurnFunds funds for buy and burn
     * @param genesisWalletFunds funds for genesis wallet
     */
    function _sendFunds(
        uint256 incentiveFee,
        uint256 buyAndBurnFunds,
        uint256 treasuryReward,
        uint256 genesisWalletFunds
    ) private {
        _sendTitanX(_msgSender(), incentiveFee);
        _sendTitanX(s_genesisAddress, genesisWalletFunds);
        _sendTitanX(s_buyAndBurnAddress, buyAndBurnFunds);
        _sendTitanX(s_treasuryAddress, treasuryReward);
    }

    /** @dev calculation to distribute collected protocol fees into different pools/parties */
    function _distributeTitanX()
        private
        returns (
            uint256 incentiveFee,
            uint256 buyAndBurnFunds,
            uint256 treasuryReward,
            uint256 genesisWallet
        )
    {
        uint256 accumulatedFees = s_undistributedTitanX;
        if (accumulatedFees == 0) revert Helios_EmptyUndistributeFees();
        s_undistributedTitanX = 0;
        emit TitanXDistributed(_msgSender(), accumulatedFees);

        incentiveFee =
            (accumulatedFees * INCENTIVE_FEE_PERCENT) /
            INCENTIVE_FEE_PERCENT_BASE;
        accumulatedFees -= incentiveFee;

        buyAndBurnFunds =
            (accumulatedFees * getBuynBurnPercentage()) /
            PERCENT_BPS;
        treasuryReward =
            (accumulatedFees * getTreasuryPercentage()) /
            PERCENT_BPS;
        genesisWallet = (accumulatedFees * PERCENT_TO_GENESIS) / PERCENT_BPS;
        uint256 cycleRewardPool = accumulatedFees -
            buyAndBurnFunds -
            treasuryReward -
            genesisWallet;

        //cycle payout
        if (cycleRewardPool != 0) {
            uint256 cycle22Reward = (cycleRewardPool * CYCLE_22_PERCENT) /
                PERCENT_BPS;
            uint256 cycle69Reward = (cycleRewardPool * CYCLE_69_PERCENT) /
                PERCENT_BPS;
            _setCyclePayoutPool(DAY22, cycle22Reward);
            _setCyclePayoutPool(DAY69, cycle69Reward);
            _setCyclePayoutPool(
                DAY420,
                cycleRewardPool - cycle22Reward - cycle69Reward
            );
        }

        uint256 ethForDistribution = s_undistributedETH;

        //cycle ETH payout
        if (ethForDistribution != 0) {
            s_undistributedETH = 0;
            uint256 ethCycle22Reward = (ethForDistribution * CYCLE_22_PERCENT) /
                PERCENT_BPS;
            uint256 ethCycle69Reward = (ethForDistribution * CYCLE_69_PERCENT) /
                PERCENT_BPS;

            _setETHCyclePayoutPool(DAY22, ethCycle22Reward);
            _setETHCyclePayoutPool(DAY69, ethCycle69Reward);
            _setETHCyclePayoutPool(
                DAY420,
                ethForDistribution - ethCycle22Reward - ethCycle69Reward
            );
        }
    }

    /** @dev calcualte required protocol fees, and return the balance (if any)
     * @param mintPower mint power 1-100,000
     */
    function _protocolFees(uint256 mintPower) private {
        uint256 protocolFee;

        protocolFee = getMintCost(mintPower, getCurrentMintCost());

        // Transfer Titanx From user to contract
        IERC20(s_titanxAddress).transferFrom(
            _msgSender(),
            address(this),
            protocolFee
        );

        s_undistributedTitanX += protocolFee;

        emit ProtocolFeeRecevied(
            _msgSender(),
            getCurrentContractDay(),
            protocolFee
        );
    }

    /** @dev calculate payouts for each cycle day tracked by cycle index
     * @param cycleNo cylce day 22, 69, 420
     * @param currentContractDay current contract day
     * @return triggered is payout triggered succesfully
     */
    function _triggerCyclePayout(
        uint256 cycleNo,
        uint256 globalActiveShares,
        uint256 currentContractDay
    ) private returns (PayoutTriggered triggered) {
        //check against cylce payout maturity day
        if (currentContractDay < getNextCyclePayoutDay(cycleNo))
            return PayoutTriggered.NO;

        //update the next cycle payout day regardless of payout triggered succesfully or not
        _setNextCyclePayoutDay(cycleNo);

        uint256 reward = getCyclePayoutPool(cycleNo);
        uint256 ethReward = getETHCyclePayoutPool(cycleNo);

        if (reward == 0 && ethReward == 0) return PayoutTriggered.NO;

        //calculate cycle reward per share and get new cycle Index
        _calculateCycleRewardPerShare(
            cycleNo,
            reward,
            ethReward,
            globalActiveShares
        );

        emit CyclePayoutTriggered(_msgSender(), cycleNo, reward);

        return PayoutTriggered.YES;
    }

    /** @dev calculate user reward with specified cycle day and claim type (shares) and update user's last claim cycle index
     * @param cycleNo cycle day 22, 69, 420
     */
    function _claimCyclePayout(
        uint256 cycleNo
    ) private returns (uint256, uint256) {
        (
            uint256 reward,
            uint256 ethRewards,
            uint256 userClaimCycleIndex,
            uint256 userClaimSharesIndex
        ) = calculateUserCycleReward(_msgSender(), cycleNo);
        _updateUserClaimIndexes(
            _msgSender(),
            cycleNo,
            userClaimCycleIndex,
            userClaimSharesIndex
        );
        return (reward, ethRewards);
    }

    /** @dev burn liquid Helios through other project.
     * called by other contracts for proof of burn 2.0 with up to 8% for both builder fee and user rebate
     * @param user user address
     * @param amount liquid helios amount
     * @param userRebatePercentage percentage for user rebate in liquid helios (0 - 8)
     * @param rewardPaybackPercentage percentage for builder fee in liquid helios (0 - 8)
     * @param rewardPaybackAddress builder can opt to receive fee in another address
     */
    function _burnLiquidHlx(
        address user,
        uint256 amount,
        uint256 userRebatePercentage,
        uint256 rewardPaybackPercentage,
        address rewardPaybackAddress
    ) private {
        if (amount == 0) revert Helios_InvalidAmount();
        if (balanceOf(user) < amount) revert Helios_InsufficientBalance();
        _spendAllowance(user, _msgSender(), amount);
        _burnbefore(userRebatePercentage, rewardPaybackPercentage);
        _burn(user, amount);
        _burnAfter(
            user,
            amount,
            userRebatePercentage,
            rewardPaybackPercentage,
            rewardPaybackAddress,
            BurnSource.LIQUID
        );
    }

    /** @dev burn stake through other project.
     * called by other contracts for proof of burn 2.0 with up to 8% for both builder fee and user rebate
     * @param user user address
     * @param id stake id
     * @param userRebatePercentage percentage for user rebate in liquid helios (0 - 8)
     * @param rewardPaybackPercentage percentage for builder fee in liquid helios (0 - 8)
     * @param rewardPaybackAddress builder can opt to receive fee in another address
     */
    function _burnStake(
        address user,
        uint256 id,
        uint256 userRebatePercentage,
        uint256 rewardPaybackPercentage,
        address rewardPaybackAddress
    ) private {
        _spendBurnStakeAllowance(user);
        _burnbefore(userRebatePercentage, rewardPaybackPercentage);
        _burnAfter(
            user,
            _endStake(
                user,
                id,
                getCurrentContractDay(),
                StakeAction.BURN,
                StakeAction.END_OWN,
                getGlobalPayoutTriggered()
            ),
            userRebatePercentage,
            rewardPaybackPercentage,
            rewardPaybackAddress,
            BurnSource.STAKE
        );
    }

    /** @dev burn mint through other project.
     * called by other contracts for proof of burn 2.0
     * burn mint has no builder reward and no user rebate
     * @param user user address
     * @param id mint id
     */
    function _burnMint(address user, uint256 id) private {
        _spendBurnMintAllowance(user);
        _burnbefore(0, 0);
        uint256 amount = _claimMint(user, id, MintAction.BURN);
        _mint(s_genesisAddress, (amount * 800) / PERCENT_BPS);
        _burnAfter(user, amount, 0, 0, _msgSender(), BurnSource.MINT);
    }

    /** @dev perform checks before burning starts.
     * check reward percentage and check if called by supported contract
     * @param userRebatePercentage percentage for user rebate
     * @param rewardPaybackPercentage percentage for builder fee
     */
    function _burnbefore(
        uint256 userRebatePercentage,
        uint256 rewardPaybackPercentage
    ) private view {
        if (
            rewardPaybackPercentage + userRebatePercentage >
            MAX_BURN_REWARD_PERCENT
        ) revert Helios_InvalidBurnRewardPercent();

        //Only supported contracts is allowed to call this function
        if (
            !IERC165(_msgSender()).supportsInterface(
                IERC165.supportsInterface.selector
            ) ||
            !IERC165(_msgSender()).supportsInterface(
                type(IHlxOnBurn).interfaceId
            )
        ) revert Helios_NotSupportedContract();
    }

    /** @dev update burn stats and mint reward to builder or user if applicable
     * @param user user address
     * @param amount helios amount burned
     * @param userRebatePercentage percentage for user rebate in liquid helios (0 - 8)
     * @param rewardPaybackPercentage percentage for builder fee in liquid helios (0 - 8)
     * @param rewardPaybackAddress builder can opt to receive fee in another address
     * @param source liquid/mint/stake
     */
    function _burnAfter(
        address user,
        uint256 amount,
        uint256 userRebatePercentage,
        uint256 rewardPaybackPercentage,
        address rewardPaybackAddress,
        BurnSource source
    ) private {
        _updateBurnAmount(user, _msgSender(), amount, source);

        uint256 devFee;
        uint256 userRebate;
        if (rewardPaybackPercentage != 0)
            devFee =
                (amount * rewardPaybackPercentage * PERCENT_BPS) /
                (100 * PERCENT_BPS);
        if (userRebatePercentage != 0)
            userRebate =
                (amount * userRebatePercentage * PERCENT_BPS) /
                (100 * PERCENT_BPS);

        if (devFee != 0) _mint(rewardPaybackAddress, devFee);
        if (userRebate != 0) _mint(user, userRebate);

        IHlxOnBurn(_msgSender()).onBurn(user, amount);
    }

    /** @dev Recommended method to transfer Tokens
     * @param to receiving address.
     * @param amount in wei.
     */
    function _sendTitanX(address to, uint256 amount) private {
        if (to == address(0)) revert Helios_InvalidAddress();
        IERC20(s_titanxAddress).transfer(to, amount);
    }

    /** @dev Recommended method to use to send native coins.
     * @param to receiving address.
     * @param amount in wei.
     */
    function _sendViaCall(address payable to, uint256 amount) private {
        if (to == address(0)) revert Helios_InvalidAddress();
        (bool sent, ) = to.call{value: amount}("");
        if (!sent) revert Helios_FailedToSendAmount();
    }

    /** @dev reduce user's allowance for caller (spender/project) by 1 (burn 1 stake at a time)
     * Does not update the allowance amount in case of infinite allowance.
     * Revert if not enough allowance is available.
     * @param user user address
     */
    function _spendBurnStakeAllowance(address user) private {
        uint256 currentAllowance = allowanceBurnStakes(user, _msgSender());
        if (currentAllowance != type(uint256).max) {
            if (currentAllowance == 0)
                revert Helios_InsufficientBurnAllowance();
            --s_allowanceBurnStakes[user][_msgSender()];
        }
    }

    /** @dev reduce user's allowance for caller (spender/project) by 1 (burn 1 mint at a time)
     * Does not update the allowance amount in case of infinite allowance.
     * Revert if not enough allowance is available.
     * @param user user address
     */
    function _spendBurnMintAllowance(address user) private {
        uint256 currentAllowance = allowanceBurnMints(user, _msgSender());
        if (currentAllowance != type(uint256).max) {
            if (currentAllowance == 0)
                revert Helios_InsufficientBurnAllowance();
            --s_allowanceBurnMints[user][_msgSender()];
        }
    }

    //Views
    /** @dev calculate user payout reward with specified cycle day and claim type (shares/burn).
     * it loops through all the unclaimed cylce index until the latest cycle index
     * @param user user address
     * @param cycleNo cycle day 7, 25, 69, 183, 420
     * @return rewards calculated reward
     * @return ethRewards calculated reward
     * @return userClaimCycleIndex last claim cycle index
     * @return userClaimSharesIndex last claim shares index
     */
    function calculateUserCycleReward(
        address user,
        uint256 cycleNo
    )
        public
        view
        returns (
            uint256 rewards,
            uint256 ethRewards,
            uint256 userClaimCycleIndex,
            uint256 userClaimSharesIndex
        )
    {
        uint256 cycleMaxIndex = getCurrentCycleIndex(cycleNo);

        (userClaimCycleIndex, userClaimSharesIndex) = getUserLastClaimIndex(
            user,
            cycleNo
        );
        uint256 sharesMaxIndex = getUserLatestShareIndex(user);

        for (uint256 i = userClaimCycleIndex; i <= cycleMaxIndex; i++) {
            (uint256 payoutPerShare, uint256 payoutDay) = getPayoutPerShare(
                cycleNo,
                i
            );
            (uint256 ethPayoutPerShare, ) = getETHPayoutPerShare(cycleNo, i);
            uint256 shares;
            (shares, userClaimSharesIndex) = _getSharesAndUpdateIndex(
                user,
                userClaimSharesIndex,
                sharesMaxIndex,
                payoutDay
            );
            if (payoutPerShare != 0 && shares != 0) {
                //reward has 18 decimals scaling, so here divide by 1e18
                rewards += (shares * payoutPerShare) / SCALING_FACTOR_1e18;
            }

            if (ethPayoutPerShare != 0 && shares != 0) {
                ethRewards +=
                    (shares * ethPayoutPerShare) /
                    SCALING_FACTOR_1e18;
            }

            userClaimCycleIndex = i + 1;
        }
    }

    function _getSharesAndUpdateIndex(
        address user,
        uint256 userClaimSharesIndex,
        uint256 sharesMaxIndex,
        uint256 payoutDay
    ) private view returns (uint256 shares, uint256) {
        //loop shares indexes to find the last updated shares before/same triggered payout day
        for (uint256 j = userClaimSharesIndex; j <= sharesMaxIndex; j++) {
            if (getUserActiveSharesDay(user, j) <= payoutDay)
                shares = getUserActiveShares(user, j);
            else break;

            userClaimSharesIndex = j;
        }
        return (shares, userClaimSharesIndex);
    }

    /** @notice get contract ETH balance
     * @return balance eth balance
     */
    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    /** @notice get genesis Wallet Address
     * @return address
     */
    function getGenesisAddress() public view returns (address) {
        return s_genesisAddress;
    }

    /** @notice get Investment Address
     * @return address
     */
    function getInvestmentAddress() public view returns (address) {
        return s_investmentAddress;
    }

    /** @notice check if address is whitelisted
     * @return bool
     */
    function isWhiteListed(address contractAddress) public view returns (bool) {
        return s_whiteList[contractAddress];
    }

    /** @notice get total TitanX burned by user using this contract
     * @return total titan burned
     */
    function getTotalTitanXBurned() public view returns (uint256) {
        return s_totalTitanBurned;
    }

    /** @notice get contract TitanX balance
     * @return balance TitanX balance
     */
    function getTitanXBalance() public view returns (uint256) {
        return IERC20(s_titanxAddress).balanceOf(address(this));
    }

    /** @notice get contract Hlx balance
     * @return balance Hlx balance
     */
    function getHlxBalance() public view returns (uint256) {
        return balanceOf(address(this));
    }

    /** @notice get undistributed TitanX balance
     * @return amount titanX amount
     */
    function getUndistributedTitanX() public view returns (uint256) {
        return s_undistributedTitanX;
    }

    /** @notice get undistributed ETH balance
     * @return amount ETH
     */
    function getUndistributedETH() public view returns (uint256) {
        return s_undistributedETH;
    }

    /** @notice get estimated Hlx at end of miner
     * @return amount of hlx
     */
    function getMintableHlx(
        uint256 mintPower,
        uint256 numOfDays,
        uint256 titanToBurn,
        address user
    ) public view returns (uint256) {
        uint256 mintCost = getMintCost(mintPower, getCurrentMintCost());

        uint256 percentage = _calculateBonusPercentage(titanToBurn, mintCost);

        return
            calculateMintReward(
                mintPower,
                numOfDays,
                getCurrentMintableHlx(),
                getCurrentEAABonus(),
                getUserBurnAmplifierBonus(user),
                percentage
            );
    }

    /** @notice get estimated shares
     */
    function estimateShares(
        uint256 amount,
        uint256 numOfDays
    )
        public
        view
        returns (uint256 sharesWithBonus, uint256 sharesWithoutBonus)
    {
        uint256 shareRate = getCurrentShareRate();

        sharesWithBonus = calculateShares(amount, numOfDays, shareRate);

        sharesWithoutBonus = amount / (shareRate / SCALING_FACTOR_1e18);
    }

    /** @notice calculate share bonus
     * @return shareBonus calculated shares bonus in 11 decimals
     */
    function getShareBonus(uint256 noOfDays) public pure returns (uint256) {
        return calculateShareBonus(noOfDays);
    }

    /** @notice get user TitanX payout for all cycles
     * @param user user address
     * @return reward total reward
     */
    function getUserTitanXClaimableTotal(
        address user
    ) public view returns (uint256 reward) {
        uint256 _reward;

        (_reward, , , ) = calculateUserCycleReward(user, DAY22);
        reward += _reward;
        (_reward, , , ) = calculateUserCycleReward(user, DAY69);
        reward += _reward;
        (_reward, , , ) = calculateUserCycleReward(user, DAY420);
        reward += _reward;
    }

    /** @notice get user ETH payout for all cycles
     * @param user user address
     * @return reward total reward
     */
    function getUserETHClaimableTotal(
        address user
    ) public view returns (uint256 reward) {
        uint256 _reward;
        (, _reward, , ) = calculateUserCycleReward(user, DAY22);
        reward += _reward;
        (, _reward, , ) = calculateUserCycleReward(user, DAY69);
        reward += _reward;
        (, _reward, , ) = calculateUserCycleReward(user, DAY420);
        reward += _reward;
    }

    /** @notice get total penalties from mint and stake
     * @return amount total penalties
     */
    function getTotalPenalties() public view returns (uint256) {
        return getTotalMintPenalty() + getTotalStakePenalty();
    }

    /** @notice returns user's burn stakes allowance of a project
     * @param user user address
     * @param spender project address
     */
    function allowanceBurnStakes(
        address user,
        address spender
    ) public view returns (uint256) {
        return s_allowanceBurnStakes[user][spender];
    }

    /** @notice returns user's burn mints allowance of a project
     * @param user user address
     * @param spender project address
     */
    function allowanceBurnMints(
        address user,
        address spender
    ) public view returns (uint256) {
        return s_allowanceBurnMints[user][spender];
    }

    /** @notice Burn Helios tokens and creates Proof-Of-Burn record to be used by connected DeFi and fee is paid to specified address
     * @param user user address
     * @param amount helios amount
     * @param userRebatePercentage percentage for user rebate in liquid helios (0 - 8)
     * @param rewardPaybackPercentage percentage for builder fee in liquid helios (0 - 8)
     * @param rewardPaybackAddress builder can opt to receive fee in another address
     */
    function burnTokensToPayAddress(
        address user,
        uint256 amount,
        uint256 userRebatePercentage,
        uint256 rewardPaybackPercentage,
        address rewardPaybackAddress
    ) public dailyUpdate nonReentrant {
        _burnLiquidHlx(
            user,
            amount,
            userRebatePercentage,
            rewardPaybackPercentage,
            rewardPaybackAddress
        );
    }

    /** @notice Burn Hlx tokens and creates Proof-Of-Burn record to be used by connected DeFi and fee is paid to specified address
     * @param user user address
     * @param amount helios amount
     * @param userRebatePercentage percentage for user rebate in liquid helios (0 - 8)
     * @param rewardPaybackPercentage percentage for builder fee in liquid helios (0 - 8)
     */
    function burnTokens(
        address user,
        uint256 amount,
        uint256 userRebatePercentage,
        uint256 rewardPaybackPercentage
    ) public dailyUpdate nonReentrant {
        _burnLiquidHlx(
            user,
            amount,
            userRebatePercentage,
            rewardPaybackPercentage,
            _msgSender()
        );
    }

    /** @notice receive eth */
    receive() external payable {
        if (msg.value > 0) {
            s_undistributedETH += msg.value;
        }
    }

    /** @notice allows user to burn liquid helios directly from contract
     * @param amount helios amount
     */
    function userBurnTokens(uint256 amount) public dailyUpdate nonReentrant {
        if (amount == 0) revert Helios_InvalidAmount();
        if (balanceOf(_msgSender()) < amount)
            revert Helios_InsufficientBalance();
        _burn(_msgSender(), amount);
        _updateBurnAmount(_msgSender(), address(0), amount, BurnSource.LIQUID);
    }

    /** @notice Burn stake and creates Proof-Of-Burn record to be used by connected DeFi and fee is paid to specified address
     * @param user user address
     * @param id stake id
     * @param userRebatePercentage percentage for user rebate in liquid helios (0 - 8)
     * @param rewardPaybackPercentage percentage for builder fee in liquid helios (0 - 8)
     * @param rewardPaybackAddress builder can opt to receive fee in another address
     */
    function burnStakeToPayAddress(
        address user,
        uint256 id,
        uint256 userRebatePercentage,
        uint256 rewardPaybackPercentage,
        address rewardPaybackAddress
    ) public dailyUpdate nonReentrant {
        _burnStake(
            user,
            id,
            userRebatePercentage,
            rewardPaybackPercentage,
            rewardPaybackAddress
        );
    }

    /** @notice Burn stake and creates Proof-Of-Burn record to be used by connected DeFi and fee is paid to project contract address
     * @param user user address
     * @param id stake id
     * @param userRebatePercentage percentage for user rebate in liquid helios (0 - 8)
     * @param rewardPaybackPercentage percentage for builder fee in liquid helios (0 - 8)
     */
    function burnStake(
        address user,
        uint256 id,
        uint256 userRebatePercentage,
        uint256 rewardPaybackPercentage
    ) public dailyUpdate nonReentrant {
        _burnStake(
            user,
            id,
            userRebatePercentage,
            rewardPaybackPercentage,
            _msgSender()
        );
    }

    /** @notice allows user to burn stake directly from contract
     * @param id stake id
     */
    function userBurnStake(uint256 id) public dailyUpdate nonReentrant {
        _updateBurnAmount(
            _msgSender(),
            address(0),
            _endStake(
                _msgSender(),
                id,
                getCurrentContractDay(),
                StakeAction.BURN,
                StakeAction.END_OWN,
                getGlobalPayoutTriggered()
            ),
            BurnSource.STAKE
        );
    }

    /** @notice Burn mint and creates Proof-Of-Burn record to be used by connected DeFi.
     * Burn mint has no project reward or user rebate
     * @param user user address
     * @param id mint id
     */
    function burnMint(
        address user,
        uint256 id
    ) public dailyUpdate nonReentrant {
        _burnMint(user, id);
    }

    /** @notice allows user to burn mint directly from contract
     * @param id mint id
     */
    function userBurnMint(uint256 id) public dailyUpdate nonReentrant {
        _updateBurnAmount(
            _msgSender(),
            address(0),
            _claimMint(_msgSender(), id, MintAction.BURN),
            BurnSource.MINT
        );
    }

    /** @notice Sets `amount` as the allowance of `spender` over the caller's (user) mints.
     * @param spender contract address
     * @param amount allowance amount
     */
    function approveBurnMints(
        address spender,
        uint256 amount
    ) public returns (bool) {
        if (spender == address(0)) revert Helios_InvalidAddress();
        s_allowanceBurnMints[_msgSender()][spender] = amount;
        emit ApproveBurnMints(_msgSender(), spender, amount);
        return true;
    }

    /** @notice Sets `amount` as the allowance of `spender` over the caller's (user) stakes.
     * @param spender contract address
     * @param amount allowance amount
     */
    function approveBurnStakes(
        address spender,
        uint256 amount
    ) public returns (bool) {
        if (spender == address(0)) revert Helios_InvalidAddress();
        s_allowanceBurnStakes[_msgSender()][spender] = amount;
        emit ApproveBurnStakes(_msgSender(), spender, amount);
        return true;
    }
}
