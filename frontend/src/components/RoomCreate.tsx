import { useMemo, useState } from 'react'
import { useWriteContract } from 'wagmi'
import { contractConfig } from '../ContractConfig'
import { getCommitPair, safeParseEther } from '../utils'
import { useStore } from '../store'
import Button from '../atomic/button'
import { useNotificationStore } from '../atomic/Toaster'

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
                joinRoom('waitForPlayer', roomId, '', fee, randomness, secret)
            },
            onError: (error) => {
                addNotification(error.name + ': ' + error.message, 'error')
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
            <Button onClick={() => setPanel('select')}>Back</Button>
            <Button onClick={createRoom} disabled={isPending || feeWei === null}>
                Create
            </Button>
        </div>
    )
}
