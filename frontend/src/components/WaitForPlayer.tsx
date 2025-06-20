import { useWatchContractEvent } from 'wagmi'
import { useStore } from '../store'
import { contractConfig } from '../ContractConfig'

export default function WaitForPlayer() {
    const { roomData, activeRoomId, acceptOpponent } = useStore()
    const secret = roomData[activeRoomId!]?.secret

    useWatchContractEvent({
        ...contractConfig,
        eventName: 'JoinedRoom',
        onLogs: (logs) => {
            for (const log of logs) {
                if (log.address === contractConfig.address && log.args.roomId === BigInt(activeRoomId!)) {
                    acceptOpponent(log.args.player2 as string)
                }
            }
        },
    })

    return (
        <div>
            <h1>Room created</h1>
            <p>Invite your friend with: {secret}</p>
        </div>
    )
}
