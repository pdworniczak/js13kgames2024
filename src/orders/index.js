export class MoveOrder {
    
    constructor(position) {
        this.position = position;
    }
    
    get type() {
        return ORDER.MOVE;
    }
}

export const ORDER = Object.freeze({
    MOVE: "MOVE",
    ATTACK: "ATTACK"
})