import hre, { ethers } from 'hardhat'

export async function deployChainshipFixture() {
    const [owner, otherAccount] = await hre.ethers.getSigners()

    const Chainship = await hre.ethers.getContractFactory('TestInternals')
    const chainship = await Chainship.deploy()

    return { chainship, owner, otherAccount }
}

export function getRoomKeys() {
    const privateKey = ethers.toBigInt(ethers.randomBytes(32))
    const packed = ethers.solidityPacked(['uint256', 'uint256'], ['0x0', privateKey])
    const hash = ethers.keccak256(packed)
    const roomId = ethers.toBigInt(hash)
    return { roomId, privateKey }
}

export function getBoard(boardStr?: string) {
    boardStr =
        boardStr ??
        `
            ###......#
            .........#
            .........#
            ...#.....#
            .#.#......
            ..........
            ..........
            ..........
            ..........
            #.......##
        `
    const board = boardStr
        .split('\n')
        .filter((row) => row.trim() !== '')
        .map((row) =>
            row
                .trim()
                .split('')
                .map((cell) => cell === '#')
        )
        .filter((row) => row.length > 0)

    const hits = board.map((row) => row.map((_) => false))

    const mapper = (x: number, y: number) => x * 10 + y

    return [board.flat(), hits.flat(), mapper] as const
}

export function getBoardCommitment(randomness: bigint, board: boolean[]) {
    const packed = ethers.solidityPacked(['uint256', 'bool[]'], [randomness, board])
    const hash = ethers.keccak256(packed)
    return ethers.toBigInt(hash)
}
