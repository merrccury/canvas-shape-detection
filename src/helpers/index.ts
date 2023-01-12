import * as tflite from '@tensorflow/tfjs-tflite';


tflite.setWasmPath(
    'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-tflite@0.0.1-alpha.8/dist/'
);

export const loadModel = async (): Promise<tflite.TFLiteModel> => {
    const modelUrl = 'https://alekseichik-datasets.s3.eu-north-1.amazonaws.com/model.tflite'
    return await tflite.loadTFLiteModel(modelUrl, {
        enableProfiling: true,
    })

}
