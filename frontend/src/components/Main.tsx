import Button from '../atomic/Button'
import { useStore } from '../store'

export default function Main() {
    const { setPanel } = useStore()

    return (
        <div className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-lg">
            <h1 className="text-4xl font-bold tracking-tight text-slate-800">Welcome to ChainShip</h1>
            <p className="mt-3 text-slate-500">
                A fully on-chain game of Battleship.
                <br />
                Create a room or join a friend's to start playing.
            </p>

            <div className="mt-8 flex flex-col gap-4">
                <Button variant="blue" onClick={() => setPanel('create')}>
                    Create a New Room
                </Button>
                <Button variant="green" onClick={() => setPanel('join')}>
                    Join an Existing Room
                </Button>
            </div>
        </div>
    )
}
