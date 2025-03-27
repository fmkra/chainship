// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.28;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

abstract contract Chainship {
    type RoomId is uint256;

    uint256 public immutable CONTRACT_SEED;

    enum RoomStatus {
        NonExistent, /// Room does not exist in the mapping
        Created, /// Room has been created and only the creator is in the room, waiting for the second player to join
        Full, /// Room has been created and both players joined the room, waiting for both players to submit their board
        InGame /// Both players have submitted their board, players are placing their shots
    }

    struct PlayerData {
        /// Account address of the player.
        address playerAddress;

        /// Commitment to ship placement that player submitted.
        uint256 boardCommitment;
    }

    struct RoomData {
        /// In what game stage the room is.
        RoomStatus status;

        /// Amount that is required to join the room.
        /// If player wins, they receive `2 * entryFee - calculateCommission(entryFee)`,
        /// so they earn `entryFee - calculateCommission(entryFee)`.
        uint256 entryFee;

        /// [0] - Data for player that created the room.
        /// [1] - Data for player that joined the room.
        PlayerData[2] players;
    }

    mapping(RoomId => RoomData) public rooms;

    constructor(uint256 contractSeed) {
        CONTRACT_SEED = contractSeed;
    }

    /// Returns the amount that is taken as a commission from the prize pool, given the entry fee.
    /// e.g. if calculateCommission(100$) = 10$ and players bet 100$ each,
    /// the commission is 10$ and winner receives 190$, so they gain 90$.
    function calculateCommission(uint256 entryFee) public pure virtual returns (uint256);

    event CreatedRoom(RoomId publicId, address player1, uint256 entryFee, uint256 commission);
    event JoinedRoom(RoomId publicId, address player2);
    event BoardSubmitted(RoomId publicId, address player, uint256 boardCommitment);
    event GameStarted(RoomId publicId);

    function getPublicRoomId(RoomId privateId) public view returns (RoomId) {
        return RoomId.wrap(uint256(keccak256(abi.encodePacked(CONTRACT_SEED, privateId))));
    }

    function createRoom(RoomId publicId) public payable {
        // Amount that each player pays to join the room.
        uint256 entryFee = msg.value;

        // Amount that is taken as a commission from the prize pool.
        uint256 commission = calculateCommission(entryFee);

        // Entry fee must be greater than commission, otherwise the winner would receive less than they paid.
        require(entryFee > commission, "Entry fee must be greater than commission");

        RoomData storage room = rooms[publicId];

        // Room Ids cannot be reused, because otherwise `privateId` would be known to the public.
        require(room.status == RoomStatus.NonExistent, "Room already exists");

        room.status = RoomStatus.Created;
        room.entryFee = entryFee;
        room.players[0].playerAddress = msg.sender;
        emit CreatedRoom(publicId, msg.sender, entryFee, commission);
    }

    function joinRoom(RoomId privateId) public payable {
        RoomId publicId = getPublicRoomId(privateId);
        RoomData storage room = rooms[publicId];

        // Players can only join rooms that has been created and nobody joined yet.
        require(room.status == RoomStatus.Created, "Room is not in the created state");

        // Both players must pay the same amount of money to join the room.
        require(msg.value == room.entryFee, "Entry fee must be equal to the room entry fee");

        room.players[1].playerAddress = msg.sender;
        room.status = RoomStatus.Full;
        emit JoinedRoom(publicId, msg.sender);
    }

    /// For the given room, returns at which position given player is.
    /// Function reverts if player is not in the room.
    function getPlayerNumber(RoomData memory room, address playerAddress) pure internal returns (uint8) {
        if(room.players[0].playerAddress == playerAddress) {
            return 0;
        } else if(room.players[1].playerAddress == playerAddress) {
            return 1;
        } else {
            revert("You are not a player in this room");
        }
    }

    function submitBoard(RoomId publicId, uint256 boardCommitment) public {
        // `boardCommitment = 0` represents no commitment, so it cannot be accepted.
        require(boardCommitment != 0, "Board commitment must be non-zero");

        RoomData storage room = rooms[publicId];

        // Players can only submit their board if both players have joined the room and game has not started yet.
        require(room.status == RoomStatus.Full, "Room is not in the full state");
        
        // Check which player is submitting the board.
        uint8 playerNumber = getPlayerNumber(room, msg.sender);
        PlayerData storage player = room.players[playerNumber];

        // Players can only submit their board once.
        require(player.boardCommitment == 0, "You have already submitted your board");

        player.boardCommitment = boardCommitment;

        // Check whether second player has also submitted their board.
        bool bothBoardsSubmitted = room.players[1 - playerNumber].boardCommitment != 0;

        emit BoardSubmitted(publicId, msg.sender, boardCommitment);
        if (bothBoardsSubmitted) {
            room.status = RoomStatus.InGame;
            emit GameStarted(publicId);
        }
    }
}

contract ChainshipImpl is Chainship {
    constructor(uint256 contractSeed) Chainship(contractSeed) {}

    function calculateCommission(uint256 entryFee) public pure override returns (uint256) {
        // around 0.02 USD + 0.1% of entry fee
        return 10000 gwei + entryFee / 1000;
    }
}
