<template>
    <q-page>
        <div class="row game-testing">
            <div v-if="pageMode === 'lobby'" class="col q-pa-lg">
                <div>Lobby</div>
                <q-btn @click="pageMode = 'game'" label="Game" color="primary" />
                <img src="/resources/chess/bb.png" width="100" height="100" />
            </div>
            <div v-show="pageMode === 'game'" class="col">
                <div class="board-container" ref="boardContainer">
                    <div class="board" ref="board">
                        <template v-for="row in board">
                            <div
                                v-for="tile in row.filter(v => v !== null)"
                                :key="tile.square"
                                :class="'piece piece-' + tile.color + tile.type"
                                :style="{
                                    width: tileSize + 'px',
                                    height: tileSize + 'px',
                                    ...calcPos(tile.square)
                                }"
                            >
                                <img :src="`/resources/chess/${tile.color}${tile.type}.png`" width="100" height="100" />
                            </div>
                        </template>
                        <template v-for="i in 8">
                            <div
                                v-for="j in 8"
                                :key="i + ',' + j"
                                class="background-tile"
                                :class="[(i+j)%2 === 0 ? 'white' : 'black']"
                                :style="{
                                    width: tileSize + 'px',
                                    height: tileSize + 'px',
                                    top: (i - 1) * tileSize + 'px',
                                    left: (j - 1) * tileSize + 'px'
                                }"
                            />
                        </template>
                    </div>
                </div>
            </div>
            <div class="console-container q-pa-sm">
                <div class="text-h6" style="height: 50px;">Console</div>
                <q-scroll-area class="console q-pa-md">
                    <div :class="'q-mb-sm' + (msg.color?' text-'+msg.color:'')" v-for="(msg, index) in messages" :key="index">{{msg.text}}</div>
                </q-scroll-area>
            </div>
        </div>
    </q-page>
</template>

<script>
import { tileSize } from '../util/chess/constants';
export default {
    name: 'Testing',
    data() {
        return {
            messages: [],
            pageMode: 'lobby',
            board: [
            [
                { square: 'a8', type: 'r', color: 'b' },
                { square: 'b8', type: 'n', color: 'b' },
                { square: 'c8', type: 'b', color: 'b' },
                { square: 'd8', type: 'q', color: 'b' },
                { square: 'e8', type: 'k', color: 'b' },
                { square: 'f8', type: 'b', color: 'b' },
                { square: 'g8', type: 'n', color: 'b' },
                { square: 'h8', type: 'r', color: 'b' }
            ],
            [
                { square: 'a7', type: 'p', color: 'b' },
                { square: 'b7', type: 'p', color: 'b' },
                { square: 'c7', type: 'p', color: 'b' },
                { square: 'd7', type: 'p', color: 'b' },
                { square: 'e7', type: 'p', color: 'b' },
                { square: 'f7', type: 'p', color: 'b' },
                { square: 'g7', type: 'p', color: 'b' },
                { square: 'h7', type: 'p', color: 'b' }
            ],
            [
                null, null, null,
                null, null, null,
                null, null
            ],
            [
                null, null, null,
                null, null, null,
                null, null
            ],
            [
                null, null, null,
                null, null, null,
                null, null
            ],
            [
                null, null, null,
                null, null, null,
                null, null
            ],
            [
                { square: 'a2', type: 'p', color: 'w' },
                { square: 'b2', type: 'p', color: 'w' },
                { square: 'c2', type: 'p', color: 'w' },
                { square: 'd2', type: 'p', color: 'w' },
                { square: 'e2', type: 'p', color: 'w' },
                { square: 'f2', type: 'p', color: 'w' },
                { square: 'g2', type: 'p', color: 'w' },
                { square: 'h2', type: 'p', color: 'w' }
            ],
            [
                { square: 'a1', type: 'r', color: 'w' },
                { square: 'b1', type: 'n', color: 'w' },
                { square: 'c1', type: 'b', color: 'w' },
                { square: 'd1', type: 'q', color: 'w' },
                { square: 'e1', type: 'k', color: 'w' },
                { square: 'f1', type: 'b', color: 'w' },
                { square: 'g1', type: 'n', color: 'w' },
                { square: 'h1', type: 'r', color: 'w' }
            ]],

            tileSize,
            calcPos: (x) => x, // ! removed
        }
    },
    mounted() {
        //scale game to window size
        let availHeight = window.innerHeight - 48 - 20, availWidth, availSize;
        let boardSize = tileSize*8;
        if (window.innerWidth <= 700) {
            availWidth = window.innerWidth - 20;
            availSize = Math.min(availHeight, availWidth);
            this.$refs.board.style.left = "calc( 50vw - " + (availSize / 2) + "px )";
        }
        else {
            availWidth = window.innerWidth - 20 - 220;
            availSize = Math.min(availHeight, availWidth);
            console.log(availHeight, availWidth, availSize, boardSize);
            this.$refs.board.style.left = "calc( (100vw - 220px) / 2 - " + (availSize / 2) + "px )";
        }
        this.$refs.board.style.top = "calc( (100vh - 48px) / 2 - " + (availSize / 2) + "px )";
        this.$refs.board.style.transform = "scale("+(availSize/boardSize)+")";
    }
}
</script>

<style lang="scss">
.game-testing {
    .board-container {
        width: 100%;
        height: 100%;
    }

    .board {
        position: relative;
        transform-origin: top left;
        border-radius: 5px;
        background: #bbada0;
        z-index: 1;
    }

    .console-container {
        width: 220px;
    }

    @media screen and (max-width: 700px) {
        .console-container {
            display: none;
        }
    }

    .background-tile {
        position: absolute;
        z-index: 2;

        &.white {
            background: #a6c3c5;
        }
        &.black {
            background: #568167;
        }
    }

    .piece {
        position: absolute;
        z-index: 10;
        cursor: pointer;

        img {
            width: 100%;
            height: 100%;
        }
    }
}
</style>