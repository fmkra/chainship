import { BOARD_SIZE, ShipConfig, SHIPS_CONFIG, useStore } from '../store'
import { useState, useMemo } from 'react'
import { cn, commitBoard, getRandomUint256 } from '../utils'
import { useWatchContractEvent, useWriteContract } from 'wagmi'
import { contractConfig } from '../ContractConfig'
import Button from '../atomic/Button'
import { useNotificationStore } from '../atomic/Toaster'

export default function Board() {
    const { roomData, activeRoomId, submitBoard, startGame } = useStore()
    const { addNotification } = useNotificationStore()
    const boardRandomness = useMemo(getRandomUint256, [])
    const room = roomData[activeRoomId!]

    const { writeContract, status } = useWriteContract({
        mutation: {
            onError: (error) => {
                addNotification(error.name + ': ' + error.message, 'error')
            },
        },
    })

    useWatchContractEvent({
        ...contractConfig,
        eventName: 'GameStarted',
        onLogs: (logs) => {
            for (const log of logs) {
                if (log.address === contractConfig.address && log.args.roomId === BigInt(activeRoomId!)) {
                    startGame(log.args.startingPlayer!)
                }
            }
        },
    })

    return (
        <div className="w-full flex justify-center">
            <BattleshipSetup
                status={status}
                onSubmitBoard={(board) => {
                    submitBoard(boardRandomness, board)
                    writeContract({
                        ...contractConfig,
                        functionName: 'submitBoard',
                        args: [
                            BigInt(activeRoomId!),
                            BigInt(commitBoard(BigInt(boardRandomness), board)),
                            BigInt(room!.randomness),
                        ],
                    })
                }}
            />
        </div>
    )
}

enum CellState {
    Empty,
    Ship,
    HoverValid,
    HoverInvalid,
}

type Board = CellState[][]

type Orientation = 'horizontal' | 'vertical'

interface HoveredCell {
    row: number
    col: number
    isValid: boolean
}

interface BattleshipSetupProps {
    status: 'error' | 'idle' | 'pending' | 'success'
    onSubmitBoard: (board: boolean[][]) => void
}

const createEmptyBoard = (): Board =>
    Array(BOARD_SIZE)
        .fill(null)
        .map(() => Array(BOARD_SIZE).fill(CellState.Empty))

