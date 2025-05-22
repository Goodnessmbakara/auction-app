import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WalletState {
  lastConnectedAddress: string | null;
  lastConnectedChainId: number | null;
  setLastConnectedAddress: (address: string | null) => void;
  setLastConnectedChainId: (chainId: number | null) => void;
  clearWalletState: () => void;
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set) => ({
      lastConnectedAddress: null,
      lastConnectedChainId: null,
      setLastConnectedAddress: (address) => set({ lastConnectedAddress: address }),
      setLastConnectedChainId: (chainId) => set({ lastConnectedChainId: chainId }),
      clearWalletState: () => set({ lastConnectedAddress: null, lastConnectedChainId: null }),
    }),
    {
      name: 'wallet-storage',
      partialize: (state) => ({
        lastConnectedAddress: state.lastConnectedAddress,
        lastConnectedChainId: state.lastConnectedChainId,
      }),
    }
  )
);

export const useWalletConnection = () => {
  const { address, chainId, isConnected } = useAccount();
  const {
    lastConnectedAddress,
    lastConnectedChainId,
    setLastConnectedAddress,
    setLastConnectedChainId,
    clearWalletState,
  } = useWalletStore();

  useEffect(() => {
    if (isConnected && address) {
      setLastConnectedAddress(address);
      if (chainId) {
        setLastConnectedChainId(chainId);
      }
    } else if (!isConnected) {
      clearWalletState();
    }
  }, [isConnected, address, chainId]);

  return {
    isConnected,
    address,
    chainId,
    lastConnectedAddress,
    lastConnectedChainId,
  };
}; 