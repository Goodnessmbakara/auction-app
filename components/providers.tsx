"use client"

import { ReactNode } from "react"
import { WagmiConfig, configureChains, createConfig, http } from "wagmi"
import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit"
import { liskSepolia } from "@/lib/lisk-chain"

const { chains, publicClient } = configureChains([liskSepolia], [http()])

const { connectors } = getDefaultWallets({
  appName: "AvaBid",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
  chains,
})

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
})

export function Web3Provider({ children }: { children: ReactNode }) {
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains}>{children}</RainbowKitProvider>
    </WagmiConfig>
  )
}
