// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.28;

// Uncomment this line to use console.log
import "hardhat/console.sol";

abstract contract Chainship {
    type RoomId is uint256;

    uint256 public immutable CONTRACT_SEED;
    uint256 public immutable DEADLINE_BLOCK_TIME;
    uint8 public constant BOARD_SIZE = 10;
    uint16 public constant TOTAL_SHIP_PARTS = 17;
    uint8 public constant MAX_SHIP_LENGTH = 5;
    uint8[MAX_SHIP_LENGTH] public SHIP_COUNTS = [0, 1, 2, 1, 1]; // i-th element is the number of i-length ships (starting from 1)

    enum RoomStatus {
        /// Room does not exist in the mapping - default.
        NonExistent,

        /// Room has been created and only the creator is in the room.
        /// Waiting for the second player to join.
        Created,

        /// Room has been created and both players joined the room.
        /// Waiting for both players to commit to their board.
        Full,

        /// Both players have committed to their board.
        /// Waiting for player to shoot or claim victory.
        Shooting,

        /// Both players have submitted their board.
        /// Waiting for player to answer.
        Answering,

        /// Player x claimed that player y is cheating.
        /// Player y will have to prove that they didn't cheat.
        DishonestyClaimed,

        /// Player x has proven victory, honesty or claimed idle.
        Won
    }

    struct PlayerData {
        /// Account address of the player.
        address playerAddress;

        /// Commitment to ship placement that player submitted.
        uint256 boardCommitment;

        uint16 noShots;

        uint256 shotsHash;

        uint256 answersHash;

        /// Variables is shared between randomness commitment and decommitment.
        /// When player didn't submit the board yet, i.e. boardCommitment is 0,
        /// then this is commitment to randomness, otherwise it is the decommited value.
        uint256 randomness;
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

        /// [0] - Player 1's turn.
        /// [1] - Player 2's turn.
        /// If player x has claimed dishonesty, whoseTurn is set to player y.
        /// If player x has claimed victory, whoseTurn is set to player x.
        /// If state is Won, whoseTurn is set to the winner.
        uint8 whoseTurn;

        /// Block number to which player has to send next expected message.
        uint256 answerDeadline;
    }

    mapping(RoomId => RoomData) public rooms;

    struct Position {
        uint8 x;
        uint8 y;
    }

    enum Answer {
        Miss,
        Hit,
        Sunk
    }

    constructor(uint256 contractSeed, uint256 deadlineBlockTime) {
        CONTRACT_SEED = contractSeed;
        DEADLINE_BLOCK_TIME = deadlineBlockTime;
    }

    /// Returns the amount that is taken as a commission from the prize pool, given the entry fee.
    /// e.g. if calculateCommission(100$) = 10$ and players bet 100$ each,
    /// the commission is 10$ and winner receives 190$, so they gain 90$.
    function calculateCommission(uint256 entryFee) public pure virtual returns (uint256);

    event CreatedRoom(RoomId roomId, address player1, uint256 entryFee, uint256 commission);
    event JoinedRoom(RoomId roomId, address player2);
    event BoardSubmitted(RoomId roomId, address player, uint256 boardCommitment);
    event GameStarted(RoomId roomId, address startingPlayer);
    event ShotTaken(RoomId roomId, address player, uint256 noShots, Position position, uint256 newShotsCommitment);
    event ShotAnswered(RoomId roomId, address player, uint256 noShots, Position position, Answer answer, uint256 newAnswersCommitment);
    event DishonestyClaimed(RoomId roomId, address player);
    event HonestyProven(RoomId roomId, address player, bool[] board);
    event VictoryProven(RoomId roomId, address player, bool[] board);
    event IdleClaimed(RoomId roomId, address player); // `player` - who claimed that enemy is idle
    event PrizeReceived(address player, uint256 prize);

    function _setDeadline(RoomData storage room) internal {
        room.answerDeadline = block.number + DEADLINE_BLOCK_TIME;
    }

    function _assertWithinDeadline(RoomData memory room) internal view {
        require(block.number <= room.answerDeadline, "Deadline has passed");
    }

    function roomSecretToId(uint256 roomSecret) public view returns (RoomId) {
        return RoomId.wrap(uint256(keccak256(abi.encodePacked(CONTRACT_SEED, roomSecret))));
    }

    function createRoom(RoomId roomId, uint256 randomnessCommitment) public payable {
        // Amount that each player pays to join the room.
        uint256 entryFee = msg.value;

        // Amount that is taken as a commission from the prize pool.
        uint256 commission = calculateCommission(entryFee);

        // Entry fee must be greater than commission, otherwise the winner would receive less than they paid.
        require(entryFee > commission, "Entry fee must be greater than commission");

        RoomData storage room = rooms[roomId];

        // Room Ids cannot be reused, because otherwise `roomSecret` would be known to the public.
        require(room.status == RoomStatus.NonExistent, "Room already exists");

        room.status = RoomStatus.Created;
        room.entryFee = entryFee;
        room.players[0].playerAddress = msg.sender;
        room.players[0].randomness = randomnessCommitment;
        emit CreatedRoom(roomId, msg.sender, entryFee, commission);
    }

    function getRoomInfo(RoomId roomId) public view returns (RoomStatus, uint256, address) {
        RoomData memory room = rooms[roomId];
        require(room.status != RoomStatus.NonExistent, "Room does not exist");
        return (room.status, room.entryFee, room.players[0].playerAddress);
    }

    function joinRoom(uint256 roomSecret, uint256 randomnessCommitment) public payable {
        RoomId roomId = roomSecretToId(roomSecret);
        RoomData storage room = rooms[roomId];

        // Players can only join rooms that have been created and nobody joined yet.
        require(room.status == RoomStatus.Created, "Room is not in the created state");

        // Both players must pay the same amount of money to join the room.
        require(msg.value == room.entryFee, "Entry fee must be equal to the room entry fee");

        // Player cannot join their own room.
        require(room.players[0].playerAddress != msg.sender, "You cannot join your own room");

        room.players[1].playerAddress = msg.sender;
        room.players[1].randomness = randomnessCommitment;
        room.status = RoomStatus.Full;
        _setDeadline(room);
        emit JoinedRoom(roomId, msg.sender);
    }

    /// For the given room, returns at which position given player is.
    /// Function reverts if player is not in the room.
    function _getPlayerNumber(RoomData memory room, address playerAddress) pure internal returns (uint8) {
        if(room.players[0].playerAddress == playerAddress) {
            return 0;
        } else if(room.players[1].playerAddress == playerAddress) {
            return 1;
        } else {
            revert("You are not a player in this room");
        }
    }

    function _verifyRandomnessCommitment(uint256 commitment, uint256 decommitment) pure internal {
        require(uint256(keccak256(abi.encodePacked(decommitment))) == commitment, "Randomness commitment does not match");
    }

    /// Returns 0 if player 1 has the starting turn, 1 if player 2 has the starting turn.
    /// Result is fair given that both players have submitted their randomness through the commitment.
    function _getStartingPlayer(uint256 player1Randomness, uint256 player2Randomness) pure internal returns (uint8) {
        return uint8(uint256(keccak256(abi.encodePacked(player1Randomness, player2Randomness))) & 1);
    }

    function submitBoard(RoomId roomId, uint256 boardCommitment, uint256 randomnessDecommitment) public {
        // `boardCommitment = 0` represents no commitment, so it cannot be accepted.
        require(boardCommitment != 0, "Board commitment must be non-zero");

        RoomData storage room = rooms[roomId];

        // Players can only submit their board if both players have joined the room and game has not started yet.
        require(room.status == RoomStatus.Full, "Room is not in the full state");

        _assertWithinDeadline(room);
        
        // Check which player is submitting the board.
        uint8 playerNumber = _getPlayerNumber(room, msg.sender);
        PlayerData storage player = room.players[playerNumber];

        // Players can only submit their board once.
        require(player.boardCommitment == 0, "You have already submitted your board");

        player.boardCommitment = boardCommitment;

        // Verify and save randomness decommitment
        _verifyRandomnessCommitment(player.randomness, randomnessDecommitment);
        // `boardCommitment` changes from 0 to non-zero, so now randomness saves decommited value instead of commitment
        player.randomness = randomnessDecommitment;

        // Check whether second player has also submitted their board.
        bool bothBoardsSubmitted = room.players[1 - playerNumber].boardCommitment != 0;

        emit BoardSubmitted(roomId, msg.sender, boardCommitment);
        if (bothBoardsSubmitted) {
            uint8 startingPlayer = _getStartingPlayer(room.players[0].randomness, room.players[1].randomness);
            room.whoseTurn = startingPlayer;
            room.status = RoomStatus.Shooting;
            _setDeadline(room);
            emit GameStarted(roomId, room.players[startingPlayer].playerAddress);
        }
    }

    function _iterateShotsHash(uint256 shotsHash, uint256 noShots, Position calldata position) pure internal returns (uint256) {
        require(position.x < BOARD_SIZE && position.y < BOARD_SIZE, "Invalid position");
        return uint256(keccak256(abi.encodePacked(shotsHash, noShots, uint256(position.x), uint256(position.y))));
    }

    function shoot(RoomId roomId, Position calldata position) public {
        // TODO: Maybe to prevent user from accidentally sending answer for other shot,
        // TODO: provide noShots as an argument and check against saved value?
        RoomData storage room = rooms[roomId];
        require(room.status == RoomStatus.Shooting, "Room is not in the shooting state");

        uint8 playerNumber = _getPlayerNumber(room, msg.sender);
        require(room.whoseTurn == playerNumber, "It is not your turn");

        PlayerData storage player = room.players[playerNumber];

        // Iterate the hash so that player cannot change their shot.
        player.noShots++;
        player.shotsHash = _iterateShotsHash(player.shotsHash, player.noShots, position);

        // Now it is enemy's turn to answer.
        room.status = RoomStatus.Answering;
        room.whoseTurn = 1 - room.whoseTurn;
        _setDeadline(room);

        emit ShotTaken(roomId, player.playerAddress, player.noShots, position, player.shotsHash);
    }

    function _iterateAnswersHash(uint256 answersHash, uint256 noShots, Position calldata position, Answer answer) pure internal returns (uint256) {
        require(position.x < BOARD_SIZE && position.y < BOARD_SIZE, "Invalid position");
        return uint256(keccak256(abi.encodePacked(answersHash, noShots, uint256(position.x), uint256(position.y), uint256(answer))));
    }

    function answerShot(RoomId roomId, Position calldata position, Answer answer) public {
        // TODO: Same as for `shoot` function, maybe to provide noShots as an argument?
        RoomData storage room = rooms[roomId];
        require(room.status == RoomStatus.Answering, "Room is not in the answering state");

        uint8 playerNumber = _getPlayerNumber(room, msg.sender);
        PlayerData storage player = room.players[playerNumber];
        PlayerData storage enemy = room.players[1 - playerNumber];

        player.answersHash = _iterateAnswersHash(player.answersHash, enemy.noShots, position, answer);
        room.status = RoomStatus.Shooting;
        _setDeadline(room);

        emit ShotAnswered(roomId, player.playerAddress, enemy.noShots, position, answer, player.answersHash);
    }

    /// Player can claim that their enemy answered incorrectly.
    /// In that case, accused player has to prove that their answers were correct.
    function claimDishonest(RoomId roomId) public {
        RoomData storage room = rooms[roomId];

        // Player has to first answer the shot, so that number of shots and answers match.
        // Therefore, dishonesty can only be claimed at the time a shot was supposed to be made.
        require(room.status == RoomStatus.Shooting, "Room is not in the shooting state");
        uint8 playerNumber = _getPlayerNumber(room, msg.sender);
        require(room.whoseTurn == playerNumber, "It is not your turn");

        room.status = RoomStatus.DishonestyClaimed;
        room.whoseTurn = 1 - playerNumber;
        _setDeadline(room);

        emit DishonestyClaimed(roomId, msg.sender);
    }

    /// Verifies whether the board is valid.
    /// Returns the commitment to the board.
    function _verifyBoard(uint256 boardRandomness, bool[] calldata board) view internal returns (uint256) {
        require(board.length == BOARD_SIZE * BOARD_SIZE, "Invalid board size");

        // Number of ships of each length. At index i, number of ships of length i+1 is stored.
        uint8[] memory shipCount = new uint8[](MAX_SHIP_LENGTH);

        // Whether the cell has already been checked.
        // When top-left corner of the ship is checked, it then goes through the whole ship, so it should not be checked again.
        bool[] memory visited = new bool[](board.length);

        for(uint8 r = 0; r < BOARD_SIZE; r++) {
            for(uint8 c = 0; c < BOARD_SIZE; c++) {
                uint16 i = uint16(r) * uint16(BOARD_SIZE) + uint16(c);
                if(visited[i] || board[i] == false) continue;
                visited[i] = true;

                bool isHorizontal = c + 1 < BOARD_SIZE && board[i + 1];
                bool isVertical = r + 1 < BOARD_SIZE && board[i + BOARD_SIZE];
                require(!(isHorizontal && isVertical), "Invalid ship placement (L-shape)");
                // Now we treat 1x1 ship as only vertical to simplify checks.
                if(!isVertical && !isHorizontal) isVertical = true;

                uint8 shipLength = 1;
                if(isVertical) {
                    if(r != 0) {
                        // Top-left
                        require(c == 0 || board[i - BOARD_SIZE - 1] == false, "Invalid ship placement (top-left)");
                        // Top
                        require(board[i - BOARD_SIZE] == false, "Invalid ship placement (top)");
                        // Top-right
                        require(c == BOARD_SIZE - 1 || board[i + 1 - BOARD_SIZE] == false, "Invalid ship placement (top-right)");
                    }
                    while(i + shipLength * BOARD_SIZE < board.length && board[i + shipLength * BOARD_SIZE]) {
                        visited[i + shipLength * BOARD_SIZE] = true;
                        // Left
                        require(c == 0 || board[i - 1 + shipLength * BOARD_SIZE] == false, "Invalid ship placement (left)");
                        // Right
                        require(c == BOARD_SIZE - 1 || board[i + 1 + shipLength * BOARD_SIZE] == false, "Invalid ship placement (right)");
                        shipLength++;
                    }
                    if(r + shipLength < BOARD_SIZE) {
                        // Bottom-left
                        require(c == 0 || board[i + shipLength * BOARD_SIZE - 1] == false, "Invalid ship placement (bottom-left)");
                        // Bottom
                        require(board[i + shipLength * BOARD_SIZE] == false, "Invalid ship placement (bottom)");
                        // Bottom-right
                        require(c == BOARD_SIZE - 1 || board[i + shipLength * BOARD_SIZE + 1] == false, "Invalid ship placement (bottom-right)");
                    }
                } else {
                    if(c != 0) {
                        // Left-top
                        require(r == 0 || board[i - BOARD_SIZE - 1] == false, "Invalid ship placement (top-left)");
                        // Left
                        require(board[i - 1] == false, "Invalid ship placement (left)");
                        // Left-bottom
                        require(r == BOARD_SIZE - 1 || board[i + BOARD_SIZE - 1] == false, "Invalid ship placement (bottom-left)");
                    }
                    while(i + shipLength < board.length && board[i + shipLength]) {
                        visited[i + shipLength] = true;
                        // Top
                        require(r == 0 || board[i - BOARD_SIZE] == false, "Invalid ship placement (top)");
                        // Bottom
                        require(r == BOARD_SIZE - 1 || board[i + BOARD_SIZE] == false, "Invalid ship placement (bottom)");
                        shipLength++;
                    }
                    if(c + shipLength < BOARD_SIZE) {
                        // Right-top
                        require(r == 0 || board[i + shipLength - BOARD_SIZE] == false, "Invalid ship placement (top-right)");
                        // Right
                        require(board[i + shipLength] == false, "Invalid ship placement (right)");
                        // Right-bottom
                        require(r == BOARD_SIZE - 1 || board[i + shipLength + BOARD_SIZE] == false, "Invalid ship placement (bottom-right)");
                    }
                }
                if(shipLength > MAX_SHIP_LENGTH) {
                    revert("Ship length is too long");
                }
                shipCount[shipLength - 1]++;
            }
        }
        // Check that number of ships of each length is correct.
        for(uint8 i = 0; i < MAX_SHIP_LENGTH; i++) {
            require(shipCount[i] == SHIP_COUNTS[i], "Invalid ship count");
        }
        return uint256(keccak256(abi.encodePacked(boardRandomness, board)));
    }

    /// Checks whether, if player was to hit at *position*, given *board* and hit positions (*hits*), would it sink the ship
    function _isSinkHit(bool[] calldata board, bool[] memory hits, uint16 position) pure internal returns (bool) {
        // Go right
        // Notice: when the cell is rightmost, 
        // (position + 1) % BOARD_SIZE == 0 before the first iteration, so it breaks immediately
        for(uint16 i = position + 1; i % BOARD_SIZE != 0 && board[i]; i++) {
            if(hits[i] == false) return false;
        }

        // Go left
        // Notice: when the cell is leftmost,
        // then (position - 1) % BOARD_SIZE == BOARD_SIZE - 1 before the first iteration, so it breaks immediately,
        // but we have to prevent integer underflow in case position == 0
        if(position != 0) {
            for(uint16 i = position - 1; i % BOARD_SIZE != BOARD_SIZE - 1 && board[i]; i--) {
                if(hits[i] == false) return false;
                if(i == 0) break; // break before decrement to avoid underflow
            }
        }

        // Go up
        uint16 boardLimit = uint16(BOARD_SIZE) * uint16(BOARD_SIZE);
        for(uint16 i = position + BOARD_SIZE; i < boardLimit && board[i]; i += BOARD_SIZE) {
            if(hits[i] == false) return false;
        }

        // Go down
        if(position >= BOARD_SIZE) {
            for(uint16 i = position - BOARD_SIZE; board[i]; i -= BOARD_SIZE) {
                if(hits[i] == false) return false;
                if(i < BOARD_SIZE) break; // break before subtraction to avoid underflow
            }
        }
        return true;
    }

    /// Verifies whether answers are correct given the board of ships and shots.
    function _verifyAnswerCorrectness(bool[] calldata board, Position[] calldata shots, Answer[] calldata answers) pure internal returns (uint256 shotsHash, uint256 answersHash, uint16 noHits) {
        shotsHash = 0;
        answersHash = 0;
        noHits = 0;
        require(shots.length == answers.length, "Shots and answers must have the same length");

        // To not double-count hits, we use a separate array.
        bool[] memory hits = new bool[](board.length);

        for(uint256 i = 0; i < shots.length; i++) {
            shotsHash = _iterateShotsHash(shotsHash, i+1, shots[i]);
            answersHash = _iterateAnswersHash(answersHash, i+1, shots[i], answers[i]);

            uint16 position = uint16(shots[i].x) * BOARD_SIZE + uint16(shots[i].y);
            if(board[position] == false) {
                require(answers[i] == Answer.Miss, "Missed shot cannot be answered as hit or sunk");
            } else {
                if(!hits[position]) noHits++;
                hits[position] = true;
                if(_isSinkHit(board, hits, position)) {
                    require(answers[i] == Answer.Sunk, "Ship cannot be sunk if it has not been hit");
                } else {
                    require(answers[i] == Answer.Hit, "Ship must be sunk if all its parts have been hit");
                }
            }
        }
    }

    /// Checks whether player answered correctly to enemy's shots.
    /// It checks the board against the commitment, answers and shots against their saved hash and if they are compatible with each other.
    function _verifyHonesty(RoomData storage room, uint8 playerNumber, uint256 boardRandomness, bool[] calldata board, Position[] calldata enemyShots, Answer[] calldata myAnswers) internal view {
        require(room.whoseTurn == playerNumber, "It is not your turn");

        uint256 boardCommitment = _verifyBoard(boardRandomness, board);
        require(boardCommitment == room.players[playerNumber].boardCommitment, "Board commitment does not match");

        (uint256 enemyShotsHash, uint256 myAnswersHash, ) = _verifyAnswerCorrectness(board, enemyShots, myAnswers);

        require(enemyShotsHash == room.players[1 - playerNumber].shotsHash, "Shots don't match enemy shots");
        require(myAnswersHash == room.players[playerNumber].answersHash, "Answers don't match my answers");
    }

    /// Proves that player answered correctly to enemy's shots in case enemy claimed dishonesty.
    /// It checks the board against the commitment, answers and shots against their saved hash and if they are compatible with each other.
    function proveHonesty(RoomId roomId, uint256 boardRandomness, bool[] calldata board, Position[] calldata enemyShots, Answer[] calldata myAnswers) public {
        RoomData storage room = rooms[roomId];
        uint8 playerNumber = _getPlayerNumber(room, msg.sender);
        require(room.status == RoomStatus.DishonestyClaimed, "Room is not in the dishonesty claimed state");
        require(room.whoseTurn == playerNumber, "It is not your turn");

        _verifyHonesty(room, playerNumber, boardRandomness, board, enemyShots, myAnswers);

        room.status = RoomStatus.Won;
        _receivePrize(room, playerNumber);

        emit HonestyProven(roomId, msg.sender, board);
    }

    /// Verifies whether number of distinct ship hits is equal to number of ship parts.
    /// It does not check whether ships are placed correctly.
    function _verifyShipsSunk(Position[] calldata myShots, Answer[] calldata enemyAnswers) pure internal returns (uint256 myShotsHash, uint256 enemyAnswersHash) {
        myShotsHash = 0;
        enemyAnswersHash = 0;

        bool[] memory hits = new bool[](BOARD_SIZE * BOARD_SIZE);
        for(uint256 i = 0; i < myShots.length; i++) {
            myShotsHash = _iterateShotsHash(myShotsHash, i+1, myShots[i]);
            enemyAnswersHash = _iterateAnswersHash(enemyAnswersHash, i+1, myShots[i], enemyAnswers[i]);
            uint16 position = uint16(myShots[i].x) * BOARD_SIZE + uint16(myShots[i].y);
            if(enemyAnswers[i] != Answer.Miss) {
                hits[position] = true;
            }
        }
        uint16 noShipHits = 0;
        for(uint16 i = 0; i < hits.length; i++) {
            if(hits[i]) noShipHits++;
        }
        require(noShipHits == TOTAL_SHIP_PARTS, "Number of ship hits does not match number of ship parts");
        return (myShotsHash, enemyAnswersHash);
    }

    function proveVictory(RoomId roomId, uint256 boardRandomness, bool[] calldata board, Position[] calldata enemyShots, Answer[] calldata myAnswers, Position[] calldata myShots, Answer[] calldata enemyAnswers) public {
        RoomData storage room = rooms[roomId];
        uint8 playerNumber = _getPlayerNumber(room, msg.sender);

        // Player has to first answer the shot, so that number of shots and answers match.
        require(room.status == RoomStatus.Shooting, "Room is not in the shooting state");

        // Check that player answered correctly to enemy's shots.
        _verifyHonesty(room, playerNumber, boardRandomness, board, enemyShots, myAnswers);

        // Check that player sunk all ships. (Board correctness has already been checked in `_verifyHonesty`.)
        (uint256 myShotsHash, uint256 enemyAnswersHash) = _verifyShipsSunk(myShots, enemyAnswers);
        require(myShotsHash == room.players[playerNumber].shotsHash, "Shots don't match my shots");
        require(enemyAnswersHash == room.players[1 - playerNumber].answersHash, "Answers don't match enemy answers");

        room.status = RoomStatus.Won;
        _receivePrize(room, playerNumber);

        emit VictoryProven(roomId, msg.sender, board);
    }

    function claimIdle(RoomId roomId) public {
        RoomData storage room = rooms[roomId];

        // `playerNumber` claims that `otherPlayer` didn't respond on time.
        uint8 playerNumber = _getPlayerNumber(room, msg.sender);
        uint8 otherPlayer = 1 - playerNumber;

        bool isPastDeadline = block.number > room.answerDeadline;
        require(isPastDeadline, "Deadline has not passed yet");

        // In case of board submission, each player has to commit in within the deadline that is set when last player joined the room.
        bool isBoardMissing = room.status == RoomStatus.Full && room.players[otherPlayer].boardCommitment == 0;

        // In case of shooting, answering or dishonesty claim, only the player given by `whoseTurn` has to respond.
        bool isHisTurnMissing = (room.status == RoomStatus.Shooting || room.status == RoomStatus.Answering || room.status == RoomStatus.DishonestyClaimed) && room.whoseTurn == otherPlayer;

        require(isBoardMissing || isHisTurnMissing, "It is not enemy's turn to respond");

        room.status = RoomStatus.Won;
        _receivePrize(room, playerNumber);
        emit IdleClaimed(roomId, msg.sender);
    }

    function _receivePrize(RoomData storage room, uint8 winnerPlayerNumber) internal {
        // TODO: Fix reentrancy attack
        address winnerAddress = room.players[winnerPlayerNumber].playerAddress;
        uint256 prize = 2 * room.entryFee - calculateCommission(room.entryFee);
        payable(winnerAddress).transfer(prize);
        emit PrizeReceived(winnerAddress, prize);
    }

    // TODO: Get funds from the contract
}

