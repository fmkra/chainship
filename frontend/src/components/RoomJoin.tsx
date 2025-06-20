import { useWriteContract, useReadContract } from 'wagmi'
import { contractConfig } from '../ContractConfig'
import { useMemo, useState } from 'react'
import { getCommitPair, keccakHashUint256s, safeBigInt } from '../utils'
import { useStore } from '../store'
import Button from '../atomic/button'
import { useNotificationStore } from '../atomic/Toaster'

export default function RoomJoin() {
    const { joinRoom } = useStore()
    const { addNotification } = useNotificationStore()
    const [roomSecret, setRoomSecret] = useState<string>('')
    const [randomness, randomnessCommitment] = useMemo(() => getCommitPair(), [])
    const roomId = useMemo(() => {
        const rs = safeBigInt(roomSecret)
        if (rs === null) return null
        return keccakHashUint256s(0n, rs)
    }, [roomSecret])

    const { data: roomInfo, isLoading } = useReadContract({
        ...contractConfig,
        functionName: 'getRoomInfo',
        args: roomId === null ? undefined : [BigInt(roomId)],
    })
    const fee = roomInfo?.[1]
    const opponent = roomInfo?.[2]

    const { writeContract } = useWriteContract({
        mutation: {
            onSuccess: () => {
                joinRoom('board', roomId!, opponent!, fee!.toString(), randomness, roomSecret)
            },
            onError: (error) => {
                addNotification(error.name + ': ' + error.message, 'error')
            },
        },
    })

    const join = () => {
        if (typeof roomInfo?.[1] !== 'bigint') return
        writeContract({
            ...contractConfig,
            functionName: 'joinRoom',
            args: [BigInt(roomSecret), BigInt(randomnessCommitment)],
            value: fee,
        })
    }

    return (
        <div>
            <h1>Join room</h1>

            <input
                type="text"
                value={roomSecret}
                onChange={(e) => setRoomSecret(e.target.value)}
                className="border border-gray-300 rounded-md p-2"
            />

            <p>Entry fee: {isLoading ? 'Loading...' : fee?.toString()}</p>

            <Button onClick={join} disabled={isLoading}>
                Join
            </Button>
        </div>
    )
}
