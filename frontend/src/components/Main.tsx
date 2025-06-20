import Button from '../atomic/button'
import { useStore } from '../store'

export default function Main() {
    const { setPanel } = useStore()

    return (
        <div className="flex gap-4 items-center justify-center p-10">
            <Button onClick={() => setPanel('create')}>Create room</Button>
            <Button onClick={() => setPanel('join')}>Join room</Button>
        </div>
    )
}
