<template>
    <q-dialog v-model="prompt" persistent>
        <q-card style="min-width: 350px;">
            <q-card-section>
                <div class="text-h6">Enter Your Name</div>
            </q-card-section>
            <q-card-section class="q-pt-none">
                <q-input dense v-model="username" maxlength="20" autofocus @keyup.enter="submitName" />
            </q-card-section>
            <q-card-actions align="right" class="text-primary">
                <q-btn flat label="Continue" @click="submitName" />
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>

<script>
export default {
    name: 'NameInput',
    data() {
        return {
            prompt: false,
            username: ''
        }
    },
    computed: {
        storedName() {
            return this.$store.state.user.name
        }
    },
    watch: {
        storedName: function(val) {
            if (!val) {
                this.prompt = true
            }
        }
    },
    methods: {
        submitName() {
            if (this.username.length == 0) return
            if (process.env.NODE_ENV == 'development') this.$q.sessionStorage.set('name', this.username)
            else this.$q.localStorage.set('name', this.username)
            this.$store.commit('setName', this.username)
            this.prompt = false
        }
    },
    created() {
        if (!this.storedName) {
            let savedName = process.env.NODE_ENV == 'development' ? this.$q.sessionStorage.getItem('name') : this.$q.localStorage.getItem('name')
            if (!savedName) this.prompt = true
            else this.$store.commit('setName', savedName)
        }
    }
}
</script>

<style>

</style>