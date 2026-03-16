const { allowOrigin, roomLimit, cards } = require('./constants');

const express = require('express');
const app = express();
//const http = require('http').Server(app);
const httpsLib = require('https');
const fs = require('fs');
const privateKey = fs.readFileSync('../ssl/localhost.key', 'utf8');
const certificate = fs.readFileSync('../ssl/localhost.crt', 'utf8');
const https = httpsLib.createServer({
    key: privateKey,
    cert: certificate
}, app)
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const io = require('socket.io')(https, {
    cors: {
        origin: allowOrigin,
        methods: ["GET", "POST"],
        credentials: true
    }
});

app.use(cors({
    origin: allowOrigin,
    credentials: true
}));

app.use(express.json());

var roomIds = [];
var rooms = {};
var roomGames = {};
var roomCount = 0;
var players = {};



app.get('/', (req, res) => {
    res.json({
        status: 'online'
    })
})

app.post('/rooms/create', (req, res) => {
    scanRooms() //delete rooms with no players
    if (roomCount >= roomLimit) {
        res.json({
            success: false,
            msg: 'Currently at maximum server capacity. Try again later.'
        })
    }
    else {
        let rmId = createRoom()
        res.json({
            success: true,
            roomId: rmId
        })
    }
});

app.post('/rooms/state', (req, res) => {
    let roomId = req.body.roomId
    if (!roomId) res.json({
        success: false
    })
    else {
        let room = rooms[roomId]
        if (room == null) {
            res.json({
                success: false
            })
        }
        else {
            res.json({
                success: true,
                gameState: room.gameState
            })
        }
    }
});

app.post('/debug', (req, res) => {
    console.log('Debug Information: ', roomCount, 'Rooms Active', roomIds, roomCount==0?'':rooms[roomIds[0]])
    res.end()
})

