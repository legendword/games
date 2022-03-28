<template>
    <q-page class="text-center">
        <div @keydown="keydown($event)">
            <div class="q-my-md text-h5">Wordle+</div>
            <div class="q-my-md text-subtitle2">Inspired by <a href="https://www.nytimes.com/games/wordle/index.html" target="_blank" rel="noreferrer noopener">Wordle</a>.</div>
            <div class="game-select" v-if="state === 0">
                <h4 class="q-pt-lg">Select Word Length</h4>
                <div class="q-my-xl">
                    <q-btn-toggle v-model="mode" toggle-color="primary" :options="modeOptions" size="lg" />
                </div>
                <q-btn color="primary" size="lg" @click="play">Play</q-btn>
            </div>
            <div v-else>
                <div class="game-view">
                    <div class="game-row" v-for="(row, i) in rows" :key="i">
                        <div :class="'game-cell ' + calcColor(val, j, row)" v-for="(val, j) in row" :key="j">{{ val }}</div>
                    </div>
                    <div class="game-row" v-if="rows.length < totalRows">
                        <div :class="'game-cell ' + (val ? 'entered' : 'empty')" v-for="(val, j) in value" :key="j">{{ val }}</div>
                        <div class="game-cell empty" v-for="j in (totalLetters - value.length)" :key="j+value.length"></div>
                    </div>
                    <div v-if="rows.length + 1 < totalRows">
                        <div class="game-row" v-for="i in (totalRows - rows.length - 1)" :key="i + rows.length + 1">
                            <div class="game-cell empty" v-for="j in totalLetters" :key="j"></div>
                        </div>
                    </div>
                </div>
                <div class="game-controls q-my-lg">
                    <div v-if="state === 2">
                        <div class="text-h5 q-my-md">Solution: {{ solution.join("").toUpperCase() }}</div>
                        <q-btn color="primary" size="lg" @click="init">New Game</q-btn>
                    </div>
                    <div v-else>
                        <div class="game-keyboard">
                            <div class="keyboard-row" v-for="(row, i) in keyboard" :key="i">
                                <div :class="'keyboard-cell ' + calcKeyboardColor(key)" v-for="key in row" :key="key" @click="keyboardPress(key)">{{ key }}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </q-page>
</template>

