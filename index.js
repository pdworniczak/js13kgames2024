window.onload = () => {
    const game = new Game();

    initControllers(game);
    game.run(0);
}

const SCALE = 0.2;

class Game {
    objects = [
        new Infantry(100, 100),
        new Infantry(150, 300)
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
        this.update();
        this.draw();

        this.previousTimeStamp = currentTimeStamp;
        this.currentFrame = window.requestAnimationFrame(this.run)
    }

    update = () => {
        for (const gameObject of this.objects) {
            gameObject.update(this.timePassed);
        }
    }

    draw = () => {
        this.context.clearRect(0, 0, 800, 600);
        for (const gameObject of this.objects) {
            gameObject.draw(this.context, this.timePassed);
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

        const clickPosition = new Position(relX <= 800 && relX >= 0 ? relX : -1, relY <= 600 && relY >= 0 ? relY: -1);

        if (clickPosition.isValid()) {
            if (e.buttons === 1) {
                selectEvent(clickPosition)
            }
    
            if (e.buttons === 2) {
                actionEvent(clickPosition);
            }
        }
    })

    const selectEvent = (clickPosition) => {   
        // for (const gameObject of game.objects) {
        //     if (gameObject.TYPE === OBJECT_TYPE.UNIT) {
        //         const distansToObjectCenter = Math.sqrt(Math.pow(gameObject.position.x - clickPosition.x, 2) + Math.pow(gameObject.position.y - clickPosition.y, 2));
        //         const isObjectClicked = SCALE * gameObject.SIZE >= distansToObjectCenter;
        //         if (isObjectClicked) {
        //             gameObject.state = OBJECT_STATE.SELECTED;
        //         }
        //     }
        // }

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

    const actionEvent = (clickPosition) => {
        const selectedObjects = getSelectedObjects();

        for (const gameObject of selectedObjects) {
            gameObject.orders[0] = new MoveOrder(clickPosition);
        }
    }

    const getSelectedObjects = () => {
        return game.objects.filter(gameObject => gameObject.state === OBJECT_STATE.SELECTED);
    }
}


class Infantry {
    TYPE = OBJECT_TYPE.UNIT;
    SIZE = 60;
    SPEED = 80;

    state = OBJECT_STATE.NONE;
    orders = [];

    constructor(x, y, color) {
        this.position = new Position(x, y);
        this.COLOR = color ?? 'green';
    }

    update = (timePassed) => {
        const order = this.orders[0];

        if (order) {
            if (order.type === ORDER.MOVE) {
                const { x: x1, y: y1 } = this.position;
                const { x: x2, y: y2 } = order.position;
                const angle =  Math.atan(Math.abs(x1-x2)/Math.abs(y1-y2));
                const dist = Math.sqrt((x1 -x2) ** 2 + (y1 - y2) ** 2)
                const currentFrameDisctance = timePassed*(this.SPEED/1000);

                if (currentFrameDisctance >= dist) {
                    this.position = new Position(order.position.x, order.position.y);
                    this.orders.pop();
                    console.log(this);
                } else {
                    const newX = currentFrameDisctance * Math.sin(angle);
                    const newY = currentFrameDisctance * Math.cos(angle);

                    this.position = new Position(
                        x1 > x2 ? this.position.x - newX : this.position.x + newX, 
                        y1 > y2 ? this.position.y - newY : this.position.y + newY
                    );
                }
            }
        }
    }


    draw = (context, timePassed) => {
        const { x, y } = this.position;
        
        context.beginPath();
        context.strokeStyle = OBJECT_STATE.SELECTED ? 'red' : this.COLOR;
        context.arc(x, y, SCALE * this.SIZE, 0, Math.PI * 2, true);
        context.stroke();

        const order = this.orders[0];

        if (order) {
            context.beginPath();
            context.moveTo(this.position.x, this.position.y);
            context.strokeStyle = 'blue';
            context.lineTo(order.position.x, order.position.y);
            context.stroke();
        }
     }

    //  getDrawOrder = () => {
    //     const order = this.orders[0];
    //     return order !== undefined && [ORDER.MOVE, ORDER.ATTACK].includes(order.type) ?? order;
    //  }
}

class Position {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    isValid = () => {
        return this.x >= 0 && this.y >= 0;
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