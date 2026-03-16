<template>
    <q-layout view="hHh lpR fFf">

        <q-header elevated class="bg-dark">
            <div class="row no-wrap justify-between">
                <div class="row no-wrap">
                    <!--
                    <div class="cursor-pointer" style="line-height: 60px;" @click="backHome">
                        <q-avatar>
                            <img src="https://cdn.quasar.dev/logo/svg/quasar-logo.svg">
                        </q-avatar>
                        Legendword Games
                    </div>
                    -->
                    <div class="logo-container">
                        <img src="/logo.png" height="30" width="30" />
                    </div>
                    <q-tabs>
                        <q-route-tab to="/" exact label="Home" />
                        <q-route-tab to="/sp" exact label="Singleplayer" />
                        <q-route-tab to="/mp" exact label="Multiplayer" />
                    </q-tabs>
                </div>

                <div>
                    <q-btn dense flat round icon="bug_report" @click="sendDebug" />
                    <q-btn v-if="false" dense flat round icon="menu" @click="right = !right" />
                </div>
            </div>
        </q-header>

        <q-drawer v-model="right" side="right" behavior="desktop" bordered>
            <!-- drawer content -->
            <div class="text-h4">Drawer Content</div>
        </q-drawer>

        <q-page-container>
            <router-view />
        </q-page-container>

    </q-layout>
</template>

<script>
import api from 'src/api'
export default {
    data () {
        return {
            right: false
        }
    },
    methods: {
        backHome() {
            if (this.$route.path !== '/') {
                this.$router.push('/')
            }
        },
        sendDebug() {
            // return
            api(3002, '/debug')
        }
    },
    created() {
        let savedName = process.env.NODE_ENV == 'development' ? this.$q.sessionStorage.getItem('name') : this.$q.localStorage.getItem('name')
        if (savedName) {
            this.$store.commit('setName', savedName)
        }
    }
}
</script>

<style>
.logo-container {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0 20px;
}
</style>