import { http, createConfig } from 'wagmi'
import { avalancheFuji} from 'wagmi/chains'
import { injected, metaMask, safe, walletConnect } from 'wagmi/connectors'

// const projectId = '<WALLETCONNECT_PROJECT_ID>'

export const config = createConfig({
  chains: [avalancheFuji],
  connectors: [
    injected(),
    // walletConnect({ projectId }),
    metaMask(),
    safe(),
  ],
  transports: {
    [avalancheFuji.id]: http(),
  },
})