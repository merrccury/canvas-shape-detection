import {Button, Container, Grid} from '@mui/material'
import React, {useEffect, useState} from 'react'
import {loadModel} from './helpers'
import {ReactSketchCanvasRef} from "react-sketch-canvas/dist/ReactSketchCanvas";
import {Canvas} from "./Canvas";
import * as tf from '@tensorflow/tfjs-core';
// @ts-ignore
import {svgToPngBase64, makeBlobFromBase64} from "svg-to-png-browser"; //function is async
import '@tensorflow/tfjs-backend-webgl';


export const convert = (path: string) => {
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
    return `M ${xMin},${yMin} H ${xMax} V ${yMax} H ${xMin} V ${yMin}`
}


function App() {

    const canvasRef = React.useRef<ReactSketchCanvasRef>(null);
    const classNames = {0: 'circle', 1: 'square', 2: 'triangle'}
    const onClearButtonClick = () => canvasRef.current?.clearCanvas();
    const onUndoButtonClick = () => canvasRef.current?.undo();
    const onRecognizeButtonClick = async () => {
        try {
            const tfliteModel = await loadModel();
            const file = await canvasRef.current?.exportSvg()
            if (file) {
                const base64Png = await svgToPngBase64(file);
                const blobPng = await makeBlobFromBase64(base64Png);
                const blobPngUrl = URL.createObjectURL(blobPng);

                const imageBitmap = await resize(blobPngUrl);
                // await navigator.clipboard.writeText(imageBitmap);

                imageBitmap.toBlob((blob) => {
                    if (!blob) return;
                    const blobUrl = URL.createObjectURL(blob);
                    console.log({blobUrl});
                })

                console.log(imageBitmap)
                const img = tf.browser.fromPixels(imageBitmap);
                const image_tensor = tf.expandDims(img, 0);

                let outputTensor = tfliteModel.predict(image_tensor) as tf.Tensor;
                const data = outputTensor.dataSync();
                const output = tf.softmax(data)
                const values: number[] = (await output.array()) as number[];
                const max_val_index = values.reduce((max_index, val, i, arr) =>
                    val > arr[max_index] ? i : max_index, 0
                );
                // @ts-ignore
                setShape(classNames[max_val_index]);
            }
        } catch (e) {
            console.log({e})
        }
    };
    const [shape, setShape] = useState('');

    useEffect(() => {
        if (shape !== 'square') return;
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
        const newAnimate = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
        newAnimate.setAttribute('xlink:href', '#react-sketch-canvas__0');
        newAnimate.setAttribute('attributeName', 'd');
        newAnimate.setAttribute('attributeType', 'XML');
        newAnimate.setAttribute('to', convert(lastElement.getAttribute('d') || ''));
        newAnimate.setAttribute('dur', '1s');
        newAnimate.setAttribute('fill', 'freeze');
        newAnimate.setAttribute('repeatCount', 'indefinite');
        node.appendChild(newAnimate);

        // const newPath = document.createElement("path");
        // newPath.setAttribute('d', convert(lastElement.getAttribute('d') as string));
        // newPath.setAttribute('fill', "none");
        // newPath.setAttribute('stroke-linecap', "round");
        // newPath.setAttribute('fill', "none");
        // newPath.setAttribute('stroke', "red");
        // newPath.setAttribute('stroke-width', "4");

        // console.log('newPath', newPath)
        // node.append(newPath);
    }, [shape])


    const resize = async (pngUrl: string): Promise<HTMLCanvasElement> => {
        return new Promise<HTMLCanvasElement>((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            canvas.height = 28;
            canvas.width = 28;

            const image = new Image();
            image.src = pngUrl;
            image.onload = async () => {
                const imageBitMap = await createImageBitmap(image);
                ctx.drawImage(imageBitMap, 0, 0, canvas.width, canvas.height);
                resolve(canvas);
            }
        });
    }

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
