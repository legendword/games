<template>
    <q-page>
        <div class="row game-chess">
            <div v-if="pageMode === 'lobby'" class="col q-pa-lg">
                <div class="text-h5 text-center q-py-sm">Chess</div>
                <q-separator />
                <div class="text-h5 q-my-md">Players ({{game.playerCount}}/{{game.playerLimit}})</div>
                <q-list bordered separator>
                    <q-item v-for="player in game.players" :key="player.token">
                        <q-item-section class="text-subtitle2 q-py-sm" style="font-size: 1.1rem;">{{player.name}}</q-item-section>
                        <q-item-section side><q-icon v-if="player.state === 'ready'" color="positive" name="done" /></q-item-section>
                    </q-item>
                </q-list>
                <div class="q-mt-lg text-center">
                    <q-btn color="primary" :flat="myPlayer.state === 'ready'" :label="myPlayer.state == 'ready' ? 'Waiting for Others' : 'Start Game'" :disable="game.playerCount !== game.playerLimit" @click="lobbyReady" />
                </div>
            </div>
            <div v-show="pageMode === 'game'" class="col">
                <div class="board-container">
                    <div class="board" ref="board">
                        <template v-if="game.board">
                            <template v-for="i in 8">
                                <div
                                    v-for="j in 8"
                                    :key="i + ',' + j"
                                    class="background-tile"
                                    :class="[backgroundTileColor(i, j), [currentMove.from, currentMove.to, game.lastMove.from, game.lastMove.to].includes(rcToSquare(i-1,j-1)) ? 'selected' : '']"
                                    :style="{
                                        width: tileSize + 'px',
                                        height: tileSize + 'px',
                                        top: (i - 1) * tileSize + 'px',
                                        left: (j - 1) * tileSize + 'px'
                                    }"
                                    @click="selectTile(rcToSquare(i-1,j-1))"
                                />
                            </template>
                            <template v-for="row in game.board">
                                <div
                                    v-for="tile in row.filter(v => v !== null)"
                                    :key="tile.square"
                                    class="piece"
                                    :class="{
                                        selected: [currentMove.from, currentMove.to, game.lastMove.from, game.lastMove.to].includes(tile.square)
                                    }"
                                    :style="{
                                        width: tileSize + 'px',
                                        height: tileSize + 'px',
                                        ...calcPos(tile.square)
                                    }"
                                    @click="selectTile(tile.square)"
                                >
                                    <img :src="`/resources/chess/${tile.color}${tile.type}.png`" />
                                </div>
                            </template>
                        </template>
                    </div>
                </div>
            </div>
            <div class="console-container">
                <div class="text-h6 q-mb-sm">Console</div>
                <q-scroll-area class="console q-pa-md">
                    <template v-for="(msg, index) in messages">
                        <div
                            v-if="msg.type === 'msg'"
                            :class="'q-mb-sm' + (msg.color?' text-'+msg.color:'')"
                            :key="index"
                        >{{msg.text}}</div>
                        <div
                            v-else
                            class="console-move-container q-mb-sm"
                            :key="index"
                        >
                            <div class="round">{{ msg.round }}</div>
                            <div v-for="(move, j) in msg.moves" :key="j" class="move">{{ move }}</div>
                        </div>
                    </template>
                </q-scroll-area>
            </div>
        </div>
        <name-input />
        <q-dialog v-model="gameEndDialog.show">
            <q-card>
                <q-card-section>
                    <div class="text-center text-h6">Game Over</div>
                </q-card-section>
                <q-card-section>
                    <div v-if="gameEndDialog.text != null" class="text-center text-h5">{{ gameEndDialog.text }}</div>
                </q-card-section>
                <q-card-section class="flex justify-center">
                    <q-btn class="q-mx-md" color="secondary" label="Quit" @click="quitGame" />
                    <q-btn class="q-mx-md" color="primary" :flat="iPlayAgain" :disable="!game.playAgain" :label="playAgainLabel" @click="playAgain" />
                </q-card-section>
            </q-card>
        </q-dialog>
    </q-page>
</template>

<script>
import NameInput from 'src/components/NameInput.vue';
import { tileSize } from '../../util/chess/constants';

import { io } from "socket.io-client";
import api from 'src/api';
import { backendBasePath, ports } from 'src/basePath';
const port = ports.chess;
const backendPath = backendBasePath + ':' + port;

const colIds = ['a', 'b', 'c', 'd', 'e', 'f', 'g' ,'h'];

