import { useState } from 'react'
import { useWatchContractEvent } from 'wagmi'
import { useStore } from '../store'
import { contractConfig } from '../ContractConfig'
import { useNotificationStore } from '../atomic/Toaster'

export default function WaitForPlayer() {
    const { roomData, activeRoomId, acceptOpponent } = useStore()
    const { addNotification } = useNotificationStore()
    const secret = roomData[activeRoomId!]?.secret
    const [copied, setCopied] = useState(false)

    useWatchContractEvent({
        ...contractConfig,
        eventName: 'JoinedRoom',
        onLogs: (logs) => {
            for (const log of logs) {
                if (log.address === contractConfig.address && log.args.roomId === BigInt(activeRoomId!)) {
                    addNotification('Opponent has joined the room!', 'success')
                    acceptOpponent(log.args.player2 as string)
                }
            }
        },
    })

    const handleCopy = () => {
        if (!secret) return
        navigator.clipboard.writeText(secret)
        setCopied(true)
        addNotification('Secret copied to clipboard!', 'success')
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-lg">
            <h1 className="text-3xl font-bold text-slate-800">Room Created</h1>
            <p className="mt-2 text-slate-500">Your room is ready and waiting for an opponent.</p>

            <div className="mt-8">
                <label htmlFor="roomSecret" className="block text-sm font-semibold text-slate-700">
                    Share this Secret with Your Friend
                </label>
                <div className="mt-1 flex items-center gap-2 rounded-md bg-slate-100 p-3">
                    <span
                        id="roomSecret"
                        className="flex-grow whitespace-nowrap overflow-hidden text-ellipsis font-mono text-slate-800"
                    >
                        {secret || 'Generating...'}
                    </span>
                    <button
                        onClick={handleCopy}
                        className="rounded bg-slate-200 px-3 py-1 text-sm font-semibold text-slate-600 transition hover:bg-slate-300"
                    >
                        {copied ? 'Copied!' : 'Copy'}
                    </button>
                </div>
            </div>

            <div className="mt-8 flex flex-col items-center justify-center gap-4">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
                <p className="font-semibold text-slate-600">Waiting for opponent to join...</p>
            </div>
        </div>
    )
}
