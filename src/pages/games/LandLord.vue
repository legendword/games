<template>
    <div>
        <q-page v-if="$q.platform.is.mobile">
            <div v-if="pageMode == 'lobby'">
                <div class="text-h5 text-center q-py-sm">LandLord</div>
                <div class="row">
                    <div class="col-4 q-pa-md">
                        <q-card class="q-mt-md" v-if="game.players.length >= 2">
                            <q-card-section>
                                <div class="text-h5 text-center">{{ game.players[1].name }}</div>
                            </q-card-section>
                            <q-card-section class="q-py-xs">
                                <q-avatar class="block-center" size="60px">
                                    <img src="https://cdn.quasar.dev/logo/svg/quasar-logo.svg">
                                </q-avatar>
                            </q-card-section>
                            <q-card-section>
                                <q-icon v-if="game.players[1].state == 'ready'" color="positive" name="done" size="md" class="text-center width-100" />
                            </q-card-section>
                        </q-card>
                    </div>
                    <div class="col-4 q-pa-md">
                        <q-card v-if="game.players.length >= 1">
                            <q-card-section>
                                <div class="text-h5 text-center">{{ game.players[0].name }}</div>
                            </q-card-section>
                            <q-card-section class="q-py-xs">
                                <q-avatar class="block-center" size="60px">
                                    <img src="https://cdn.quasar.dev/logo/svg/quasar-logo.svg">
                                </q-avatar>
                            </q-card-section>
                            <q-card-section>
                                <q-icon v-if="game.players[0].state == 'ready'" color="positive" name="done" size="md" class="text-center width-100" />
                            </q-card-section>
                        </q-card>
                        <q-btn class="q-mt-lg block-center" color="primary" :flat="myPlayer.state == 'ready'" :label="myPlayer.state == 'ready' ? 'Waiting for Others' : 'Start Game'" :disable="game.playerCount !== game.playerLimit" @click="lobbyReady" />
                    </div>
                    <div class="col-4 q-pa-md">
                        <q-card class="q-mt-md" v-if="game.players.length == 3">
                            <q-card-section>
                                <div class="text-h5 text-center">{{ game.players[2].name }}</div>
                            </q-card-section>
                            <q-card-section class="q-py-xs">
                                <q-avatar class="block-center" size="60px">
                                    <img src="https://cdn.quasar.dev/logo/svg/quasar-logo.svg">
                                </q-avatar>
                            </q-card-section>
                            <q-card-section>
                                <q-icon v-if="game.players[2].state == 'ready'" color="positive" name="done" size="md" class="text-center width-100" />
                            </q-card-section>
                        </q-card>
                    </div>
                </div>
            </div>
            <div v-else-if="pageMode == 'game'">
                <div class="game-container">
                    <div :class="'game-container-left' + (game.roundPos == leftPlayer.position ? ' current-player' : '')">
                        <div class="player-name">{{ leftPlayer.name }}</div>
                        <div class="text-center player-chips">
                            <q-chip size="sm" icon="terrain" v-show="leftPlayer.isLandLord">LandLord</q-chip>
                        </div>
                        <div class="container-cards-vertical game-card-outer-vertical game-card-outer-sm">
                            <img v-for="n in game.cardCounts[leftPlayer.position]" :key="n" src="/resources/cardbacks/blue.svg" class="game-card" :style="{top: (n-1)*12 + 'px'}" /> 
                        </div>
                    </div>
                    <div :class="'game-container-right' + (game.roundPos == rightPlayer.position ? ' current-player' : '')">
                        <div class="player-name">{{ rightPlayer.name }}</div>
                        <div class="text-center player-chips">
                            <q-chip size="sm" icon="terrain" v-show="rightPlayer.isLandLord">LandLord</q-chip>
                        </div>
                        <div class="container-cards-vertical game-card-outer-vertical game-card-outer-sm">
                            <img v-for="n in game.cardCounts[rightPlayer.position]" :key="n" src="/resources/cardbacks/blue.svg" class="game-card" :style="{top: (n-1)*12 + 'px'}" /> 
                        </div>
                    </div>
                    <div :class="'game-container-bottom' + (game.roundPos == myPlayer.position ? ' current-player' : '')">
                        <div class="container-cards game-card-outer" :style="{width: myCardList.length*20+80 + 'px'}">
                            <img v-for="(item, itid) in myCardList" :key="item.id" :src="item.imgURL" :class="'game-card' + (selectedCards.includes(item.id) ? ' game-card-selected' : '')" :style="{left: (itid)*20 + 'px'}" @mousedown="cardMouseDown(item.id)" @mouseover="cardMouseOver($event, item.id)" draggable="false" />
                        </div>
                        <div class="text-center text-weight-medium bottom-player-name">{{ myPlayer.name }} <q-chip size="sm" icon="terrain" v-show="myPlayer.isLandLord">LandLord</q-chip></div>
                    </div>
                    <div class="game-container-middle">
                        <!--
                        <div class="card-pile">
                            <div class="container-cards game-card-outer" :style="{width: currentCardList.length*20+80 + 'px'}">
                                <img v-for="(item, itid) in currentCardList" :key="item.id" :src="item.imgURL" class="game-card" :style="{left: (itid)*20 + 'px'}" />
                            </div>
                        </div> -->
                        <div class="landlord-card-pool">
                            <div v-if="game.cardPool.length > 0" class="container-cards game-card-outer game-card-outer-xs" :style="{width: '115px'}">
                                <img v-for="(item, itid) in cardPoolList" :key="item.id" :src="item.imgURL" class="game-card" :style="{left: (itid)*40 + 'px'}" />
                            </div>
                            <div v-else class="container-cards game-card-outer game-card-outer-xs" :style="{width: '115px'}">
                                <img v-for="n in 3" :key="n" src="/resources/cardbacks/blue.svg" class="game-card" :style="{left: (n-1)*40 + 'px'}" />
                            </div>
                        </div>
                        <div class="left-cards" v-if="Array.isArray(leftPlayer.lastMove)">
                            <div class="container-cards game-card-outer game-card-outer-md" :style="{width: (leftPlayedCardList.length>10?10:leftPlayedCardList.length)*18+80-18 + 'px'}">
                                <img v-for="(item, itid) in leftPlayedCardList" :key="item.id" :src="item.imgURL" class="game-card" :style="{left: (itid%10)*18 + 'px', top: itid>=10?'30px':'0'}" />
                            </div>
                        </div>
                        <div class="status left-status" v-else>
                            <div class="text" v-if="leftPlayer.lastMove == 'pass'">PASS</div>
                            <div class="text text-weight-medium" v-else>{{ leftPlayer.lastMove }}</div>
                        </div>
                        <div class="right-cards" v-if="Array.isArray(rightPlayer.lastMove)">
                            <div class="container-cards game-card-outer game-card-outer-md" :style="{width: (rightPlayedCardList.length>10?10:rightPlayedCardList.length)*18+80-18 + 'px'}">
                                <img v-for="(item, itid) in rightPlayedCardList" :key="item.id" :src="item.imgURL" class="game-card" :style="{left: (itid%10)*18 + 'px', top: itid>=10?'30px':'0'}" />
                            </div>
                        </div>
                        <div class="status right-status" v-else>
                            <div class="text" v-if="rightPlayer.lastMove == 'pass'">PASS</div>
                            <div class="text text-weight-medium" v-else>{{ rightPlayer.lastMove }}</div>
                        </div>
                        <div class="bottom-cards" v-if="(!isMyRound && Array.isArray(myPlayer.lastMove)) || game.gameEnded">
                            <div class="container-cards game-card-outer game-card-outer-md" :style="{width: myPlayedCardList.length*18+80-18 + 'px'}">
                                <img v-for="(item, itid) in myPlayedCardList" :key="item.id" :src="item.imgURL" class="game-card" :style="{left: itid*18 + 'px'}" />
                            </div>
                        </div>
                        <div class="bottom-status" v-else>
                            <div v-if="isMyRound" class="player-actions">
                                <div class="action-btns-outer" v-if="game.roundId == 0">
                                    <q-btn v-for="n in 4" :key="n" color="primary" :label="n-1" @click="callLandLord(n-1)" />
                                </div>
                                <div class="action-btns-outer" v-else>
                                    <q-btn color="secondary" label="Pass" @click="move('pass')" />
                                    <q-btn color="primary" label="Confirm" @click="move('card')" />
                                </div>
                            </div>
                            <div v-else class="normal-status">
                                <div class="text" v-if="myPlayer.lastMove == 'pass'">PASS</div>
                                <div class="text text-weight-medium" v-else>{{ myPlayer.lastMove }}</div>
                            </div>
                        </div>
                    </div>
                    <div class="game-container-mask" v-if="showEndScreen"></div>
                    <div class="game-end-container" v-if="showEndScreen">
                        <q-card>
                            <q-card-section>
                                <div v-if="endScreenWin" class="text-h5 text-center q-py-md text-positive">You Won!</div>
                                <div v-else class="text-h5 text-center q-py-md text-negative">You Lost.</div>
                            </q-card-section>
                            <q-card-section class="flex justify-center">
                                <q-btn class="q-mx-md" color="secondary" label="Quit" @click="quitGame" />
                                <q-btn class="q-mx-md" color="primary" :flat="iPlayAgain" :disable="!game.playAgain" :label="playAgainLabel" @click="playAgain" />
                            </q-card-section>
                        </q-card>
                    </div>
                </div>
            </div>
        </q-page>
        <q-page class="q-pa-lg" v-else>
            <div v-if="pageMode == 'description'">
                <!-- todo -->
            </div>
            <div v-if="pageMode == 'lobby'" class="row">
                <div class="col-12 col-md q-pa-lg">
                    <div class="text-h4 q-my-md">LandLord - Room Lobby</div>
                    <q-separator />
                    <div class="text-h5 q-my-md">Players ({{game.playerCount}}/{{game.playerLimit}})</div>
                    <q-list bordered separator>
                        <q-item v-for="player in game.players" :key="player.token">
                            <q-item-section class="text-subtitle2 q-py-sm" style="font-size: 1.1rem;">{{player.name}}</q-item-section>
                            <q-item-section side><q-icon v-if="player.state == 'ready'" color="positive" name="done" /></q-item-section>
                        </q-item>
                    </q-list>
                    <div class="q-mt-lg text-center">
                        <q-btn color="primary" :flat="myPlayer.state == 'ready'" :label="myPlayer.state == 'ready' ? 'Waiting for Others' : 'Start Game'" :disable="game.playerCount !== game.playerLimit" @click="lobbyReady" />
                    </div>
                </div>
                <div class="col-12 col-md-2 col-lg-3 q-pa-sm q-pa-lg-lg">
                    <div class="text-h6" style="height: 50px;">Console</div>
                    <q-scroll-area class="console q-pa-md">
                        <div :class="'q-mb-sm' + (msg.color?' text-'+msg.color:'')" v-for="(msg, index) in messages" :key="index">{{msg.text}}</div>
                    </q-scroll-area>
                </div>
            </div>
            <div v-if="pageMode == 'game'" class="row">
                <div class="col-12 col-md">
                    <div class="game-container">
                        <div :class="'game-container-left' + (game.roundPos == leftPlayer.position ? ' current-player' : '')">
                            <div class="player-name">{{ leftPlayer.name }}</div>
                            <div class="text-center player-chips">
                                <q-chip size="sm" icon="terrain" v-show="leftPlayer.isLandLord">LandLord</q-chip>
                            </div>
                            <div class="container-cards-vertical game-card-outer-vertical game-card-outer-sm">
                                <img v-for="n in game.cardCounts[leftPlayer.position]" :key="n" src="/resources/cardbacks/blue.svg" class="game-card" :style="{top: (n-1)*12 + 'px'}" /> 
                            </div>
                        </div>
                        <div :class="'game-container-right' + (game.roundPos == rightPlayer.position ? ' current-player' : '')">
                            <div class="player-name">{{ rightPlayer.name }}</div>
                            <div class="text-center player-chips">
                                <q-chip size="sm" icon="terrain" v-show="rightPlayer.isLandLord">LandLord</q-chip>
                            </div>
                            <div class="container-cards-vertical game-card-outer-vertical game-card-outer-sm">
                                <img v-for="n in game.cardCounts[rightPlayer.position]" :key="n" src="/resources/cardbacks/blue.svg" class="game-card" :style="{top: (n-1)*12 + 'px'}" /> 
                            </div>
                        </div>
                        <div :class="'game-container-bottom' + (game.roundPos == myPlayer.position ? ' current-player' : '')">
                            <div class="container-cards game-card-outer" :style="{width: myCardList.length*20+80 + 'px'}">
                                <img v-for="(item, itid) in myCardList" :key="item.id" :src="item.imgURL" :class="'game-card' + (selectedCards.includes(item.id) ? ' game-card-selected' : '')" :style="{left: (itid)*20 + 'px'}" @mousedown="cardMouseDown(item.id)" @mouseover="cardMouseOver($event, item.id)" draggable="false" />
                            </div>
                            <div class="text-center text-weight-medium bottom-player-name">{{ myPlayer.name }} <q-chip size="sm" icon="terrain" v-show="myPlayer.isLandLord">LandLord</q-chip></div>
                        </div>
                        <div class="game-container-middle">
                            <!--
                            <div class="card-pile">
                                <div class="container-cards game-card-outer" :style="{width: currentCardList.length*20+80 + 'px'}">
                                    <img v-for="(item, itid) in currentCardList" :key="item.id" :src="item.imgURL" class="game-card" :style="{left: (itid)*20 + 'px'}" />
                                </div>
                            </div> -->
                            <div class="landlord-card-pool">
                                <div v-if="game.cardPool.length > 0" class="container-cards game-card-outer game-card-outer-xs" :style="{width: '115px'}">
                                    <img v-for="(item, itid) in cardPoolList" :key="item.id" :src="item.imgURL" class="game-card" :style="{left: (itid)*40 + 'px'}" />
                                </div>
                                <div v-else class="container-cards game-card-outer game-card-outer-xs" :style="{width: '115px'}">
                                    <img v-for="n in 3" :key="n" src="/resources/cardbacks/blue.svg" class="game-card" :style="{left: (n-1)*40 + 'px'}" />
                                </div>
                            </div>
                            <div class="left-cards" v-if="Array.isArray(leftPlayer.lastMove)">
                                <div class="container-cards game-card-outer game-card-outer-md" :style="{width: (leftPlayedCardList.length>10?10:leftPlayedCardList.length)*16+80-16 + 'px'}">
                                    <img v-for="(item, itid) in leftPlayedCardList" :key="item.id" :src="item.imgURL" class="game-card" :style="{left: (itid%10)*16 + 'px', top: itid>=10?'30px':'0'}" />
                                </div>
                            </div>
                            <div class="status left-status" v-else>
                                <div class="text" v-if="leftPlayer.lastMove == 'pass'">PASS</div>
                                <div class="text text-weight-medium" v-else>{{ leftPlayer.lastMove }}</div>
                            </div>
                            <div class="right-cards" v-if="Array.isArray(rightPlayer.lastMove)">
                                <div class="container-cards game-card-outer game-card-outer-md" :style="{width: (rightPlayedCardList.length>10?10:rightPlayedCardList.length)*16+80-16 + 'px'}">
                                    <img v-for="(item, itid) in rightPlayedCardList" :key="item.id" :src="item.imgURL" class="game-card" :style="{left: (itid%10)*16 + 'px', top: itid>=10?'30px':'0'}" />
                                </div>
                            </div>
                            <div class="status right-status" v-else>
                                <div class="text" v-if="rightPlayer.lastMove == 'pass'">PASS</div>
                                <div class="text text-weight-medium" v-else>{{ rightPlayer.lastMove }}</div>
                            </div>
                            <div class="bottom-cards" v-if="(!isMyRound && Array.isArray(myPlayer.lastMove)) || game.gameEnded">
                                <div class="container-cards game-card-outer game-card-outer-md" :style="{width: myPlayedCardList.length*16+80-16 + 'px'}">
                                    <img v-for="(item, itid) in myPlayedCardList" :key="item.id" :src="item.imgURL" class="game-card" :style="{left: itid*16 + 'px'}" />
                                </div>
                            </div>
                            <div class="bottom-status" v-else>
                                <div v-if="isMyRound" class="player-actions">
                                    <div class="action-btns-outer" v-if="game.roundId == 0">
                                        <q-btn v-for="n in 4" :key="n" color="primary" :label="n-1" @click="callLandLord(n-1)" />
                                    </div>
                                    <div class="action-btns-outer" v-else>
                                        <q-btn color="secondary" label="Pass" @click="move('pass')" />
                                        <q-btn color="primary" label="Confirm" @click="move('card')" />
                                    </div>
                                </div>
                                <div v-else class="normal-status">
                                    <div class="text" v-if="myPlayer.lastMove == 'pass'">PASS</div>
                                    <div class="text text-weight-medium" v-else>{{ myPlayer.lastMove }}</div>
                                </div>
                            </div>
                        </div>
                        <div class="game-container-mask" v-if="showEndScreen"></div>
                        <div class="game-end-container" v-if="showEndScreen">
                            <q-card>
                                <q-card-section>
                                    <div v-if="endScreenWin" class="text-h5 text-center q-py-md text-positive">You Won!</div>
                                    <div v-else class="text-h5 text-center q-py-md text-negative">You Lost.</div>
                                </q-card-section>
                                <q-card-section class="flex justify-center">
                                    <q-btn class="q-mx-md" color="secondary" label="Quit" @click="quitGame" />
                                    <q-btn class="q-mx-md" color="primary" :flat="iPlayAgain" :disable="!game.playAgain" :label="playAgainLabel" @click="playAgain" />
                                </q-card-section>
                            </q-card>
                        </div>
                    </div>
                </div>
                <div class="col-12 col-md-2 col-lg-3 q-pa-sm q-pa-lg-lg">
                    <div class="text-h6" style="height: 50px;">Console</div>
                    <q-scroll-area class="console q-pa-md">
                        <div :class="'q-mb-sm' + (msg.color?' text-'+msg.color:'')" v-for="(msg, index) in messages" :key="index">{{msg.text}}</div>
                    </q-scroll-area>
                </div>
            </div>
        </q-page>
        <name-input />
    </div>
