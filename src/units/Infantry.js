import { SCALE } from "../consts";
import { ORDER, ORDER_COLOR } from "../orders";
import { Point } from "../utils";
import { UNIT_ACTION, UNIT_STATE, UNIT_TYPE } from "./consts";

export class Infantry {
    static id = 0;

    TYPE = UNIT_TYPE.UNIT;
    LINE_WIDTH = 5;
    RADIUS = 70;
    SIZE = this.RADIUS + this.LINE_WIDTH * 2;
    SPEED = 154;
    TURN_SPEED = 2;

    weapon = new Sword();

    state = UNIT_STATE.NONE;
    action = UNIT_ACTION.STANDING;
    orders = [];
    animations = [];
    direction = 0;

    constructor(x, y, team) {
        this.id = ++this.constructor.id;
        this.position = new Point(x, y);
        this.team = team;
        this.color = team.color;
    }

    get size() {
        return SCALE * this.SIZE;
    }

    get speed() {
        return SCALE * this.SPEED;
    }

    update = ({ relations, timePassed }) => {
        const animation = this.animations[0];
        const order = this.orders[0];

        if (animation) {
            animation.timePassed += timePassed;
            console.log(animation.constructor.name);
            if (animation.isFinished()) {
                animation.pop();
                console.log("HIT");
            }
        } else if (order) {
            if (order.type === ORDER.MOVE) {
                const { x: posX, y: posY } = this.position;
                const { x: ordX, y: ordY } = order.position;
                const angle = Math.atan(Math.abs(posX-ordX)/Math.abs(posY-ordY));

                this.setDirection(angle, this.position, order.position);
                this.setNewPosition(angle, relations, timePassed);
                this.action = UNIT_ACTION.MOVING;
            }

            if (order.type === ORDER.ATTACK) {
                const { x: posX, y: posY } = this.position;
                const { x: ordX, y: ordY } = order.position;
                const angle = Math.atan(Math.abs(posX-ordX)/Math.abs(posY-ordY));

                this.setDirection(angle, this.position, order.position);
                this.setNewPosition(angle, relations, timePassed);
            }
        }
    }

    setNewPosition = (angle, relations, timePassed) => {
        const { x, y } = this.position;
        const order = this.orders[0];
        const destPos = order.position;

        const distanceToDestination = this.distanceTo(destPos);
        const maximalDistanceForCurrentFrame = timePassed*(this.speed/1000);

        if (maximalDistanceForCurrentFrame >= distanceToDestination) {
                    
            if (!this.colision(relations, destPos)) {
                this.position = Object.assign({}, destPos);
                this.orders.pop();
                this.action = UNIT_ACTION.STANDING;
                console.log(this);
            }
            
        } else {
            const newX = maximalDistanceForCurrentFrame * Math.sin(angle);
            const newY = maximalDistanceForCurrentFrame * Math.cos(angle);
            const newPosition = new Point(
                x > destPos.x ? x - newX : x + newX, 
                y > destPos.y ? y - newY : y + newY
            );
            
            if (!this.colision(relations, newPosition)) {
                this.position = newPosition;
            }
        }

        if (order.type === ORDER.ATTACK) {
            const units = this.getNearbyUnits(relations, this.weapon.range);

            if (units.includes(order.unit)) {
                this.action = UNIT_ACTION.ATTACKING;
                this.animations.push(new AttackAnimation(this.weapon, order.unit));
            }
        };
    }

    setDirection = (angle, startPosition, endPosition) => {
        this.direction = angle;

        if (endPosition.x>startPosition.x && endPosition.y>startPosition.y) {
            this.direction = Math.PI - angle;
        } else if (startPosition.x>endPosition.x && endPosition.y>startPosition.y) {
            this.direction = Math.PI + angle;
        } else if (startPosition.x>endPosition.x && startPosition.y>endPosition.y) {
            this.direction = 2*Math.PI - angle;
        }
    }

    draw = ({ context }) => {
        const { x, y } = this.position;
        
        context.beginPath();
        context.lineWidth = this.LINE_WIDTH;
        context.strokeStyle = this.color;
        context.arc(x, y, SCALE * this.RADIUS, 0, Math.PI * 2, true);
        context.stroke();

        // weapon
        const startPoint = new Point(x + this.size, y).rotate(this.direction, this.position)
        const endPoint = new Point(x + this.size, y - this.weapon.range).rotate(this.direction, this.position)

        context.beginPath();
        context.moveTo(startPoint.x, startPoint.y);
        context.strokeStyle = 'black';
        context.lineWidth = this.LINE_WIDTH;
        context.lineTo(endPoint.x, endPoint.y);
        context.stroke();
        // end front

        if (this.state === UNIT_STATE.SELECTED) {
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
            context.strokeStyle = ORDER_COLOR[order.type];
            context.lineTo(order.position.x, order.position.y);
            context.stroke();
        }
    }

    colision = (relations, newPosition) => {
        const nearbyUnits = this.getNearbyUnits(relations, 10);

        return nearbyUnits.some(unit => newPosition.distance(unit.position) < this.size + unit.size);
    }

    getNearbyUnits = (relations, expectedDistance) => {
        return Object.entries(relations)
        .filter(([key, { distance, units }]) => {
            return key.startsWith(this.id) && distance < this.size + units[1].size + expectedDistance;
        })
        .map(([key, relation]) => relation)
        .flatMap(relation => relation.units)
        .filter(unit => this !== unit)
    }

    distanceTo = (destPos) => {
        return this.position.distance(destPos);
    }
}
class Sword {
    SPEED = 2500;
    RANGE = 120;
    
    constructor() {
    }

    get range() {
        return SCALE * this.RANGE;
    }
}

class AttackAnimation {
    #weapon;
    #target;
    #timePassed;

    constructor(weapon, target, callback) {
        this.#weapon = weapon;
        this.#target = target;
        this.#timePassed = 0;
    }

    set timePassed(duration) {
        this.#timePassed += duration;
    }

    isFinished = () => {
        return this.#weapon.SPEED/1000 <= this.#timePassed;
    }

}