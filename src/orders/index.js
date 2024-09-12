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

export const ORDER_COLOR = Object.freeze({
    MOVE: 'rgb(0 255 0 / 20%)',
    ATTACK: 'rgb(255 0 0 / 20%)',
})