</template>

<script>
import NameInput from 'src/components/NameInput.vue'
import { io } from "socket.io-client";
import api from 'src/api';
import { backendBasePath, ports } from 'src/basePath';
import { cards, cardsReference } from 'src/cards';
const port = ports.landlord;
const backendPath = backendBasePath + ':' + port;
export default {
    components: { NameInput },
    name: 'LandLord',
    data() {
        return {
            pageMode: null,
            token: '',
            socket: null,
            game: {},
            myHand: [],
            selectedCards: [],
            messages: [],
            showEndScreen: false,
            endScreenWin: true
        }
    },
    methods: {
        quitGame() {
            this.$router.push('/')
        },
        playAgain() {
            this.socket.emit('playAgain')
        },
        cardMouseDown(n) {
            this.toggleCardSelect(n)
        },
        cardMouseOver(ev, n) {
            if (ev.buttons > 0) {
                this.toggleCardSelect(n)
            }
        },
        toggleCardSelect(cd) {
            let index = this.selectedCards.indexOf(cd)
            if (index == -1) {
                this.selectedCards.push(cd)
            }
            else {
                this.selectedCards.splice(index, 1)
            }
        },
        callLandLord(num) {
            if (num < 0 || num > 3 || !this.isMyRound) return
            this.socket.emit('move', {
                value: num,
                type: 'landlord'
            })
        },
        move(type) {
            if (!this.isMyRound) return
            if (type == 'pass') {
                this.socket.emit('move', {
                    type: 'pass'
                })
            }
            else { //type == 'card'
                if (this.selectedCards.length == 0) {
                    this.$q.notify({
                        message: 'You must select at least one card.',
                        color: 'negative'
                    })
                    return
                }
                this.socket.emit('move', {
                    value: this.selectedCards,
                    type: 'card'
                })
            }
        },
        getCardInfo(cd) {
            let card = cards[cd]
            return {
                id: cd,
                imgURL: '/resources/cards/' + cardsReference[card.suit] + '_' + (cardsReference[card.value] ? cardsReference[card.value] : card.value) + '.png'
            }
        },
        lobbyReady() {
            this.socket.emit('ready')
        },
        connect() {
            this.socket = io(backendPath, {
                reconnection: false
            })
            this.socket.on('connect', () => {
                console.log('Socket Connected: ', this.socket.id)
                this.addMessage({
                    type: 'connected'
                })
                this.socket.emit('name', this.userName)
                this.socket.emit('room', {
                    token: this.token,
                    roomId: this.roomId
                })
            })
            this.socket.on('room', (res) => {
                if (res.success) {
                    this.token = res.token
                    if (process.env.NODE_ENV) this.$q.sessionStorage.set('token', this.token)
                    else this.$q.localStorage.set('token', this.token)
                }
                else {
                    this.$q.notify({
                        color: 'negative',
                        message: res.msg,
                        position: 'top',
                        timeout: 2000
                    })
                }
            })
            this.socket.on('update', (res) => {
                console.log('update', res)
                this.game = res
                if (this.game.gameState == 'game') {
                    if (this.pageMode !== 'game') this.pageMode = 'game'
                }
            })
            this.socket.on('updateHand', (res) => {
                console.log('updateHand', res)
                this.myHand = res
                this.selectedCards = this.selectedCards.filter(v => res.includes(v))
            })
            this.socket.on('gameRestart', () => {
                console.log('gameRestart')
                this.showEndScreen = false
                this.messages = []
            })
            this.socket.on('msg', (res) => {
                this.addMessage(res)
            })
            this.socket.on('notify', (res) => {
                this.$q.notify(res)
            })
            this.socket.on('disconnect', () => {
                console.log('Socket Disconnected.')
                this.addMessage({
                    type: 'disconnected'
                })
            })
        },
        addMessage(obj) {
            let msg = ''
            let value = obj.value
            let color = null
            switch (obj.type) {
                case 'cardPassed':
                    msg = `${value} passed.`
                    break
                case 'cardPlayed':
                    msg = `${value[0]} played ${value[1]}.`
                    break
                case 'gameEnd':
                    if (value) msg = 'Game Ended. The LandLord won!'
                    else msg = 'Game Ended. The Civilians won!'
                    this.endScreenWin = value ? this.myPlayer.isLandLord : !this.myPlayer.isLandLord
                    setTimeout(() => {
                        this.showEndScreen = true
                    }, 2000)
                    color = 'primary'
                    break
                case 'callLandLord':
                    msg = `${value[0]} called ${value[1]}.`
                    break
                case 'decideLandLord':
                    msg = `No one has called a 3. Deciding LandLord automatically by the next biggest call...`
                    break
                case 'becameLandLord':
                    msg = `${value} became LandLord.`
                    break
                case 'newRound':
                    if (value == 0) msg = `Round ${value}: Call for LandLord.`
                    else msg = `Round ${value}`
                    break
                case 'connected':
                    msg = 'Connected to server.'
                    color = 'positive'
                    break
                case 'disconnected':
                    msg = 'You have been disconnected from the server. Try refreshing the page to reconnect, or check the server status.'
                    color = 'negative'
                    break
                case 'playerJoin':
                    if (this.game.gameState == 'lobby') {
                        msg = `${value} joined the lobby.`
                    }
                    else {
                        msg = `${value} reconnected.`
                    }
                    break
                case 'playerLeave':
                    if (this.game.gameState == 'lobby') {
                        msg = `${value} left the lobby.`
                    }
                    else {
                        msg = `${value} disconnected.`
                    }
                    break
                case 'playerReady':
                    msg = `${value} is ready to start.`
                    break
                case 'playerReadyCancel':
                    msg = `${value} canceled ready.`
                    break
                default:
                    msg = `${value}`
                    break
            }
            this.messages.unshift({
                text: msg,
                color: color
            })
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
        leftPlayer() {
            if (this.game.gameState == 'game') return this.game.players[this.myPlayer.position+1 > 2 ? 0 : this.myPlayer.position+1]
            else return {name: '', state: 'game'}
        },
        rightPlayer() {
            if (this.game.gameState == 'game') return this.game.players[this.myPlayer.position-1 < 0 ? 2 : this.myPlayer.position-1]
            else return {name: '', state: 'game'}
        },
        myCardList() {
            return this.myHand.map(v => this.getCardInfo(v))
        },
        currentCardList() {
            return this.game.currentCards.map(v => this.getCardInfo(v))
        },
        leftPlayedCardList() {
            return Array.isArray(this.leftPlayer.lastMove) ? this.leftPlayer.lastMove.map(v => this.getCardInfo(v)) : []
        },
        rightPlayedCardList() {
            return Array.isArray(this.rightPlayer.lastMove) ? this.rightPlayer.lastMove.map(v => this.getCardInfo(v)) : []
        },
        myPlayedCardList() {
            return Array.isArray(this.myPlayer.lastMove) ? this.myPlayer.lastMove.map(v => this.getCardInfo(v)) : []
        },
        cardPoolList() {
            return this.game.cardPool.map(v => this.getCardInfo(v))
        },
        isMyRound() {
            return this.game.roundPos == this.myPlayer.position
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
    created() {
        console.log('userName', this.userName)
        this.token = process.env.NODE_ENV ? this.$q.sessionStorage.getItem('token') : this.$q.localStorage.getItem('token')
        if (!this.token) this.token = ''
        console.log(this.token)
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
.console {
    height: calc( 100vh - 197px ); /* 51px (header) + 2*48px (2 q-pa-lg) + 50px (title) */
    border: 1px solid $grey-4;
}
.block-center {
    margin-left: auto;
    margin-right: auto;
    display: block;
}
.width-100 {
    width: 100%;
}
</style>