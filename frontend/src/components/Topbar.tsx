import { useState } from 'react'
import { config } from './Layout'
import { useStore } from '../store'
import Button from '../atomic/button'

export function Topbar() {
    const { panel, leaveRoom } = useStore()
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
        <div className="p-4 border-b border-gray-800 flex justify-end items-center bg-white">
            {panel !== 'select' && (
                <Button onClick={leaveRoom} className="mr-auto">
                    Back
                </Button>
            )}
            {!isConnected ? (
                <Button onClick={connectWallet} id="wallet-button">
                    Connect Wallet
                </Button>
            ) : (
                <>
                    <p id="account">Connected to: {address}</p>
                    <div className="space-x-4">
                        <Button variant="red" onClick={disconnectWallet}>
                            Disconnect
                        </Button>
                    </div>
                </>
            )}
        </div>
    )
}
