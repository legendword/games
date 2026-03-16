import { tileColors, tileSize, tileMargin } from './constants'

class Tile {
    constructor(props) {
        this.x = props.x
        this.y = props.y
        this.n = props.n
        this.isNew = true
        this.isMerged = false
        this.destroyed = false
        this.calcProps()
    }

    calcProps() {
        this.ind = this.x*4 + this.y
        this.top = this.x * (tileSize + tileMargin) + 1.5 * tileMargin
        this.left = this.y * (tileSize + tileMargin) + 1.5 * tileMargin
        this.transform = "translate( "+this.left+"px , "+this.top+"px )"
        this.number = 2**this.n
        this.color = this.n>=tileColors.length?tileColors[0]:tileColors[this.n]
        this.fontColor = this.n==1?"#776E65":"#F9F6F2"
        this.fontSize = this.n<10?"3rem":((this.n<14)?"2.2rem":"1.8rem")
    }
}

export default Tile;