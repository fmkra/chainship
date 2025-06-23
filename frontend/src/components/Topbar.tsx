import { useState } from 'react'
import { config } from './Layout'
import { useStore } from '../store'
import Button from '../atomic/Button'
import { useNotificationStore } from '../atomic/Toaster'
import { CHAINS, Settings, useContractStorage } from './Contracts'
import { shorten } from '../utils'

export const Topbar = () => {
    const { panel, leaveRoom } = useStore()
    const [isConnected, setIsConnected] = useState<boolean>(false)
    const [address, setAddress] = useState<string>('')
    const { addNotification } = useNotificationStore()
    const { getSelectedContract } = useContractStorage()

    const connectWallet = async () => {
        try {
            const result = await config.connectors[0].connect()
            setIsConnected(true)
            setAddress(result.accounts[0])
            addNotification('Wallet connected successfully!', 'success')
        } catch (error) {
            console.error('Failed to connect:', error)
            addNotification('Failed to connect wallet.', 'error')
        }
    }

    const disconnectWallet = async () => {
        try {
            await config.connectors[0].disconnect()
            setIsConnected(false)
            setAddress('')
            addNotification('Wallet disconnected.', 'info')
        } catch (error) {
            console.error('Failed to disconnect:', error)
            addNotification('Failed to disconnect wallet.', 'error')
        }
    }

    const showLeaveRoom = panel === 'waitForPlayer' || panel === 'board' || panel === 'game'
    const selectedContract = getSelectedContract()

    return (
        <div className="p-4 border-b border-slate-300 flex justify-end items-center bg-white space-x-4">
            {showLeaveRoom && (
                <Button onClick={leaveRoom} className="mr-auto" variant="red">
                    Leave Room
                </Button>
            )}
            {!isConnected ? (
                <Button onClick={connectWallet} id="wallet-button" disabled={!selectedContract}>
                    Connect Wallet
                </Button>
            ) : (
                <>
                    <p id="account" className="text-sm font-medium text-slate-700 truncate">
                        Connected: <span className="font-mono">{address}</span>
                    </p>
                    <Button variant="red" onClick={disconnectWallet}>
                        Disconnect
                    </Button>
                </>
            )}
            {selectedContract && (
                <div className="text-sm text-center">
                    <p className="font-semibold text-slate-700">{CHAINS[selectedContract.chainId]}</p>
                    <p className="text-xs text-slate-500 font-mono">{shorten(selectedContract.address)}</p>
                </div>
            )}
            <Settings />
        </div>
    )
}
