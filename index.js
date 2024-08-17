window.onload = () => {
    const game = new Game();

    initControllers(game);
    game.run(0);
}

const SCALE = 0.2;

class Game {
    objects = [
        new Infantry(100, 100)
    ]

    constructor() {
        const container = document.getElementById('game');
        this.container = container;
        this.context = container.getContext("2d");
        this.previousTimeStamp = 0;
        this.currentFrame = 0;
        this.currentTimeStamp = 0;
    }

    run = (currentTimeStamp) => {
        this.currentTimeStamp = currentTimeStamp;
        this.updateUi();
        this.draw();

        // console.log(currentTimeStamp, this.timePassed, this.currentFrame);


        this.previousTimeStamp = currentTimeStamp;
        this.currentFrame = window.requestAnimationFrame(this.run)
    }

    draw = () => {
        for (const gameObject of this.objects) {
            gameObject.draw(this.context, this.timePassed);
        }
    }

    updateUi = (currentTimeStamp) => {
        const frameRate = 1000/this.timePassed;

        document.getElementById('frameRate').innerHTML = frameRate.toFixed(0);

        for (const gameObject of this.objects) {
            document.getElementById('selected').innerHTML = '*';
            if (gameObject.state === OBJECT_STATE.SELECTED) {
                document.getElementById('selected').innerHTML = JSON.stringify(gameObject);
            }
        }
    }

    get timePassed() {
        return this.currentTimeStamp - this.previousTimeStamp;
    }

}

class Infantry {
    TYPE = OBJECT_TYPE.UNIT;
    SIZE = 60;
    SPEED = 142;

    state = OBJECT_STATE.NONE;
    orders = [];

    constructor(x, y, color) {
        this.position = new Position(x, y);
        this.COLOR = color ?? 'green';
    }


    draw = (context, timePassed) => {
        const { x, y } = this.position;
        
        context.fillStyle = OBJECT_STATE.SELECTED ? 'red' : this.COLOR;
        context.arc(x, y, SCALE * this.SIZE, 0, Math.PI * 2, true);
        context.stroke();
    }
}

const initControllers = (game) => {
    document.addEventListener('keydown', e => {
        const { currentFrame} = game;
    
        if (e.key === 'q') {
            window.cancelAnimationFrame(currentFrame);
            document.getElementById('frameRate').innerHTML = '-';
        }
    });

    document.addEventListener('mousedown', e => {
        const gameRect = game.container.getBoundingClientRect();
        const relX = e.clientX - gameRect.x; //mouse x relative to game container
        const relY = e.clientY - gameRect.y; //mouse y relative to game container

        console.log(e.buttons)

        const clickPosition = new Position(relX <= 800 && relX >= 0 ? relX : -1, relY <= 600 && relY >= 0 ? relY: -1);

        if (e.buttons === 1) {
            selectEvent(clickPosition)
        }

        if (e.buttons === 2) {
            actionEvent(clickPosition);
        }

        
    })

    const selectEvent = (clickPosition) => {   
        for (const gameObject of game.objects) {
            if (gameObject.TYPE === OBJECT_TYPE.UNIT) {
                const distansToObjectCenter = Math.sqrt(Math.pow(gameObject.position.x - clickPosition.x, 2) + Math.pow(gameObject.position.y - clickPosition.y, 2));
                const isObjectClicked = SCALE * gameObject.SIZE >= distansToObjectCenter;
                if (isObjectClicked) {
                    gameObject.state = OBJECT_STATE.SELECTED;
                }
            }
        }

        const selectedGameObject = game
            .objects
            .filter((gameObject) => gameObject.TYPE === OBJECT_TYPE.UNIT)
            .map((gameObject) => { gameObject.state = OBJECT_STATE.NONE; return gameObject })
            .find((gameObject) => {
                const distansToObjectCenter = Math.sqrt(Math.pow(gameObject.position.x - clickPosition.x, 2) + Math.pow(gameObject.position.y - clickPosition.y, 2));
                const isObjectClicked = SCALE * gameObject.SIZE >= distansToObjectCenter;
                if (isObjectClicked) {
                    gameObject.state = OBJECT_STATE.SELECTED;
                }

                return isObjectClicked;
            })
    }

    const actionEvent = () => {

    }
}


class Position {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

const ORDER = Object.freeze({
    MOVE: "MOVE",
    ATTACK: "ATTACK"
})

const OBJECT_TYPE = Object.freeze({
    UNIT: "UNIT",
})

const OBJECT_STATE = Object.freeze({
    NONE: "NONE",
    SELECTED: "SELECTED"
})


class MoveOrder {
    
    constructor(position) {
        this.position = position;
    }
    
    get type() {
        return ORDER.MOVE;
    }
}