import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers'
import { anyValue } from '@nomicfoundation/hardhat-chai-matchers/withArgs'
import { expect } from 'chai'
import { ethers } from 'hardhat'
import { deployChainshipFixture, getBoard, getBoardCommitment, getRoomKeys } from './utils'

describe('Full flow', function () {
    it('Should win the game', async function () {
        const { chainship, owner, otherAccount } = await loadFixture(deployChainshipFixture)

        const { roomId, privateKey } = await getRoomKeys()
        const fee = ethers.parseEther('1')

        const player1Randomness = BigInt('0x3f2f81548e3d7580c061e304354e2f2df1b4b2cc1639b7a795b8b25cdf3d68bb')
        const player1Commitment = ethers.solidityPackedKeccak256(['uint256'], [player1Randomness])

        await expect(chainship.connect(owner).createRoom(roomId, player1Commitment, { value: fee }))
            .to.emit(chainship, 'CreatedRoom')
            .withArgs(roomId, owner, fee, 0)

        const player2Randomness = BigInt('0xe5b0f227f4c4cc50b1e4b752ac19013fd4b7d18ee7cc12e09d3580e5f995eb18')
        const player2Commitment = ethers.solidityPackedKeccak256(['uint256'], [player2Randomness])

        await expect(chainship.connect(otherAccount).joinRoom(privateKey, player2Commitment, { value: fee }))
            .to.emit(chainship, 'JoinedRoom')
            .withArgs(roomId, otherAccount)

        const [player1Board] = getBoard(`
            ........##
            ...#......
            ...#......
            ...#..###.
            ...#......
            #..#......
            #.........
            #.........
            ....####..
            ..........
        `)
        const player1BoardRandomness = BigInt(ethers.hexlify(ethers.randomBytes(32)))
        const player1BoardCommitment = getBoardCommitment(player1BoardRandomness, player1Board)

        await expect(chainship.connect(owner).submitBoard(roomId, player1BoardCommitment, player1Randomness))
            .to.emit(chainship, 'BoardSubmitted')
            .withArgs(roomId, owner, player1BoardCommitment)

        const [player2Board] = getBoard(`
            ..........
            .#.....##.
            .#........
            .#..###...
            ..........
            ..........
            ####......
            ..........
            ..........
            ...#####..
        `)

        const player2BoardRandomness = BigInt(ethers.hexlify(ethers.randomBytes(32)))
        const player2BoardCommitment = getBoardCommitment(player2BoardRandomness, player2Board)

        await expect(chainship.connect(otherAccount).submitBoard(roomId, player2BoardCommitment, player2Randomness))
            .to.emit(chainship, 'BoardSubmitted')
            .withArgs(roomId, otherAccount, player2BoardCommitment)
            .to.emit(chainship, 'GameStarted')
            .withArgs(roomId, otherAccount)

        const player1Shots = [
            [2, 2, 'Hit'],
            [3, 2, 'Hit'],
            [4, 2, 'Sunk'],

            [6, 2, 'Hit'],
            [6, 3, 'Hit'],
            [6, 4, 'Miss'],
            [6, 1, 'Hit'],
            [6, 0, 'Sunk'],

            [9, 4, 'Hit'],
            [8, 4, 'Miss'],
            [9, 5, 'Hit'],
            [9, 6, 'Hit'],
            [9, 7, 'Hit'],
            [9, 8, 'Miss'],
            [9, 3, 'Sunk'],

            [3, 6, 'Hit'],
            [4, 6, 'Miss'],
            [2, 6, 'Miss'],
            [3, 7, 'Miss'],
            [3, 5, 'Hit'],
            [3, 4, 'Sunk'],

            [1, 7, 'Hit'],
            [1, 8, 'Sunk'],
            [0, 0, 'Won'],
        ] as const

        const player2Shots = [
            [0, 0, 'Miss'],
            [0, 1, 'Miss'],
            [0, 2, 'Miss'],
            [0, 3, 'Miss'],
            [0, 4, 'Miss'],
            [0, 5, 'Miss'],

            [0, 9, 'Hit'],
            [0, 8, 'Sunk'],

            [1, 3, 'Hit'],
            [2, 3, 'Hit'],
            [3, 3, 'Hit'],
            [4, 3, 'Hit'],
            [5, 3, 'Sunk'],

            [3, 6, 'Hit'],
            [3, 7, 'Hit'],
            [3, 8, 'Sunk'],

            [5, 0, 'Hit'],
            [6, 0, 'Hit'],
            [7, 0, 'Sunk'],

            [8, 4, 'Hit'],
            [8, 5, 'Hit'],
            [8, 6, 'Hit'],
            [8, 7, 'Sunk'],
        ] as const

        const allShots = player2Shots.map((a, i) => (i < player1Shots.length ? [a, player1Shots[i]] : a)).flat()

        for (let i = 0; i < allShots.length; i++) {
            const [x, y, r] = allShots[i] as [number, number, string]
            const shooter = i % 2 === 0 ? otherAccount : owner
            const answerer = i % 2 === 0 ? owner : otherAccount
            const answer = r === 'Hit' ? BigInt(1) : r == 'Sunk' ? BigInt(2) : BigInt(0)
            const noShots = BigInt(Math.floor(i / 2) + 1)

            await expect(chainship.connect(shooter).shoot(roomId, { x, y }))
                .to.emit(chainship, 'ShotTaken')
                .withArgs(roomId, shooter, noShots, [x, y], anyValue)

            if (r == 'Won') {
                if (i % 2 === 0) {
                    await expect(
                        chainship.connect(shooter).proveVictory(
                            roomId,
                            player1Randomness,
                            player1Board,
                            player2Shots.map(([x, y]) => ({ x, y })),
                            player1Shots.map((s) =>
                                s[2] == 'Hit' ? BigInt(1) : s[2] == 'Sunk' ? BigInt(2) : BigInt(0)
                            ),
                            player1Shots.map(([x, y]) => ({ x, y })),
                            player2Shots.map((s) =>
                                s[2] == 'Hit' ? BigInt(1) : s[2] == 'Sunk' ? BigInt(2) : BigInt(0)
                            )
                        )
                    ).to.emit(chainship, 'VictoryProved')
                } else {
                    await expect(
                        chainship.connect(shooter).proveVictory(
                            roomId,
                            player2Randomness,
                            player2Board,
                            player1Shots.map(([x, y]) => ({ x, y })),
                            player2Shots.map((s) =>
                                s[2] == 'Hit' ? BigInt(1) : s[2] == 'Sunk' ? BigInt(2) : BigInt(0)
                            ),
                            player2Shots.map(([x, y]) => ({ x, y })),
                            player1Shots.map((s) =>
                                s[2] == 'Hit' ? BigInt(1) : s[2] == 'Sunk' ? BigInt(2) : BigInt(0)
                            )
                        )
                    ).to.emit(chainship, 'VictoryProved')
                }
                break
            }
            await expect(chainship.connect(answerer).answerShot(roomId, { x, y }, answer))
                .to.emit(chainship, 'ShotAnswered')
                .withArgs(roomId, answerer, noShots, [x, y], answer, anyValue)
        }
    })
})
