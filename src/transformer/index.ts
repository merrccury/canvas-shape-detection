// @ts-ignore
import {makeBlobFromBase64, svgToPngBase64} from "svg-to-png-browser"; //function is async


const getResizedCanvasByBlobUri = async (pngUrl: string): Promise<HTMLCanvasElement> => {
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


export const transformerToCanvas = async (svg: string): Promise<HTMLCanvasElement> => {
    const base64Png = await svgToPngBase64(svg);
    const blobPng = await makeBlobFromBase64(base64Png);
    const blobPngUrl = URL.createObjectURL(blobPng);
    return  await getResizedCanvasByBlobUri(blobPngUrl);
}
