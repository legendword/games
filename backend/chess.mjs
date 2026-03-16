import { Chess } from 'chess.js';

import games from './games.js';
const game = games.chess;

import express from 'express';
const app = express();
// import httpLib from 'http';
// const http = httpLib.Server(app);

import httpsLib from 'https';
import fs from 'fs';
const privateKey = fs.readFileSync('../ssl/legendword.key', 'utf8');
const certificate = fs.readFileSync('../ssl/legendword.crt', 'utf8');
const https = httpsLib.createServer({
    key: privateKey,
    cert: certificate
}, app);

import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import { Server as socketIO } from 'socket.io';
const io = new socketIO(https, {
// const io = new socketIO(http, {
    cors: {
        origin: true,
        methods: ["GET", "POST"],
        credentials: true
    }
});

app.use(cors({
    origin: true,
    credentials: true
}));

app.use(express.json());

var roomIds = [];
var rooms = {};
var chess = {}; // the chess class instance for each room
var roomGames = {};
var roomCount = 0;
var players = {};
var onlinePlayers = 0;

app.post('/', (req, res) => {
    res.json({
        status: 'online',
        roomLimit: game.roomLimit,
        roomCount: roomCount,
        playerCount: onlinePlayers
    });
});

app.post('/rooms/create', (req, res) => {
    scanRooms(); //delete rooms with no players
    if (roomCount >= game.roomLimit) {
        res.json({
            success: false,
            msg: 'Currently at maximum server capacity. Try again later.'
        });
    }
    else {
        let rmId = createRoom();
        res.json({
            success: true,
            roomId: rmId
        });
    }
});

app.post('/rooms/state', (req, res) => {
    let roomId = req.body.roomId;
    if (!roomId) res.json({
        success: false
    });
    else {
        let room = rooms[roomId];
        if (room == null) {
            res.json({
                success: false
            });
        }
        else {
            res.json({
                success: true,
                gameState: room.gameState
            });
        }
    }
});

app.post('/debug', (req, res) => {
    console.log('Debug Information: ', roomCount, 'Rooms Active', rooms);
    res.end();
});

