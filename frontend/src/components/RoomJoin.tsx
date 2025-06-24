import { useWriteContract, useReadContract } from 'wagmi'
import { useMemo, useState } from 'react'
import { getCommitPair, keccakHashUint256s, safeBigInt } from '../utils'
import { useAppState } from '../app-state'
import Button from '../atomic/Button'
import { useNotificationStore } from '../atomic/Toaster'
import Input from '../atomic/Input'
import { formatEther } from 'viem'
import { useContractStorage } from './Contracts'
import { abi } from '../abi'

export default function RoomJoin() {
    const { joinRoom, setPanel } = useAppState()
    const { addNotification } = useNotificationStore()
    const [roomSecret, setRoomSecret] = useState<string>('')
    const [randomness, randomnessCommitment] = useMemo(() => getCommitPair(), [])
    const { getConfig, selectedContractId } = useContractStorage()
    const config = getConfig()

    const roomId = useMemo(() => {
        const rs = safeBigInt(roomSecret)
        if (rs === null) return null
        return keccakHashUint256s(0n, rs)
    }, [roomSecret])

    const { data: roomInfo, isLoading } = useReadContract({
        ...config,
        abi,
        functionName: 'getRoomInfo',
        args: roomId === null ? undefined : [BigInt(roomId)],
    })
    const entryFeeWei = roomInfo?.[1]
    const opponent = roomInfo?.[2]

    const [submitContractId, setSubmitContractId] = useState<string>('')
    const { isPending, writeContract } = useWriteContract({
        mutation: {
            onSuccess: () => {
                addNotification('Joining room transaction sent!', 'info')
                const entryFeeEth = formatEther(entryFeeWei!)
                joinRoom(submitContractId, 'board', roomId!, opponent!, entryFeeEth, randomness, roomSecret)
            },
            onError: (error) => {
                const shortMessage = error.message.split('\n')[0]
                addNotification(`${error.name}: ${shortMessage}`, 'error')
            },
        },
    })

    const join = () => {
        if (typeof entryFeeWei !== 'bigint') {
            addNotification('Could not find room or entry fee.', 'error')
            return
        }
        if (!config || !selectedContractId) {
            addNotification('No contract selected', 'error')
            return
        }
        setSubmitContractId(selectedContractId)
        writeContract({
            ...config,
            abi,
            functionName: 'joinRoom',
            args: [BigInt(roomSecret), BigInt(randomnessCommitment)],
            value: entryFeeWei,
        })
    }

    return (
        <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-slate-800">Join a Room</h1>
                <p className="mt-2 text-slate-500">Enter the secret code you received from your friend.</p>
            </div>

            <div className="mt-8 space-y-6">
                <Input
                    id="roomSecret"
                    label="Room Secret"
                    type="text"
                    value={roomSecret}
                    onChange={(e) => setRoomSecret(e.target.value)}
                    placeholder="Paste the secret code here"
                />

                <div className="rounded-md bg-slate-50 p-3">
                    <div className="flex justify-between text-sm">
                        <span className="font-semibold text-slate-600">Entry fee:</span>
                        <span className="font-mono text-slate-800">
                            {isLoading
                                ? 'Loading...'
                                : entryFeeWei !== undefined
                                ? `${formatEther(entryFeeWei)} ETH`
                                : 'Enter a valid secret'}
                        </span>
                    </div>
                </div>
            </div>

            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                <Button variant="gray" onClick={() => setPanel('select')}>
                    Back
                </Button>
                <Button
                    variant="blue"
                    onClick={join}
                    disabled={isLoading || isPending || typeof entryFeeWei !== 'bigint'}
                >
                    {isPending ? 'Joining...' : 'Join Room'}
                </Button>
            </div>
        </div>
    )
}
