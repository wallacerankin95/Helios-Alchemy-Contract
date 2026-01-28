# Introduction
This guide is designed for frontend developers who need to set up and interact with Helios contracts in a Hardhat environment. We'll cover key steps, including forking the Ethereum mainnet for local testing, deploying contracts, setting up MetaMask, importing accounts, and time-skipping for testing purposes.

# Prerequisites
- Node.js and npm installed.
- Hardhat environment set up in your project.
- Basic understanding of Ethereum, smart contracts, and the Hardhat framework.

## Step-by-Step Guide

### 1. Start a Local Ethereum Node
First, we need to start a local Ethereum node that forks the main Ethereum network. This allows us to simulate a real network environment on our local machine.

- Open a terminal and navigate to your project directory.
- Run the following command:
  ```
  npx hardhat node
  ```
- Keep this terminal running.

### 2. Deploy Contracts
With the local node running, we can deploy our Helios contracts to this local network.

- Open a new terminal window in your project directory.
- Deploy the contracts by running:
  ```
  npx hardhat run scripts/deploy.js --network localhost
  ```

### 3. Setup MetaMask for Local Network
Now, let's configure MetaMask to connect to our local Ethereum network.

- Open MetaMask and add a new network with the following details:
  - Network Name: Localhost 8545
  - New RPC URL: http://localhost:8545
  - Chain ID: 1337 (or as per your Hardhat configuration)
- Connect MetaMask to this new network.

### 4. Import Accounts into MetaMask
To interact with the contracts, we need to import accounts into MetaMask.

-  add this private key "0x50064ce5c4835c90c983261af44a605263654afc7c871c96b8bbde8f904cd297".
- You will have titanx balance in this account.
- In MetaMask, use the "Import Account" option and enter the private key of an account.

### 5. Time-Skipping for Testing
If you need to test functionalities like staking or mining that require time to pass, use the time-skipping script.

- Edit the `scripts/skip.js` file to set the number of days you want to skip.
- Run the script with:
  ```
  npx hardhat run scripts/skip.js
  ```

### 6. Understanding Scenarios with Test Cases
To get a better understanding of different scenarios and how the contracts operate, go through the test cases provided in the project.

### 7. Complete Setup
By following the above steps in order, your environment will be fully set up, including contract deployment, account setup, and initial configurations like liquidity and address values. 

## Conclusion
You now have a fully functional local development environment for the Helios ecosystem. This setup allows frontend developers to interact with contracts, test functionalities, and develop applications with a real-world simulation.

npx hardhat run scripts/deployTesting.js --network localhost


npx hardhat run scripts/skip.js --network localhost

npx hardhat run scripts/startTitanxMiners.js --network localhost

npx hardhat run scripts/triggerPayouts.js --network localhost