io.on('connection', (socket) => {
    console.log('user', socket.id, 'connected');
    socket.on('name', name => { //player set name
        console.log('name', socket.id, name)
        socket.name = name
        if (socket.usertoken && players[socket.usertoken]) {
            players[socket.usertoken].name = name
        }
    })
    socket.on('room', (obj) => { //player join room
        console.log('room', obj)
        if (!obj.roomId) return;
        let token = obj.token == '' ? null : obj.token

        let roomId = obj.roomId
        let room = rooms[roomId]
        if (room == null) {
            socket.emit('room', {
                success: false,
                msg: 'Room does not exist.'
            })
            return
        }
        if (token && room.players.findIndex(v => v.token == token) !== -1) { //user already in room; now back online
            if (!players[token]) {
                socket.emit('room', {
                    success: false,
                    msg: 'Undefined player.'
                })
                return
            }
            if (players[token].connected) {
                //already has an ongoing connection
                socket.emit('room', {
                    success: false,
                    msg: 'You are already playing in another tab!'
                })
                return
            }
            //console.log(players[token].name, 'join back room', roomId)
            socket.usertoken = token
            players[token].connected = true
            players[token].socketId = socket.id
            room.players[room.players.findIndex(v => v.token == token)].state = 'game' 
            room.activePlayerCount += 1
            socket.to(roomId).emit('msg', {
                type: 'playerJoin',
                value: players[token].name
            })
        }
        else {
            if (room.gameState == 'lobby') { //try to join room
                if (room.playerCount == room.playerLimit) {
                    socket.emit('room', {
                        success: false,
                        msg: 'Room is full.'
                    })
                }
                else {
                    let newToken = uuidv4()
                    while (players[newToken] && players[newToken].connected) {
                        newToken = uuidv4()
                    }
                    let playerName = socket.name ? socket.name : 'Player'
                    //console.log(playerName, 'join', roomId, 'with newToken', newToken)
                    socket.usertoken = newToken
                    socket.join(roomId)
                    players[newToken] = {
                        socketId: socket.id,
                        connected: true,
                        room: roomId,
                        name: playerName
                    }
                    room.playerCount += 1
                    room.activePlayerCount += 1
                    room.players.push({
                        token: newToken,
                        name: playerName,
                        state: 'lobby'
                    })
                    socket.emit('room', {
                        success: true,
                        token: newToken //assign new token to this player for this room (used for reconnecting during a game)
                    })
                    socket.to(roomId).emit('msg', {
                        type: 'playerJoin',
                        value: playerName
                    })
                    updateRoom(roomId)
                }
            }
            else { //game already started, cannot join
                socket.emit('room', {
                    success: false,
                    msg: 'Game already started.'
                })
            }
        }
    })
    socket.on('ready', () => {
        if (socket.usertoken && players[socket.usertoken]) {
            let rid = players[socket.usertoken].room
            let pidx = rooms[rid].players.findIndex(v => v.token == socket.usertoken)
            if (rooms[rid].players[pidx].state == 'ready') { //cancel ready
                rooms[rid].players[pidx].state = 'lobby'
                io.to(rid).emit('msg', {
                    type: 'playerReadyCancel',
                    value: socket.name
                })
            }
            else {
                rooms[rid].players[pidx].state = 'ready'
                io.to(rid).emit('msg', {
                    type: 'playerReady',
                    value: socket.name
                })
            }
            if (!roomCheckStart(rid)) updateRoom(rid)
        }
        else {
            socket.emit('notify', {
                color: 'negative',
                message: 'Token not found.'
            })
        }
    })
    socket.on('move', (obj) => {
        if (!socket.usertoken || !players[socket.usertoken]) return
        let player = players[socket.usertoken]
        let rid = player.room
        if (!rid || !rooms[rid] || !rooms[rid].gameState == 'game') return
        let room = rooms[rid]
        let playerPos = room.players.findIndex(v => v.token == socket.usertoken)
        if (room.roundPos != playerPos) {
            socket.emit('notify', {
                color: 'negative',
                message: 'It is not your round yet.'
            })
            return
        }
        if (room.roundId == 0) { //calling landlord round
            if (obj.type != 'landlord') {
                socket.emit('msg', {
                    type: 'error',
                    value: '[Socket] Move Type Not LandLord'
                })
                return
            }
            if (obj.value < 0 || obj.value > 3) return
            else if (obj.value == 3) { //landlord confirmed
                io.to(rid).emit('msg', {
                    type: 'callLandLord',
                    value: [player.name, obj.value]
                })
                io.to(rid).emit('msg', {
                    type: 'becameLandLord',
                    value: player.name
                })
                console.log(player.name, 'callLandLord and becameLandLord', obj.value, rooms[rid].roundCounter)
                //make cardPool public
                rooms[rid].cardPool = roomGames[rid].cardPool
                //and grant the landlord all the cards
                roomGames[rid].hands[playerPos].push(...roomGames[rid].cardPool)
                //don't forget to sort and update cardCount
                roomGames[rid].hands[playerPos] = roomGames[rid].hands[playerPos].sort((a,b) => realCardValue(cards[a].value)-realCardValue(cards[b].value))
                rooms[rid].cardCounts[playerPos] += roomGames[rid].cardPool.length
                //and set player's landlord status
                rooms[rid].players[playerPos].isLandLord = true
                //reset lastMove
                for (let i=0;i<3;i++) {
                    rooms[rid].players[i].lastMove = null
                }
                //advance round
                newRound(rid, playerPos)
            }
            else {
                io.to(rid).emit('msg', {
                    type: 'callLandLord',
                    value: [player.name, obj.value]
                })
                console.log(player.name, 'callLandLord', obj.value, rooms[rid].roundCounter)
                //save number
                rooms[rid].players[playerPos].lastMove = obj.value
                if (rooms[rid].roundCounter == 2) { //2 players have chosen a number, the 3rd player chose a number other than 3, so everyone chose a number other than 3
                    io.to(rid).emit('msg', {
                        type: 'decideLandLord'
                    })
                    //decide landlord
                    let pos = nextPos(playerPos)

                    console.log('decideLandLord, starting with', pos)
                    let maxNum = -1
                    let maxNumPos = -1
                    for (let i=0;i<3;i++) {
                        if (rooms[rid].players[pos].lastMove > maxNum) {
                            maxNum = rooms[rid].players[pos].lastMove
                            maxNumPos = pos
                        }
                        pos = nextPos(pos)
                    }
                    if (maxNumPos == -1) console.log('[Fatal Error] Landlord maxNumPos == -1')
                    //landlord player pos is maxNumPos
                    
                    io.to(rid).emit('msg', {
                        type: 'becameLandLord',
                        value: rooms[rid].players[maxNumPos].name
                    })
                    console.log('decidedLandLord', maxNumPos, 'with call', maxNum)
                    //make cardPool public
                    rooms[rid].cardPool = roomGames[rid].cardPool
                    //and grant the landlord all the cards
                    roomGames[rid].hands[maxNumPos].push(...roomGames[rid].cardPool)
                    //don't forget to sort and update cardCount
                    roomGames[rid].hands[maxNumPos] = roomGames[rid].hands[maxNumPos].sort((a,b) => realCardValue(cards[a].value)-realCardValue(cards[b].value))
                    rooms[rid].cardCounts[maxNumPos] += roomGames[rid].cardPool.length
                    //and set player's landlord status
                    rooms[rid].players[maxNumPos].isLandLord = true
                    //reset lastMove
                    for (let i=0;i<3;i++) {
                        rooms[rid].players[i].lastMove = null
                    }
                    //advance round
                    newRound(rid, maxNumPos)
                }
                else {
                    nextPlayer(rid)
                }
            }
        }
        else { //normal cards round
            if (room.lastMove == -1 && obj.type == 'pass') {
                socket.emit('notify', {
                    color: 'negative',
                    message: 'You cannot pass when starting.'
                })
                return
            }
            if (obj.type == 'pass') {
                rooms[rid].players[playerPos].lastMove = 'pass'
                io.to(rid).emit('msg', {
                    type: 'cardPassed',
                    value: player.name
                })
                nextPlayer(rid)
                if (rooms[rid].lastMove == rooms[rid].roundPos) { //second and last player both passed; the first player can play again
                    room.currentCards = []
                    newRound(rid, rooms[rid].roundPos)
                }
            }
            else { //obj.type == 'card'
                let playedCards = obj.value
                if (!playedCards || playedCards.length == 0) return
                let playerHand = roomGames[rid].hands[playerPos]
                for (let i of playedCards) { //make sure cards are actually in player's hand
                    if (!playerHand.includes(i)) return
                }
                console.log('playedCard check canBePlayed...')
                if (canBePlayed(playedCards, room.currentCards)) {
                    console.log('playedCard canBePlayed', true)
                    //remove cards from player hand
                    roomGames[rid].hands[playerPos] = roomGames[rid].hands[playerPos].filter(v => !playedCards.includes(v))
                    rooms[rid].cardCounts[playerPos] -= playedCards.length
                    //add cards to currentCards
                    rooms[rid].currentCards = playedCards
                    //update player lastMove and room lastMove
                    rooms[rid].players[playerPos].lastMove = 'card'
                    rooms[rid].lastMove = playerPos
                    //check game end
                    if (roomGames[rid].hands[playerPos].length == 0) {
                        gameEnd(rid, playerPos)
                    }
                    else {
                        nextPlayer(rid)
                    }
                    io.to(rid).emit('msg', {
                        type: 'cardPlayed',
                        value: [player.name, playedCards.join(',')]
                    })
                }
                else {
                    console.log('playedCard canBePlayed', false)
                    socket.emit('notify', {
                        color: 'negative',
                        message: 'This combination of cards is not valid.'
                    })
                    return
                }
            }
        }
        updateRoom(rid)
    })
    socket.on('disconnect', () => {
        console.log('user', socket.id, 'disconnected')
        if (socket.usertoken) {
            let player = players[socket.usertoken]
            if (player.room && rooms[player.room]) {
                let pl = rooms[player.room].players.findIndex(v => v.token == socket.usertoken)
                if (rooms[player.room].gameState == 'lobby') { //remove player from lobby
                    for (let i=0;i<rooms[player.room].players.length;i++) {
                        rooms[player.room].players[i].state = 'lobby' //set all ready back to lobby state
                    }
                    rooms[player.room].players.splice(pl, 1)
                    rooms[player.room].playerCount -= 1
                }
                else {
                    rooms[player.room].players[pl].state = 'disconnected'
                }
                rooms[player.room].activePlayerCount -= 1
                io.to(player.room).emit('msg', {
                    type: 'playerLeave',
                    value: socket.name ? socket.name : 'Player'
                })
                updateRoom(player.room)
            }
            players[socket.usertoken].connected = false
        }
    })
});

