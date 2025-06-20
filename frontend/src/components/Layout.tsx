import { WagmiProvider, createConfig, http } from 'wagmi'
import { localhost } from 'wagmi/chains'
import { injected } from '@wagmi/connectors'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Topbar } from './Topbar'
import NotificationToaster from '../atomic/Toaster'

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
                <div className="flex min-h-screen flex-col bg-slate-200">
                    <Topbar />
                    <main className="flex flex-grow items-center justify-center p-4 sm:p-8">{children}</main>
                    <NotificationToaster />
                </div>
            </QueryClientProvider>
        </WagmiProvider>
    )
}
