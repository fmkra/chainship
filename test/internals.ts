import { expect } from 'chai'
import { deployChainshipFixture, getBoard } from './utils'
import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers'

describe('Internals', function () {
    it('_isSinkHit', async function () {
        const { chainship } = await loadFixture(deployChainshipFixture)
        const [board, hits, mapper] = getBoard()

        // Notice: this function checks whether hitting at the position would sink the ship,
        // NOT whether the ship is already sank.
        expect(await chainship.isSinkHit(board, hits, mapper(0, 0))).to.equal(false)
        expect(await chainship.isSinkHit(board, hits, mapper(0, 1))).to.equal(false)
        expect(await chainship.isSinkHit(board, hits, mapper(0, 2))).to.equal(false)
        hits[mapper(0, 0)] = true
        expect(await chainship.isSinkHit(board, hits, mapper(0, 0))).to.equal(false)
        expect(await chainship.isSinkHit(board, hits, mapper(0, 1))).to.equal(false)
        expect(await chainship.isSinkHit(board, hits, mapper(0, 2))).to.equal(false)
        hits[mapper(0, 1)] = true
        expect(await chainship.isSinkHit(board, hits, mapper(0, 0))).to.equal(false)
        expect(await chainship.isSinkHit(board, hits, mapper(0, 1))).to.equal(false)
        expect(await chainship.isSinkHit(board, hits, mapper(0, 2))).to.equal(true)
        hits[mapper(0, 2)] = true
        expect(await chainship.isSinkHit(board, hits, mapper(0, 0))).to.equal(true)
        expect(await chainship.isSinkHit(board, hits, mapper(0, 1))).to.equal(true)
        expect(await chainship.isSinkHit(board, hits, mapper(0, 2))).to.equal(true)

        expect(await chainship.isSinkHit(board, hits, mapper(0, 9))).to.equal(false)
        expect(await chainship.isSinkHit(board, hits, mapper(1, 9))).to.equal(false)
        expect(await chainship.isSinkHit(board, hits, mapper(2, 9))).to.equal(false)
        expect(await chainship.isSinkHit(board, hits, mapper(3, 9))).to.equal(false)
        hits[mapper(1, 9)] = true
        expect(await chainship.isSinkHit(board, hits, mapper(0, 9))).to.equal(false)
        expect(await chainship.isSinkHit(board, hits, mapper(1, 9))).to.equal(false)
        expect(await chainship.isSinkHit(board, hits, mapper(2, 9))).to.equal(false)
        expect(await chainship.isSinkHit(board, hits, mapper(3, 9))).to.equal(false)
        hits[mapper(2, 9)] = true
        expect(await chainship.isSinkHit(board, hits, mapper(0, 9))).to.equal(false)
        expect(await chainship.isSinkHit(board, hits, mapper(1, 9))).to.equal(false)
        expect(await chainship.isSinkHit(board, hits, mapper(2, 9))).to.equal(false)
        expect(await chainship.isSinkHit(board, hits, mapper(3, 9))).to.equal(false)
        hits[mapper(0, 9)] = true
        expect(await chainship.isSinkHit(board, hits, mapper(0, 9))).to.equal(false)
        expect(await chainship.isSinkHit(board, hits, mapper(1, 9))).to.equal(false)
        expect(await chainship.isSinkHit(board, hits, mapper(2, 9))).to.equal(false)
        expect(await chainship.isSinkHit(board, hits, mapper(3, 9))).to.equal(true)
        hits[mapper(3, 9)] = true
        expect(await chainship.isSinkHit(board, hits, mapper(0, 9))).to.equal(true)
        expect(await chainship.isSinkHit(board, hits, mapper(1, 9))).to.equal(true)
        expect(await chainship.isSinkHit(board, hits, mapper(2, 9))).to.equal(true)
        expect(await chainship.isSinkHit(board, hits, mapper(3, 9))).to.equal(true)

        expect(await chainship.isSinkHit(board, hits, mapper(4, 1))).to.equal(true)
        hits[mapper(4, 1)] = true
        expect(await chainship.isSinkHit(board, hits, mapper(4, 1))).to.equal(true)

        expect(await chainship.isSinkHit(board, hits, mapper(3, 3))).to.equal(false)
        expect(await chainship.isSinkHit(board, hits, mapper(4, 3))).to.equal(false)
        hits[mapper(3, 3)] = true
        expect(await chainship.isSinkHit(board, hits, mapper(3, 3))).to.equal(false)
        expect(await chainship.isSinkHit(board, hits, mapper(4, 3))).to.equal(true)
        hits[mapper(4, 3)] = true
        expect(await chainship.isSinkHit(board, hits, mapper(3, 3))).to.equal(true)
        expect(await chainship.isSinkHit(board, hits, mapper(4, 3))).to.equal(true)

        expect(await chainship.isSinkHit(board, hits, mapper(9, 0))).to.equal(true)
        hits[mapper(9, 0)] = true
        expect(await chainship.isSinkHit(board, hits, mapper(9, 0))).to.equal(true)

        expect(await chainship.isSinkHit(board, hits, mapper(9, 8))).to.equal(false)
        expect(await chainship.isSinkHit(board, hits, mapper(9, 9))).to.equal(false)
        hits[mapper(9, 9)] = true
        expect(await chainship.isSinkHit(board, hits, mapper(9, 8))).to.equal(true)
        expect(await chainship.isSinkHit(board, hits, mapper(9, 9))).to.equal(false)
        hits[mapper(9, 8)] = true
        expect(await chainship.isSinkHit(board, hits, mapper(9, 8))).to.equal(true)
        expect(await chainship.isSinkHit(board, hits, mapper(9, 9))).to.equal(true)
    })

    it('_verifyAnswerCorrectness', async function () {
        const { chainship } = await loadFixture(deployChainshipFixture)
        const [board, mapper] = getBoard()
        const answer = {
            Miss: BigInt(0),
            Hit: BigInt(1),
            Sunk: BigInt(2),
        }

        const shotsAndAnswers: { x: number; y: number; a: bigint }[] = [{ x: 0, y: 0, a: answer.Hit }]
        const shots = shotsAndAnswers.map(({ x, y }) => ({ x, y }))
        const answers = shotsAndAnswers.map(({ a }) => a)

        chainship.verifyAnswerCorrectness(board, [{ x: 0, y: 0 }], [answer.Hit])
    })

    it('verifyBoard', async function () {
        const { chainship } = await loadFixture(deployChainshipFixture)

        const boards = [
            `
            ..........
            .#...###..
            .#........
            .#........
            .#..#...##
            ....#.....
            ....#.....
            ....#..#..
            ....#..#..
            .......#..
            `,
            `
            #####....#
            .........#
            .........#
            .........#
            ..........
            ..........
            ..........
            .........#
            .........#
            ###...##.#
            `,
        ]

        for (const boardStr of boards) {
            const [board] = getBoard(boardStr)
            await chainship.verifyBoard(BigInt(0x123), board)
        }
    })
})
