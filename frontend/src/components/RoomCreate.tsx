import { useMemo, useState } from 'react'
import { useWriteContract } from 'wagmi'
import { contractConfig } from '../ContractConfig'
import { getCommitPair, safeParseEther } from '../utils'
import { useStore } from '../store'

export default function RoomCreate() {
    const { setPanel, joinRoom } = useStore()

    const [secret, roomId] = useMemo(() => getCommitPair(BigInt(0)), [])
    const [randomness, randomnessCommitment] = useMemo(() => getCommitPair(), [])
    const [fee, setFee] = useState('0.1')
    const feeWei = safeParseEther(fee)

    const { isPending, writeContract, isSuccess, error } = useWriteContract({
        mutation: {
            onSuccess: () => {
                joinRoom('waitForPlayer', roomId, '', fee, randomness, secret)
            },
        },
    })

    const createRoom = () => {
        if (feeWei === null) return
        writeContract({
            ...contractConfig,
            functionName: 'createRoom',
            args: [BigInt(roomId), BigInt(randomnessCommitment)],
            value: feeWei,
        })
    }

    return (
        <div>
            <h1>Create room</h1>
            <p>Secret: {secret}</p>
            <p>Room id: {roomId}</p>
            <input type="number" value={fee} onChange={(e) => setFee(e.target.value)} />
            Wei: {feeWei?.toString()}
            <button onClick={() => setPanel('select')} className="bg-blue-500 text-white p-2 rounded-md">
                Back
            </button>
            <button
                onClick={createRoom}
                disabled={isPending || feeWei === null}
                className="bg-blue-500 text-white p-2 rounded-md"
            >
                Create
            </button>
            {isSuccess && 'Success'}
            Error: {error?.message}
        </div>
    )
}
function setActiveRoomId(roomId: string) {
    throw new Error('Function not implemented.')
}
