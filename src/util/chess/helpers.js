import { tileSize } from './constants';

const colIds = ['a', 'b', 'c', 'd', 'e', 'f', 'g' ,'h'];
export const calcPos = (squareId) => {
    let row = 8 - parseInt(squareId[1]);
    let col = colIds.indexOf(squareId[0]);
    return {
        top: row * tileSize + 'px',
        left: col * tileSize + 'px'
    };
};
export const rcToSquare = (r, c) => {
    return colIds[c] + (8 - r);
};
