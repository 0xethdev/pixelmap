require("@nomicfoundation/hardhat-toolbox");
require("hardhat-gas-reporter");
const dotenv = require('dotenv');

dotenv.config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 100,
      },
      viaIR: true,
    },
  },
  paths: {
    artifacts: "./frontend/src/artifacts",
  },
  networks: {
    sepolia: {
      url: process.env.VITE_SEPOLIA_TESTNET,
      accounts: [process.env.PRIVATE_KEY]
    },
    hardhat: {
      chainId:1337,
      forking: {
        url: process.env.VITE_ETH_MAINNET,
        //blockNumber: 18657836
      }
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};