abstract contract ChainshipWithMulticall is Chainship {
    constructor(uint256 contractSeed, uint256 deadlineBlockTime) Chainship(contractSeed, deadlineBlockTime) {}

    function answerAndShoot(RoomId roomId, Position calldata answerPosition, Answer answer, Position calldata shootPosition) public {
        answerShot(roomId, answerPosition, answer);
        shoot(roomId, shootPosition);
    }

    function answerAndClaimVictory(RoomId roomId, Position calldata answerPosition, Answer answer, uint256 boardRandomness, bool[] calldata board, Position[] calldata enemyShots, Answer[] calldata myAnswers, Position[] calldata myShots, Answer[] calldata enemyAnswers) public {
        answerShot(roomId, answerPosition, answer);
        proveVictory(roomId, boardRandomness, board, enemyShots, myAnswers, myShots, enemyAnswers);
    }

    function answerAndClaimDishonest(RoomId roomId, Position calldata answerPosition, Answer answer) public {
        answerShot(roomId, answerPosition, answer);
        claimDishonest(roomId);
    }
}

contract TestContract is ChainshipWithMulticall {
    constructor(uint256 contractSeed) ChainshipWithMulticall(contractSeed, 10) {}
    uint256 public x;

    function calculateCommission(uint256 entryFee) public pure override returns (uint256) {
        // around 0.02 USD + 0.1% of entry fee
        return 10000 gwei + entryFee / 1000;
    }
}

contract ChainshipNoFee is ChainshipWithMulticall {
    constructor(uint256 contractSeed) ChainshipWithMulticall(contractSeed, 10 * 60 / 12) {} // 10 minutes

    function calculateCommission(uint256 entryFee) public pure override returns (uint256) {
        return 0;
    }
}
