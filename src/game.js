import { Infantry, OBJECT_STATE } from "./objects";
import { Team } from "./subjects";

export class Game {
    team1 = new Team(1, [], [2]);
    team2 = new Team(2, [], [1]);

    objects = [
        new Infantry(400, 100, this.team2),
        new Infantry(450, 300, this.team2),
        new Infantry(550, 315, this.team2),
        new Infantry(120, 450, this.team1),
        new Infantry(170, 510, this.team1)
    ]

    constructor(canvasId) {
        const container = document.getElementById(canvasId);
        this.container = container;
        this.context = container.getContext("2d");
        this.previousTimeStamp = 0;
        this.currentFrame = 0;
        this.currentTimeStamp = 0;
    }

    run = (currentTimeStamp) => {
        this.currentTimeStamp = currentTimeStamp;
        this.updateUi();
        this.update();
        this.draw();

        this.previousTimeStamp = currentTimeStamp;
        this.currentFrame = window.requestAnimationFrame(this.run)
    }

    update = () => {
        for (const gameObject of this.objects) {
            gameObject.update(this);
        }
    }

    draw = () => {
        this.context.clearRect(0, 0, 800, 600);
        for (const gameObject of this.objects) {
            gameObject.draw(this);
        }
    }

    updateUi = (currentTimeStamp) => {
        const frameRate = 1000/this.timePassed;

        document.getElementById('frameRate').innerHTML = frameRate.toFixed(0);
        document.getElementById('selected').innerHTML = '*';

        for (const gameObject of this.objects) {
            if (gameObject.state === OBJECT_STATE.SELECTED) {
                document.getElementById('selected').innerHTML = JSON.stringify(gameObject);
            }
        }
    }

    get timePassed() {
        return this.currentTimeStamp - this.previousTimeStamp;
    }

}
