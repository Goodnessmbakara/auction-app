import { http, createConfig } from 'wagmi'
import { avalancheFuji} from 'wagmi/chains'
import { injected, metaMask, safe, walletConnect } from 'wagmi/connectors'


const projectId = 'e21343657a112adab1bc42ddde78c8fd'

export const config = createConfig({
  chains: [avalancheFuji],
  connectors: [
    injected(),
    walletConnect({ projectId }),
    metaMask(),
    safe(),
  ],
  transports: {
    [avalancheFuji.id]: http(),
  },
})
