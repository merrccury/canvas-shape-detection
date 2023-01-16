interface IPoint {
    x: number;
    y: number;
}

class Point {
    constructor(point: IPoint) {
        this.point = point;
    }

    private readonly point: IPoint;

    toString(): string {
        return `${this.point.x},${this.point.y}`;
    }
}

type CoordinateTpe = 'M' | 'L' | 'C';

class Coordinate {
    constructor(type: CoordinateTpe, ...points: IPoint[]) {
        this.type = type;
        this.points = points.map(point => new Point(point));
    }

    private readonly type: CoordinateTpe;
    private readonly points: Point[];

    toString(): string {
        return `${this.type} ${this.points.map(point => point.toString()).join(' ')}`;
    }
}


export class Pen {
    constructor(public readonly color: string, public readonly strokeWidth: number) {
    }

    private coordinates: Coordinate[] = [];

    public moveTo(x: number, y: number) {
        this.coordinates.push(new Coordinate('M', {x, y}));
        return this;
    }

    public lineTo(x: number, y: number) {
        this.coordinates.push(new Coordinate('L', {x, y}));
        return this;
    }

    toString(): string {
        return this.coordinates.map(coordinate => coordinate.toString()).join(' ');
    }

}
