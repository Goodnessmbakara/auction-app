require('@nomiclabs/hardhat-ethers');
require('dotenv').config();

module.exports = {
  solidity: "0.8.20",
  networks: {
    lisk: {
      url: process.env.LISK_RPC_URL, // Your Lisk RPC URL (e.g., for the testnet or mainnet)
      accounts: [process.env.PRIVATE_KEY],
    },
  },
};
