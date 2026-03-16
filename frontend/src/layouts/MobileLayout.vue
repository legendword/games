<template>
    <q-layout view="hHh lpR fFf">

        <q-header bordered class="bg-white text-primary">
            <q-toolbar class="mobile-header">
                <q-toolbar-title>
                    <q-avatar>
                        <img src="https://cdn.quasar.dev/logo/svg/quasar-logo.svg">
                    </q-avatar>
                    <div class="title">User</div>
                </q-toolbar-title>
                <q-field borderless dense class="mobile-header-field bg-primary text-white">
                    <template v-slot:prepend>
                        <q-icon name="payments" color="white" />
                    </template>
                    <template v-slot:control>
                        <div class="self-center full-width no-outline text-white text-weight-medium mobile-header-field-value" tabindex="0">0</div>
                    </template>
                </q-field>
            </q-toolbar>
        </q-header>

        <q-page-container>
            <router-view />
        </q-page-container>

        <q-footer bordered class="bg-white text-primary" v-if="$route.meta.showTabs">
            <q-tabs no-caps active-color="primary" indicator-color="transparent" class="text-grey">
                <q-route-tab label="Home" class="mobile-tab" to="/" exact />
            </q-tabs>
        </q-footer>

    </q-layout>
</template>

<script>
export default {
    name: 'MobileLayout',
    data () {
        return {
        }
    }
}
</script>

<style lang="scss">
.mobile-header {
    min-height: 40px;
    height: 40px;
    line-height: 40px;

    .title {
        min-height: 40px;
        line-height: 40px;
        height: 40px;
        margin-left: 5px;
        display: inline;
    }
}
.mobile-header-field {
    height: 36px;
    min-height: 36px;
    margin: 2px 0;
    padding: 0 10px;
    border-radius: 2px;
}
.mobile-header-field * {
    height: 36px !important;
    min-height: 36px !important;
    line-height: 36px !important;
    padding-top: 0 !important;
    padding-bottom: 0 !important;
}
.mobile-header-field-value {
    min-width: 30px;
    text-align: right;
}
.mobile-tab {
    min-height: 40px;
    height: 40px;
}
</style>