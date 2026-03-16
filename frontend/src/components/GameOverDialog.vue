<template>
    <q-dialog ref="dialog" @hide="onDialogHide">
        <q-card class="q-dialog-plugin">
            <q-card-section class="text-center">
                <div class="text-h6">Game Over</div>
                <div v-if="score != null" class="q-my-md text-h5">
                    <span class="text-weight-bold q-mr-md">Score:</span>
                    <span>{{ score }}</span>
                </div>
            </q-card-section>

            <q-card-section class="row justify-center">
                <q-btn class="q-mx-md" color="secondary" :label="cancelLabel" @click="onCancelClick" />
                <q-btn class="q-mx-md" color="primary" :label="OKLabel" @click="onOKClick" />
            </q-card-section>
        </q-card>
    </q-dialog>
</template>

<script>
export default {
    name: 'GameOverDialog',
    props: {
        score: Number,
        OKLabel: {
            type: String,
            default: "Play Again"
        },
        cancelLabel: {
            type: String,
            default: "Quit"
        }
    },
    methods: {
        show() {
            this.$refs.dialog.show();
        },
        hide() {
            this.$refs.dialog.hide();
        },
        onDialogHide() {
            this.$emit('hide');
        },
        onOKClick() {
            this.$emit('ok');
            this.hide();
        },
        onCancelClick() {
            this.hide();
        }
    }
}
</script>

<style>

</style>