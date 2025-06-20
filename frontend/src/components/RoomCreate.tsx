import { useMemo, useState } from 'react'
import { useWriteContract } from 'wagmi'
import { contractConfig } from '../ContractConfig'
import { getCommitPair, safeParseEther } from '../utils'
import { useStore } from '../store'
import Button from '../atomic/Button'
import { useNotificationStore } from '../atomic/Toaster'
import Input from '../atomic/Input'

export default function RoomCreate() {
    const { setPanel, joinRoom } = useStore()
    const { addNotification } = useNotificationStore()

    const [secret, roomId] = useMemo(() => getCommitPair(BigInt(0)), [])
    const [randomness, randomnessCommitment] = useMemo(() => getCommitPair(), [])
    const [fee, setFee] = useState('0.1')
    const feeWei = safeParseEther(fee)

    const { isPending, writeContract } = useWriteContract({
        mutation: {
            onSuccess: () => {
                addNotification('Room creation transaction sent!', 'info')
                joinRoom('waitForPlayer', roomId, '', fee, randomness, secret)
            },
            onError: (error) => {
                const shortMessage = error.message.split('\n')[0]
                addNotification(`${error.name}: ${shortMessage}`, 'error')
            },
        },
    })

    const createRoom = () => {
        if (feeWei === null) {
            addNotification('The fee you entered is not a valid number.', 'error')
            return
        }
        writeContract({
            ...contractConfig,
            functionName: 'createRoom',
            args: [BigInt(roomId), BigInt(randomnessCommitment)],
            value: feeWei,
        })
    }

    return (
        <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-slate-800">Create a New Room</h1>
                <p className="mt-2 text-slate-500">Set an entry fee and generate a room for your friend to join.</p>
            </div>

            <div className="mt-8 space-y-6">
                <div>
                    <label htmlFor="roomId" className="block text-sm font-semibold text-slate-700">
                        Your Unique Room ID
                    </label>
                    <div className="mt-1 flex items-center gap-2 rounded-md bg-slate-100 p-3">
                        <span
                            id="roomId"
                            className="flex-grow whitespace-nowrap overflow-hidden text-ellipsis font-mono text-slate-800"
                        >
                            {roomId}
                        </span>
                    </div>
                </div>

                <div>
                    <Input
                        id="entryFee"
                        label="Entry Fee (ETH)"
                        type="number"
                        value={fee}
                        onChange={(e) => setFee(e.target.value)}
                        placeholder="e.g., 0.1"
                    />
                    <p className="mt-1 text-xs text-slate-500">
                        {feeWei !== null ? `Value in Wei: ${feeWei.toString()}` : 'Please enter a valid value.'}
                    </p>
                </div>
            </div>

            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                <Button onClick={() => setPanel('select')} variant="gray">
                    Back
                </Button>
                <Button onClick={createRoom} disabled={isPending || feeWei === null} variant="blue">
                    {isPending ? 'Creating...' : 'Create Room'}
                </Button>
            </div>
        </div>
    )
}
