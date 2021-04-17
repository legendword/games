<template>
    <q-page class="mobile-page">
        <div class="text-h6 mobile-game-list-title">Games</div>
        <div class="mobile-game-list">
            <div class="card-container" v-for="game in gameList" :key="game.link">
                <q-card class="bg-primary text-white card" @click="createRoom(game)">
                    <q-card-section>
                        <div class="text-h6">{{ game.label }}</div>
                        <div class="text-subtitle2">{{ game.desc }}</div>
                    </q-card-section>
                </q-card>
            </div>
        </div>
    </q-page>
</template>

<script>
import { ports } from 'src/basePath'
import api from '../api'
import gameList from 'src/gameList'
export default {
    name: 'MobileCreate',
    data() {
        return {
            gameList: gameList
        }
    },
    methods: {
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
    }
}
</script>

<style lang="scss">
.mobile-game-list-title {
    position: absolute;
    top: 5%;
    left: 5%;
    height: 10%;
    width: 90%;
}
.mobile-game-list {
    overflow-x: auto;
    overflow-y: hidden;
    position: absolute;
    top: 20%;
    left: 5%;
    height: 75%;
    width: 90%;
    display: flex;
    flex-wrap: nowrap;

    .card-container {
        width: 300px;
        height: 100%;
        padding: 20px;
        flex: 0 0 auto;

        .card {
            width: 100%;
            height: 100%;
        }
    }
}
</style>