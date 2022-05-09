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
                <div class="col-6 col-md-3" v-for="game in gameList" :key="game.name">
                    <q-card class="mp-game-list-card q-ma-sm">
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

                        <q-space class="bg-primary" />

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
import gameList from 'src/gameList'
export default {
    name: 'Multiplayer',
    components: { NameInput },
    data() {
        return {
            inputRoomURL: '',
            gameList: gameList.filter(v => v.mode == 'mp'),
            gameStatus: {
                landlord: {
                    status: 'unknown',
                    playerCount: ''
                },
                chess: {
                    status: 'unknown',
                    playerCount: ''
                },
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
.mp-game-list-card {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}
</style>