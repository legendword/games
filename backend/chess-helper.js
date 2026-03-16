

// ! NOT FINISHED and NOT USED; using Chess.js instead






const initialChessBoard = [
    ['WR', 'WN', 'WB', 'WQ', 'WK', 'WB', 'WN', 'WR'],
    ['WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP'],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    ['BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP'],
    ['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR']
];
// ? is this needed?
const initialChessPieces = {
    'WR': [{row: 0, col: 0, alive: true}, {row: 0, col: 7, alive: true}],
    'WN': [{row: 0, col: 1, alive: true}, {row: 0, col: 6, alive: true}],
    'WB': [{row: 0, col: 2, alive: true}, {row: 0, col: 5, alive: true}],
    'WQ': [{row: 0, col: 3, alive: true}],
    'WK': [{row: 0, col: 4, alive: true}],
    'WP': [{row: 1, col: 0, alive: true}, {row: 1, col: 1, alive: true}, {row: 1, col: 2, alive: true}, {row: 1, col: 3, alive: true}, {row: 1, col: 4, alive: true}, {row: 1, col: 5, alive: true}, {row: 1, col: 6, alive: true}, {row: 1, col: 7, alive: true}],
    'BR': [{row: 7, col: 0, alive: true}, {row: 7, col: 7, alive: true}],
    'BN': [{row: 7, col: 1, alive: true}, {row: 7, col: 6, alive: true}],
    'BB': [{row: 7, col: 2, alive: true}, {row: 7, col: 5, alive: true}],
    'BQ': [{row: 7, col: 3, alive: true}],
    'BK': [{row: 7, col: 4, alive: true}],
    'BP': [{row: 6, col: 0, alive: true}, {row: 6, col: 1, alive: true}, {row: 6, col: 2, alive: true}, {row: 6, col: 3, alive: true}, {row: 6, col: 4, alive: true}, {row: 6, col: 5, alive: true}, {row: 6, col: 6, alive: true}, {row: 6, col: 7, alive: true}]
};
class Board {
    board;
    pieces;
    moved;
    constructor() {
        this.board = initialChessBoard;
        this.pieces = initialChessPieces;
        this.moved = [
            [false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false],
            [true, true, true, true, true, true, true, true],
            [true, true, true, true, true, true, true, true],
            [true, true, true, true, true, true, true, true],
            [true, true, true, true, true, true, true, true],
            [false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false],
        ]
    }

    withinBounds(row, col) {
        return row >= 0 && row < 8 && col >= 0 && col < 8;
    }

    getPieceId(row, col) {
        if (!withinBounds(row, col)) return null;
        let id = this.board[row][col];
        return id;
    }

    generateValidSquares(row, col) {
        // for checkmate checking
        let id = this.getPieceId(row, col);
        if (id === null) return [];
        let side = id[0];
        let oppositeSide = side === 'W' ? 'B' : 'W';
        let res = [[row, col]];
        switch (id[1]) {
            case 'K':
                // ? when checking for checkmate we allow opponent's K to move to a position where they are in check if they can take the K
                return [[-1,-1], [-1,0], [-1,1], [0,-1], [0,1], [1,-1], [1,0], [1,1]].filter(v => {
                    let r = row + v[0], c = col + v[1];
                    return this.withinBounds(r, c) && (this.board[r][c] === null || this.board[r][c][0] === oppositeSide);
                });
            case 'Q':
                for (let d of [[-1,-1], [-1,0], [-1,1], [0,-1], [0,1], [1,-1], [1,0], [1,1]]) {
                    let r = row, c = col;
                    while (true) {
                        r += d[0];
                        c += d[1];
                        if (!this.withinBounds(r, c)) break;
                        if (this.board[r][c] === null) res.push([r, c]);
                        else {
                            if (this.board[r][c] === oppositeSide) res.push([r, c]);
                            break;
                        }
                    }
                }
                return res;
            case 'B':
                for (let d of [[-1,-1], [-1,1], [1,-1], [1,1]]) {
                    let r = row, c = col;
                    while (true) {
                        r += d[0];
                        c += d[1];
                        if (!this.withinBounds(r, c)) break;
                        if (this.board[r][c] === null) res.push([r, c]);
                        else {
                            if (this.board[r][c] === oppositeSide) res.push([r, c]);
                            break;
                        }
                    }
                }
                return res;
            case 'N':
                for (let d of [[-1,-2], [-1,2], [-2,-1], [-2,1], [1,-2], [1,2], [2,-1], [2,1]]) {
                    let r = row + d[0], c = col + d[1];
                    if (this.withinBounds(r, c) && (this.board[r][c] === null || this.board[r][c] === oppositeSide)) res.push([r, c]);
                }
                return res;
                if (!((dx === 1 && dy === 2) || (dx === 2 && dy === 1))) return false;
                break;
            case 'R':
                if (!(row === destRow || col === destCol)) return false;
                if (!this.hasClearPath(row, col, destRow, destCol)) return false;
                break;
            case 'P':
        }
    }

