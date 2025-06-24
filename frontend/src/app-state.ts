import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { generateAnswer } from './utils'

export const ShotResultType = {
    Miss: 0,
    Hit: 1,
    Sunk: 2,
} as const

export type ShotResultInt = (typeof ShotResultType)[keyof typeof ShotResultType]

export interface ShotResult {
    x: number
    y: number
    answer: ShotResultInt
}

export interface ShotCoordinate {
    x: number
    y: number
}

export const BOARD_SIZE = 10

export interface ShipConfig {
    name: string
    length: number
}

export const SHIPS_CONFIG: ShipConfig[] = [
    { name: 'Carrier', length: 5 },
    { name: 'Battleship', length: 4 },
    { name: 'Cruiser', length: 3 },
    { name: 'Submarine', length: 3 },
    { name: 'Destroyer', length: 2 },
]

export const TOTAL_SHIPS = SHIPS_CONFIG.reduce((acc, ship) => acc + ship.length, 0)

export const OptionalPlayer = {
    None: 0,
    Self: 1,
    Opponent: 2,
} as const

export type OptionalPlayerInt = (typeof OptionalPlayer)[keyof typeof OptionalPlayer]

export type VictoryReason = null | 'waiting-for-proof' | 'dishonesty-claimed' | 'victory'

export interface State {
    panel: 'select' | 'create' | 'waitForPlayer' | 'join' | 'board' | 'game'
    activeRoomId?: string
    roomData: Record<
        string,
        {
            contractId: string
            entryFee: string
            opponent: string
            randomness: string
            secret: string
            myBoard?: boolean[][]
            myBoardRandomness?: string
            startingPlayer?: string
            isMyTurn: boolean
            myShots: ShotCoordinate[]
            enemyShots: ShotCoordinate[]
            myShotAnswers: ShotResult[]
            enemyShotAnswers: ShotResult[]
            winner: OptionalPlayerInt
            victoryReason: VictoryReason
            dishonestyClaimed: OptionalPlayerInt // who WAS ACCUSED of cheating
            provenEnemyBoard?: boolean[][]
        }
    >
}

export interface Actions {
    setPanel: (panel: State['panel']) => void
    leaveRoom: () => void
    joinRoom: (
        contractId: string,
        panel: State['panel'],
        roomId: string,
        opponent: string,
        entryFee: string,
        randomness: string,
        secret: string
    ) => void
    rejoin: (roomId: string) => void
    acceptOpponent: (address: string) => void
    submitBoard: (boardRandomness: string, board: boolean[][]) => void
    startGame: (startingPlayer: string) => void
    setIsMyTurn: (isMyTurn: boolean) => void
    updateShots: (shots: [string, number, ShotCoordinate][]) => void
    updateAnswers: (answers: [string | null, number, ShotCoordinate, ShotResultInt][]) => void // when player is null, it means self
    removeLastAnswer: () => void
    generateAnswer: (position: ShotCoordinate) => ShotResultInt
    claimDishonest: (player: string) => void
    setVictory: (player: string, victoryReason: 'dishonesty-claimed' | 'victory', board: boolean[][]) => void
}

