import { State, useStore } from './store'
import RoomCreate from './components/RoomCreate'
import RoomJoin from './components/RoomJoin'
import Layout from './components/Layout'
import Main from './components/Main'
import WaitForPlayer from './components/WaitForPlayer'
import Board from './components/Board'
import Game from './components/Game'

function App() {
    const { panel } = useStore()

    const stateComponents = {
        select: <Main />,
        create: <RoomCreate />,
        waitForPlayer: <WaitForPlayer />,
        join: <RoomJoin />,
        board: <Board />,
        game: <Game />,
    } satisfies Record<State['panel'], React.ReactNode>

    return <Layout>{stateComponents[panel]}</Layout>
}

export default App
