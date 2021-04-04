<template>
    <q-page padding>
        <div class="q-mb-lg">
            <div class="text-h5 q-my-md">Join Room</div>
            <div class="row inline q-gutter-md">
                <q-input class="sm-input" outlined v-model="inputRoomURL" type="text" label="Enter Room URL" />
                <q-btn color="primary" label="Join" @click="enterRoom" />
            </div>
        </div>
        <q-separator />
        <div class="q-mb-lg">
            <div class="text-h5 q-my-md flex justify-between">
                <div>Create Room</div>
                <div>
                    <q-btn color="secondary" flat :loading="loadingServerInfo" label="Refresh" icon="refresh" @click="fetchServerInfo" />
                </div>
            </div>
            <div class="row">
                <div class="col-6 col-md-3" v-for="game in gameList" :key="game.link">
                    <q-card>
                        <q-card-section class="bg-primary text-white">
                            <div class="row q-mb-sm">
                                <div class="col text-h6">{{ game.label }}</div>
                                <div class="col-auto">
                                    <q-icon v-if="gameStatus[game.name].status == 'online'" color="positive" name="circle"></q-icon>
                                    <q-icon v-if="gameStatus[game.name].status == 'offline'" color="negative" name="circle"></q-icon>
                                    <q-icon v-if="gameStatus[game.name].status == 'unknown'" color="grey" name="circle"></q-icon>
                                    {{ gameStatus[game.name].playerCount }}
                                </div>
                            </div>
                            
                            <div class="text-subtitle2">{{ game.desc }}</div>
                        </q-card-section>

                        <q-separator />

                        <q-card-actions vertical>
                            <q-btn flat @click="createRoom(game)">Create Room</q-btn>
                        </q-card-actions>
                    </q-card>
                </div>
            </div>
        </div>
        <q-separator />
        <div class="q-mb-lg">
            <div class="text-h5 q-my-md">Player Information</div>
            <div class="flex justify-between">
                <div class="large-text">Name: <strong>{{this.$store.state.user.name}}</strong></div>
                <div>
                    <q-btn color="primary" flat @click="$store.commit('setName', null)">Change Name</q-btn>
                </div>
            </div>
        </div>
        <!--
        <div class="row">
            <div class="col-12 col-md">
                <div class="game-container">
                    <div class="game-container-left">
                        <div class="player-name">leftPlayer.nameleftPlayer.nameleftPlayer.nameleftPlayer.name</div>
                        <div class="text-center player-chips">
                            <q-chip size="sm" icon="terrain">Landlord</q-chip>
                        </div>
                        <div class="container-cards-vertical game-card-outer-vertical game-card-outer-sm">
                            <img v-for="n in 20" :key="n" src="/resources/cardbacks/blue.svg" class="game-card" :style="{top: (n-1)*12 + 'px'}" /> 
                        </div>
                    </div>
                    <div class="game-container-right">
                        <div class="player-name">rightPlayer.name</div>
                        <div class="text-center player-chips">
                            <q-chip size="sm" icon="terrain">Landlord</q-chip>
                        </div>
                        <div class="container-cards-vertical game-card-outer-vertical game-card-outer-sm">
                            <img v-for="n in 2" :key="n" src="/resources/cardbacks/blue.svg" class="game-card" :style="{top: (n-1)*12 + 'px'}" /> 
                        </div>
                    </div>
                    <div class="game-container-bottom">
                        <div class="container-cards game-card-outer" :style="{width: 18*20+80 + 'px'}">
                            <img v-for="n in 17" :key="n" src="/resources/cards/clubs_ace.svg" class="game-card" :style="{left: (n-1)*20 + 'px'}" draggable="false" />
                            <img src="/resources/cards/hearts_ace.svg" class="game-card game-card-selected" :style="{left: (18-1)*20 + 'px'}" />
                        </div>
                        <div class="text-center text-weight-medium bottom-player-name">myPlayer.name <q-chip size="sm" icon="terrain">Landlord</q-chip></div>
                    </div>
                    <div class="game-container-middle">
                        <div class="card-pile" v-show="false">
                            <div class="container-cards game-card-outer" :style="{width: 18*20+80 + 'px'}">
                                <img v-for="n in 18" :key="n" src="/resources/cards/clubs_ace.svg" class="game-card" :style="{left: (n-1)*20 + 'px'}" /> 
                            </div>
                        </div>
                        <div class="landlord-card-pool">
                            <div v-show="true" class="container-cards game-card-outer game-card-outer-xs" :style="{width: '115px'}">
                                <img v-for="n in 3" :key="n" src="/resources/cards/clubs_ace.svg" class="game-card" :style="{left: (n-1)*40 + 'px'}" />
                            </div>
                            <div v-show="false" class="container-cards game-card-outer game-card-outer-xs" :style="{width: '115px'}">
                                <img v-for="n in 3" :key="n" src="/resources/cardbacks/blue.svg" class="game-card" :style="{left: (n-1)*40 + 'px'}" />
                            </div>
                        </div>
                        <div class="left-cards">
                            <div class="container-cards game-card-outer game-card-outer-md" :style="{width: (12>10?10:12)*18+80-18 + 'px'}">
                                <img v-for="n in 12" :key="n" src="/resources/cards/clubs_ace.svg" class="game-card" :style="{left: ((n-1)%10)*18 + 'px', top: n-1>=10?'30px':'0'}" />
                            </div>
                        </div>
                        <div class="status left-status">
                            <div class="text" v-show="true">PASS</div>
                            <div class="text" v-show="false"><q-icon name="arrow_forward" /></div>
                        </div>
                        <div class="right-cards" v-show="false">
                            <div class="container-cards game-card-outer game-card-outer-md" :style="{width: 10*18+80-18 + 'px'}">
                                <img v-for="n in 14" :key="n" src="/resources/cards/clubs_ace.svg" class="game-card" :style="{left: ((n-1)%10)*18 + 'px', top: n-1>=10?'30px':'0'}" />
                            </div>
                        </div>
                        <div class="status right-status">
                            <div class="text" v-show="false">PASS</div>
                            <div class="text text-weight-medium" v-show="true">4</div>
                        </div>
                        <div class="bottom-cards">
                            <div class="container-cards game-card-outer game-card-outer-md" :style="{width: 20*18+80-18 + 'px'}">
                                <img v-for="n in 20" :key="n" src="/resources/cards/clubs_ace.svg" class="game-card" :style="{left: (n-1)*18 + 'px'}" />
                            </div>
                        </div>
                        <div class="bottom-status">
                            <div v-show="true" class="normal-status">
                                <div class="text" v-show="true">PASS</div>
                                <div class="text" v-show="false"><q-icon name="arrow_upward" /></div>
                            </div>
                            <div v-show="false" class="player-actions">
                                <div class="action-btns-outer">
                                    <q-btn v-for="n in 4" :key="n" color="primary" :label="n-1" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="game-container-mask"></div>
                    <div class="game-end-container">
                        <q-card>
                            <q-card-section>
                                <div v-show="false" class="text-h5 text-center q-py-md text-positive">You Won!</div>
                                <div v-show="true" class="text-h5 text-center q-py-md text-negative">You Lost.</div>
                            </q-card-section>
                            <q-card-section class="flex justify-center">
                                <q-btn class="q-mx-md" color="secondary" label="Quit" />
                                <q-btn class="q-mx-md" color="primary" label="Play Again" />
                            </q-card-section>
                        </q-card>
                    </div>
                </div>
            </div>
            <div class="col-12 col-md-2 col-lg-3 q-pa-sm q-pa-lg-lg">
                <div class="text-h6" style="height: 50px;">Console</div>
                <q-scroll-area class="console q-pa-md">
                    <div class="q-mb-sm" v-for="n in 100" :key="n">{{n}}</div>
                </q-scroll-area>
            </div>
        </div>
        -->
        <name-input />
        <q-dialog v-model="serverOffline">
            <q-card>
                <q-card-section>
                <div class="text-h6">Server Offline</div>
                </q-card-section>

                <q-card-section class="q-pt-none">
                    The server is currently offline due to maintenance/upgrade. Please try again later.
                </q-card-section>

                <q-card-actions align="right">
                    <q-btn flat label="Try Again" color="primary" @click="tryAgain" />
                </q-card-actions>
            </q-card>
        </q-dialog>
    </q-page>
