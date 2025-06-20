import { useState } from 'react'
import { config } from './Layout'
import { useStore } from '../store'
import Button from '../atomic/Button'

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

    const showLeaveRoom = panel === 'waitForPlayer' || panel === 'board' || panel === 'game'

    return (
        <div className="p-4 border-b border-slate-300 flex justify-end items-center bg-white">
            {showLeaveRoom && (
                <Button onClick={leaveRoom} className="mr-auto" variant="red">
                    Leave Room
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