io.on('connection', (socket) => {
    console.log('user', socket.id, 'connected');
    onlinePlayers += 1;
    socket.on('name', name => { //player set name
        console.log('name', socket.id, name);
        socket.name = name;
        if (socket.usertoken && players[socket.usertoken]) {
            players[socket.usertoken].name = name;
        }
    });
    socket.on('room', (obj) => { //player join room
        if (!obj.roomId) return;
        let token = obj.token == '' ? null : obj.token;

        let roomId = obj.roomId;
        let room = rooms[roomId];
        if (room == null) {
            socket.emit('room', {
                success: false,
                msg: 'Room does not exist.'
            });
            return;
        }
        if (token && room.players.findIndex(v => v.token == token) !== -1) { //user already in room; now back online
            // DO NOT allow re-join
            socket.emit('room', {
                success: false,
                msg: 'You cannot rejoin.'
            });
            return;
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
                    let newToken = uuidv4();
                    while (players[newToken] && players[newToken].connected) {
                        newToken = uuidv4();
                    }
                    let playerName = socket.name ? socket.name : 'Player';
                    //console.log(playerName, 'join', roomId, 'with newToken', newToken)
                    socket.usertoken = newToken;
                    socket.join(roomId);
                    players[newToken] = {
                        socketId: socket.id,
                        connected: true,
                        room: roomId,
                        name: playerName
                    };
                    room.playerCount += 1;
                    room.activePlayerCount += 1;
                    room.players.push({
                        token: newToken,
                        name: playerName,
                        state: 'lobby'
                    });
                    socket.emit('room', {
                        success: true,
                        token: newToken //assign new token to this player for this room (used for reconnecting during a game)
                    });
                    socket.to(roomId).emit('msg', {
                        type: 'playerJoin',
                        value: playerName
                    });
                    updateRoom(roomId);
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
    socket.on('playAgain', () => {
        if (socket.usertoken && players[socket.usertoken]) {
            let rid = players[socket.usertoken].room;
            if (!rid || !rooms[rid]) return;
            if (rooms[rid].gameEnded) {
                if (rooms[rid].playAgain === false) {
                    socket.emit('notify', {
                        color: 'negative',
                        message: 'Your opponent has already left the room.'
                    });
                    return;
                }
                if (rooms[rid].playAgain.includes(socket.usertoken)) {
                    rooms[rid].playAgain.splice(rooms[rid].playAgain.indexOf(socket.usertoken), 1);
                    updateRoom(rid);
                }
                else {
                    rooms[rid].playAgain.push(socket.usertoken);
                    if (rooms[rid].playAgain.length == 2) {
                        io.to(rid).emit('gameRestart');
                        if (!roomCheckStart(rid)) console.log('[Fatal] PlayAgain cannot trigger roomCheckStart');
                    }
                    else {
                        updateRoom(rid);
                    }
                }
            }
        }
    })
    socket.on('ready', () => {
        if (socket.usertoken && players[socket.usertoken]) {
            let rid = players[socket.usertoken].room;
            let pidx = rooms[rid].players.findIndex(v => v.token == socket.usertoken);
            if (rooms[rid].players[pidx].state == 'ready') { //cancel ready
                rooms[rid].players[pidx].state = 'lobby';
                io.to(rid).emit('msg', {
                    type: 'playerReadyCancel',
                    value: socket.name
                });
            }
            else {
                rooms[rid].players[pidx].state = 'ready';
                io.to(rid).emit('msg', {
                    type: 'playerReady',
                    value: socket.name
                });
            }
            if (!roomCheckStart(rid)) updateRoom(rid);
        }
        else {
            socket.emit('notify', {
                color: 'negative',
                message: 'Token not found.'
            });
        }
    });
    socket.on('move', (obj) => {
        if (!socket.usertoken || !players[socket.usertoken]) return;
        if (!obj.from || !obj.to) return;
        let player = players[socket.usertoken];
        let rid = player.room;
        if (!rid || !rooms[rid] || !rooms[rid].gameState == 'game') return;
        let room = rooms[rid];
        let playerPos = room.players.findIndex(v => v.token == socket.usertoken);
        if (room.roundPos != playerPos) {
            socket.emit('notify', {
                color: 'negative',
                message: 'It is not your round yet.'
            });
            return;
        }
        if (!chess[rid]) {
            console.log('[Fatal] No chess class instance found for room.');
            return;
        }
        let moveParams = {
            from: obj.from,
            to: obj.to
        };
        let move = chess[rid].move(moveParams);
        if (!move) {
            socket.emit('notify', {
                color: 'negative',
                message: 'That is an illegal move.'
            });
            return;
        }
        rooms[rid].lastMove = moveParams;
        rooms[rid].lastSAN = move.san;
        nextPlayer(rid);
        if (chess[rid].game_over()) {
            rooms[rid].gameEnded = true;
            rooms[rid].gameResult = chess[rid].in_checkmate() ? (chess[rid].turn() === 'b' ? 'white' : 'black') : 'draw';
            rooms[rid].playAgain = [];
            io.to(rid).emit('msg', {
                type: 'gameEnd',
                value: rooms[rid].gameResult
            });
        }
        updateRoom(rid);
    });
    socket.on('disconnect', () => {
        console.log('user', socket.id, 'disconnected');
        onlinePlayers -= 1;
        if (socket.usertoken) {
            let player = players[socket.usertoken];
            if (player.room && rooms[player.room]) {
                let pl = rooms[player.room].players.findIndex(v => v.token == socket.usertoken);
                if (rooms[player.room].gameState == 'lobby') { //remove player from lobby
                    for (let i=0;i<rooms[player.room].players.length;i++) {
                        rooms[player.room].players[i].state = 'lobby'; //set all ready back to lobby state
                    }
                    rooms[player.room].players.splice(pl, 1);
                    rooms[player.room].playerCount -= 1;
                }
                else {
                    if (rooms[player.room].gameEnded) {
                        rooms[player.room].playAgain = false;
                        rooms[player.room].players.splice(pl, 1);
                        rooms[player.room].playerCount -= 1;
                    }
                    else rooms[player.room].players[pl].state = 'disconnected';
                }
                rooms[player.room].activePlayerCount -= 1;
                io.to(player.room).emit('msg', {
                    type: 'playerLeave',
                    value: socket.name ? socket.name : 'Player'
                });
                updateRoom(player.room);
            }
            delete players[socket.usertoken];
        }
    });
});

https.listen(game.port, () => {
// http.listen(game.port, () => {
    console.log(`Running ${game.name} on port ${game.port} with roomLimit ${game.roomLimit}`);
});

function nextPlayer(rid) {
    rooms[rid].roundPos = 1 - rooms[rid].roundPos;
    if (++rooms[rid].roundCounter === 2) {
        ++rooms[rid].roundId;
        rooms[rid].roundCounter = 0;
    }
}

function scanRooms() {
    let minTime = Date.now() - 60000; //60s ago
    let unusedRoomId = roomIds.find(v => rooms[v].activePlayerCount == 0 && rooms[v].createTime < minTime);
    while (unusedRoomId !== undefined) {
        if (rooms[unusedRoomId]) {
            delete rooms[unusedRoomId];
        }
        roomCount -= 1;
        roomIds.splice(unusedRoomId, 1);
        unusedRoomId = roomIds.find(v => rooms[v].activePlayerCount == 0 && rooms[v].createTime < minTime);
    }
}

function createRoom() {
    if (roomCount > game.roomLimit) return null;
    let roomId = uuidv4();
    while (rooms[roomId]) {
        roomId = uuidv4();
    }
    rooms[roomId] = {
        id: roomId,
        playerCount: 0,
        activePlayerCount: 0,
        createTime: Date.now(),
        gameId: 1,
        gameState: 'lobby',
        players: [],
        playerLimit: 2
    };
    roomIds.push(roomId);
    roomCount += 1;
    console.log('createRoom', roomId);
    console.log('currentRooms: ', roomIds);
    return roomId;
}

function updateRoom(roomId) {
    if (!rooms[roomId]) return;

    if (rooms[roomId].gameState === 'game' && chess[roomId]) {
        rooms[roomId].board = chess[roomId].board();
    }

    io.to(roomId).emit('update', rooms[roomId]);
}

function roomCheckStart(roomId) {
    if (!rooms[roomId]) return false;
    let room = rooms[roomId];
    if ((room.gameState == 'lobby' && room.playerCount == room.playerLimit) || (room.gameState == 'game' && room.gameEnded && room.playAgain && room.playAgain.length == room.playerLimit)) {
        //check if everyone is ready
        for (let i of room.players) {
            if (i.state != 'ready' && i.state != 'game') return false;
        }
        //start the game
        let startPos = Math.floor(Math.random()*2);
        for (let i=0;i<room.players.length;i++) { //init player
            rooms[roomId].players[i].position = i;
            rooms[roomId].players[i].state = 'game';
            rooms[roomId].players[i].side = startPos === i ? 'white' : 'black';
        }

        chess[roomId] = new Chess();
        
        rooms[roomId].roundId = 1;
        rooms[roomId].lastMove = {
            from: null,
            to: null
        };
        rooms[roomId].roundPos = startPos;
        rooms[roomId].roundCounter = 0;
        rooms[roomId].gameState = 'game';
        rooms[roomId].gameEnded = false;
        rooms[roomId].playAgain = [];
        rooms[roomId].gameResult = null;
        console.log(roomId, 'Game Start');
        console.log('Room', rooms[roomId]);
        updateRoom(roomId);
        return true;
    }
    return false;
}