import { useState } from 'react'
import { config } from './Layout'

export function Topbar() {
    const [isConnected, setIsConnected] = useState(false)
    const [address, setAddress] = useState<string>('')

    const connectWallet = async () => {
        try {
            const result = await config.connectors[0].connect()
            setIsConnected(true)
            setAddress(result.accounts[0])
        } catch (error) {
            console.error('Failed to connect:', error)
        }
    }

    const disconnectWallet = async () => {
        try {
            await config.connectors[0].disconnect()
            setIsConnected(false)
            setAddress('')
        } catch (error) {
            console.error('Failed to disconnect:', error)
        }
    }

    return (
        <div className="p-4 border-b border-gray-800 flex justify-end items-center">
            {!isConnected ? (
                <button
                    onClick={connectWallet}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    id="wallet-button"
                >
                    Connect Wallet
                </button>
            ) : (
                <>
                    <p id="account">Connected to: {address}</p>
                    <div className="space-x-4">
                        <button
                            onClick={disconnectWallet}
                            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                        >
                            Disconnect
                        </button>
                    </div>
                </>
            )}
        </div>
    )
}
