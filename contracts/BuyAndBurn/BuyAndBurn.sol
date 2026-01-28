// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.7.6;
pragma abicoder v2;

import "./openzeppelin/security/ReentrancyGuard.sol";

import "./libs/Constant.sol";
import "./libs/PoolAddress.sol";
import "./libs/CallbackValidation.sol";
import "./libs/TransferHelper.sol";

import "./interfaces/IWETH9.sol";
import "./interfaces/IHELIOS.sol";
import "./interfaces/INonfungiblePositionManager.sol";
import "./interfaces/ITITANX.sol";
import "./interfaces/IHELIOS.sol";
import "hardhat/console.sol";

import "@uniswap/v3-core/contracts/libraries/TickMath.sol";
import "@uniswap/v3-periphery/contracts/libraries/OracleLibrary.sol";

contract BuyAndBurn is ReentrancyGuard {
    /** @dev Hlx Token Contract Address */
    address private s_hlxAddress;

    /** @dev Hlx/TitanX Pool Contract Address */
    address private s_poolAddress;

    /** @dev is initial LP created */
    InitialLPCreated private s_initialLiquidityCreated;

    /** @dev genesis timestamp */
    uint256 private immutable i_genesisTs;

    /** @dev owner address */
    address private s_ownerAddress;

    /** @dev Flag for lp and burn */
    bool private s_addLiquidity;

    /** @dev tracks total weth used for buyandburn */
    uint256 private s_totalWethBuyAndBurn;

    /** @dev tracks total titanX used for buyandburn */
    uint256 private s_totalTitanXBuyAndBurn;

    /** @dev tracks Helios burned through buyandburn */
    uint256 private s_totalHlxBuyAndBurn;

    /**
     * @dev Specifies the value in minutes for the timed-weighted average when calculating the price
     */
    uint32 private _minutesTwa;

    /** @dev tracks total hlx burned from fees */
    uint256 private s_totalHlxFeesBurn;

    /** @dev tracks collect fees (titanx) for buyandburn */
    uint256 private s_feesTitanXBuyAndBurn;

    /** @dev tracks current per swap cap */
    uint256 private s_capPerSwap;

    /** @dev tracks current minimum Cap ETH per swap cap */
    uint256 private s_capPerSwapETH;

    /** @dev tracks timestamp of the last buynburn was called */
    uint256 private s_lastCallTs;

    /** @dev tracks timestamp of the last ETH buynburn was called */
    uint256 private s_ethLastCallTs;

    /** @dev slippage amount between 1 - 15 */
    uint256 private s_slippage;

    /** @dev buynburn interval in seconds */
    uint256 private s_interval;

    /** @dev ETH swap interval in seconds */
    uint256 private s_ethInterval;

    /** @dev store position token info, only one full range position */
    TokenInfo private s_tokenInfo;

    //structs
    struct TokenInfo {
        uint80 tokenId;
        uint256 liquidity;
        int24 tickLower;
        int24 tickUpper;
    }

    event BoughtAndBurned(
        uint256 indexed titanx,
        uint256 indexed hlx,
        address indexed caller
    );
    event CollectedFees(
        uint256 indexed titanx,
        uint256 indexed hlx,
        address indexed caller
    );

    constructor() {
        i_genesisTs = block.timestamp;
        s_ownerAddress = msg.sender;
        s_capPerSwap = 50_000_000 ether;
        s_capPerSwapETH = 0.01 ether;
        s_slippage = 5;
        s_interval = 60 minutes;
        s_ethInterval = 60 minutes;
        s_addLiquidity = true;
        _minutesTwa = 15;
    }

    /** @notice receive eth and convert all eth into weth */
    receive() external payable {
        //prevent ETH withdrawal received from WETH contract into deposit function
        if (msg.sender != WETH9) IWETH9(WETH9).deposit{value: msg.value}();
    }

    /** @notice remove owner */
    function renounceOwnership() public {
        require(msg.sender == s_ownerAddress, "InvalidCaller");
        s_ownerAddress = address(0);
    }

    /** @notice change flag */
    function addLiquidity() public {
        require(msg.sender == s_ownerAddress, "InvalidCaller");
        s_addLiquidity = !s_addLiquidity;
    }

    /** @notice set new owner address. Only callable by owner address.
     * @param ownerAddress new owner address
     */
    function setOwnerAddress(address ownerAddress) external {
        require(msg.sender == s_ownerAddress, "InvalidCaller");
        require(ownerAddress != address(0), "InvalidAddress");
        s_ownerAddress = ownerAddress;
    }

    /** @notice set hlx token address. Only callable by owner address.
     * @param hlxAddress new owner address
     */
    function setHlxAddress(address hlxAddress) external {
        require(msg.sender == s_ownerAddress, "InvalidCaller");
        require(hlxAddress != address(0), "InvalidAddress");
        s_hlxAddress = hlxAddress;
    }

    /** @notice set Hlx/Titanx pool address. Only callable by owner address.
     * @param poolAddress new owner address
     */
    function setHlxTitanPoolAddress(address poolAddress) external {
        require(msg.sender == s_ownerAddress, "InvalidCaller");
        require(poolAddress != address(0), "InvalidAddress");
        s_poolAddress = poolAddress;
    }

    /**
     * @notice set TitanX cap amount per buynburn call. Only callable by owner address.
     * @param amount amount in 18 decimals
     */
    function setCapPerSwap(uint256 amount) external {
        require(msg.sender == s_ownerAddress, "InvalidCaller");
        s_capPerSwap = amount;
    }

    /**
     * @notice set ETH cap amount per buynburn call. Only callable by owner address.
     * @param amount amount in 18 decimals
     */
    function setETHCapPerSwap(uint256 amount) external {
        require(msg.sender == s_ownerAddress, "InvalidCaller");
        s_capPerSwapETH = amount;
    }

    /**
     * @notice set slippage % for buynburn minimum received amount. Only callable by owner address.
     * @param amount amount from 0 - 50
     */
    function setSlippage(uint256 amount) external {
        require(msg.sender == s_ownerAddress, "InvalidCaller");
        require(amount >= 1 && amount <= 15, "1-15_Only");
        s_slippage = amount;
    }

    /**
     * @notice set buynburn call interval in seconds. Only callable by owner address.
     * @param secs amount in seconds
     */
    function setBuynBurnInterval(uint256 secs) external {
        require(msg.sender == s_ownerAddress, "InvalidCaller");
        require(
            secs >= MIN_INTERVAL_SECONDS && secs <= MAX_INTERVAL_SECONDS,
            "1m-12h_Only"
        );
        s_interval = secs;
    }

    /**
     * @notice set the TWA value in Minutes. Only callable by owner address.
     * @param mins TWA in minutes
     */
    function setMinutesTwa(uint32 mins) external {
        require(msg.sender == s_ownerAddress, "InvalidCaller");
        require(mins >= 5 && mins <= 60, "5m-1h only");
        _minutesTwa = mins;
    }

    /**
     * @notice set ETHbuynburn call interval in seconds. Only callable by owner address.
     * @param secs amount in seconds
     */
    function setETHBuynBurnInterval(uint256 secs) external {
        require(msg.sender == s_ownerAddress, "InvalidCaller");
        require(
            secs >= MIN_INTERVAL_SECONDS && secs <= MAX_INTERVAL_SECONDS,
            "1m-12h_Only"
        );
        s_ethInterval = secs;
    }

    /** @notice burn all Helios in BuyAndBurn address */
    function burnLPHelios() public {
        IHELIOS(s_hlxAddress).burnLPTokens();
    }

    /** @notice One-time function to create initial pool to initialize with the desired price ratio.
     * To avoid being front run, must call this function right after contract is deployed and HLX address is set.
     */
    function createInitialPool() public {
        require(s_poolAddress == address(0), "PoolHasCreated");
        require(s_hlxAddress != address(0), "InvalidHlxAddress");
        _createPool();
    }

    /** @notice One-time function to create initial liquidity pool. Require TitanX to execute. */
    function createInitialLiquidity() public {
        require(s_poolAddress != address(0), "NoPoolExists");
        if (s_initialLiquidityCreated == InitialLPCreated.YES) return;
        require(
            ITITANX(TITANX).balanceOf(address(this)) >= INITIAL_LP_TITAN,
            "Need More TitanX"
        );

        s_initialLiquidityCreated = InitialLPCreated.YES;

        // Approve the position manager
        TransferHelper.safeApprove(
            s_hlxAddress,
            NONFUNGIBLEPOSITIONMANAGER,
            type(uint256).max
        );
        TransferHelper.safeApprove(
            TITANX,
            NONFUNGIBLEPOSITIONMANAGER,
            type(uint256).max
        );

        IHELIOS(s_hlxAddress).mintLPTokens();

        _mintPosition();
    }

    /** @notice buy and burn Helios from uniswap pool */
    function buynBurn() public nonReentrant {
        //prevent contract accounts (bots) from calling this function
        require(msg.sender == tx.origin, "InvalidCaller");

        require(
            s_initialLiquidityCreated == InitialLPCreated.YES,
            "NeedInitialLP"
        );
        //a minium gap of 1 min between each call
        require(block.timestamp - s_lastCallTs > s_interval, "IntervalWait");
        s_lastCallTs = block.timestamp;
        uint256 titanAmount = getTitanXBalance(address(this));

        uint256 titanCap = s_capPerSwap;
        uint256 wethBalance = getWethBalance();
        if (
            titanAmount < titanCap &&
            wethBalance > 0 &&
            (block.timestamp - s_ethLastCallTs) > s_ethInterval
        ) {
            s_ethLastCallTs = block.timestamp;
            if (wethBalance > s_capPerSwapETH) wethBalance = s_capPerSwapETH;
            // Swap ETH to TitanX to reach the cap
            _swapTokens(WETH9, TITANX, wethBalance);

            // Update the titanAmount to the current balance
            titanAmount = getTitanXBalance(address(this));
        }

        require(titanAmount != 0, "NoAvailableFunds");

        if (titanAmount > titanCap) titanAmount = titanCap;

        uint256 incentiveFee = (titanAmount * INCENTIVE_FEE) /
            INCENTIVE_FEE_PERCENT_BASE;

        titanAmount -= incentiveFee;
        _swapTokens(TITANX, s_hlxAddress, titanAmount);
        TransferHelper.safeTransfer(TITANX, msg.sender, incentiveFee);
    }

    /** @notice Used by uniswapV3. Modified from uniswapV3 swap callback function to complete the swap */
    function uniswapV3SwapCallback(
        int256 amount0Delta,
        int256 amount1Delta,
        bytes calldata
    ) external {
        require(amount0Delta > 0 || amount1Delta > 0, "Invalid Swap"); // swaps entirely within 0-liquidity regions are not supported

        if (msg.sender == TITANX_WETH_POOL) {
            IUniswapV3Pool pool = CallbackValidation.verifyCallback(
                UNISWAPV3FACTORY,
                WETH9,
                TITANX,
                POOLFEE1PERCENT
            );
            require(address(pool) == TITANX_WETH_POOL, "WrongPool");

            TransferHelper.safeTransfer(
                WETH9,
                msg.sender,
                amount0Delta > 0 ? uint256(amount0Delta) : uint256(amount1Delta)
            );
            s_totalWethBuyAndBurn += amount0Delta > 0
                ? uint256(amount0Delta)
                : uint256(amount1Delta);
        } else if (msg.sender == s_poolAddress) {
            IUniswapV3Pool pool = CallbackValidation.verifyCallback(
                UNISWAPV3FACTORY,
                TITANX,
                s_hlxAddress,
                POOLFEE1PERCENT
            );

            require(address(pool) == s_poolAddress, "WrongPool");

            TransferHelper.safeTransfer(
                TITANX,
                msg.sender,
                amount0Delta > 0 ? uint256(amount0Delta) : uint256(amount1Delta)
            );

            s_totalTitanXBuyAndBurn += amount0Delta > 0
                ? uint256(amount0Delta)
                : uint256(amount1Delta);
        } else {
            // Unknown pool, revert the transasction
            revert("UnknownPool");
        }
    }

    /** @notice collect fees from LP */
    function collectFees() public nonReentrant {
        (uint256 amount0, uint256 amount1) = _collectFees();
        uint256 helios;
        uint256 titan;
        if (TITANX < s_hlxAddress) {
            titan = uint256(amount0 >= 0 ? amount0 : -amount0);
            helios = uint256(amount1 >= 0 ? amount1 : -amount1);
        } else {
            helios = uint256(amount0 >= 0 ? amount0 : -amount0);
            titan = uint256(amount1 >= 0 ? amount1 : -amount1);
        }

        if (s_addLiquidity) {
            uint256 price = getCurrentTitanPrice();
            if (helios != 0 && titan != 0) {
                if (TITANX < s_hlxAddress) {
                    _increaseLiquidityCurrentRange(titan, helios, price);
                } else {
                    _increaseLiquidityCurrentRange(
                        helios,
                        titan,
                        ((1 ether * 1 ether) / price)
                    );
                }
            }
        } else {
            burnLPHelios();
        }

        s_totalHlxFeesBurn += helios;
        s_feesTitanXBuyAndBurn += titan;

        emit CollectedFees(titan, helios, msg.sender);
    }

    // ==================== Private Functions =======================================

    /** @dev sort tokens in ascending order, that's how uniswap identify the pair
     * @return token0 token address that is digitally smaller than token1
     * @return token1 token address that is digitally larger than token0
     * @return amount0 LP amount for token0
     * @return amount1 LP amount for token1
     */
    function _getTokensConfig()
        private
        view
        returns (
            address token0,
            address token1,
            uint256 amount0,
            uint256 amount1
        )
    {
        token0 = TITANX;
        token1 = s_hlxAddress;
        amount0 = INITIAL_LP_TITAN;
        amount1 = INITIAL_LP_HLX;
        if (s_hlxAddress < TITANX) {
            token0 = s_hlxAddress;
            token1 = TITANX;
            amount0 = INITIAL_LP_HLX;
            amount1 = INITIAL_LP_TITAN;
        }
    }

    /** @dev create pool with the preset sqrt price ratio */
    function _createPool() private {
        (address token0, address token1, , ) = _getTokensConfig();
        s_poolAddress = INonfungiblePositionManager(NONFUNGIBLEPOSITIONMANAGER)
            .createAndInitializePoolIfNecessary(
                token0,
                token1,
                POOLFEE1PERCENT,
                TITANX < s_hlxAddress
                    ? INITIAL_SQRTPRICE_TITANX_HLX
                    : INITIAL_SQRTPRICE_HLX_TITANX
            );
    }

    /** @dev mint full range LP token */
    function _mintPosition() private {
        (
            address token0,
            address token1,
            uint256 amount0Desired,
            uint256 amount1Desired
        ) = _getTokensConfig();

        INonfungiblePositionManager.MintParams
            memory params = INonfungiblePositionManager.MintParams({
                token0: token0,
                token1: token1,
                fee: POOLFEE1PERCENT,
                tickLower: MIN_TICK,
                tickUpper: MAX_TICK,
                amount0Desired: amount0Desired,
                amount1Desired: amount1Desired,
                amount0Min: (amount0Desired * 90) / 100,
                amount1Min: (amount1Desired * 90) / 100,
                recipient: address(this),
                deadline: block.timestamp + 600
            });

        (uint256 tokenId, uint256 liquidity, , ) = INonfungiblePositionManager(
            NONFUNGIBLEPOSITIONMANAGER
        ).mint(params);

        s_tokenInfo.tokenId = uint80(tokenId);
        s_tokenInfo.liquidity = liquidity;
        s_tokenInfo.tickLower = MIN_TICK;
        s_tokenInfo.tickUpper = MAX_TICK;
    }

    /**
     * @dev Increases liquidity in the current price range of the Uniswap V3 pool.
     * This function calculates the amounts of each token to add to the pool,
     * keeping the ratio consistent with the current pool price.
     *
     * @param amount0Collected The amount of token0 collected as fees.
     * @param amount1Collected The amount of token1 collected as fees.
     * @param price The current price of token1 in terms of token0.
     */
    function _increaseLiquidityCurrentRange(
        uint256 amount0Collected,
        uint256 amount1Collected,
        uint256 price
    ) private {
        // Calculate desired amounts of each token to maintain the price ratio
        uint256 desiredAmount0 = FullMath.mulDiv(amount1Collected, price, 1e18);
        uint256 desiredAmount1 = FullMath.mulDiv(amount0Collected, 1e18, price);

        // Determine the actual amounts to add, which are the lesser of the
        // collected amounts and the desired amounts
        uint256 amount0ToAdd = amount0Collected < desiredAmount0
            ? amount0Collected
            : desiredAmount0;
        uint256 amount1ToAdd = amount1Collected < desiredAmount1
            ? amount1Collected
            : desiredAmount1;

        // Create parameters for increasing liquidity
        INonfungiblePositionManager.IncreaseLiquidityParams
            memory params = INonfungiblePositionManager
                .IncreaseLiquidityParams({
                    tokenId: s_tokenInfo.tokenId,
                    amount0Desired: amount0ToAdd,
                    amount1Desired: amount1ToAdd,
                    amount0Min: (amount0ToAdd * 90) / 100,
                    amount1Min: (amount1ToAdd * 90) / 100,
                    deadline: block.timestamp + 600
                });

        // Call Uniswap V3's increaseLiquidity function to add liquidity
        (uint256 liquidity, , ) = INonfungiblePositionManager(
            NONFUNGIBLEPOSITIONMANAGER
        ).increaseLiquidity(params);

        // update the stored liquidity amount
        s_tokenInfo.liquidity += liquidity;
    }

    /**
     * @dev Generic function to swap tokens on Uniswap and perform additional actions
     * @param fromToken Address of the source token
     * @param toToken Address of the destination token
     * @param amount Amount of tokens to swap
     */
    function _swapTokens(
        address fromToken,
        address toToken,
        uint256 amount
    ) private {
        // Calculate minimum amount for slippage protection
        uint256 minTokenAmount = ((amount * 1 ether * (100 - s_slippage)) /
            (
                fromToken == WETH9
                    ? getCurrentEthPrice()
                    : getCurrentTitanPrice()
            )) / 100;

        // Get the corresponding Uniswap pool address
        address pool = fromToken == WETH9 ? TITANX_WETH_POOL : s_poolAddress;

        // Swap tokens on Uniswap
        (int256 amount0, int256 amount1) = IUniswapV3Pool(pool).swap(
            address(this),
            fromToken < toToken,
            int256(amount),
            fromToken < toToken ? MIN_SQRT_RATIO + 1 : MAX_SQRT_RATIO - 1,
            ""
        );

        // Get the actual swapped amount
        uint256 swappedAmount = fromToken < toToken
            ? uint256(amount1 >= 0 ? amount1 : -amount1)
            : uint256(amount0 >= 0 ? amount0 : -amount0);

        // Slippage protection check
        require(swappedAmount >= minTokenAmount, "TooLittleReceived");

        // If destination token is HLX, burn the LP tokens
        if (toToken == s_hlxAddress) {
            uint256 hlxBalance = getHlxBalance();
            uint256 hlxBurnAmount = hlxBalance > swappedAmount
                ? swappedAmount
                : hlxBalance;
            s_totalHlxBuyAndBurn += hlxBurnAmount;
            burnLPHelios();
            emit BoughtAndBurned(amount, hlxBurnAmount, msg.sender);
        }
    }

    /** @dev call uniswapv3 collect funtion to collect LP fees
     * @return amount0 token0 amount
     * @return amount1 token1 amount
     */
    function _collectFees() private returns (uint256 amount0, uint256 amount1) {
        INonfungiblePositionManager.CollectParams
            memory params = INonfungiblePositionManager.CollectParams(
                s_tokenInfo.tokenId,
                address(this),
                type(uint128).max,
                type(uint128).max
            );
        (amount0, amount1) = INonfungiblePositionManager(
            NONFUNGIBLEPOSITIONMANAGER
        ).collect(params);
    }

    //views
    /** @notice get Helios TitanX pool address
     * @return address Helios TitanX pool address
     */
    function getPoolAddress() public view returns (address) {
        return s_poolAddress;
    }

    /** @notice flag that if true add liqudity from fees if false
     * @return bool
     */
    function getAddLiquidity() public view returns (bool) {
        return s_addLiquidity;
    }

    /** @notice getlast timestamp when BuynBurn is called
     * @return uint256 timestamp
     */
    function getlastBuynBurnCall() public view returns (uint256) {
        return s_lastCallTs;
    }

    //views
    /** @notice get TitanX weth pool address
     * @return address TitanX weth pool address
     */
    function getTitanXPoolAddress() public pure returns (address) {
        return TITANX_WETH_POOL;
    }

    /** @notice get contract ETH balance
     * @return balance contract ETH balance
     */
    function getWethBalance() public view returns (uint256) {
        return IWETH9(WETH9).balanceOf(address(this));
    }

    /** @notice get WETH balance for speciifed address
     * @param account address
     * @return balance WETH balance
     */
    function getWethBalance(address account) public view returns (uint256) {
        return IWETH9(WETH9).balanceOf(account);
    }

    /** @notice get Helios Balance for BuyAndBurn Contract
     */
    function getHlxBalance() public view returns (uint256) {
        return IHELIOS(s_hlxAddress).balanceOf(address(this));
    }

    /** @notice get Helios balance for speicifed address
     * @param account address
     */
    function getHlxBalance(address account) public view returns (uint256) {
        return IHELIOS(s_hlxAddress).balanceOf(account);
    }

    /** @notice get TitanX balance for speicifed address
     * @param account address
     */
    function getTitanXBalance(address account) public view returns (uint256) {
        return ITITANX(TITANX).balanceOf(account);
    }

    /** @notice get TitanX balance for BuyAndBurn Contract
     */
    function getTitanXBalance() public view returns (uint256) {
        return ITITANX(TITANX).balanceOf(address(this));
    }

    /** @notice get current sqrt price
     * @return sqrtPrice sqrt Price X96
     */
    function getCurrentSqrtPriceX96() public view returns (uint160) {
        IUniswapV3Pool pool = IUniswapV3Pool(s_poolAddress);
        (uint160 sqrtPriceX96, , , , , , ) = pool.slot0();
        return sqrtPriceX96;
    }

    /** @notice get current Titan price TitanX/HLX
     * @return TitanX price
     */
    function getCurrentTitanPrice() public view returns (uint256) {
        uint256 sqrtPriceX96 = getSqrtPriceX96(s_poolAddress);
        uint256 numerator1 = sqrtPriceX96 * sqrtPriceX96;
        uint256 numerator2 = 10 ** 18;
        uint256 price = FullMath.mulDiv(numerator1, numerator2, 1 << 192);
        price = TITANX < s_hlxAddress ? (1 ether * 1 ether) / price : price;

        return price;
    }

    /** @notice get current eth price
     * @return ethPrice eth price
     */
    function getCurrentEthPrice() public view returns (uint256) {
        uint256 sqrtPriceX96 = getSqrtPriceX96(TITANX_WETH_POOL);
        uint256 numerator1 = sqrtPriceX96 * sqrtPriceX96;
        uint256 numerator2 = 10 ** 18;
        uint256 price = FullMath.mulDiv(numerator1, numerator2, 1 << 192);
        price = WETH9 < TITANX ? (1 ether * 1 ether) / price : price;
        return price;
    }

    function getSqrtPriceX96(
        address poolAddress
    ) public view returns (uint160 sqrtPriceX96) {
        uint32 secondsAgo = _minutesTwa * 60;
        uint32 oldestObservation = OracleLibrary.getOldestObservationSecondsAgo(
            poolAddress
        );

        if (oldestObservation < secondsAgo) {
            secondsAgo = oldestObservation;
        }

        if (secondsAgo == 0) {
            IUniswapV3Pool pool = IUniswapV3Pool(poolAddress);
            (sqrtPriceX96, , , , , , ) = pool.slot0();
        } else {
            (int24 arithmeticMeanTick, ) = OracleLibrary.consult(
                poolAddress,
                secondsAgo
            );
            sqrtPriceX96 = TickMath.getSqrtRatioAtTick(arithmeticMeanTick);
        }

        return sqrtPriceX96;
    }

    /** @notice get Titanx cap amount per buy and burn
     * @return cap amount
     */
    function getBuyAndBurnCap() public view returns (uint256) {
        return s_capPerSwap;
    }

    /** @notice get  ETH cap amount per buy and burn
     * @return cap amount
     */
    function getWethBuyAndBurnCap() public view returns (uint256) {
        return s_capPerSwapETH;
    }

    /** @notice get buynburn slippage
     * @return slippage
     */
    function getSlippage() public view returns (uint256) {
        return s_slippage;
    }

    /** @notice get the buynburn interval between each call in seconds
     * @return seconds
     */
    function getBuynBurnInterval() public view returns (uint256) {
        return s_interval;
    }

    /** @notice get the buynburn ETH interval between each call in seconds
     * @return seconds
     */
    function getBuynBurnEthInterval() public view returns (uint256) {
        return s_ethInterval;
    }

    /**
     * @return return the total supply
     */
    function totalHeliosLiquidSupply() public view returns (uint256) {
        return IHELIOS(s_hlxAddress).totalSupply();
    }

    // ==================== BuyAndBurn Getters =======================================
    /** @notice get buy and burn funds
     * @return amount TitanX amount
     */
    function getBuyAndBurnFunds() public view returns (uint256) {
        return getTitanXBalance(address(this));
    }

    /** @notice get total TitanX amount used to buy and burn
     * @return amount total TitanX amount
     */
    function getTotalTitanXBuyAndBurn() public view returns (uint256) {
        return s_totalTitanXBuyAndBurn;
    }

    /** @notice get total Helios amount burned from all buy and burn
     * @return amount total Helios amount
     */
    function getTotalHelioBuyAndBurn() public view returns (uint256) {
        return s_totalHlxBuyAndBurn;
    }

    /** @notice get buy and burn funds from TitanX fees only
     * @return amount TitanX amount
     */
    function getTitanXFeesBuyAndBurnFunds() public view returns (uint256) {
        return s_feesTitanXBuyAndBurn;
    }

    /** @notice get burned HLX from fees
     * @return amount HLX amount
     */
    function getHlxFeesBuyAndBurnFunds() public view returns (uint256) {
        return s_totalHlxFeesBurn;
    }

    /** @notice get LP token info
     * @return tokenId tokenId
     * @return liquidity liquidity
     * @return tickLower tickLower
     * @return tickUpper tickUpper
     */
    function getTokenInfo()
        public
        view
        returns (
            uint256 tokenId,
            uint256 liquidity,
            int24 tickLower,
            int24 tickUpper
        )
    {
        return (
            s_tokenInfo.tokenId,
            s_tokenInfo.liquidity,
            s_tokenInfo.tickLower,
            s_tokenInfo.tickUpper
        );
    }

    /** @notice get LP token URI
     * @return uri URI
     */
    function getTokenURI() public view returns (string memory) {
        return
            INonfungiblePositionManager(NONFUNGIBLEPOSITIONMANAGER).tokenURI(1);
    }
}
