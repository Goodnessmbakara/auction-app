"use client"

import { useEffect, useState } from "react"
import { WagmiProvider, http } from "wagmi"
import { RainbowKitProvider, getDefaultConfig } from "@rainbow-me/rainbowkit"
import { liskSepolia } from "@/lib/lisk-chain"
import "@rainbow-me/rainbowkit/styles.css"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

const config = getDefaultConfig({
  appName: "Auction App",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
  chains: [liskSepolia],
  transports: {
    [liskSepolia.id]: http(),
  },
})

export function WalletWrapper({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())
  const [isClient, setIsClient] = useState(false)

  // Ensure that the theme is applied only on the client-side
  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return <></> // Don't render anything on the server-side
  }

  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={config}>
        <RainbowKitProvider chains={[liskSepolia]}>
          {children}
        </RainbowKitProvider>
      </WagmiProvider>
    </QueryClientProvider>
  )
}
