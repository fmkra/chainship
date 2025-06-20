import { useState, useEffect, useMemo } from 'react'
import {
    BOARD_SIZE,
    ShotCoordinate,
    ShotResult,
    ShotResultInt,
    ShotResultType,
    useStore,
    WinnerType,
    WinnerTypeInt,
} from '../store'
import { useWatchContractEvent, useWriteContract } from 'wagmi'
import { contractConfig } from '../ContractConfig'

export default function Game() {
    const { roomData, activeRoomId, setIsMyTurn, updateShots, updateAnswers, generateAnswer } = useStore()
    const room = roomData[activeRoomId!]
    const myBoard = room.myBoard!
    const isMyTurn = room.isMyTurn

    const { writeContract, isPending } = useWriteContract({
        mutation: {
            onSuccess: () => {
                setIsMyTurn(false)
            },
        },
    })

    const onShot = (x: number, y: number) => {
        if (room.enemyShots.length > room.myShotAnswers.length) {
            const answerPosition = room.enemyShots[room.enemyShots.length - 1]
            const answer = generateAnswer(answerPosition)
            writeContract({
                ...contractConfig,
                functionName: 'answerAndShoot',
                args: [BigInt(activeRoomId!), answerPosition, answer, { x, y }],
            })
        } else {
            writeContract({
                ...contractConfig,
                functionName: 'shoot',
                args: [BigInt(activeRoomId!), { x, y }],
            })
        }
    }

    const claimVictory = () => {
        if (room.enemyShots.length > room.myShotAnswers.length) {
            const answerPosition = room.enemyShots[room.enemyShots.length - 1]
            const answer = generateAnswer(answerPosition)
            console.log('sending enemy shots', room.enemyShots, room.myShotAnswers)
            writeContract({
                ...contractConfig,
                functionName: 'answerAndClaimVictory',
                args: [
                    BigInt(activeRoomId!),
                    answerPosition,
                    answer,
                    BigInt(room.myBoardRandomness!),
                    room.myBoard!.flat(),
                    room.enemyShots,
                    [...room.myShotAnswers.map((a) => a.answer), answer],
                    room.myShots,
                    room.enemyShotAnswers.map((a) => a.answer),
                ],
            })
        } else {
            writeContract({
                ...contractConfig,
                functionName: 'proveVictory',
                args: [
                    BigInt(activeRoomId!),
                    BigInt(room.myBoardRandomness!),
                    room.myBoard!.flat(),
                    room.enemyShots,
                    room.myShotAnswers.map((a) => a.answer),
                    room.myShots,
                    room.enemyShotAnswers.map((a) => a.answer),
                ],
            })
        }
    }

    useWatchContractEvent({
        ...contractConfig,
        eventName: 'ShotTaken',
        onLogs: (logs) => {
            console.log('ShotTaken', logs)
            for (const log of logs) {
                if (log.args.roomId === BigInt(activeRoomId!)) {
                    // console.log('Updating shots')
                    updateShots(log.args.player!, Number(log.args.noShots), log.args.position!)
                }
            }
        },
    })

    useWatchContractEvent({
        ...contractConfig,
        eventName: 'ShotAnswered',
        onLogs: (logs) => {
            console.log('ShotAnswered', logs)
            const answers = logs
                .filter((log) => log.args.roomId === BigInt(activeRoomId!))
                .map(
                    (log) =>
                        [
                            log.args.player!,
                            Number(log.args.noShots),
                            log.args.position!,
                            log.args.answer as ShotResultInt,
                        ] as [string, number, ShotCoordinate, ShotResultInt]
                )
            updateAnswers(answers)
        },
    })

    useWatchContractEvent({
        ...contractConfig,
        eventName: 'VictoryProven',
        onLogs: (logs) => {
            console.log('=== VictoryProven', logs)
        },
    })

    return (
        <BattleshipGame
            playerBoard={myBoard}
            playerShotResults={roomData[activeRoomId!].enemyShotAnswers}
            enemyShotCoordinates={roomData[activeRoomId!].enemyShots}
            isPlayerTurn={isMyTurn}
            gameStatus={room.winner}
            onPlayerShot={onShot}
            isPending={isPending}
            onClaimVictory={claimVictory}
        />
    )
}

enum ShotState {
    Untouched,
    Hit,
    Miss,
    Sunk,
}

type GameBoardState = ShotState[][]

interface BattleshipGameProps {
    playerBoard: boolean[][]
    playerShotResults: ShotResult[]
    enemyShotCoordinates: ShotCoordinate[]
    isPlayerTurn: boolean
    gameStatus: WinnerTypeInt
    onPlayerShot: (row: number, col: number) => void
    isPending: boolean
    onClaimVictory: () => void
}

const createEmptyGameBoard = (): GameBoardState =>
    Array(BOARD_SIZE)
        .fill(null)
        .map(() => Array(BOARD_SIZE).fill(ShotState.Untouched))

