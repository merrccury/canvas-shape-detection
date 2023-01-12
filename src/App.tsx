import {Button, Container, Grid} from '@mui/material'
import React, {useState} from 'react'
import {loadModel} from './helpers'
import {ReactSketchCanvasRef} from "react-sketch-canvas/dist/ReactSketchCanvas";
import {Canvas} from "./Canvas";
import * as tf from '@tensorflow/tfjs-core';
// @ts-ignore
import {svgToPngBase64, makeBlobFromBase64} from "svg-to-png-browser"; //function is async
import '@tensorflow/tfjs-backend-webgl';



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