</template>

<script>
import NameInput from 'src/components/NameInput.vue'
import api from '../api'
import { frontendBasePath, ports } from 'src/basePath'
import version from 'src/version'
export default {
    components: { NameInput },
    name: 'Index',
    data() {
        return {
            inputRoomURL: '',
            gameList: [
                { name: 'landlord', label: 'LandLord', link: '/landlord', desc: 'Classic Chinese LandLord card game, played with 3 players and one set of 54 cards.' }
            ],
            gameStatus: {
                landlord: {
                    status: 'unknown',
                    playerCount: ''
                }
            },
            serverOffline: false,
            loadingServerInfo: false
        }
    },
    methods: {
        fetchServerInfo() {
            let loadedCount = 0
            let totalCount = this.gameList.length
            this.loadingServerInfo = true
            for (let i of this.gameList) {
                api(ports[i.name], '/').then(res => {
                    this.gameStatus[i.name] = res.data
                    if (++loadedCount == totalCount) this.loadingServerInfo = false
                }).catch(err => {
                    this.gameStatus[i.name].status = 'offline'
                    this.gameStatus[i.name].playerCount = 'Offline'
                    if (++loadedCount == totalCount) this.loadingServerInfo = false
                })
            }
        },
        fetchBaseInfo() {
            api(ports.index, '/').then(res => {
                let r = res.data
                if (r.version != version) {
                    this.$q.dialog({
                        title: 'Update Client',
                        message: `Detected new client version ${r.version}. You are using ${version}. Please update your client (on desktop) or refresh the web page (in browser).`
                    })
                }
                this.fetchServerInfo()
            }).catch(err => {
                this.serverOffline = true
                console.log('err', err)
            })
        },
        tryAgain() {
            this.serverOffline = false
            this.fetchBaseInfo()
        },
        enterRoom() {
            if (!this.inputRoomURL.startsWith(frontendBasePath)) {
                this.$q.notify({
                    color: 'negative',
                    message: 'Invalid URL',
                    position: 'top',
                    timeout: 2000
                })
            }
            else {
                this.$router.push(this.inputRoomURL.substring(frontendBasePath.length))
            }
        },
        createRoom(game) {
            api(ports[game.name], '/rooms/create').then(res => {
                let r = res.data
                console.log(r)
                if (r.success) {
                    this.$router.push(game.link+'/'+encodeURIComponent(r.roomId))
                }
                else {
                    this.$q.notify({
                        color: 'negative',
                        message: r.msg,
                        position: 'top',
                        timeout: 2000
                    })
                }
            }).catch(err => {
                this.$q.notify({
                    color: 'negative',
                    message: game.label + ' server is currently offline.',
                    position: 'top',
                    timeout: 2000
                })
                console.log('err', err)
            })
        }
    },
    created() {
        console.log(process.env.NODE_ENV, version)
        this.fetchBaseInfo()
    }
}
</script>

<style>
.sm-input {
    max-width: 400px;
    min-width: 300px;
}
.large-text {
    font-size: 18px;
}
</style>