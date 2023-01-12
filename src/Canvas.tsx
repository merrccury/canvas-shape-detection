import * as React from 'react';
import {ReactSketchCanvas} from 'react-sketch-canvas';
import {ReactSketchCanvasRef} from "react-sketch-canvas/dist/ReactSketchCanvas";

const styles = {
    border: '0.0625rem solid #9c9c9c',
    borderRadius: '0.25rem',
};

export interface ICanvasProps {
}


export const Canvas = React.forwardRef<ReactSketchCanvasRef, ICanvasProps>((props, ref) => {

    return (
        <ReactSketchCanvas
            canvasColor={'white'}
            ref={ref}
            style={styles}
            height={'300px'}
            width={'300px'}
            strokeWidth={4}
            strokeColor={'#000000'}
        />
    );
});
