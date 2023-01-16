import { RectangleShape } from "./RectangleShape";

export const convert = (path: string): Array<number> => {
    const coordinates = path.split('C');

    let xMax = 0, yMax = 0, xMin = Number.MAX_VALUE, yMin = Number.MAX_VALUE;

    for (let coordinate of coordinates) {
        const coordinateArray = coordinate.split(' ');
        let [x, y] = coordinateArray[1].split(',');
        if (!x || !y) {
            continue;
        }

        const X = parseInt(x.split('.')[0], 10);
        const Y = parseInt(y.split('.')[0], 10);
        xMax = Math.max(xMax, X);
        yMax = Math.max(yMax, Y);
        xMin = Math.min(xMin, X);
        yMin = Math.min(yMin, Y);

    }
    return [xMin, xMax, yMin, yMax];
}


export {
    RectangleShape
}
