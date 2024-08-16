console.log('hello world');

const SCALE = 0.1;

window.onload = () => {
    const game = new Game();
    game.run(0);
}

class Game {
    gameObjects = [
        new Infantry(100, 100)
    ]

    constructor() {
        const gameContainer = document.getElementById('game');
        this.gameContainer = gameContainer;
        this.context = gameContainer.getContext("2d");
        this.frameRateElement = document.getElementById('frameRate');
        this.previousTimeStamp = 0;
        this.currentFrame = 0;
        this.currentTimeStamp = 0;

        document.addEventListener('keydown', e => {
            console.log(e.key, this.currentFrame)
    
            if (e.key === 'q') {
                window.cancelAnimationFrame(this.currentFrame);
                this.frameRateElement.innerHTML = '-';
            }
        });
    }

    run = (currentTimeStamp) => {
        this.currentTimeStamp = currentTimeStamp;
        this.updateUi();
        this.draw();

        console.log(currentTimeStamp, this.timePassed, this.currentFrame);


        this.previousTimeStamp = currentTimeStamp;
        this.currentFrame = window.requestAnimationFrame(this.run)
    }

    draw = () => {
        for (const gameObject of this.gameObjects) {
            gameObject.draw(this.context, this.timePassed);
        }
    }

    updateUi = (currentTimeStamp) => {
        const frameRate = 1000/this.timePassed;

        this.frameRateElement.innerHTML = frameRate.toFixed(0);
    }

    get timePassed() {
        return this.currentTimeStamp - this.previousTimeStamp;
    }

}

class Infantry {
    SIZE = 20;
    SPEED = 142;

    orders = [];

    constructor(x, y, color) {
        this.position = new Position(x, y);
        this.COLOR = color ?? 'green';
    }


    draw = (context, timePassed) => {
        const { x, y } = this.position;
        context.fillStyle = this.COLOR;
        context.arc(x, y, this.SIZE, 0, Math.PI * 2, true);
        context.stroke();
    }
}


class Position {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}