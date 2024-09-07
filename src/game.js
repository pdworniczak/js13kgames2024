import { Infantry, OBJECT_STATE } from "./units/index.js";
import { Relation, Team } from "./units/utils.js";

export class Game {
    team1 = new Team(1, [2]);
    team2 = new Team(2, [1]);

    units = [
        // new Infantry(400, 100, this.team2),
        new Infantry(550, 315, this.team2),
        new Infantry(450, 300, this.team1),
        // new Infantry(120, 450, this.team1),
        // new Infantry(170, 510, this.team1)
    ]

    relations = {}

    constructor(canvasId) {
        const container = document.getElementById(canvasId);
        this.container = container;
        this.context = container.getContext("2d");
        this.previousTimeStamp = 0;
        this.currentFrame = 0;
        this.currentTimeStamp = 0;
    }

    get timePassed() {
        return this.currentTimeStamp - this.previousTimeStamp;
    }

    run = (currentTimeStamp) => {
        this.previousTimeStamp = this.currentTimeStamp;
        this.currentTimeStamp = currentTimeStamp;
        this.updateUi();
        this.calculateUnitsRelations();
        this.update();
        this.draw();

        this.currentFrame = window.requestAnimationFrame(this.run)
    }

    update = () => {
        for (const gameObject of this.units) {
            gameObject.update(this);
        }
    }

    draw = () => {
        this.context.clearRect(0, 0, 800, 600);
        for (const gameObject of this.units) {
            gameObject.draw(this);
        }
    }

    updateUi = (currentTimeStamp) => {
        const frameRate = 1000/this.timePassed;

        document.getElementById('frameRate').innerHTML = frameRate.toFixed(0);
        document.getElementById('selected').innerHTML = '*';

        for (const gameObject of this.units) {
            if (gameObject.state === OBJECT_STATE.SELECTED) {
                document.getElementById('selected').innerHTML = `${JSON.stringify(gameObject)}`;
            }
        }
    }

    calculateUnitsRelations = () => {
        this.relations = {};
        for (const unit1 of this.units) {
            for (const unit2 of this.units) {
                if (unit1 !== unit2 && this.relations[`${unit1.id}::${unit2.id}`] === undefined) {
                    const relation = new Relation(unit1, unit2)
                    relation.distance = unit1.distanceTo(unit2.position);



                    this.relations[`${unit1.id}::${unit2.id}`] = relation;
                    this.relations[`${unit2.id}::${unit1.id}`] = relation;
                }
            }
        }
    }
}