https.listen(3000, () => {
    console.log('listening on *:3000');
});

function canBePlayed(playedCards, currentCards) {
    //core function: checks if the cards can be played on top of the currentCards
    //first check if the cards played is a valid pattern
    let playedPattern = cardsPattern(playedCards)
    if (playedPattern == -1) return false
    //if currentCards is empty, anything can be played
    if (currentCards.length == 0) return true
    //then determine the pattern of currentCards
    let currentPattern = cardsPattern(currentCards)
    if (currentPattern == -1) {
        console.log('[Fatal] currentCards invalid pattern')
        return false
    }
    if (playedPattern[0] == currentPattern[0]) { //same pattern id
        return playedPattern[1] > currentPattern[1] //can be played if value is larger
    }
    else {
        if (playedPattern[0] == 9) { //two jokers, biggest pattern
            return true
        }
        else if (playedPattern[0] == 4 && currentPattern[0] != 9) { //4 of same card, bomb
            return true
        }
        else return false
    }
}

function realCardValue(vl) {
    if (vl < 3) return vl + 13 //'K' = 13, 'A' = 13+1 = 14, '2' = 13+2 = 15
    else if (vl > 13) return vl + 2 //BJ = 14+2 = 16, RJ = 15+2 = 17
    return vl //3 to K, realValue = value
}

