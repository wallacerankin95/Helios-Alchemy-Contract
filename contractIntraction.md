# Helios Contract 

### Minting Tokens
- **Function**: `startMint(uint256 mintPower, uint256 numOfDays, uint256 titanToBurn)`
- **Purpose**: To start a new minting process.
- **Arguments**:
  - `mintPower`: The minting power, maximum 100,000.
  - `numOfDays`: The duration of the mint, maximum 250 days.
  - `titanToBurn`: TitanX tokens to burn to receive up to 10% more Helios tokens as a burn reward.
- **Minting Fee**: Paid in TitanX tokens.

### Claiming Mints
- **Function**: `claimMint(uint256 id)`
- **Purpose**: To claim minted tokens after the minting period ends.
- **Arguments**:
  - `id`: The ID of the mint.

### Staking Tokens
- **Function**: `startStake(uint256 amount, uint256 numOfDays, uint256 titanToBurn)`
- **Purpose**: To start a new staking process.
- **Arguments**:
  - `amount`: The amount of Helios tokens to stake.
  - `numOfDays`: The duration of the stake, maximum 830 days.
  - `titanToBurn`: TitanX tokens to burn to receive up to 10% more rewards.

### Ending a Stake
- **Function**: `endStake(uint256 id)`
- **Purpose**: To end an active stake and claim the staking rewards.
- **Arguments**:
  - `id`: The ID of the stake.

### Ending a Stake for Others
- **Function**: `endStakeForOthers(address user, uint256 id)`
- **Purpose**: To end a stake on behalf of another user and claim the staking rewards for them.
- **Arguments**:
  - `user`: The wallet address of the user for whom the stake is being ended.
  - `id`: The ID of the stake.

### Distributing TitanX Rewards
- **Function**: `distributeTitanX()`
- **Purpose**: To distribute collected TitanX tokens as rewards. Can be called by anyone.
- **Rewards**:
  - Incentive fee in ETH for the calling user.
  - Distribution of collected TitanX tokens.

Thank you for pointing that out. Let's include the `triggerPayouts` function in the guide:

### Triggering Payouts
- **Function**: `triggerPayouts()`
- **Purpose**: To trigger cycle payouts for specific days (e.g., Day 22, Day 69, Day 420). This function can be called on or after the maturity day of each cycle to distribute rewards.
- **Usage**: This function should be called to trigger the distribution of rewards for specific cycle days. It is essential to call this function at the time where users have not ended their stakes so they can get rewards.

### Claiming User Payouts
- **Function**: `claimUserAvailablePayouts()`
- **Purpose**: To claim all available TitanX and ETH payouts for a user with active stakes.

### Viewing Contract Balances
- **Functions**: 
  - `getBalance()`: Returns the ETH balance of the contract.
  - `getTotalTitanXBurned()`: Returns the total TitanX burned for extra rewards.
  - `getTitanXBalance()`: Returns the TitanX balance of the Helios contract.
  - `getHlxBalance()`: Returns the Helios balance of the contract.
  - `getUndistributedTitanX()`: Returns any undistributed TitanX in the contract.

### Checking User Rewards and Penalties
- **Functions**:
  - `getUserTitanXClaimableTotal(address user)`: Returns the total TitanX payout due for a user from cycle payouts.
  - `getUserETHClaimableTotal(address user)`: Returns the total ETH payout due for a user from cycle payouts.
  - `getTotalPenalties()`: Returns the total penalties from mints and stakes.

### Allowing Burn of Stakes and Mints
- **Functions**:
  - `approveBurnMints(address spender, uint256 amount)`: Allows a user to approve another address (spender) to burn their mints.
  - `approveBurnStakes(address spender, uint256 amount)`: Allows a user to approve another address (spender) to burn their stakes.

### Burning Tokens
- **Functions**:
  - `burnTokensToPayAddress(address user, uint256 amount, uint256 userRebatePercentage, uint256 rewardPaybackPercentage, address rewardPaybackAddress)`: Allows other projects to burn HLX tokens and pay a specified address.
  - `burnTokens(address user, uint256 amount, uint256 userRebatePercentage, uint256 rewardPaybackPercentage)`: Allows other projects to burn HLX tokens.
  - `userBurnTokens(uint256 amount)`: Allows a user to burn their HLX tokens.
  - `userBurnStake(uint256 id)`: Allows a user to burn their stake.
  - `userBurnMint(uint256 id)`: Allows a user to burn their mint.


# BuyAndBurn

### Buying and Burning Helios (HLX)
- **Function**: `buynBurn()`
- **Purpose**: To buy HLX tokens using TitanX tokens collected from minting fees and/or ETH from the treasury, and then burn the bought HLX tokens.
- **Usage**: This function can be called by any user. The caller receives an incentive fee. The function converts TitanX tokens and/or ETH to HLX and then burns these HLX tokens.
- **Details**: The function swaps TitanX for HLX and also converts any ETH to TitanX before swapping for HLX. The swapped HLX tokens are then burned.

### Collecting Fees from Liquidity Pool
- **Function**: `collectFees()`
- **Purpose**: To collect fees accumulated from the provided liquidity in the TitanX/HLX pool.
- **Usage**: Call this function to collect fees from the liquidity pool. The collected fees can either be added back to the liquidity pool or burned, based on the `addLiquidity` flag's current setting.
- **Details**: If `addLiquidity` is `true`, the collected fees are added to the liquidity pool. If `false`, the collected HLX tokens are burned.

