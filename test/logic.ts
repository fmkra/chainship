import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers'
import { deployChainshipFixture } from './utils'
import { ethers } from 'hardhat'
import { expect } from 'chai'

describe('Logic', function () {
    it('Should correctly randomize starting player', async function () {
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
