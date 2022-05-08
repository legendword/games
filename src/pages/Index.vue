<template>
    <q-page>
        <section class="main-section text-center">
            <div class="text-h1 floating-text">Legendword Games</div>
            <div class="text-h4 q-mt-lg main-subtitle">Minigames to be played anywhere.</div>
            <div class="q-mt-xl">
                <q-btn to="/sp" class="q-mx-md float-on-hover" color="primary" size="lg" push>Play Singleplayer</q-btn>
                <q-btn to="/mp" class="q-mx-md float-on-hover" color="primary" size="lg" push>Play Multiplayer</q-btn>
            </div>
        </section>
        <div class="main-footer">v{{ version }} | Created by <a href="https://legendword.com/" class="link">Legendword</a> | <a href="https://github.com/legendword/games" class="link">Star this repo on GitHub</a></div>
    </q-page>
</template>

<script>
import version from "../version";

export default {
    name: 'Index',
    data() {
        return {
            version: version
        }
    }
}
</script>

<style lang="scss">
.main-section {
    width: 100%;
    height: calc( 100vh - 80px );
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}
.main-subtitle {
    opacity: 0.8;
}
.main-footer {
    text-align: center;
    opacity: 0.4;
    height: 20px;
    line-height: 20px;
}
</style>