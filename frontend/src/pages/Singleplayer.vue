<template>
    <q-page padding>
        <div class="text-center text-h4 q-mt-md">Singleplayer Games</div>
        <div class="game-list">
            <div v-for="game in gameList" :key="game.name" class="q-my-lg game-list-card row" flat>
                <div class="col-9 col-md-10 bg-primary text-white q-pa-md">
                    <div class="text-h5">{{ game.label }}</div>
                    <div>{{ game.desc }}</div>
                </div>
                <q-btn :to="game.link" class="col game-play-btn" label="Play" size="lg" color="accent" />
            </div>
        </div>
    </q-page>
</template>

<script>
import gameList from 'src/gameList'
export default {
    name: 'Singleplayer',
    data() {
        return {
            gameList: gameList.filter(v => v.mode == 'sp')
        }
    }
}
</script>

<style lang="scss">
.game-list {
    width: min( 80vw, 800px );
    margin: 40px auto;
}
.game-list-card {
    width: 100%;

    .game-play-btn {
        align-self: stretch;
    }
}
</style>