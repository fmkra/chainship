import Button from '../atomic/Button'
import { useAppState } from '../app-state'
import { useContractStorage } from './Contracts'
import { shorten } from '../utils'

export default function Main() {
    const { setPanel, rejoin, roomData } = useAppState()
    const { selectedContractId } = useContractStorage()
    const rooms = Object.entries(roomData).filter(([_, data]) => data.contractId === selectedContractId)

    return (
        <div className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-lg">
            <h1 className="text-4xl font-bold tracking-tight text-slate-800">Welcome to ChainShip</h1>
            <p className="mt-3 text-slate-500">
                A fully on-chain game of Battleship.
                <br />
                Create a room or join a friend's to start playing.
            </p>

            <div className="mt-8 flex flex-col gap-4">
                <Button variant="blue" onClick={() => setPanel('create')} id="create-room-button">
                    Create a New Room
                </Button>
                <Button variant="green" onClick={() => setPanel('join')}>
                    Join an Existing Room
                </Button>
            </div>

            <div className="mt-8">
                <h2 className="text-xl font-semibold text-slate-700 mb-2">Your Rooms</h2>
                {rooms.length === 0 ? (
                    <p className="text-slate-400">No rooms yet. Create or join one to get started!</p>
                ) : (
                    <ul className="space-y-2">
                        {rooms.map(([roomId, room]) => (
                            <li key={roomId} className="rounded bg-slate-100 p-3 text-left">
                                <div className="font-mono text-slate-800 text-center">{shorten(roomId, 12, 10)}</div>
                                <div className="flex gap-2 justify-between">
                                    <div>
                                        <div className="text-slate-600 text-sm">
                                            Opponent:{' '}
                                            {room.opponent ? (
                                                shorten(room.opponent, 12, 10)
                                            ) : (
                                                <span className="italic text-slate-400">None</span>
                                            )}
                                        </div>
                                        <div className="text-slate-600 text-sm">Entry Fee: {room.entryFee} ETH</div>
                                    </div>
                                    <div>
                                        <Button variant="blue" onClick={() => rejoin(roomId)}>
                                            Join
                                        </Button>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    )
}
