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
                                    :class="[(i+j)%2 === 0 ? 'white' : 'black', [currentMove.from, currentMove.to, game.lastMove.from, game.lastMove.to].includes(rcToSquare(i-1,j-1)) ? 'selected' : '']"
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
            <div class="console-container q-pa-sm">
                <div class="text-h6" style="height: 50px;">Console</div>
                <q-scroll-area class="console q-pa-md">
                    <div :class="'q-mb-sm' + (msg.color?' text-'+msg.color:'')" v-for="(msg, index) in messages" :key="index">{{msg.text}}</div>
                </q-scroll-area>
            </div>
        </div>
        <name-input />
    </q-page>
</template>

<script>
import NameInput from 'src/components/NameInput.vue';
import { tileSize } from '../../util/chess/constants';
import { calcPos, rcToSquare } from 'src/util/chess/helpers';

import { io } from "socket.io-client";
import api from 'src/api';
import { backendBasePath, ports } from 'src/basePath';
const port = ports.chess;
const backendPath = backendBasePath + ':' + port;

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
            calcPos: calcPos,
            rcToSquare: rcToSquare,
            currentMove: {
                from: null,
                to: null
            }
        }
    },
    methods: {
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
                        console.log('move', this.currentMove);
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
                }
            });
            this.socket.on('gameRestart', () => {
                console.log('gameRestart')
                this.showEndScreen = false;
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
                // case 'move':
                //     break;
                case 'gameEnd':
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
            this.messages.unshift({
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
        myTurn() {
            if (this.game.players && this.token) {
                return this.game.players.findIndex(v => v.token == this.token) === this.game.roundPos;
            }
            else return false;
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