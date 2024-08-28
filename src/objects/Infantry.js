import { SCALE } from "../consts";
import { ORDER } from "../orders";
import { Point } from "../subjects";
import { OBJECT_STATE, OBJECT_TYPE } from "./consts";

export class Infantry {
    TYPE = OBJECT_TYPE.UNIT;
    LINE_WIDTH = 5;
    RADIUS = 70;
    SIZE = this.RADIUS + this.LINE_WIDTH * 2;
    SPEED = 154;
    TURN_SPEED = 2;

    state = OBJECT_STATE.NONE;
    orders = [];
    direction = 0;

    constructor(x, y, team) {
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

    update = ({ objects, timePassed }) => {
        const order = this.orders[0];

        if (order) {
            if (order.type === ORDER.MOVE) {
                const { x: x1, y: y1 } = this.position;
                const { x: x2, y: y2 } = order.position;
                const angle = Math.atan(Math.abs(x1-x2)/Math.abs(y1-y2));
                const distanceToDestination = Math.hypot(x1-x2, y1-y2);
                const maximalDistanceForCurrentFrame = timePassed*(this.speed/1000);

                this.direction = angle;

                if (x2>x1 && y2>y1) {
                    this.direction = Math.PI - angle;
                } else if (x1>x2 && y2>y1) {
                    this.direction = Math.PI + angle;
                } else if (x1>x2 && y1>y2) {
                    this.direction = 2*Math.PI - angle;
                }

                if (maximalDistanceForCurrentFrame >= distanceToDestination) {
                    
                    if (!this.colision(order.position, objects)) {
                        this.position = new Point(order.position.x, order.position.y);
                        this.orders.pop();
                        console.log(this);
                    }
                    
                } else {
                    const x = maximalDistanceForCurrentFrame * Math.sin(angle);
                    const y = maximalDistanceForCurrentFrame * Math.cos(angle);
                    const newPosition = new Point(
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

        // front
        const startPoint = new Point(x + this.size, y).rotate(this.direction, this.position)
        const endPoint = new Point(x + this.size, y - 2 * 15).rotate(this.direction, this.position)

        context.beginPath();
        context.moveTo(startPoint.x, startPoint.y);
        context.strokeStyle = 'black';
        context.lineWidth = this.LINE_WIDTH;
        context.lineTo(endPoint.x, endPoint.y);
        context.stroke();
        // end front

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