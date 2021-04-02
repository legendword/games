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
            <div class="text-h5 q-my-md">Create Room</div>
            <div class="row">
                <div class="col-6 col-md-3" v-for="game in gameList" :key="game.link">
                    <q-card>
                        <q-card-section class="bg-primary text-white">
                            <div class="text-h6 q-mb-sm">{{ game.label }}</div>
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
                <div><strong>Name:</strong> {{this.$store.state.user.name}}</div>
                <div>
                    <q-btn color="primary" flat @click="$store.commit('setName', null)">Change Name</q-btn>
                </div>
            </div>
        </div>
        <!--
        <div class="game-card-outer game-card-outer-sm">
            <img src="/resources/cards/clubs_ace.svg" class="game-card" />
            <img src="/resources/cards/spades_4.svg" class="game-card" />
        </div>
        <div class="game-card-outer-vertical game-card-outer-sm">
            <img src="/resources/cardbacks/blue.svg" class="game-card" />
            <img src="/resources/cardbacks/blue.svg" class="game-card" />
        </div>
        <div class="row">
            <div class="col">
                <div class="game-container">
                    <div class="game-container-left">
                        <div class="player-name">leftPlayer.nameleftPlayer.nameleftPlayer.nameleftPlayer.name</div>
                        <div class="text-center player-chips">
                            <q-chip size="sm" icon="terrain">Landlord</q-chip>
                        </div>
                        <div class="container-cards-vertical game-card-outer-vertical game-card-outer-sm">
                            <img v-for="n in 20" :key="n" src="/resources/cardbacks/blue.svg" class="game-card" :style="{top: (n-1)*20 + 'px'}" /> 
                        </div>
                    </div>
                    <div class="game-container-right">
                        <div class="player-name">rightPlayer.name</div>
                        <div class="text-center player-chips">
                            <q-chip size="sm" icon="terrain">Landlord</q-chip>
                        </div>
                        <div class="container-cards-vertical game-card-outer-vertical game-card-outer-sm">
                            <img v-for="n in 2" :key="n" src="/resources/cardbacks/blue.svg" class="game-card" :style="{top: (n-1)*20 + 'px'}" /> 
                        </div>
                    </div>
                    <div class="game-container-bottom">
                        <div class="container-cards game-card-outer" :style="{width: 18*20+80 + 'px'}">
                            <img v-for="n in 17" :key="n" src="/resources/cards/clubs_ace.svg" class="game-card" :style="{left: (n-1)*20 + 'px'}" />
                            <img src="/resources/cards/hearts_ace.svg" class="game-card game-card-selected" :style="{left: (18-1)*20 + 'px'}" />
                        </div>
                        <div class="text-center text-weight-medium bottom-player-name">myPlayer.name <q-chip size="sm" icon="terrain">Landlord</q-chip></div>
                    </div>
                    <div class="game-container-middle">
                        <div class="card-pile">
                            <div class="container-cards game-card-outer" :style="{width: 18*20+80 + 'px'}">
                                <img v-for="n in 18" :key="n" src="/resources/cards/clubs_ace.svg" class="game-card" :style="{left: (n-1)*20 + 'px'}" /> 
                            </div>
                        </div>
                        <div class="landlord-card-pool">
                            <div v-show="false" class="container-cards game-card-outer game-card-outer-xs" :style="{width: 3*110-10 + 'px'}">
                                <img v-for="n in 3" :key="n" src="/resources/cards/clubs_ace.svg" class="game-card" :style="{left: (n-1)*110 + 'px'}" />
                            </div>
                            <div v-show="true" class="container-cards game-card-outer game-card-outer-xs" :style="{width: 3*110-10 + 'px'}">
                                <img v-for="n in 3" :key="n" src="/resources/cardbacks/blue.svg" class="game-card" :style="{left: (n-1)*110 + 'px'}" />
                            </div>
                        </div>
                        <div class="status left-status">
                            <div class="text" v-show="false">PASS</div>
                            <div class="text" v-show="true"><q-icon name="arrow_forward" /></div>
                        </div>
                        <div class="status right-status">
                            <div class="text" v-show="false">PASS</div>
                            <div class="text" v-show="true"><q-icon name="arrow_backward" /></div>
                        </div>
                        <div class="bottom-status">
                            <div v-show="false" class="normal-status">
                                <div class="text" v-show="true">PASS</div>
                                <div class="text" v-show="false"><q-icon name="arrow_upward" /></div>
                            </div>
                            <div v-show="true" class="player-actions">
                                <div class="action-btns-outer">
                                    <q-btn v-for="n in 4" :key="n" color="primary" :label="n-1" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
            </div>
            <div class="col-3 q-pa-lg">
                <div class="text-h6" style="height: 50px;">Console</div>
                <q-scroll-area class="console q-pa-md">
                    <div class="q-mb-sm" v-for="n in 100" :key="n">{{n}}</div>
                </q-scroll-area>
            </div>
        </div>
        -->
        <name-input />
    </q-page>
</template>

<script>
import NameInput from 'src/components/NameInput.vue'
import api from '../api'
import { frontendBasePath } from 'src/basePath'
export default {
    components: { NameInput },
    name: 'Index',
    data() {
        return {
            inputRoomURL: '',
            gameList: [
                { label: 'DouDiZhu', link: '/doudizhu', desc: 'Classic DouDiZhu card game, built with an elegant interface.' }
            ]
        }
    },
    methods: {
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
            api('/rooms/create').then(res => {
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
            })
        }
    }
}
</script>

<style>
.sm-input {
    max-width: 400px;
    min-width: 300px;
}
</style>