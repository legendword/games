<template>
    <q-page class="game-2048">
        <!-- <Modal modal={this.state.modal} />
        <div class="container">
            <p class="text-center arcade-game-toosmall">Sorry, your screen is too small to play this game.</p>
        </div>
        -->
        <div class="outer">
            <div class="title">
                <div class="text-center text-h4 row justify-between title-inner">
                    <div>
                        <q-btn color="primary" label="Restart" @click="init" />
                    </div>
                    <div>2048</div>
                    <div>
                        <q-btn disabled color="accent" label="Settings" />
                    </div>
                </div>
            </div>
            <div class="sidecol">
                <!-- remove q-mt-xl after High Score todo finished -->
                <div class="text-h5 q-mt-xl">Score</div>
                <div class="score">{{ score }}</div>
                <div class="text-h5 q-mt-md" v-show="false">High Score</div>
                <div class="score" v-show="false">TODO</div>
            </div>
            <div class="game" ref="main" :style="{
                width: (tileSize*4+tileMargin*6),
                height: (tileSize*4+tileMargin*6)
            }">
                <!--
                <div
                    v-for="(v, ind) in tiles"
                    :key="ind"
                    class="tile"
                    :class="{
                        'new': v.isNew,
                        'merged': v.isMerged
                    }"
                    :id="ind"
                    :style="{
                        width: (tileSize+1)+'px',
                        height: (tileSize+1)+'px',
                        transform: v.transform,
                        backgroundColor: v.color,
                        color: v.fontColor,
                        fontSize: v.fontSize
                    }"
                >
                    <div class="tile-inner" v-if="v.isMerged">{{ v.number }}</div>
                    <span v-else>{{ v.number }}</span>
                </div>
                -->
                <div
                    v-for="(v, ind) in backgroundTiles"
                    :key="ind"
                    class="tile-background"
                    :style="{
                        width: (tileSize+1)+'px',
                        height: (tileSize+1)+'px',
                        top: (tileMargin*1.5+(tileSize+tileMargin)*v[0])+'px',
                        left: (tileMargin*1.5+(tileSize+tileMargin)*v[1])+'px'
                    }"
                />
            </div>
        </div>
    </q-page>
</template>

<script>
import Tile from '../../util/2048/Tile';
import { tileSize, tileMargin } from '../../util/2048/constants'
import { v4 as uuidv4 } from 'uuid';

