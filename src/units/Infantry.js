import { SCALE } from "../consts";
import { ORDER } from "../orders";
import { Point } from "../utils";
import { UNIT_STATE, UNIT_TYPE } from "./consts";

export class Infantry {
    static id = 0;

    TYPE = UNIT_TYPE.UNIT;
    LINE_WIDTH = 5;
    RADIUS = 70;
    SIZE = this.RADIUS + this.LINE_WIDTH * 2;
    SPEED = 154;
    TURN_SPEED = 2;

    state = UNIT_STATE.NONE;
    orders = [];
    direction = 0;

    constructor(x, y, team) {
        this.id = ++this.constructor.id;
        this.position = new Point(x, y);
        this.TEAM = team;
        this.COLOR = team.color;
    }

    get size() {
        return SCALE * this.SIZE;
    }

    get speed() {
        return SCALE * this.SPEED;
    }

    update = ({ relations, timePassed }) => {
        const order = this.orders[0];

        if (order) {
            if (order.type === ORDER.MOVE) {
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
        const destPos = this.orders[0].position;

        const distanceToDestination = this.distanceTo(destPos);
        const maximalDistanceForCurrentFrame = timePassed*(this.speed/1000);

        if (maximalDistanceForCurrentFrame >= distanceToDestination) {
                    
            if (!this.colision(relations, destPos)) {
                this.position = Object.assign({}, destPos);
                this.orders.pop();
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
            };
        }
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
        context.strokeStyle = this.COLOR;
        context.arc(x, y, SCALE * this.RADIUS, 0, Math.PI * 2, true);
        context.stroke();

        // weapon
        const startPoint = new Point(x + this.size, y).rotate(this.direction, this.position)
        const endPoint = new Point(x + this.size, y - 2 * 15).rotate(this.direction, this.position)

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
            context.strokeStyle = 'rgb(0 255 0 / 20%)';
            context.lineTo(order.position.x, order.position.y);
            context.stroke();
        }
    }

    colision = (relations, newPosition) => {
        const nearbyRelations = Object.entries(relations)
            .filter(([key, { distance, units }]) => {
                return key.startsWith(this.id) && distance < this.size + units[1].size + 10;
            })
            .map(([key, relation]) => relation)

        const colision = nearbyRelations.flatMap(relation => relation.units)
            .filter(unit => this !== unit)
            .some(unit => newPosition.distance(unit.position) < this.size + unit.size);

        console.log(nearbyRelations, colision);

        return colision
    }

    distanceTo = (destPos) => {
        return this.position.distance(destPos);
    }
}