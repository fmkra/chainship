import { WagmiProvider, createConfig, http } from 'wagmi'
import { localhost } from 'wagmi/chains'
import { injected } from '@wagmi/connectors'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Topbar } from './Topbar'

export const queryClient = new QueryClient()

export const config = createConfig({
    chains: [localhost],
    transports: {
        [localhost.id]: http(),
    },
    connectors: [injected()],
})

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <Topbar />
                {children}
            </QueryClientProvider>
        </WagmiProvider>
    )
}
