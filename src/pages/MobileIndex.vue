<template>
    <q-page class="mobile-page">
        <div class="mobileindex-btn mobileindex-btn-create">
            <q-card flat class="card text-white bg-secondary" @click="cardLink('/create')">
                <q-card-section class="cardTitleSection">
                    <div class="cardTitle text-h5 text-weight-medium text-center">Create Room</div>
                </q-card-section>
            </q-card>
        </div>
        <div class="mobileindex-btn mobileindex-btn-join">
            <q-card flat class="card text-secondary bg-white">
                <q-card-section class="cardTitleSection">
                    <div class="cardTitle text-h5 text-weight-medium text-center">Join Room</div>
                </q-card-section>
            </q-card>
        </div>
        <div class="mobileindex-btn mobileindex-btn-shop">
            <q-card flat class="card text-secondary bg-white">
                <q-card-section class="cardTitleSection">
                    <div class="cardTitle text-h5 text-weight-medium text-center">Shop</div>
                </q-card-section>
            </q-card>
        </div>
    </q-page>
</template>

<script>
export default {
    name: 'MobileIndex',
    data() {
        return {}
    },
    methods: {
        cardLink(link) {
            this.$router.push(link)
        }
    }
}
</script>

<style lang="scss">
.mobileindex-btn {
    .card {
        height: 100%;
        width: 100%;
        border: 2px solid $secondary;
        
        .cardTitleSection {
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }
    }
}
.mobileindex-btn-create {
    position: absolute;
    top: 10%;
    height: 80%;
    width: 40%;
    left: 7.5%;
}
.mobileindex-btn-join {
    position: absolute;
    top: 10%;
    height: 35%;
    width: 40%;
    right: 7.5%;
}
.mobileindex-btn-shop {
    position: absolute;
    bottom: 10%;
    height: 35%;
    width: 40%;
    right: 7.5%;
}
</style>