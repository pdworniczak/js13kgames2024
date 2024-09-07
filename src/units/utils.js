const TEAM_COLOR_MAP = Object.freeze({
    '1': 'rgb(56, 152, 255)',
    '2': 'rgb(255, 0, 67)',
    '3': 'rgb(75, 214, 72)',
    '4': 'rgb(226, 218, 63)'
})

export class Team {
    #id;
    #enemies;

    constructor(id, enemies) {
        this.#id = id;
        this.#enemies = enemies;
    }

    isHostile = (team) => {
        return this.#enemies.includes(team.id)
    }

    get id() {
        return this.#id;
    }

    get color() {
        return TEAM_COLOR_MAP[this.#id]
    }
}

export class Relation {
    units = [];
    distance = 9999;

    constructor(unit1, unit2) {
        this.units.push(unit1);
        this.units.push(unit2);
    }

    set distance(distance) {
        this.distance = distance;
    }

    toString = () => {
        return `${units[0]} =/= ${this.units[1]}`
    }
}