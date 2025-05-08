import { Chain } from "wagmi"

export const liskSepolia: Chain = {
  id: 4202,
  name: "Lisk Sepolia",
  network: "lisk-sepolia",
  nativeCurrency: {
    name: "Lisk",
    symbol: "LSK",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://sepolia-rpc.lisk.com"], // Confirm this is the current RPC endpoint
    },
    public: {
      http: ["https://sepolia-rpc.lisk.com"],
    },
  },
  blockExplorers: {
    default: {
      name: "Lisk Explorer",
      url: "https://sepolia-explorer.lisk.com",
    },
  },
  testnet: true,
}
