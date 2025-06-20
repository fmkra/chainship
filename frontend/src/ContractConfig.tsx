import { abi } from './abi'

export const contractConfig = {
    chainId: (import.meta.env.VITE_CHAIN_ID ?? 31337) as number,
    address: (import.meta.env.VITE_CONTRACT_ADDRESS ?? '0x5fbdb2315678afecb367f032d93f642f64180aa3') as `0x${string}`,
    abi,
}