export default {
    name: 'Chess',
    components: { NameInput },
    data() {
        return {
            pageMode: null,
            socket: null,
            token: '',
            game: {},
            messages: [],
            tileSize: tileSize,
            currentMove: {
                from: null,
                to: null
            },
            lastUpdate: {
                roundId: 1,
                roundCounter: 0
            },
            gameEndDialog: {
                show: false,
                text: null
            }
        }
    },
    methods: {
        quitGame() {
            this.$router.push('/');
        },
        playAgain() {
            this.socket.emit('playAgain');
        },
        selectTile(square) {
            if (this.currentMove.from) {
                if (this.currentMove.from === square) {
                    this.currentMove.from = null;
                    this.currentMove.to = null;
                }
                else {
                    if (this.myTurn) {
                        // todo: if not valid move and on another piece, then choose this piece as currentMove.from instead (requires using chess.js client-side)
                        this.currentMove.to = square;
                        this.socket.emit('move', this.currentMove);
                        this.currentMove.from = null;
                        this.currentMove.to = null;
                    }
                    else {
                        this.currentMove.from = square;
                        this.currentMove.to = null;
                    }
                }
            }
            else {
                this.currentMove.from = square;
            }
        },
        backgroundTileColor(i, j) {
            if (this.mySide === 'white') {
                return (i+j)%2 === 0 ? 'white' : 'black';
            }
            else {
                return (i+j)%2 === 0 ? 'black' : 'white';
            }
        },
        calcPos(squareId) {
            let row = this.mySide === 'white' ? (8 - parseInt(squareId[1])) : (parseInt(squareId[1]) - 1);
            let col = colIds.indexOf(squareId[0]);
            return {
                top: row * tileSize + 'px',
                left: col * tileSize + 'px'
            };
        },
        rcToSquare(r, c) {
            return colIds[c] + (this.mySide === 'white' ? (8 - r) : (r + 1));
        },
        lobbyReady() {
            this.socket.emit('ready')
        },
        connect() {
            this.socket = io(backendPath, {
                reconnection: false
            });
            this.socket.on('connect', () => {
                console.log('Socket Connected: ', this.socket.id);
                this.addMessage({
                    type: 'connected'
                });
                this.socket.emit('name', this.userName);
                this.socket.emit('room', {
                    token: this.token,
                    roomId: this.roomId
                });
            });
            this.socket.on('room', (res) => {
                if (res.success) {
                    this.token = res.token;
                    if (process.env.NODE_ENV) this.$q.sessionStorage.set('token', this.token);
                    else this.$q.localStorage.set('token', this.token);
                }
                else {
                    this.$q.notify({
                        color: 'negative',
                        message: res.msg,
                        position: 'top',
                        timeout: 2000
                    });
                }
            });
            this.socket.on('update', (res) => {
                console.log('update', res);
                this.game = res;
                if (this.game.gameState == 'game') {
                    if (this.pageMode !== 'game') this.pageMode = 'game';

                    this.currentMove.from = null;
                    this.currentMove.to = null;

                    if (!this.game.gameEnded && (this.game.roundCounter !== this.lastUpdate.roundCounter || this.game.roundId !== this.lastUpdate.roundId)) {
                        // add move message
                        let lastMsg = this.messages.length === 0 ? null : this.messages[this.messages.length - 1];
                        if (this.game.roundCounter === 1) {
                            this.messages.push({
                                type: 'move',
                                round: this.game.roundId,
                                moves: [this.game.lastSAN]
                            });
                        }
                        else if (!lastMsg || lastMsg.type !== 'move') {
                            this.messages.push({
                                type: 'move',
                                round: this.game.roundId,
                                moves: ['', this.game.lastSAN]
                            });
                        }
                        else {
                            this.messages[this.messages.length - 1].moves.push(this.game.lastSAN);
                        }
                    }
                }
            });
            this.socket.on('gameRestart', () => {
                console.log('gameRestart');
                this.gameEndDialog.show = false;
                this.messages = [];
            });
            this.socket.on('msg', (res) => {
                this.addMessage(res);
            });
            this.socket.on('notify', (res) => {
                this.$q.notify(res);
            });
            this.socket.on('disconnect', () => {
                console.log('Socket Disconnected.');
                this.addMessage({
                    type: 'disconnected'
                });
            });
        },
        addMessage(obj) {
            let msg = '';
            let value = obj.value;
            let color = null;
            switch (obj.type) {
                case 'gameEnd':
                    msg = value === 'draw' ? 'Draw.' : (value === 'white' ? 'White won.' : 'Black won.');
                    color = 'primary';
                    this.gameEndDialog.text = value === 'draw' ? 'Draw.' : (this.myPlayer.side === value ? 'You won.' : 'You lost.');
                    this.gameEndDialog.show = true;
                    break;
                case 'connected':
                    msg = 'Connected to server.';
                    color = 'positive';
                    break;
                case 'disconnected':
                    msg = 'You have been disconnected from the server.';
                    color = 'negative';
                    break;
                case 'playerJoin':
                    if (this.game.gameState == 'lobby') {
                        msg = `${value} joined the lobby.`;
                    }
                    else { // ? impossible
                        msg = `${value} reconnected.`;
                    }
                    break;
                case 'playerLeave':
                    if (this.game.gameState == 'lobby') {
                        msg = `${value} left the lobby.`;
                        color = 'negative';
                    }
                    else {
                        msg = `${value} disconnected.`;
                        color = 'negative';
                    }
                    break;
                case 'playerReady':
                    msg = `${value} is ready to start.`;
                    break;
                case 'playerReadyCancel':
                    msg = `${value} canceled ready.`;
                    break;
                default:
                    msg = `${value}`;
                    break;
            }
            this.messages.push({
                type: 'msg',
                text: msg,
                color: color
            });
        },
        init() {
            api(port, '/rooms/state', {
                roomId: this.roomId
            }).then(res => {
                let r = res.data
                console.log(r)
                if (r.success) {
                    if (r.gameState == 'lobby') {
                        this.connect()
                        this.pageMode = 'lobby'
                    }
                }
                else {
                    this.$q.notify({
                        color: 'negative',
                        message: 'Room not found.',
                        position: 'top',
                        timeout: 2000
                    })
                }
            })
        }
    },
    computed: {
        roomId() {
            return this.$route.params.roomId
        },
        nameIsSet() {
            return this.$store.state.user.name != null && this.$store.state.user.name != ''
        },
        userName() {
            return this.$store.state.user.name
        },
        myPlayer() {
            if (this.game.players && this.token) return this.game.players.find(v => v.token == this.token)
            else return {state: 'lobby'}
        },
        mySide() {
            return this.myPlayer.side ? this.myPlayer.side : '';
        },
        myTurn() {
            if (this.game.players && this.token) {
                return this.game.players.findIndex(v => v.token == this.token) === this.game.roundPos;
            }
            else return false;
        },
        iPlayAgain() {
            return this.game.playAgain ? this.game.playAgain.includes(this.token) : false
        },
        playAgainLabel() {
            if (!this.game.playAgain) return 'Play Again'
            return (this.game.playAgain.includes(this.token) ? 'Waiting for Others' : 'Play Again') + ' ' + this.game.playAgain.length
        }
    },
    watch: {
        nameIsSet: {
            handler: function(val) {
                if (val == true) {
                    this.init()
                }
            }
        }
    },
    mounted() {
        // adjust board size
        let availHeight = window.innerHeight - 48 - 20, availWidth, availSize;
        let boardSize = tileSize*8;
        if (window.innerWidth <= 700) {
            availWidth = window.innerWidth - 20;
            availSize = Math.min(availHeight, availWidth);
            this.$refs.board.style.left = "calc( 50vw - " + (availSize / 2) + "px )";
        }
        else {
            availWidth = window.innerWidth - 20 - 220;
            availSize = Math.min(availHeight, availWidth);
            this.$refs.board.style.left = "calc( (100vw - 220px) / 2 - " + (availSize / 2) + "px )";
        }
        this.$refs.board.style.top = "calc( (100vh - 48px) / 2 - " + (availSize / 2) + "px )";
        this.$refs.board.style.transform = "scale("+(availSize/boardSize)+")";
    },
    created() {
        if (this.roomId == null || this.roomId == '') {
            //this.pageMode = 'description'
            this.$router.push('/')
        }
        else {
            if (this.nameIsSet) {
                this.init()
            }
        }
    },
    beforeRouteUpdate(to, from, next) {
        if (this.socket && this.socket.connected) {
            this.socket.disconnect()
            this.socket = null
        }
        next()
    },
    beforeRouteLeave(to, from, next) {
        if (this.socket && this.socket.connected) {
            this.socket.disconnect()
            this.socket = null
        }
        next()
    },
    beforeDestroy() {
        if (this.socket && this.socket.connected) {
            this.socket.disconnect()
            this.socket = null
        }
    }
}
</script>

<style lang="scss">
.game-chess {
    .board-container {
        width: 100%;
        height: 100%;
    }

    .board {
        position: relative;
        transform-origin: top left;
        border-radius: 5px;
        background: #bbada0;
        z-index: 1;
    }

    .console-container {
        width: 220px;
    }

    @media screen and (max-width: 700px) {
        .console-container {
            display: none;
        }
    }

    .console-move-container {
        width: 100%;
        display: flex;
        justify-content: flex-start;
        column-gap: 5px;

        .round {
            width: 40px;
            font-weight: 500;

            &::after {
                content: '.';
            }
        }

        .move {
            width: 60px;
        }
    }

    .background-tile {
        position: absolute;
        cursor: pointer;
        z-index: 2;

        &.white {
            background: #a6c3c5;
        }
        &.black {
            background: #568167;
        }
        &.selected {
            background: var(--q-color-primary);
        }
    }

    .piece {
        position: absolute;
        z-index: 10;
        cursor: pointer;

        &.selected {
            background: var(--q-color-primary);
        }

        img {
            width: 100%;
            height: 100%;
        }
    }
}
</style>