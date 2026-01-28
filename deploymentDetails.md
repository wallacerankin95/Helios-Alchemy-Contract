## Setting Up `hardhat.config.js`

Before deploying your contracts to the mainnet, you need to configure your Hardhat environment correctly. One crucial part of this setup is specifying your account's private key, which Hardhat will use to sign transactions during the deployment process.

1. **Private Key**:  In the context of deploying contracts, Hardhat uses this private key to sign deployment transactions on your behalf.

2. **Configuring Hardhat**: add the private key of the account you wish to use for deployment.

   Example configuration snippet for `hardhat.config.js`:
   ```javascript

   module.exports = {
     networks: {
       mainnet: {
         url: "https://eth-mainnet.g.alchemy.com/v2/lRMsx20J5y-EEw-RAVZGzuZk7lcQDzy0",
         accounts: [`0x${MAINNET_PRIVATE_KEY}`] 
       }
     }
   };
   ```
## Running the Deployment Command

Once your `hardhat.config.js` is correctly set up, you can deploy your contracts to the mainnet using the Hardhat command line interface (CLI).

- **Command**: `npx hardhat run scripts/deployMainnet.js --network mainnet`

  - `npx`: Runs the Hardhat CLI without requiring a global installation.
  - `hardhat run`: This command is used to execute scripts within the Hardhat environment.
  - `scripts/deployMainnet.js`: Path to your deployment script. This script contains the logic for deploying your contracts.
  - `--network mainnet`: Specifies which network configuration to use from `hardhat.config.js`. In this case, it tells Hardhat to deploy to the Ethereum Mainnet using the configuration you've set under the `mainnet` key.

## What Does Mainnet Deployment Script Do?

### 1. **Setup and Initialization**
- **Hardhat Runtime Environment (HRE)**: It imports the HRE to utilize Hardhat's functionalities such as deploying contracts, running scripts, and interacting with the blockchain.
- **Network Identification**: Extracts the network name from Hardhat arguments to determine the target blockchain network (e.g., Ethereum Mainnet) for the deployment.

### 2. **Deployment Preparation**
- **Signer Accounts**: Retrieves signers from the Hardhat environment. These are the Ethereum accounts that will be used to deploy the contracts. The first signer, typically the deployer's account, is designated as the `owner`.
- **Contract Factories**: Creates instances of contract factories for `BuyAndBurn`, `Treasury`, and `HELIOS`. These factories are pre-configured templates to deploy new instances of these contracts.

### 3. **Contract Deployment**
- **Deploy Contracts**: Sequentially deploys the `BuyAndBurn`, `Treasury`, and `HELIOS` contracts to the target network. Each deployment involves sending a transaction to the network, which, when mined, results in a new contract instance on the blockchain.
- **Deployment Parameters**: For contracts requiring initialization parameters (e.g., addresses of other contracts or tokens), these are passed during deployment. For instance, `HELIOS` is deployed with references to `BuyAndBurn`, the `TitanX` token address, and the `Treasury`.

### 4. **Post-Deployment Configuration**
- **Setting Contract References**: After deployment, the script establishes relationships between deployed contracts. For example, it sets the `HELIOS` address in the `BuyAndBurn` and `Treasury` contracts, enabling them to interact with `HELIOS`.
- **Initial Setup Calls**: Performs any necessary initial setup, such as creating an initial liquidity pool in the `BuyAndBurn` contract, ensuring the contracts are ready for use immediately after deployment.

### 5. **Contract Address Management**
- **Updating Contract Addresses**: Stores the deployed contract addresses in a local or off-chain location. This is crucial for tracking contract deployments across different networks and for application integration.

This deployment script automates the process of deploying your contracts to the Ethereum Mainnet, handling many of the complexities and potential pitfalls of manual deployment.