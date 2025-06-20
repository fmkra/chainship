import { time, loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers'
import { anyValue } from '@nomicfoundation/hardhat-chai-matchers/withArgs'
import { expect } from 'chai'
import hre, { ethers } from 'hardhat'

describe('Chainship', function () {
    async function deployChainshipFixture() {
        const [owner, otherAccount] = await hre.ethers.getSigners()

        const Chainship = await hre.ethers.getContractFactory('TestInternals')
        const chainship = await Chainship.deploy()

        return { chainship, owner, otherAccount }
    }

    function getRoomKeys() {
        const privateKey = ethers.toBigInt(ethers.randomBytes(32))
        const packed = ethers.solidityPacked(['uint256', 'uint256'], ['0x0', privateKey])
        const hash = ethers.keccak256(packed)
        const roomId = ethers.toBigInt(hash)
        return { roomId, privateKey }
    }

    function getBoard(boardStr?: string) {
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

    describe('Deployment', function () {
        it('Should create a room', async function () {
            const { chainship, owner, otherAccount } = await loadFixture(deployChainshipFixture)

            const { roomId, privateKey } = await getRoomKeys()
            const fee = ethers.parseEther('1')

            await chainship.connect(owner).createRoom(roomId, 0, { value: fee })

            await chainship.connect(otherAccount).joinRoom(privateKey, 0, { value: fee })

            // getBoardCommitment()

            const x = await loadFixture(deployChainshipFixture)
        })
    })

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
                .......#..
                ..........
                ..........
                ....#.....
                ....#.....
                ..........
                ..........
                ..........
                ..........
                `,
                `
                ##........
                ..........
                ..........
                ..........
                ..........
                ..........
                ..........
                ..........
                ..........
                .........#
                `,
            ]

            for (const boardStr of boards) {
                const [board] = getBoard(boardStr)
                await chainship.verifyBoard(BigInt(0x123), board)
            }
        })
    })

    describe('Randomizing player', function () {
        it('Should correctly calculate starting player', async function () {
            const { chainship, owner: account1, otherAccount: account2 } = await loadFixture(deployChainshipFixture)

            const fee = ethers.parseEther('1')

            const NUMBER_OF_TESTS = 100
            let roomSecret = BigInt(0)
            let player1Wins = 0
            for (let i = 0; i < NUMBER_OF_TESTS; i++) {
                const randomnessPlayer1 = BigInt(ethers.hexlify(ethers.randomBytes(32)))
                const randomnessPlayer2 = BigInt(ethers.hexlify(ethers.randomBytes(32)))

                roomSecret++
                const commitmentPlayer1 = ethers.solidityPackedKeccak256(['uint256'], [randomnessPlayer1])
                const commitmentPlayer2 = ethers.solidityPackedKeccak256(['uint256'], [randomnessPlayer2])

                const roomId = await chainship.roomSecretToId(roomSecret)
                await chainship.connect(account1).createRoom(roomId, commitmentPlayer1, { value: fee })
                await chainship.connect(account2).joinRoom(roomSecret, commitmentPlayer2, { value: fee })

                const correctStartingPlayer =
                    (BigInt(
                        ethers.solidityPackedKeccak256(['uint256', 'uint256'], [randomnessPlayer1, randomnessPlayer2])
                    ) &
                        1n) ==
                    0n
                if (correctStartingPlayer) player1Wins++

                await chainship.connect(account1).submitBoard(roomId, 1, randomnessPlayer1)
                await expect(chainship.connect(account2).submitBoard(roomId, 1, randomnessPlayer2))
                    .to.emit(chainship, 'GameStarted')
                    .withArgs(roomId, (correctStartingPlayer ? account1 : account2).address)
            }

            // Ensure randomization is roughly fair
            // This check fails with probability 1.8e-7
            expect(NUMBER_OF_TESTS / 4 <= player1Wins && player1Wins <= (NUMBER_OF_TESTS * 3) / 4)
        })
    })
})
