export const abi = [
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: 'Chainship.RoomId',
                name: 'roomId',
                type: 'uint256',
            },
            {
                indexed: false,
                internalType: 'address',
                name: 'player',
                type: 'address',
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'boardCommitment',
                type: 'uint256',
            },
        ],
        name: 'BoardSubmitted',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: 'Chainship.RoomId',
                name: 'roomId',
                type: 'uint256',
            },
            {
                indexed: false,
                internalType: 'address',
                name: 'player1',
                type: 'address',
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'entryFee',
                type: 'uint256',
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'commission',
                type: 'uint256',
            },
        ],
        name: 'CreatedRoom',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: 'Chainship.RoomId',
                name: 'roomId',
                type: 'uint256',
            },
            {
                indexed: false,
                internalType: 'address',
                name: 'player',
                type: 'address',
            },
        ],
        name: 'DishonestyClaimed',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: 'Chainship.RoomId',
                name: 'roomId',
                type: 'uint256',
            },
            {
                indexed: false,
                internalType: 'address',
                name: 'startingPlayer',
                type: 'address',
            },
        ],
        name: 'GameStarted',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: 'Chainship.RoomId',
                name: 'roomId',
                type: 'uint256',
            },
            {
                indexed: false,
                internalType: 'address',
                name: 'player',
                type: 'address',
            },
            {
                indexed: false,
                internalType: 'bool[]',
                name: 'board',
                type: 'bool[]',
            },
        ],
        name: 'HonestyProven',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: 'Chainship.RoomId',
                name: 'roomId',
                type: 'uint256',
            },
            {
                indexed: false,
                internalType: 'address',
                name: 'player2',
                type: 'address',
            },
        ],
        name: 'JoinedRoom',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: 'address',
                name: 'player',
                type: 'address',
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'prize',
                type: 'uint256',
            },
        ],
        name: 'PrizeReceived',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: 'Chainship.RoomId',
                name: 'roomId',
                type: 'uint256',
            },
            {
                indexed: false,
                internalType: 'address',
                name: 'player',
                type: 'address',
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'noShots',
                type: 'uint256',
            },
            {
                components: [
                    {
                        internalType: 'uint8',
                        name: 'x',
                        type: 'uint8',
                    },
                    {
                        internalType: 'uint8',
                        name: 'y',
                        type: 'uint8',
                    },
                ],
                indexed: false,
                internalType: 'struct Chainship.Position',
                name: 'position',
                type: 'tuple',
            },
            {
                indexed: false,
                internalType: 'enum Chainship.Answer',
                name: 'answer',
                type: 'uint8',
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'newAnswersCommitment',
                type: 'uint256',
            },
        ],
        name: 'ShotAnswered',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: 'Chainship.RoomId',
                name: 'roomId',
                type: 'uint256',
            },
            {
                indexed: false,
                internalType: 'address',
                name: 'player',
                type: 'address',
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'noShots',
                type: 'uint256',
            },
            {
                components: [
                    {
                        internalType: 'uint8',
                        name: 'x',
                        type: 'uint8',
                    },
                    {
                        internalType: 'uint8',
                        name: 'y',
                        type: 'uint8',
                    },
                ],
                indexed: false,
                internalType: 'struct Chainship.Position',
                name: 'position',
                type: 'tuple',
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'newShotsCommitment',
                type: 'uint256',
            },
        ],
        name: 'ShotTaken',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: 'Chainship.RoomId',
                name: 'roomId',
                type: 'uint256',
            },
            {
                indexed: false,
                internalType: 'address',
                name: 'player',
                type: 'address',
            },
            {
                indexed: false,
                internalType: 'bool[]',
                name: 'board',
                type: 'bool[]',
            },
        ],
        name: 'VictoryProven',
        type: 'event',
    },
    {
        inputs: [],
        name: 'BOARD_SIZE',
        outputs: [
            {
                internalType: 'uint8',
                name: '',
                type: 'uint8',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'CONTRACT_SEED',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'DEADLINE_BLOCK_TIME',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'MAX_SHIP_LENGTH',
        outputs: [
            {
                internalType: 'uint8',
                name: '',
                type: 'uint8',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256',
            },
        ],
        name: 'SHIP_COUNTS',
        outputs: [
            {
                internalType: 'uint8',
                name: '',
                type: 'uint8',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'TOTAL_SHIP_PARTS',
        outputs: [
            {
                internalType: 'uint16',
                name: '',
                type: 'uint16',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'Chainship.RoomId',
                name: 'roomId',
                type: 'uint256',
            },
            {
                components: [
                    {
                        internalType: 'uint8',
                        name: 'x',
                        type: 'uint8',
                    },
                    {
                        internalType: 'uint8',
                        name: 'y',
                        type: 'uint8',
                    },
                ],
                internalType: 'struct Chainship.Position',
                name: 'answerPosition',
                type: 'tuple',
            },
            {
                internalType: 'enum Chainship.Answer',
                name: 'answer',
                type: 'uint8',
            },
        ],
        name: 'answerAndClaimDishonest',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'Chainship.RoomId',
                name: 'roomId',
                type: 'uint256',
            },
            {
                components: [
                    {
                        internalType: 'uint8',
                        name: 'x',
                        type: 'uint8',
                    },
                    {
                        internalType: 'uint8',
                        name: 'y',
                        type: 'uint8',
                    },
                ],
                internalType: 'struct Chainship.Position',
                name: 'answerPosition',
                type: 'tuple',
            },
            {
                internalType: 'enum Chainship.Answer',
                name: 'answer',
                type: 'uint8',
            },
            {
                internalType: 'uint256',
                name: 'boardRandomness',
                type: 'uint256',
            },
            {
                internalType: 'bool[]',
                name: 'board',
                type: 'bool[]',
            },
            {
                components: [
                    {
                        internalType: 'uint8',
                        name: 'x',
                        type: 'uint8',
                    },
                    {
                        internalType: 'uint8',
                        name: 'y',
                        type: 'uint8',
                    },
                ],
                internalType: 'struct Chainship.Position[]',
                name: 'enemyShots',
                type: 'tuple[]',
            },
            {
                internalType: 'enum Chainship.Answer[]',
                name: 'myAnswers',
                type: 'uint8[]',
            },
            {
                components: [
                    {
                        internalType: 'uint8',
                        name: 'x',
                        type: 'uint8',
                    },
                    {
                        internalType: 'uint8',
                        name: 'y',
                        type: 'uint8',
                    },
                ],
                internalType: 'struct Chainship.Position[]',
                name: 'myShots',
                type: 'tuple[]',
            },
            {
                internalType: 'enum Chainship.Answer[]',
                name: 'enemyAnswers',
                type: 'uint8[]',
            },
        ],
        name: 'answerAndClaimVictory',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'Chainship.RoomId',
                name: 'roomId',
                type: 'uint256',
            },
            {
                components: [
                    {
                        internalType: 'uint8',
                        name: 'x',
                        type: 'uint8',
                    },
                    {
                        internalType: 'uint8',
                        name: 'y',
                        type: 'uint8',
                    },
                ],
                internalType: 'struct Chainship.Position',
                name: 'answerPosition',
                type: 'tuple',
            },
            {
                internalType: 'enum Chainship.Answer',
                name: 'answer',
                type: 'uint8',
            },
            {
                components: [
                    {
                        internalType: 'uint8',
                        name: 'x',
                        type: 'uint8',
                    },
                    {
                        internalType: 'uint8',
                        name: 'y',
                        type: 'uint8',
                    },
                ],
                internalType: 'struct Chainship.Position',
                name: 'shootPosition',
                type: 'tuple',
            },
        ],
        name: 'answerAndShoot',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'Chainship.RoomId',
                name: 'roomId',
                type: 'uint256',
            },
            {
                components: [
                    {
                        internalType: 'uint8',
                        name: 'x',
                        type: 'uint8',
                    },
                    {
                        internalType: 'uint8',
                        name: 'y',
                        type: 'uint8',
                    },
                ],
                internalType: 'struct Chainship.Position',
                name: 'position',
                type: 'tuple',
            },
            {
                internalType: 'enum Chainship.Answer',
                name: 'answer',
                type: 'uint8',
            },
        ],
        name: 'answerShot',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'uint256',
                name: 'entryFee',
                type: 'uint256',
            },
        ],
        name: 'calculateCommission',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256',
            },
        ],
        stateMutability: 'pure',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'Chainship.RoomId',
                name: 'roomId',
                type: 'uint256',
            },
        ],
        name: 'claimDishonest',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'Chainship.RoomId',
                name: 'roomId',
                type: 'uint256',
            },
        ],
        name: 'claimIdle',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'Chainship.RoomId',
                name: 'roomId',
                type: 'uint256',
            },
            {
                internalType: 'uint256',
                name: 'randomnessCommitment',
                type: 'uint256',
            },
        ],
        name: 'createRoom',
        outputs: [],
        stateMutability: 'payable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'Chainship.RoomId',
                name: 'roomId',
                type: 'uint256',
            },
        ],
        name: 'getRoomInfo',
        outputs: [
            {
                internalType: 'enum Chainship.RoomStatus',
                name: '',
                type: 'uint8',
            },
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256',
            },
            {
                internalType: 'address',
                name: '',
                type: 'address',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'uint256',
                name: 'roomSecret',
                type: 'uint256',
            },
            {
                internalType: 'uint256',
                name: 'randomnessCommitment',
                type: 'uint256',
            },
        ],
        name: 'joinRoom',
        outputs: [],
        stateMutability: 'payable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'Chainship.RoomId',
                name: 'roomId',
                type: 'uint256',
            },
            {
                internalType: 'uint256',
                name: 'boardRandomness',
                type: 'uint256',
            },
            {
                internalType: 'bool[]',
                name: 'board',
                type: 'bool[]',
            },
            {
                components: [
                    {
                        internalType: 'uint8',
                        name: 'x',
                        type: 'uint8',
                    },
                    {
                        internalType: 'uint8',
                        name: 'y',
                        type: 'uint8',
                    },
                ],
                internalType: 'struct Chainship.Position[]',
                name: 'enemyShots',
                type: 'tuple[]',
            },
            {
                internalType: 'enum Chainship.Answer[]',
                name: 'myAnswers',
                type: 'uint8[]',
            },
        ],
        name: 'proveHonesty',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'Chainship.RoomId',
                name: 'roomId',
                type: 'uint256',
            },
            {
                internalType: 'uint256',
                name: 'boardRandomness',
                type: 'uint256',
            },
            {
                internalType: 'bool[]',
                name: 'board',
                type: 'bool[]',
            },
            {
                components: [
                    {
                        internalType: 'uint8',
                        name: 'x',
                        type: 'uint8',
                    },
                    {
                        internalType: 'uint8',
                        name: 'y',
                        type: 'uint8',
                    },
                ],
                internalType: 'struct Chainship.Position[]',
                name: 'enemyShots',
                type: 'tuple[]',
            },
            {
                internalType: 'enum Chainship.Answer[]',
                name: 'myAnswers',
                type: 'uint8[]',
            },
            {
                components: [
                    {
                        internalType: 'uint8',
                        name: 'x',
                        type: 'uint8',
                    },
                    {
                        internalType: 'uint8',
                        name: 'y',
                        type: 'uint8',
                    },
                ],
                internalType: 'struct Chainship.Position[]',
                name: 'myShots',
                type: 'tuple[]',
            },
            {
                internalType: 'enum Chainship.Answer[]',
                name: 'enemyAnswers',
                type: 'uint8[]',
            },
        ],
        name: 'proveVictory',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'uint256',
                name: 'roomSecret',
                type: 'uint256',
            },
        ],
        name: 'roomSecretToId',
        outputs: [
            {
                internalType: 'Chainship.RoomId',
                name: '',
                type: 'uint256',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'Chainship.RoomId',
                name: '',
                type: 'uint256',
            },
        ],
        name: 'rooms',
        outputs: [
            {
                internalType: 'enum Chainship.RoomStatus',
                name: 'status',
                type: 'uint8',
            },
            {
                internalType: 'uint256',
                name: 'entryFee',
                type: 'uint256',
            },
            {
                internalType: 'uint8',
                name: 'whoseTurn',
                type: 'uint8',
            },
            {
                internalType: 'uint256',
                name: 'answerDeadline',
                type: 'uint256',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'Chainship.RoomId',
                name: 'roomId',
                type: 'uint256',
            },
            {
                components: [
                    {
                        internalType: 'uint8',
                        name: 'x',
                        type: 'uint8',
                    },
                    {
                        internalType: 'uint8',
                        name: 'y',
                        type: 'uint8',
                    },
                ],
                internalType: 'struct Chainship.Position',
                name: 'position',
                type: 'tuple',
            },
        ],
        name: 'shoot',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'Chainship.RoomId',
                name: 'roomId',
                type: 'uint256',
            },
            {
                internalType: 'uint256',
                name: 'boardCommitment',
                type: 'uint256',
            },
            {
                internalType: 'uint256',
                name: 'randomnessDecommitment',
                type: 'uint256',
            },
        ],
        name: 'submitBoard',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
] as const