export default {
    name: "TwentyFortyEight",
    data() {
        return {
            tileSize,
            tileMargin,

            valid: [],
            validCount: 16,
            numbers: [],
            numToTile: [],
            isGameOver: false,

            score: 0,
            tiles: {},
            backgroundTiles: []
        }
    },
    methods: {
        removeAllTiles() {
            for (let i in this.tiles) {
                this.removeTile(i);
            }
        },
        removeTile(i) {
            let e = document.getElementById(i);
            if (e) e.remove();
        },
        renderTiles() {
            // * using manual manipulation of DOM instead of Vue v-for for proper animations
            let main = this.$refs.main;
            for (let i in this.tiles) {
                let v = this.tiles[i];
                let e = document.getElementById(i);
                if (!e) {
                    let div = document.createElement("div");
                    div.id = i;
                    div.className = "tile" + (v.isNew ? " new" : "") + (v.isMerged ? " merged" : "");
                    div.style.width = (tileSize+1) + "px";
                    div.style.height = (tileSize+1) + "px";
                    div.style.transform = v.transform;
                    div.style.backgroundColor = v.color;
                    div.style.color = v.fontColor;
                    div.style.fontSize = v.fontSize;
                    if (v.isMerged) {
                        let c = document.createElement("div");
                        div.appendChild(c);
                        c.className = "tile-inner";
                        c.innerHTML = v.number;
                    }
                    else {
                        div.innerHTML = v.number;
                    }
                    main.insertBefore(div, main.firstChild);
                }
                else {
                    e.className = "tile" + (v.isNew ? " new" : "") + (v.isMerged ? " merged" : "");
                    e.style.transform = v.transform;
                    e.style.backgroundColor = v.color;
                    e.style.color = v.fontColor;
                    e.style.fontSize = v.fontSize;
                    if (!v.isMerged) e.innerHTML = v.number;
                }
            }
        },
        generateTiles() {
            if (this.isGameOver) return;

            let howMany = Math.min(Math.random()>0.95?2:1, this.validCount);
            do {
                let ri = Math.floor(Math.random()*16);
                while (!this.valid[ri]) {
                    ri = Math.floor(Math.random()*16);
                }
                let rn = Math.random()>0.9?2:1;
                
                let uni = uuidv4();
                this.tiles[uni] = new Tile({x:parseInt(ri/4),y:ri%4,n:rn});
                this.valid[ri] = false;
                this.validCount--;
                this.numbers[ri] = rn;
                this.numToTile[ri] = uni;
                //console.log("+"+ri)
                howMany--;
            } while (howMany > 0 && this.validCount > 0);

            if (this.validCount === 0) {
                //check gameover
                let hasMerge = false;
                for (let i = 0; i < 16; i++) {
                    if (i % 4 != 3 && this.numbers[i] === this.numbers[i+1]) {
                        hasMerge = true;
                        break;
                    }
                    if (i < 12 && this.numbers[i] === this.numbers[i+4]) {
                        hasMerge = true;
                        break;
                    }
                }
                if (!hasMerge) {
                    setTimeout(this.gameOver, 1000);
                }
            }

            this.renderTiles();
        },
        init() {
            this.valid = new Array(16).fill(true);
            this.validCount = 16;
            this.numbers = new Array(16).fill(0);
            this.numToTile = new Array(16).fill(-1);
            this.isGameOver = false;

            //! load highscore
            /*
            let hs = this.props.highscore[this.props.gameCode]
            if (hs===null||(typeof hs)!=="number") {
                this.props.highscoreUpdate({gameCode:this.props.gameCode, score:0})
            }
            */

            //scale game to window size
            let tm = (window.innerWidth - 40)/(tileSize*4+tileMargin*6);
            let dm = (window.innerHeight - 60 - 60 - 40)/(tileSize*4+tileMargin*6);
            this.$refs.main.style.transform = "scale("+Math.min(tm,dm)+")";
            this.$refs.main.style.left = "calc( 50% - " + (Math.min(tm,dm)*(tileSize*4+tileMargin*5) / 2) + "px )";

            this.removeAllTiles();

            this.tiles = {};
            this.score = 0;

            this.generateTiles();
        },
        gameOver() {
            console.log('gameOver');
        },
        addScore(num) {
            this.score += 2 ** num;
        },
        move(dx, dy) {
            if (this.isGameOver) return;

            let tls = this.tiles;
            for (let i in tls) {
                if (tls[i].destroyed || tls[i].isMerged) {
                    this.removeTile(i);
                    delete tls[i];
                }
                else {
                    if (tls[i].isNew) tls[i].isNew = false;
                }
            }
            let moved = false;
            let mergedTiles = {};
            for (let i = 0; i < 4; i++) {
                for (let j = 0; j < 4; j++) {
                    let k = (dx>0?3-i:i)*4 + (dy>0?3-j:j);
                    if (this.numbers[k] !== 0) {
                        let lastOne = -1;
                        if (!dy) {
                            for (let m = k; m < 16 && m >= 0; m += dx*4) {
                                if (m === k) continue;
                                if (this.numbers[m] !== 0) {
                                    if (this.numbers[m] === this.numbers[k] && (!mergedTiles[m])) {
                                        //console.log("+"+m+" -"+k)
                                        this.numbers[m]++;
                                        this.numbers[k] = 0;

                                        let mgid = uuidv4();
                                        tls[mgid] = new Tile({x:tls[this.numToTile[m]].x,y:tls[this.numToTile[m]].y,n:tls[this.numToTile[m]].n+1});
                                        tls[mgid].isNew = false;
                                        tls[mgid].isMerged = true;

                                        tls[this.numToTile[m]].n++;
                                        tls[this.numToTile[m]].calcProps();

                                        tls[this.numToTile[k]].n++;
                                        tls[this.numToTile[k]].x = tls[this.numToTile[m]].x;
                                        tls[this.numToTile[k]].y = tls[this.numToTile[m]].y;
                                        tls[this.numToTile[k]].calcProps();

                                        tls[this.numToTile[k]].destroyed = true;
                                        this.numToTile[k] = -1;

                                        this.valid[k] = true;
                                        this.validCount++;

                                        lastOne = -1;

                                        moved = true;
                                        mergedTiles[m] = true;

                                        this.addScore(tls[this.numToTile[m]].n);
                                    }
                                    break
                                }
                                lastOne = m;
                            }
                        }
                        else {
                            for (let m = k; m >= parseInt(k/4) * 4 && m < parseInt(k/4+1) * 4; m += dy) {
                                if (m === k) continue;
                                if (this.numbers[m] !== 0) {
                                    if (this.numbers[m] === this.numbers[k] && (!mergedTiles[m])) {
                                        //console.log("+"+m+" -"+k)
                                        this.numbers[m]++;
                                        this.numbers[k] = 0;

                                        let mgid = uuidv4();
                                        tls[mgid] = new Tile({x:tls[this.numToTile[m]].x,y:tls[this.numToTile[m]].y,n:tls[this.numToTile[m]].n+1});
                                        tls[mgid].isNew = false;
                                        tls[mgid].isMerged = true;

                                        tls[this.numToTile[m]].n++;
                                        tls[this.numToTile[m]].calcProps();

                                        tls[this.numToTile[k]].n++;
                                        tls[this.numToTile[k]].x = tls[this.numToTile[m]].x;
                                        tls[this.numToTile[k]].y = tls[this.numToTile[m]].y;
                                        tls[this.numToTile[k]].calcProps();

                                        tls[this.numToTile[k]].destroyed = true;
                                        this.numToTile[k] = -1;

                                        this.valid[k] = true;
                                        this.validCount++;

                                        lastOne = -1;

                                        moved = true;
                                        mergedTiles[m] = true;

                                        this.addScore(tls[this.numToTile[m]].n);
                                    }
                                    break;
                                }
                                lastOne = m;
                            }
                        }
                        if (lastOne !== -1) {
                            //console.log(k+"-->"+lastOne)
                            this.numbers[lastOne] = this.numbers[k];
                            this.numbers[k] = 0;
                            this.numToTile[lastOne] = this.numToTile[k];
                            this.numToTile[k] = -1;

                            let nx = parseInt(lastOne/4);
                            let ny = lastOne%4;

                            tls[this.numToTile[lastOne]].x = nx;
                            tls[this.numToTile[lastOne]].y = ny;
                            tls[this.numToTile[lastOne]].calcProps();

                            this.valid[k] = true;
                            this.valid[lastOne] = false;

                            moved = true;
                        }
                    }
                }
            }
            
            this.tiles = tls;

            this.renderTiles();

            if (moved) this.generateTiles();
        },
        keydown(e) {
            switch (e.keyCode) {
                case 37:
                    this.move(0,-1);
                    break;
                case 39:
                    this.move(0,1);
                    break;
                case 38:
                    this.move(-1,0);
                    break;
                case 40:
                    this.move(1,0);
                    break;
                default:
                    break;
            }
        }
    },
    created() {
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                this.backgroundTiles.push([i,j]);
            }
        }
    },
    mounted() {
        this.init();
        document.body.style.overflow = 'hidden';
        window.addEventListener("keydown", this.keydown);
    },
    beforeDestroy() {
        document.body.style.overflow = 'auto';
        window.removeEventListener("keydown", this.keydown);
    }
};
</script>

