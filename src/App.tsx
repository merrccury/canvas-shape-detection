import {Button, Container, Grid} from '@mui/material'
import React, {useEffect, useState} from 'react'
import {ReactSketchCanvasRef} from "react-sketch-canvas/dist/ReactSketchCanvas";
import {Canvas} from "./Canvas";
import '@tensorflow/tfjs-backend-webgl';
import {predictShape, ShapeType} from "./predictor";
import {transformerToCanvas} from "./transformer";
import {convert, RectangleShape} from "./shapes";


function App() {

    const canvasRef = React.useRef<ReactSketchCanvasRef>(null);
    const onClearButtonClick = () => canvasRef.current?.clearCanvas();
    const onUndoButtonClick = () => canvasRef.current?.undo();

    const onRecognizeButtonClick = async () => {
        try {
            const file = await canvasRef.current?.exportSvg()
            if (file) {
                const shape = await transformerToCanvas(file);
                const prediction = await predictShape(shape);
                setShape(prediction);
            }
        } catch (e) {
            console.log({e})
        }
    };
    const [shape, setShape] = useState<undefined | ShapeType>();

    useEffect(() => {
        if (shape !== 'rectangle') return;
        const node = document.getElementById('react-sketch-canvas__stroke-group-0');
        if (!node) return;
        const lastElement = node.lastElementChild;
        if (!lastElement) return;

        //        <animate xlink:href="#react-sketch-canvas__0"
        //                  attributeName="d"
        //                  attributeType="XML"
        //                  to="M 60,34 H 272 V 268 H 60 V 34"
        //                  dur="1s"
        //                  fill="freeze"
        //                     repeatCount="indefinite" />
        // const newAnimate = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
        // newAnimate.setAttribute('xlink:href', '#react-sketch-canvas__0');
        // newAnimate.setAttribute('attributeName', 'd');
        // newAnimate.setAttribute('attributeType', 'XML');
        // newAnimate.setAttribute('to', convert(lastElement.getAttribute('d') || ''));
        // newAnimate.setAttribute('dur', '1s');
        // newAnimate.setAttribute('fill', 'freeze');
        // newAnimate.setAttribute('repeatCount', 'indefinite');
        // node.appendChild(newAnimate);

        // const newPath = document.createElement("path");
        const [xMin, xMax, yMin, yMax] = convert(lastElement.getAttribute('d') as string);

        const newPath = new RectangleShape(xMin, xMax, yMin, yMax);
        node.append(newPath.toPathElement());
    }, [shape])


    return (
        <div className='App'>
            <Container>
                <Grid container xs={12}>
                    <Grid item xs={12} display={'flex'} justifyContent={'space-between'}>
                        <Button variant="contained" onClick={onUndoButtonClick}>
                            Undo
                        </Button>
                        <Button variant="contained" onClick={onClearButtonClick}>
                            Clear
                        </Button>
                        <Button variant="contained" onClick={onRecognizeButtonClick}>
                            Recognize
                        </Button>
                    </Grid>
                    <Grid container
                          marginTop={'20px'}
                          alignItems="center"
                          flexDirection={'column'}
                          justifyContent="center"
                          item xs={12}>
                        <Canvas ref={canvasRef}/>
                        <p>{shape}</p>
                    </Grid>
                </Grid>
            </Container>
        </div>
    )
}

export default App