<script>
import words from "src/util/WordlePlus/words.json"
export default {
    name: 'WordlePlus',
    data() {
        return {
            state: 0,
            totalWordCount: 0,

            mode: "random",
            modeOptions: [
                { label: "Random", value: "random" },
                { label: "3", value: "3" },
                { label: "4", value: "4" },
                { label: "5", value: "5" },
                { label: "6", value: "6" },
                { label: "7", value: "7" }
            ],

            keyboard: [
                ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
                ['A', 'S', 'D', 'F', 'G', 'H', "J", 'K', 'L'],
                ['Enter', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'Backspace']
            ],
            keyInfo: {},

            wordLength: "5", // basically totalLetters in String type

            totalLetters: 5,
            totalRows: 6,
            rows: [],
            value: [],
            solution: []
        }
    },
    methods: {
        gameEnd(win) {
            this.state = 2;
            if (win === 1) {
                this.$q.notify({
                    message: "You won!",
                    color: "positive"
                });
            }
            else {
                this.$q.notify({
                    message: "You lost.",
                    color: "negative"
                });
            }
        },
        keyboardPress(key) {
            if (this.state !== 1) return;
            if (key === "Backspace") {
                this.value.pop();
            }
            else if (key === "Enter") {
                if (this.value.length !== this.totalLetters) return;
                if (!words[this.wordLength].includes(this.value.join(""))) {
                    this.$q.notify({
                        message: "Not a valid word!",
                        group: false
                    });
                    return;
                }

                let correct = true;
                for (let i in this.value) {
                    if (this.value[i] != this.solution[i]) {
                        correct = false;
                    }
                    let key = this.value[i].toUpperCase();
                    if (this.value[i] == this.solution[i]) {
                        this.keyInfo[key] = "correct";
                    }
                    else {
                        correct = false;
                        if (this.solution.includes(this.value[i])) {
                            if (!this.keyInfo[key]) this.keyInfo[key] = "included";
                        }
                        else {
                            this.keyInfo[key] = "incorrect";
                        }
                    }
                }

                this.rows.push([...this.value]);
                this.value = [];
                
                if (correct) this.gameEnd(1); // won
                else if (this.rows.length === this.totalRows) this.gameEnd(0); // lost
            }
            else if (key.length === 1) {
                if (this.value.length === this.totalLetters) return;
                this.value.push(key.toLowerCase());
            }
        },
        keydown(e) {
            if (this.state !== 1) return;
            if (e.metaKey || e.ctrlKey || e.altKey) return;
            if (e.keyCode >= 65 && e.keyCode <= 90) {
                let input = String.fromCharCode(e.keyCode);
                this.keyboardPress(input);
            }
            else if (e.keyCode == 8) {
                this.keyboardPress("Backspace");
            }
            else if (e.keyCode == 13) {
                this.keyboardPress("Enter");
            }
        },
        play() {
            let chosen = null;
            if (this.mode == "random") {
                let index = Math.floor(Math.random() * this.totalWordCount);
                for (let i in words) {
                    if (index >= words[i].length) {
                        index -= words[i].length;
                        continue;
                    }
                    chosen = words[i][index];
                }
            }
            else {
                let index = Math.floor(Math.random() * words[this.mode].length);
                chosen = words[this.mode][index];
            }
            this.solution = chosen.split("");
            this.totalLetters = this.solution.length;
            this.wordLength = this.totalLetters.toString();
            this.totalRows = 6 + Math.abs(this.totalLetters - 5); // TODO make changes to this if game is too hard
            this.state = 1;
        },
        init() {
            this.solution = [];
            this.totalRows = 6;
            this.totalLetters = 5;
            this.wordLength = "5";
            this.value = [];
            this.rows = [];
            this.keyInfo = {};

            this.state = 0;
        },
        calcColor(letter, pos, arr) {
            if (this.solution[pos] == letter) return "correct";
            let ind = this.solution.indexOf(letter, 0);
            while (ind !== -1) {
                if (arr[ind] !== letter) break;
                ind = this.solution.indexOf(letter, ind + 1);
            }
            if (ind !== -1) return "included";
            return "incorrect";
        },
        calcKeyboardColor(key) {
            if (key.length !== 1) return "special";
            return this.keyInfo[key] ?? "unknown";
        }
    },
    created() {
        this.totalWordCount = 0;
        for (let i in words) {
            console.log(i, words[i].length);
            this.totalWordCount += words[i].length;
        }
    },
    mounted() {
        window.addEventListener("keydown", this.keydown);
    },
    beforeDestroy() {
        window.removeEventListener("keydown", this.keydown);
    }
}
</script>

<style lang="scss">
.game-view {
    margin-left: auto;
    margin-right: auto;
    display: block;
    padding-top: 20px;

    .game-row {
        display: flex;
        justify-content: center;
        height: 62px;
        margin-bottom: 3px;

        .game-cell {
            margin-left: 3px;
            margin-right: 3px;
            width: 60px;
            height: 60px;
            line-height: 60px;
            font-weight: bolder;
            text-align: center;
            font-size: 24px;
            border: 1px solid grey;
            text-transform: uppercase;

            &.entered {
                border: 1px solid black;
            }
            &.correct {
                background-color: $positive;
                color: #fff;
            }
            &.incorrect {
                background-color: grey;
                color: #fff;
            }
            &.included {
                background-color: $warning;
                color: #fff;
            }
        }
    }
}
.game-keyboard {
    user-select: none;

    .keyboard-row {
        display: flex;
        justify-content: center;
        height: 52px;
        margin-bottom: 3px;

        .keyboard-cell {
            margin-left: 3px;
            margin-right: 3px;
            width: 40px;
            height: 50px;
            line-height: 50px;
            font-weight: bold;
            text-align: center;
            font-size: 22px;
            border: 1px solid grey;
            cursor: pointer;

            &.special {
                width: auto;
                padding: 0 8px;
                font-size: 18px;
            }
            &.correct {
                background-color: $positive;
                color: #fff;
            }
            &.incorrect {
                background-color: grey;
                color: #fff;
            }
            &.included {
                background-color: $warning;
                color: #fff;
            }
        }
    }
}
</style>