<style lang="scss">
/* 2048 */
@keyframes pop {
    0% {
        transform: scale(0);
    }
    50% {
        transform: scale(1.1);
    }
    100% {
        transform: scale(1);
    }
}

@keyframes appear {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

.game-2048 {
    .tile.new {
        /* transition: none; */
        opacity: 0;
        animation: appear 200ms ease 100ms;
        animation-fill-mode: forwards;
    }

    .tile.merged .tile-inner {
        z-index: 4;
        width: 100%;
        height: 100%;
        background-color: inherit;
        border-radius: inherit;
        animation: pop 150ms ease 50ms;
        animation-fill-mode: backwards;
    }

    .tile {
        transition: transform 100ms ease-in-out, background-color 50ms ease 200ms,
            color 50ms ease 200ms;
        z-index: 3;
    }

    .tile,
    .tile-background {
        position: absolute;
        text-align: center;
        vertical-align: middle;
        line-height: 101px;
        -ms-user-select: none;
        -webkit-user-select: none;
        -moz-user-select: none;
        user-select: none;
        cursor: default;
        font-weight: 700;
        border-radius: 5px;
    }

    .tile-background {
        background-color: #cdc1b4;
        z-index: 2;
    }

    .score {
        font-size: 2.2rem;
    }

    .sidecol {
        position: absolute;
        left: max(3vw, 10px);
        top: calc((100vh - 80px) / 2 - (160px / 2));
        height: 12rem;
        width: 10rem;
    }

    .game {
        position: absolute;
        margin-top: 20px;
        transform-origin: top left;
        border-radius: 5px;
        background: #bbada0;
        z-index: 1;
    }

    .title {
        margin-top: 20px;
    }

    .title-inner {
        padding: 0 max(3vw, 10px);
        line-height: 38px;
        vertical-align: middle;
    }
}
</style>