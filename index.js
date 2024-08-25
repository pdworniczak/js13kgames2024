window.onload = () => {
    const game = new Game();

    initControllers(game);
    game.run(0);
}

const SCALE = 0.2;

class Game {
    team1 = new Team(1, [], [2]);
    team2 = new Team(2, [], [1]);

    objects = [
        new Infantry(400, 100, this.team2),
        new Infantry(450, 300, this.team2),
        new Infantry(550, 315, this.team2),
        new Infantry(120, 450, this.team1),
        new Infantry(170, 510, this.team1)
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
    LINE_WIDTH = 5;
    RADIUS = 70;
    SIZE = this.RADIUS + this.LINE_WIDTH * 2;
    SPEED = 154;

    state = OBJECT_STATE.NONE;
    orders = [];

    constructor(x, y, team) {
        this.position = new Position(x, y);
        this.TEAM = team;
        this.COLOR = COLOR_MAP[team.id];
    }

    get size() {
        return SCALE * this.SIZE;
    }

    get speed() {
        return SCALE * this.SPEED;
    }

    update = ({ objects, timePassed }) => {
        const order = this.orders[0];

        if (order) {
            if (order.type === ORDER.MOVE) {
                const { x: x1, y: y1 } = this.position;
                const { x: x2, y: y2 } = order.position;
                const angle =  Math.atan(Math.abs(x1-x2)/Math.abs(y1-y2));
                const distanceToDestination = Math.hypot(x1-x2, y1-y2);
                const maximalDistanceForCurrentFrame = timePassed*(this.speed/1000);

                if (maximalDistanceForCurrentFrame >= distanceToDestination) {
                    
                    if (!this.colision(order.position, objects)) {
                        this.position = new Position(order.position.x, order.position.y);
                        this.orders.pop();
                        console.log(this);
                    }
                    
                } else {
                    const x = maximalDistanceForCurrentFrame * Math.sin(angle);
                    const y = maximalDistanceForCurrentFrame * Math.cos(angle);
                    const newPosition = new Position(
                        x1 > x2 ? this.position.x - x : this.position.x + x, 
                        y1 > y2 ? this.position.y - y : this.position.y + y
                    );
                    
                    if (!this.colision(newPosition, objects)) {
                        this.position = newPosition;
                    };
                }
            }
        }
    }


    draw = ({ context, objects }) => {
        const { x, y } = this.position;
        
        context.beginPath();
        context.lineWidth = this.LINE_WIDTH;
        context.strokeStyle = this.COLOR;
        context.arc(x, y, SCALE * this.RADIUS, 0, Math.PI * 2, true);
        context.stroke();

        if (this.state === OBJECT_STATE.SELECTED) {
            context.beginPath();
            context.fillStyle = 'rgb(0 255 0/ 50%)'
            context.arc(x, y, SCALE * (this.RADIUS + this.LINE_WIDTH), 0, Math.PI * 2, true);
            context.fill();
        }

        const order = this.orders[0];

        if (order) {
            context.beginPath();
            context.moveTo(this.position.x, this.position.y);
            context.lineWidth = 2;
            context.strokeStyle = 'rgb(0 255 0 / 20%)';
            context.lineTo(order.position.x, order.position.y);
            context.stroke();
        }
     }

     colision = (position, objects) => {

        for (const gameObject of objects) {
            if (this !== gameObject) {
                if (Math.hypot(position.x-gameObject.position.x, position.y - gameObject.position.y) < this.size + gameObject.size) {
                    return true;
                }
            }
        }
        return false;
     }
}

class Team {
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

const COLOR_MAP = Object.freeze({
    '1': 'rgb(56, 152, 255)',
    '2': 'rgb(255, 0, 67)',
    '3': 'rgb(75, 214, 72)',
    '4': 'rgb(226, 218, 63)'
})