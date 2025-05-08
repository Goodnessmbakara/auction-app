// providers/wallet-provider.tsx

"use client"

import { WagmiConfig, createClient, configureChains } from "wagmi"
import { InjectedConnector } from "wagmi/connectors/injected"
import { WalletConnectConnector } from "wagmi/connectors/walletConnect"
import { mainnet, polygon } from "wagmi/chains"
import { RainbowKitProvider, lightTheme } from "@rainbow-me/rainbowkit"
import { getDefaultWallets } from "@rainbow-me/rainbowkit"
import { ethers } from "ethers"

// Configuring chains and providers
const { chains, provider, webSocketProvider } = configureChains(
  [mainnet, polygon], 
  [
    // Add your custom RPC providers here, or use public ones
    ethers.providers.InfuraProvider
  ]
)

const { connectors } = getDefaultWallets({
  appName: "YourApp",
  chains,
})

// Create the wagmi client
const client = createClient({
  autoConnect: true,
  connectors: [
    new InjectedConnector({ chains }),
    new WalletConnectConnector({
      chains,
      options: {
        qrcode: true,
      },
    }),
  ],
  provider,
  webSocketProvider,
})

export function WalletProvider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiConfig client={client}>
      <RainbowKitProvider chains={chains} theme={lightTheme()}>
        {children}
      </RainbowKitProvider>
    </WagmiConfig>
  )
}
