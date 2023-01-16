import {IShape} from "./IShape";
import {Pen} from "./Pen";

export class RectangleShape implements IShape {
    constructor(
        private readonly xMin: number,
        private readonly xMax: number,
        private readonly yMin: number,
        private readonly yMax: number
    ) {
        this.pen = new Pen('red', 4);
        this.pen.moveTo(xMin, yMin);
        this.pen.lineTo(xMax, yMin);
        this.pen.lineTo(xMax, yMax);
        this.pen.lineTo(xMin, yMax);
        this.pen.lineTo(xMin, yMin);
    }

    private readonly pen: Pen

    toPath(): string {
        return this.pen.toString();
    }

    toPathElement(): SVGPathElement {
        const element = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        element.setAttribute('d', this.toPath());
        element.setAttribute('stroke-linecap', "round");
        element.setAttribute('fill', "none");
        element.setAttribute('stroke', this.pen.color);
        element.setAttribute('stroke-width', `${this.pen.strokeWidth}`);
        return element;
    }
}