function cardsPattern(val) {
    //returns [pattern id, pattern value] of the cards given, or -1 if not a valid pattern
    let cardValueCount = {}
    let cardValues = []
    let maxSameValue = 0
    let ptCards = val.map(v => cards[v])
    for (let i of ptCards) {
        let rv = realCardValue(i.value)
        //push the real value into cardValues
        cardValues.push(rv)
        if (cardValueCount[rv]) cardValueCount[rv] += 1
        else cardValueCount[rv] = 1
        maxSameValue = Math.max(cardValueCount[rv], maxSameValue)
    }
    //sort cardValues
    cardValues = cardValues.sort((a, b) => a - b)

    if (maxSameValue == 1) {
        if (ptCards.length == 1) return [1, cardValues[0]] //single card
        else if (ptCards.length == 2) { //potential pair of jokers
            if (cardValues[0] == 16 && cardValues[1] == 17) return [9, 17]
            else return -1
        }
        else if (ptCards.length >= 5) { //potential single ladder
            let smallestCard = cardValues[0]
            for (let i=0;i<cardValues.length;i++) {
                if (cardValues[i] != smallestCard + i) return -1 //not ladder
            }
            if (cardValues[cardValues.length-1] >= 15) return -1 //ladder cannot include anything greater than or equal to '2' (realValue 15)
            return [100 + ptCards.length - 5, cardValues[0]] //100, 101, 102, ..., 112
        }
        else return -1
    }
    else if (maxSameValue == 2) {
        if (ptCards.length == 2) return [2, cardValues[0]] //pair of cards
        else if (ptCards.length >= 6) { //potential pair ladder
            if (ptCards.length % 2 != 0) return -1 //# of cards must be even
            let curValue = cardValues[0]
            for (let i=0;i<cardValues.length;i+=2) {
                if (cardValues[i] != cardValues[i+1]) return -1 //not pairs
                if (cardValues[i] != curValue++) return -1 //not ladder
            }
            if (cardValues[cardValues.length-1] >= 15) return -1 //ladder cannot include anything greater than or equal to '2' (realValue 15)
            return [200 + (ptCards.length / 2) - 3, cardValues[0]] //200, 201, 202, ..., 207
        }
        else return -1
    }
    else if (maxSameValue == 3) {
        if (ptCards.length == 3) return [3, cardValues[0]] //3 same cards
        else if (ptCards.length == 4) { //3 + 1
            let value1 = cardValues[0]
            let value2 = cardValues[3]
            if (cardValues[1] == value1) return [10, value1]
            else return [10, value2]
        }
        else if (ptCards.length == 5) { //3 + 2
            let commonValue = cardValues[2] //this must be the value of the 3 same cards
            if (cardValues[0] != commonValue && cardValues[1] == cardValues[0]) return [20, commonValue]
            if (cardValues[4] != commonValue && cardValues[3] == cardValues[4]) return [20, commonValue]
            return -1
        }
        else if (ptCards.length >= 6) { //ladder of 3s
            let numbers = [0,0,0,0]
            let smallest3Value = 10000
            for (let i in cardValueCount) {
                if (cardValueCount[i] == 3) {
                    smallest3Value = Math.min(smallest3Value, i)
                }
                numbers[cardValueCount[i]]++
            }
            if (numbers[1] == 0 && numbers[2] == 0) { //pure ladder of 3s
                if (ptCards.length % 3 != 0) return -1 //# of cards must be divisible by 3
                let curValue = cardValues[0]
                for (let i=0;i<cardValues.length;i+=3) {
                    if (cardValues[i] != cardValues[i+1] || cardValues[i+1] != cardValues[i+2]) return -1 //not 3s
                    if (cardValues[i] != curValue++) return -1 //not ladder
                }
                if (cardValues[cardValues.length-1] >= 15) return -1 //ladder cannot include anything greater than or equal to '2' (realValue 15)
                return [300 + (ptCards.length / 3) - 2, cardValues[0]] //300, 301, 302, ..., 304
            }
            else if (numbers[2] == numbers[3] && numbers[1] == 0) { //ladder of 3+2s
                let curValue = smallest3Value
                let initialPos = 0
                while (cardValues[initialPos] != curValue) initialPos++
                let cur = initialPos
                for (let i=0;i<numbers[3];i++) {
                    if (cur + 2 >= cardValues.length) return -1
                    if (cardValues[cur] != cardValues[cur+1] || cardValues[cur+1] != cardValues[cur+2]) return -1 //not 3s
                    if (cardValues[cur] != curValue++) return -1 //not ladder
                    cur += 3
                }
                if (cardValues[cur] >= 15) return -1 //ladder cannot include anything greater than or equal to '2' (realValue 15)
                return [400 + numbers[3] - 2, smallest3Value]
            }
            else if (numbers[1] == numbers[3] && numbers[2] == 0) { //ladder of 3+1s
                //code below is the same as ladder of 3+2s above (Except the pattern id, of course)
                let curValue = smallest3Value
                let initialPos = 0
                while (cardValues[initialPos] != curValue) initialPos++
                let cur = initialPos
                for (let i=0;i<numbers[3];i++) {
                    if (cur + 2 >= cardValues.length) return -1
                    if (cardValues[cur] != cardValues[cur+1] || cardValues[cur+1] != cardValues[cur+2]) return -1 //not 3s
                    if (cardValues[cur] != curValue++) return -1 //not ladder
                    cur += 3
                }
                if (cardValues[cur] >= 15) return -1 //ladder cannot include anything greater than or equal to '2' (realValue 15)
                return [500 + numbers[3] - 2, smallest3Value]
            }
            else return -1
        }
    }
    else if (maxSameValue == 4) {
        if (ptCards.length == 4) return [4, cardValues[0]] //bomb
        else return -1 //TODO: 4+1, 4+2
    }
    return -1
}

