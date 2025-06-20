import { useStore } from '../store'

export default function Main() {
    const { setPanel } = useStore()

    return (
        <div className="flex gap-4 items-center justify-center p-10">
            <button onClick={() => setPanel('create')} className="bg-blue-500 text-white p-2 rounded-md">
                Create room
            </button>
            <button onClick={() => setPanel('join')} className="bg-blue-500 text-white p-2 rounded-md">
                Join room
            </button>
        </div>
    )
}
