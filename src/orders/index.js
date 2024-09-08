export class MoveOrder {

    type = ORDER.MOVE;
    
    constructor(position) {
        this.position = position;
    }
}

export class AttackOrder {

    type = ORDER.ATTACK;
    
    constructor(unit) {
        this.unit = unit;
    }

    get position() {
        return this.unit.position;
    }
}

export const ORDER = Object.freeze({
    MOVE: "MOVE",
    ATTACK: "ATTACK"
})