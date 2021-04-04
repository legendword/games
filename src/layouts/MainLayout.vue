<template>
  <q-layout view="hHh lpR fFf">

    <q-header bordered class="bg-primary text-white">
      <q-toolbar>
        <q-toolbar-title class="cursor-pointer" @click="backHome">
          <!--
          <q-avatar>
            <img src="https://cdn.quasar.dev/logo/svg/quasar-logo.svg">
          </q-avatar>
          -->
          Legendword Games
        </q-toolbar-title>

        <q-btn v-show="false" dense flat round icon="bug_report" @click="sendDebug" />
        <q-btn v-show="false" dense flat round icon="menu" @click="right = !right" />
      </q-toolbar>
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
      return
      api(3000, '/debug').then(res => {
        console.log(res.data)
      })
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