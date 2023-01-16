import * as tf from "@tensorflow/tfjs-core";
import {loadModel} from "../helpers";

export type ShapeType = 'circle' | 'rectangle' | 'triangle';

export type ClassificationType = Record<number, ShapeType>;

const classNames: ClassificationType = {0: 'circle', 1: 'rectangle', 2: 'triangle'}


export const predictShape = async (canvasElement: HTMLCanvasElement) => {
    const tfliteModel = await loadModel();

    const img = tf.browser.fromPixels(canvasElement);
    const image_tensor = tf.expandDims(img, 0);

    let outputTensor = tfliteModel.predict(image_tensor) as tf.Tensor;
    const data = outputTensor.dataSync();
    const output = tf.softmax(data)
    const values: number[] = (await output.array()) as number[];
    const max_val_index: number  = values.reduce((max_index, val, i, arr) =>
        val > arr[max_index] ? i : max_index, 0
    );
    return classNames[max_val_index];
}