function newRound(rid, pos) {
    console.log('newRound', pos)
    rooms[rid].roundPos = pos
    rooms[rid].roundId += 1
    rooms[rid].roundCounter = 0
    io.to(rid).emit('msg', {
        type: 'newRound',
        value: rooms[rid].roundId
    })
}

function nextPlayer(rid) {
    console.log('nextPlayer')
    rooms[rid].roundCounter += 1
    rooms[rid].roundPos = nextPos(rooms[rid].roundPos)
}

function nextPos(n) {
    return n+1 > 2 ? 0 : n+1
}

function gameEnd(rid, playerPos) {
    rooms[rid].gameEnded = true
    if (rooms[rid].players[playerPos].isLandLord) rooms[rid].landLordWon = true
    else rooms[rid].landLordWon = false
    io.to(rid).emit('msg', {
        type: 'gameEnd',
        value: rooms[rid].landLordWon
    })
}

function scanRooms() {
    let minTime = Date.now() - 60000 //60s ago
    let unusedRoomId = roomIds.findIndex(v => rooms[v].activePlayerCount == 0 && rooms[v].createTime < minTime)
    while (unusedRoomId > -1) {
        let unusedRoom = rooms[unusedRoomId]
        if (unusedRoom) {
            rooms[unusedRoom] = null
        }
        roomCount -= 1
        roomIds.splice(unusedRoomId, 1)
        unusedRoomId = roomIds.findIndex(v => rooms[v].activePlayerCount == 0 && rooms[v].createTime < minTime)
    }
}