### Getting Pool Addresses
- **Function**: `getPoolAddress()`
- **Purpose**: To get the HLX/TitanX pool address.
- **Returns**: The address of the HLX/TitanX liquidity pool.

- **Function**: `getTitanXPoolAddress()`
- **Purpose**: To get the TitanX/ETH pool address.
- **Returns**: The address of the TitanX/ETH liquidity pool.

### Managing and Checking Balances
- **Function**: `getWethBalance()`
- **Purpose**: To get the WETH balance of the BuyAndBurn contract.
- **Returns**: The WETH balance of the BuyAndBurn contract.

- **Function**: `getWethBalance(address account)`
- **Purpose**: To get the WETH balance of a specified account.
- **Arguments**:
  - `account`: The address of the account.
- **Returns**: The WETH balance of the specified account.

- **Function**: `getHlxBalance()`, `getHlxBalance(address account)`
- **Purpose**: To get the HLX balance of the BuyAndBurn contract or a specified account.
- **Returns**: The HLX balance of the BuyAndBurn contract or the specified account.

- **Function**: `getTitanXBalance()`
- **Purpose**: To get the TitanX balance of the BuyAndBurn contract.
- **Returns**: The TitanX balance of the BuyAndBurn contract.

### Getting Current Prices
- **Function**: `getCurrentTitanPrice()`
- **Purpose**: To get the current price of TitanX in the TitanX/HLX pool.
- **Returns**: The current price of TitanX in the TitanX/HLX pool.

- **Function**: `getCurrentEthPrice()`
- **Purpose**: To get the current price of ETH against TitanX.
- **Returns**: The current price of ETH in terms of TitanX.

### Getting BuyAndBurn Parameters
- **Function**: `getWethBuyAndBurnCap()`
- **Purpose**: To get the ETH cap per buy and burn transaction.
- **Returns**: The ETH cap for buy and burn per transaction.

- **Function**: `getBuynBurnInterval()`
- **Purpose**: To get the interval between each buy and burn call.
- **Returns**: The interval in seconds between buy and burn calls.

- **Function**: `totalHeliosLiquidSupply()`
- **Purpose**: To get the total liquid supply of Helios tokens.
- **Returns**: The total liquid supply of Helios tokens.

### Getting BuyAndBurn Statistics
- **Function**: `getTotalTitanXBuyAndBurn()`
- **Purpose**: To get the total amount of TitanX used for buying and burning.
- **Returns**: The total amount of TitanX used for buying and burning.

- **Function**: `getTotalHelioBuyAndBurn()`
- **Purpose**: To get the total amount of Helios burned from all buy and burn operations.
- **Returns**: The total amount of Helios burned.

- **Function**: `getTitanXFeesBuyAndBurnFunds()`
- **Purpose**: To get the total TitanX collected

 from fees for buying and burning.
- **Returns**: The total TitanX collected from fees.

- **Function**: `getHlxFeesBuyAndBurnFunds()`
- **Purpose**: To get the total Helios collected from fees for buying and burning.
- **Returns**: The total Helios collected from fees.


# Treasury 

Based on your description of the Treasury contract, I'll create a guide for frontend developers on how to interact with its key functions. This guide will provide details about each function's purpose, required arguments, and when to use them.

---

# Treasury Contract Interaction Guide for Frontend Developers

### Staking TitanX
- **Function**: `stakeTITANX()`
- **Purpose**: To stake TitanX tokens held by the Treasury. The function stakes TitanX for a maximum number of days.
- **Usage**: This function can be called by any user. The caller receives an incentive fee. The function can only be called if the minimum amount of TitanX is available and after the stake interval has elapsed.
- **Details**: The function stakes the available TitanX tokens in the Treasury and records the staking time. The incentive fee is calculated and transferred to the caller.

### Ending Matured Stakes
- **Function**: `endStakeAfterMaturity(uint256 sId)`
- **Purpose**: To end a matured stake initiated by the Treasury.
- **Arguments**:
  - `sId`: The ID of the stake to be ended.
- **Usage**: Call this function to end a matured stake. The function can only be called if there are matured stakes available. The caller receives an incentive fee.
- **Details**: The function checks the maturity of the stake and ends it if matured, transferring the incentive fee to the caller.

### Claiming Stake Rewards
- **Function**: `claimReward()`
- **Purpose**: To claim ETH rewards from stakes initiated by the Treasury and distribute the received ETH to relevant addresses.
- **Usage**: Call this function to claim rewards and distribute ETH. The caller receives an incentive fee.
- **Details**: The function claims rewards from the TitanX contract, calculates the incentive fee, and distributes the remaining ETH to designated addresses.

### Checking Balances and Stake Information
- **Function**: `getTitanBalance()`
- **Purpose**: To get the TitanX balance of the Treasury.
- **Returns**: The TitanX balance of the Treasury.

- **Function**: `getLastStakeId()`
- **Purpose**: To get the last stake ID created by the Treasury.
- **Returns**: The last stake ID.

- **Function**: `getLastStakedTime()`
- **Purpose**: To get the timestamp of the last staking operation by the Treasury.
- **Returns**: The timestamp of the last staking operation.

- **Function**: `getTotalTitanXBurned()`
- **Purpose**: To get the total amount of TitanX burned by the Treasury.
- **Returns**: The total amount of TitanX burned.

### Burning TitanX
- **Function**: `burnTitanX()`
- **Purpose**: To burn TitanX using ETH sent to this function.
- **Usage**: Call this function to burn TitanX using ETH. The function receives ETH, converts it to TitanX, and burns the TitanX. Burn rewards are received by the Treasury and the genesis wallet.