const BattleshipGame = ({
    playerBoard,
    playerShotResults,
    enemyShotCoordinates,
    isPlayerTurn,
    gameStatus,
    onPlayerShot,
    isPending,
    onClaimVictory,
}: BattleshipGameProps) => {
    const playerShots = useMemo(() => {
        const newPlayerShots = createEmptyGameBoard()
        playerShotResults.forEach((result) => {
            if (result.answer === ShotResultType.Hit) {
                newPlayerShots[result.x][result.y] = ShotState.Hit
            } else if (result.answer === ShotResultType.Miss) {
                newPlayerShots[result.x][result.y] = ShotState.Miss
            } else if (result.answer === ShotResultType.Sunk) {
                newPlayerShots[result.x][result.y] = ShotState.Hit

                function dfs(x: number, y: number) {
                    if (x < 0 || x >= BOARD_SIZE || y < 0 || y >= BOARD_SIZE) return
                    if (newPlayerShots[x][y] !== ShotState.Hit) return
                    newPlayerShots[x][y] = ShotState.Sunk
                    dfs(x - 1, y)
                    dfs(x + 1, y)
                    dfs(x, y - 1)
                    dfs(x, y + 1)
                }
                console.log('Sunk', result.x, result.y)
                dfs(result.x, result.y)
            }
        })
        return newPlayerShots
    }, [playerShotResults])

    const enemyShots = useMemo(() => {
        const newEnemyShots = createEmptyGameBoard()
        enemyShotCoordinates.forEach((shot) => {
            const isHit = playerBoard[shot.x][shot.y]
            newEnemyShots[shot.x][shot.y] = isHit ? ShotState.Hit : ShotState.Miss
        })
        return newEnemyShots
    }, [enemyShotCoordinates, playerBoard])

    const handlePlayerShot = (row: number, col: number) => {
        if (!isPlayerTurn || gameStatus !== WinnerType.None || playerShots[row][col] !== ShotState.Untouched) {
            return
        }
        onPlayerShot(row, col)
    }

    const renderCell = (state: ShotState, isShip?: boolean) => {
        const baseClass = 'flex items-center justify-center font-bold text-xl'
        if (state === ShotState.Sunk) {
            return (
                <div className="w-full h-full bg-red-200 flex items-center justify-center absolute inset-0">
                    <span className="text-red-500">✕</span>
                </div>
            )
        }
        if (state === ShotState.Hit) {
            return <div className={`${baseClass} text-red-500 absolute inset-0`}>✕</div>
        }
        if (state === ShotState.Miss) {
            return <div className={`${baseClass} text-blue-400 absolute inset-0`}>●</div>
        }
        if (isShip) {
            return <div className="w-full h-full bg-slate-700"></div>
        }
        return null
    }

    return (
        <div className="flex flex-col lg:flex-row gap-8 p-4 sm:p-6 bg-slate-100 rounded-lg shadow-lg w-full max-w-7xl">
            <div className="w-full lg:w-72 flex flex-col justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 border-b-2 border-slate-300 pb-2 mb-4">
                        The Battle
                    </h2>
                    {gameStatus === WinnerType.None && (
                        <div
                            className={`p-4 rounded-md text-center ${
                                isPlayerTurn ? 'bg-blue-100 border-blue-400' : 'bg-orange-100 border-orange-400'
                            }`}
                        >
                            <h3 className="font-bold text-lg">{isPlayerTurn ? 'Your Turn' : "Enemy's Turn"}</h3>
                            <p className="text-sm">
                                {isPlayerTurn ? 'Select a cell on the enemy board to fire.' : 'Awaiting enemy fire...'}
                            </p>
                        </div>
                    )}
                    {gameStatus !== WinnerType.None && (
                        <div
                            className={`p-4 rounded-md text-center ${
                                gameStatus === WinnerType.Self
                                    ? 'bg-green-100 border-green-400'
                                    : 'bg-red-100 border-red-400'
                            }`}
                        >
                            <h3 className="font-bold text-2xl">
                                {gameStatus === WinnerType.Self ? 'You Win!' : 'You Lose!'}
                            </h3>
                            {gameStatus === WinnerType.Self && (
                                <button
                                    className="bg-blue-500 text-white px-4 py-2 rounded-md"
                                    onClick={onClaimVictory}
                                >
                                    Claim Victory
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <h3 className="text-xl font-bold text-center text-slate-700 mb-2">Your Board</h3>
                    <div
                        className="grid w-full aspect-square border-2 border-slate-400"
                        style={{ gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)` }}
                    >
                        {playerBoard.map((row, rIdx) =>
                            row.map((isShip, cIdx) => (
                                <div key={`${rIdx}-${cIdx}`} className="border border-slate-300 bg-white relative">
                                    {renderCell(enemyShots[rIdx][cIdx], isShip)}
                                </div>
                            ))
                        )}
                    </div>
                </div>
                <div>
                    <h3 className="text-xl font-bold text-center text-slate-700 mb-2">Enemy Board</h3>
                    <div
                        className="grid w-full aspect-square border-2 border-slate-400"
                        style={{ gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)` }}
                    >
                        {playerShots.map((row, rIdx) =>
                            row.map((shot, cIdx) => {
                                const isEnabled =
                                    isPlayerTurn &&
                                    !isPending &&
                                    shot === ShotState.Untouched &&
                                    gameStatus === WinnerType.None
                                return (
                                    <button
                                        key={`${rIdx}-${cIdx}`}
                                        className={`border border-slate-300 bg-white relative ${
                                            isEnabled ? 'cursor-pointer hover:bg-slate-200' : ''
                                        }`}
                                        onClick={() => handlePlayerShot(rIdx, cIdx)}
                                        disabled={!isEnabled}
                                    >
                                        {renderCell(shot)}
                                    </button>
                                )
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
