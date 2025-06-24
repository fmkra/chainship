import { WagmiProvider, createConfig, http } from 'wagmi'
import { anvil, sepolia, mainnet } from 'wagmi/chains'
import { injected } from '@wagmi/connectors'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Topbar } from './Topbar'
import NotificationToaster from '../atomic/Toaster'
import { ContractSettingsModal } from './Contracts'

export const queryClient = new QueryClient()

export const config = createConfig({
    chains: [
        anvil,
        sepolia,
        mainnet,
        {
            id: 123123,
            name: 'Local',
            nativeCurrency: {
                name: 'Ether',
                symbol: 'ETH',
                decimals: 18,
            },
            rpcUrls: {
                default: {
                    http: ['http://eth-node-local.fkrawczyk.pl:8545'],
                },
            },
        },
    ],
    transports: {
        [anvil.id]: http(),
        [sepolia.id]: http(import.meta.env.VITE_ETH_SEPOLIA_RPC),
        [mainnet.id]: http(import.meta.env.VITE_ETH_MAINNET_RPC),
        123123: http(),
    },
    connectors: [injected()],
})

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <div className="flex min-h-screen flex-col bg-slate-200">
                    <Topbar />
                    <ContractSettingsModal />
                    <main className="flex flex-grow items-center justify-center p-4 sm:p-8">{children}</main>
                    <NotificationToaster />
                </div>
            </QueryClientProvider>
        </WagmiProvider>
    )
}
