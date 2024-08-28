export class Team {
    #id;
    #allies;
    #enemies;

    constructor(id, alies, enemies) {
        this.#id = id;
        this.#allies = alies;
        this.#enemies = enemies;
    }

    isHostile = (team) => {
        return this.#enemies.includes(team.id)
    }

    isAlly = (team) => {
        return this.#allies.includes(team.id);
    }

    get id() {
        return this.#id;
    }

    get color() {
        return TEAM_COLOR_MAP[this.#id]
    }
}

const TEAM_COLOR_MAP = Object.freeze({
    '1': 'rgb(56, 152, 255)',
    '2': 'rgb(255, 0, 67)',
    '3': 'rgb(75, 214, 72)',
    '4': 'rgb(226, 218, 63)'
})