    generateValidSquaresForSide(side) {
        let oppositeSide = side === 'W' ? 'B' : 'W';
        for (let r = 0; r < 7; r++) {
            for (let c = 0; c < 7; c++) {
                let id = this.board[r][c];
                if (id !== null && id[0] === oppositeSide) {

                }
            }
        }
    }

    castle(row, col, destCol) {
        let kingId = this.board[row][col], rookId = this.board[row][destCol];
        let kingCol = col + (destCol > col ? 2 : -2);
        let rookCol = kingCol + (destCol > col ? -1 : 1);

        this.board[row][kingCol] = kingId;
        this.board[row][rookCol] = rookId;
        this.board[row][col] = null;
        this.board[row][destCol] = null;

        this.moved[row][kingCol] = true;
        this.moved[row][rookCol] = true;
        this.moved[row][col] = true;
        this.moved[row][destCol] = true;
    }

    hasClearPath(row, col, destRow, destCol) {
        let rowStep = destRow === row ? 0 : (destRow > row ? 1 : -1);
        let colStep = destCol === col ? 0 : (destCol > col ? 1 : -1);
        let r = row, c = col;
        while (true) {
            r += rowStep;
            c += colStep;
            if (r === destRow && c === destCol) break;
            if (this.board[r][c] !== null) return false;
        }
        return true;
    }

    move(row, col, destRow, destCol) {
        if (!withinBounds(row, col) || !withinBounds(destRow, destCol)) return false;
        if (row === destRow && col === destCol) return false;
        let id = this.board[row][col];
        if (id === null) return false;
        let destId = this.getPieceId(destRow, destCol);
        if (destId !== null && destId[0] === id[0] && id[1] !== 'K') return false; // same side piece, and it's not a castle
        let dx = Math.abs(destRow - row), dy = Math.abs(destCol - col);
        switch (id[1]) {
            case 'K':
                if (!(dx <= 1 && dy <= 1)) {
                    if (row === destRow && destId !== null && destId[0] === id[0] && destId[1] === 'R' && !this.moved[row][col] && !this.moved[destRow][destCol] && this.hasClearPath(row, col, destRow, destCol)) {
                        // ! TODO: king will be in check position
                        this.castle(row, col, destRow, destCol);
                        return true;
                    }
                    return false;
                }
                // ! TODO: king is in check situation
                break;
            case 'Q':
                if (!(row === destRow || col === destCol || dx === dy)) return false;
                if (!this.hasClearPath(row, col, destRow, destCol)) return false;
                break;
            case 'B':
                if (!(dx === dy)) return false;
                if (!this.hasClearPath(row, col, destRow, destCol)) return false;
                break;
            case 'N':
                if (!((dx === 1 && dy === 2) || (dx === 2 && dy === 1))) return false;
                break;
            case 'R':
                if (!(row === destRow || col === destCol)) return false;
                if (!this.hasClearPath(row, col, destRow, destCol)) return false;
                break;
            case 'P':
                if (!((id[0] === 'W' && row < destRow) || (id[0] === 'B' && row > destRow))) return false; // must move forward
                if (col !== destCol) {
                    // pawn takes
                    if (destId === null) return false;
                    if (!(dy === 1 && dx === 1)) return false; // can only take adjacent
                }
                else if (!this.moved[row][col]) {
                    // pawn has not moved yet; can move 2 squares
                    if (destId !== null) return false; // pawn does not take where it moves
                    if (dx > 2) return false;
                    if (!this.hasClearPath(row, col, destRow, destCol)) return false;
                    
                }
                else {
                    if (destId !== null) return false;
                    if (dx > 1) return false;
                }
                // ! TODO: promotion
                // ! TODO: en passant
                break;
            default:
                return false;
        }
        this.board[row][col] = null;
        this.board[destRow][destCol] = id;
        this.moved[row][col] = true;
        this.moved[destRow][destCol] = true;
        return true;
    }
}