function createRoom() {
    if (roomCount > roomLimit) return null
    let roomId = uuidv4()
    while (rooms[roomId]) {
        roomId = uuidv4()
    }
    rooms[roomId] = {
        id: roomId,
        playerCount: 0,
        activePlayerCount: 0,
        createTime: Date.now(),
        gameId: 0, //todo, currently useless as there is only one game
        gameState: 'lobby',
        players: [],
        playerLimit: 3
    }
    roomIds.push(roomId)
    roomCount += 1
    return roomId
}

function updateRoom(roomId) {
    if (!rooms[roomId]) return
    let room = rooms[roomId]
    io.to(roomId).emit('update', room)
    if (room.gameState == 'game') { //update hand information
        for (let i of room.players) {
            if (i.state == 'game' && players[i.token]) {
                let player = players[i.token]
                if (!player.connected) continue
                io.to(player.socketId).emit('updateHand', roomGames[roomId].hands[i.position])
            }
        }
    }
}

function roomCheckStart(roomId) {
    if (!rooms[roomId]) return false
    let room = rooms[roomId]
    if (room.gameState == 'lobby' && room.playerCount == room.playerLimit) {
        //check if everyone is ready
        for (let i of room.players) {
            if (i.state != 'ready') return
        }
        //start the game
        //initial cards (randomly give 17 cards each to 3 players, and leave 3)
        let pc = [[], [], [], []]
        for (let i in cards) {
            let j = Math.floor(Math.random()*4)
            while ((j<3 && pc[j].length == 17) || (j == 3 && pc[j].length == 3)) {
                j = Math.floor(Math.random()*4)
            }
            pc[j].push(i)
        }
        for (let i=0;i<3;i++) {
            pc[i] = pc[i].sort((a,b) => realCardValue(cards[a].value)-realCardValue(cards[b].value))
        }
        let startPos = Math.floor(Math.random()*3)
        for (let i=0;i<room.players.length;i++) { //init player
            rooms[roomId].players[i].position = i
            rooms[roomId].players[i].state = 'game'
            rooms[roomId].players[i].isLandLord = false
            rooms[roomId].players[i].lastMove = null
        }
        roomGames[roomId] = { //private info for games
            hands: pc,
            cardPool: [...pc[3]] //for landlord
        }
        //public info
        rooms[roomId].cardPool = [] //empty until landlord is decided
        rooms[roomId].cardCounts = [17, 17, 17]
        rooms[roomId].currentCards = []
        rooms[roomId].roundId = 0
        rooms[roomId].lastMove = -1
        rooms[roomId].roundCounter = 0 //how many moves have been made in this round
        rooms[roomId].roundPos = startPos
        rooms[roomId].gameState = 'game'
        rooms[roomId].gameEnded = false
        rooms[roomId].landLordWon = false
        console.log(roomId, 'Game Start')
        console.log('Hands', pc)
        console.log('Room', rooms[roomId])
        updateRoom(roomId)
        io.to(roomId).emit('msg', {
            type: 'newRound',
            value: 0
        })
        return true
    }
    return false
}