export const useAppState = create<State & Actions>()(
    persist(
        (set, get) => ({
            panel: 'select',
            roomData: {},
            setPanel: (panel) => set((state) => ({ ...state, panel })),
            joinRoom: (contractId, panel: State['panel'], roomId, opponent, entryFee, randomness, secret) =>
                set((state) => ({
                    ...state,
                    panel: panel,
                    activeRoomId: roomId,
                    roomData: {
                        ...state.roomData,
                        [roomId]: {
                            contractId,
                            randomness,
                            opponent,
                            entryFee,
                            secret,
                            isMyTurn: false,
                            myShots: [],
                            enemyShots: [],
                            myShotAnswers: [],
                            enemyShotAnswers: [],
                            winner: OptionalPlayer.None,
                            dishonestyClaimed: OptionalPlayer.None,
                            victoryReason: null,
                        },
                    },
                })),
            rejoin: (roomId) =>
                set((state) => {
                    const room = state.roomData[roomId]
                    return {
                        ...state,
                        panel:
                            room.opponent === ''
                                ? 'waitForPlayer'
                                : room.startingPlayer === undefined
                                ? 'board'
                                : 'game',
                        activeRoomId: roomId,
                    }
                }),
            acceptOpponent: (address) =>
                set((state) => ({
                    ...state,
                    panel: 'board',
                    roomData: {
                        ...state.roomData,
                        [state.activeRoomId!]: { ...state.roomData[state.activeRoomId!], opponent: address },
                    },
                })),
            submitBoard: (boardRandomness, board) =>
                set((state) => ({
                    ...state,
                    roomData: {
                        ...state.roomData,
                        [state.activeRoomId!]: {
                            ...state.roomData[state.activeRoomId!],
                            myBoard: board,
                            myBoardRandomness: boardRandomness,
                        },
                    },
                })),
            startGame: (startingPlayer) =>
                set((state) => ({
                    ...state,
                    panel: 'game',
                    roomData: {
                        ...state.roomData,
                        [state.activeRoomId!]: {
                            ...state.roomData[state.activeRoomId!],
                            startingPlayer,
                            isMyTurn: startingPlayer !== state.roomData[state.activeRoomId!].opponent,
                        },
                    },
                })),
            setIsMyTurn: (isMyTurn) =>
                set((state) => ({
                    ...state,
                    roomData: {
                        ...state.roomData,
                        [state.activeRoomId!]: {
                            ...state.roomData[state.activeRoomId!],
                            isMyTurn,
                        },
                    },
                })),
            updateShots: (shots) =>
                set((state) => {
                    const room = state.roomData[state.activeRoomId!]

                    const newMyShots = [...room.myShots]
                    const newEnemyShots = [...room.enemyShots]

                    for (const [player, noShots, position] of shots) {
                        const isSelf = room.opponent !== player
                        const newShots = isSelf ? newMyShots : newEnemyShots
                        newShots[noShots - 1] = position
                    }

                    const noEnemyShots = newEnemyShots.length
                    const noMyAnswers = room.myShotAnswers.length
                    const isMyTurn = noEnemyShots > noMyAnswers
                    console.log(
                        'settings isMyTurn =',
                        isMyTurn,
                        'because noEnemyShots =',
                        noEnemyShots,
                        'noMyAnswers =',
                        noMyAnswers
                    )
                    return {
                        ...state,
                        roomData: {
                            ...state.roomData,
                            [state.activeRoomId!]: {
                                ...room,
                                isMyTurn,
                                myShots: newMyShots,
                                enemyShots: newEnemyShots,
                            },
                        },
                    }
                }),
            updateAnswers: (answers: [string | null, number, ShotCoordinate, ShotResultInt][]) =>
                set((state) => {
                    const room = state.roomData[state.activeRoomId!]
                    const newMyAnswers = [...room.myShotAnswers]
                    const newEnemyAnswers = [...room.enemyShotAnswers]
                    let noMyHits = 0
                    let noEnemyHits = 0

                    for (const [player, noShots, position, answer] of answers) {
                        const isSelf = room.opponent !== player
                        const newAnswers = isSelf ? newMyAnswers : newEnemyAnswers
                        newAnswers[noShots - 1] = { ...position, answer }
                    }

                    for (const answer of newMyAnswers) {
                        if (answer.answer !== ShotResultType.Miss) {
                            noEnemyHits++
                        }
                    }
                    for (const answer of newEnemyAnswers) {
                        if (answer.answer !== ShotResultType.Miss) {
                            noMyHits++
                        }
                    }

                    const winner =
                        noMyHits === TOTAL_SHIPS
                            ? OptionalPlayer.Self
                            : noEnemyHits === TOTAL_SHIPS
                            ? OptionalPlayer.Opponent
                            : OptionalPlayer.None

                    let victoryReason = room.victoryReason
                    if (winner !== OptionalPlayer.None && victoryReason === null) {
                        victoryReason = 'waiting-for-proof'
                    }
                    return {
                        ...state,
                        roomData: {
                            ...state.roomData,
                            [state.activeRoomId!]: {
                                ...room,
                                winner,
                                victoryReason,
                                myShotAnswers: newMyAnswers,
                                enemyShotAnswers: newEnemyAnswers,
                            },
                        },
                    }
                }),
            removeLastAnswer: () =>
                set((state) => ({
                    ...state,
                    roomData: {
                        ...state.roomData,
                        [state.activeRoomId!]: {
                            ...state.roomData[state.activeRoomId!],
                            myShotAnswers: state.roomData[state.activeRoomId!].myShotAnswers.slice(0, -1),
                        },
                    },
                })),
            generateAnswer: (position) => {
                const s = get()
                const room = s.roomData[s.activeRoomId!]
                return generateAnswer(room.myBoard!, room.enemyShots, position)
            },
            leaveRoom: () =>
                set((state) => ({
                    ...state,
                    panel: 'select',
                    activeRoomId: undefined,
                })),
            claimDishonest: (player) => {
                const s = get()
                console.log('claimDishonest', player, s.roomData[s.activeRoomId!].opponent)
                const isMyTurn = player !== s.roomData[s.activeRoomId!].opponent
                const newDishonesty = isMyTurn ? OptionalPlayer.Opponent : OptionalPlayer.Self
                console.log('newDishonesty', newDishonesty)
                if (newDishonesty === s.roomData[s.activeRoomId!].dishonestyClaimed) {
                    return
                }
                set((state) => ({
                    ...state,
                    roomData: {
                        ...state.roomData,
                        [s.activeRoomId!]: {
                            ...s.roomData[s.activeRoomId!],
                            isMyTurn,
                            dishonestyClaimed: newDishonesty,
                        },
                    },
                }))
            },
            setVictory: (player, victoryReason, board) => {
                const s = get()
                const isEnemy = player === s.roomData[s.activeRoomId!].opponent
                set((state) => ({
                    ...state,
                    roomData: {
                        ...state.roomData,
                        [state.activeRoomId!]: {
                            ...state.roomData[state.activeRoomId!],
                            provenEnemyBoard: isEnemy ? board : undefined,
                            winner: isEnemy ? OptionalPlayer.Opponent : OptionalPlayer.Self,
                            victoryReason,
                        },
                    },
                }))
            },
        }),
        {
            name: 'app-state',
            storage: createJSONStorage(() => localStorage),
        }
    )
)
