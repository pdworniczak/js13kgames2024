export class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    isValid = () => {
        return this.x >= 0 && this.y >= 0;
    }

    rotate = (angle, centerPoint) => {
        const xC = this.x - centerPoint.x;
        const yC = this.y - centerPoint.y;

        const x = xC * Math.cos(angle) - yC * Math.sin(angle) + centerPoint.x;
        const y = yC * Math.cos(angle) + xC * Math.sin(angle) + centerPoint.y;

        return new Point(x, y)
    }

    distance = (point) => {
        return Math.hypot(this.x - point.x, this.y - point.y);
    }
}