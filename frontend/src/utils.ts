import { ethers } from 'ethers'
import { ShotCoordinate, ShotResultInt, ShotResultType } from './store'
import clsx, { ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function keccakHashUint256s(...args: (bigint | undefined)[]): string {
    const preimage = args
        .filter((a): a is bigint => a !== undefined)
        .map((a) => a.toString(16).padStart(64, '0'))
        .join('')
    return ethers.keccak256('0x' + preimage).padStart(64, '0')
}

export function getRandomUint256(): string {
    const r = new Uint8Array(32)
    crypto.getRandomValues(r)

    const id = Array.from(r)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')
        .padStart(64, '0')

    return '0x' + id
}

export function getCommitPair(seed?: bigint): [string, string] {
    const randomness = getRandomUint256()
    const hash = keccakHashUint256s(seed, BigInt(randomness))

    return [randomness, hash]
}

export function safeParseEther(eth: string) {
    try {
        return ethers.parseEther(eth)
    } catch {
        return null
    }
}

export function safeBigInt(value: string | number) {
    try {
        return BigInt(value)
    } catch {
        return null
    }
}

export function commitBoard(randomness: bigint, board: boolean[][]) {
    const data = ethers.solidityPacked(['uint256', 'bool[]'], [randomness, board.flat()])
    return ethers.keccak256(data)
}

export function generateAnswer(
    board: boolean[][],
    enemyShots: ShotCoordinate[],
    position: ShotCoordinate
): ShotResultInt {
    const { x, y } = position

    if (x < 0 || x >= board.length || y < 0 || y >= board[0].length) {
        return ShotResultType.Miss
    }

    if (!board[x][y]) {
        return ShotResultType.Miss
    }

    if (isShipSunk(board, enemyShots, x, y)) {
        return ShotResultType.Sunk
    }

    return ShotResultType.Hit
}

function isShipSunk(board: boolean[][], enemyShots: ShotCoordinate[], startX: number, startY: number): boolean {
    // Find all connected ship cells
    const shipCells = findConnectedShipCells(board, startX, startY)

    // Check if all ship cells have been hit
    return shipCells.every(
        (cell) =>
            enemyShots.some((shot) => shot.x === cell.x && shot.y === cell.y) ||
            (cell.x === startX && cell.y === startY) // Include the current shot
    )
}

function findConnectedShipCells(board: boolean[][], startX: number, startY: number): ShotCoordinate[] {
    const visited = new Set<string>()
    const shipCells: ShotCoordinate[] = []

    function dfs(x: number, y: number) {
        const key = `${x},${y}`
        if (visited.has(key)) return

        visited.add(key)

        // Check if this cell is part of the ship
        if (x < 0 || x >= board.length || y < 0 || y >= board[0].length || !board[x][y]) {
            return
        }

        shipCells.push({ x, y })

        // Check adjacent cells (up, down, left, right)
        dfs(x - 1, y)
        dfs(x + 1, y)
        dfs(x, y - 1)
        dfs(x, y + 1)
    }

    dfs(startX, startY)
    return shipCells
}

export const cn = (...classes: ClassValue[]) => twMerge(clsx(...classes))

export const shorten = (text: string, maxPrefixLength: number = 5, maxSuffixLength: number = 3) => {
    if (text.length <= maxPrefixLength + maxSuffixLength) return text
    return text.slice(0, maxPrefixLength) + '...' + text.slice(-maxSuffixLength)
}

export function filterLog(
    logAddress: string,
    logRoomId: bigint | undefined,
    configAddress: string | undefined,
    configRoomId: string | undefined
) {
    return (
        logAddress.toLowerCase() === (configAddress ?? '').toLowerCase() &&
        configRoomId !== undefined &&
        logRoomId === BigInt(configRoomId)
    )
}