const BattleshipSetup = ({ onSubmitBoard, status }: BattleshipSetupProps) => {
    const [board, setBoard] = useState<Board>(createEmptyBoard)
    const [currentShipIndex, setCurrentShipIndex] = useState<number>(0)
    const [orientation, setOrientation] = useState<Orientation>('horizontal')
    const [hoveredCells, setHoveredCells] = useState<HoveredCell[]>([])

    const isSetupComplete = currentShipIndex >= SHIPS_CONFIG.length
    const currentShip = isSetupComplete ? null : SHIPS_CONFIG[currentShipIndex]

    const canPlaceShip = (row: number, col: number, ship: ShipConfig, boardState: Board): boolean => {
        if (orientation === 'horizontal') {
            if (col + ship.length > BOARD_SIZE) return false
        } else {
            if (row + ship.length > BOARD_SIZE) return false
        }
        for (let i = 0; i < ship.length; i++) {
            const r = orientation === 'vertical' ? row + i : row
            const c = orientation === 'horizontal' ? col + i : col
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    const checkRow = r + dr
                    const checkCol = c + dc
                    if (checkRow >= 0 && checkRow < BOARD_SIZE && checkCol >= 0 && checkCol < BOARD_SIZE) {
                        if (boardState[checkRow][checkCol] === CellState.Ship) {
                            return false
                        }
                    }
                }
            }
        }
        return true
    }

    const handleCellMouseEnter = (row: number, col: number) => {
        if (isSetupComplete || !currentShip) return
        const isValid = canPlaceShip(row, col, currentShip, board)
        const newHoveredCells: HoveredCell[] = []
        for (let i = 0; i < currentShip.length; i++) {
            const r = orientation === 'vertical' ? row + i : row
            const c = orientation === 'horizontal' ? col + i : col
            if (r < BOARD_SIZE && c < BOARD_SIZE) {
                newHoveredCells.push({ row: r, col: c, isValid })
            }
        }
        setHoveredCells(newHoveredCells)
    }

    const handleCellMouseLeave = () => setHoveredCells([])

    const handleCellClick = (row: number, col: number) => {
        if (isSetupComplete || !currentShip) return
        if (canPlaceShip(row, col, currentShip, board)) {
            const newBoard = board.map((r) => [...r])
            for (let i = 0; i < currentShip.length; i++) {
                const r = orientation === 'vertical' ? row + i : row
                const c = orientation === 'horizontal' ? col + i : col
                newBoard[r][c] = CellState.Ship
            }
            setBoard(newBoard)
            setCurrentShipIndex((prev) => prev + 1)
            setHoveredCells([])
        }
    }

    const handleRotate = () => setOrientation((prev) => (prev === 'horizontal' ? 'vertical' : 'horizontal'))

    const handleReset = () => {
        setBoard(createEmptyBoard())
        setCurrentShipIndex(0)
        setOrientation('horizontal')
        setHoveredCells([])
    }

    const handleSubmit = () => {
        const booleanBoard = board.map((row) => row.map((cell) => cell === CellState.Ship))
        onSubmitBoard(booleanBoard)
    }

    const displayBoard = useMemo(() => {
        const newDisplayBoard = board.map((r) => [...r])
        hoveredCells.forEach(({ row, col, isValid }) => {
            newDisplayBoard[row][col] = isValid ? CellState.HoverValid : CellState.HoverInvalid
        })
        return newDisplayBoard
    }, [board, hoveredCells])

    const getCellClass = (cellState: CellState): string => {
        switch (cellState) {
            case CellState.Ship:
                return 'bg-slate-700'
            case CellState.HoverValid:
                return 'bg-green-400'
            case CellState.HoverInvalid:
                return 'bg-red-500'
            default:
                return 'bg-white hover:bg-slate-200'
        }
    }

    return (
        <div className="flex flex-col md:flex-row gap-8 p-4 sm:p-6 bg-slate-100 rounded-lg w-full max-w-4xl">
            <div className="w-full md:w-64 flex flex-col justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 border-b-2 border-slate-300 pb-2 mb-4">
                        Battleship Setup
                    </h2>
                    {!isSetupComplete ? (
                        <div>
                            <h3 className="text-lg font-semibold text-slate-700">Place your ships</h3>
                            <p className="text-slate-600 mt-2">
                                Now placing:{' '}
                                <strong className="text-blue-600">
                                    {currentShip?.name} (Length: {currentShip?.length})
                                </strong>
                            </p>
                            <p className="text-slate-600">
                                Orientation: <strong className="capitalize">{orientation}</strong>
                            </p>
                        </div>
                    ) : status !== 'success' ? (
                        <div className="p-4 bg-blue-100 border border-blue-400 text-blue-800 rounded-md text-center">
                            <h3 className="font-bold">Board Ready!</h3>
                            <p className="text-sm">Submit your board to begin.</p>
                        </div>
                    ) : (
                        <div className="p-4 bg-blue-100 border border-green-400 text-green-800 rounded-md text-center">
                            <h3 className="font-bold">Board Submitted!</h3>
                            <p className="text-sm">Waiting for opponent to submit their board...</p>
                        </div>
                    )}
                </div>
                <div className="flex flex-col gap-3 mt-6">
                    {isSetupComplete ? (
                        <Button
                            onClick={handleSubmit}
                            disabled={status === 'pending' || status === 'success'}
                            variant="green"
                        >
                            Submit Board
                        </Button>
                    ) : (
                        <Button onClick={handleRotate}>Rotate Ship</Button>
                    )}
                    <Button
                        onClick={handleReset}
                        disabled={status === 'pending' || status === 'success'}
                        variant="orange"
                    >
                        Reset Board
                    </Button>
                </div>
            </div>

            <div className="w-full md:flex-1 flex justify-center items-center">
                <div
                    className="grid w-full max-w-md aspect-square border-2 border-slate-400"
                    style={{
                        gridTemplateColumns: `repeat(${BOARD_SIZE}, minmax(0, 1fr))`,
                    }}
                    onMouseLeave={handleCellMouseLeave}
                >
                    {displayBoard.map((row, rowIndex) =>
                        row.map((cell, colIndex) => (
                            <button
                                key={`${rowIndex}-${colIndex}`}
                                className={cn(
                                    'border border-slate-300 transition-colors',
                                    isSetupComplete || 'hover:cursor-pointer',
                                    getCellClass(cell)
                                )}
                                onClick={() => handleCellClick(rowIndex, colIndex)}
                                onMouseEnter={() => handleCellMouseEnter(rowIndex, colIndex)}
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}
