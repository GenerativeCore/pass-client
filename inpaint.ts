import fs from 'fs';
import sharp, { Sharp } from 'sharp';
import { generativeCore, delay, fit } from './utils';
import { BASE_URL, AUTH } from './consts';

const paas = generativeCore({ baseUrl: BASE_URL, auth: AUTH });

(async () => {

    const file = fs.readFileSync('./for_inpaint.jpg');
    const image = await sharp(file);
    const { width, height } = await image.metadata();

    const request = {
        type: 'inpaint-on-image',
        isFast: false,
        payload: {
            image: file.toString('base64'),
            mask: fs.readFileSync('./mask_for_glasses.png').toString('base64'),
            inpaintMode: 'controlnet',
            checkpoint: 'epicrealism_naturalSinRC1VAE.safetensors',
            prompt: '((best quality)), ((masterpiece)), (detailed), 1girl, portrait, precise, head only, finely detail, depth of field, shine, highres, original, perfect lighting, colorful, centered, realistic face, photorealism, bodycon tank top, (aviators, tinted sunglasses, reflection), <lora:Prop_Sunglasses_v1:.6>',
            negativePrompt: '(deformed, distorted, disfigured:1.3), twisted arms and legs, overlapping fingers, ugly, elongated body, amputation, (watermark, signature), poorly drawn, bad anatomy, extra limb, missing limb, floating limbs, (mutated hands and fingers:1.4), disconnected limbs, mutation, mutated, ugly, blurry, body out of frame, (worst quality, bad quality, child, cropped:1.4) ((monochrome)), ((grayscale)), <hypernet:BadArtist:1>, <hypernet:BadHandsV4:1>, <hypernet:BadHandsV5:1>, <hypernet:BadImage:1>, <hypernet:BadQuality:1>,  EasyNegative,  VeryBadImage',
            loras: [
                {
                    modelName: 'Prop_Sunglasses_v1.safetensors',
                    weight: .6
                }
            ],
            denoisingStrength: .95,
            width,
            height,
            steps: 35
        }
    };

    // for debugging purposes
    fs.writeFileSync('payloads/inpaint-on-image.json', JSON.stringify(request, null, '\t'));

    try {
        const id = await paas.createTask(request);
        console.log('task created', id);
        let task;
        let attempts = 0;
        do {
            await delay(1000);
            task = await await paas.checkTask(id);
            console.log(attempts, task.status);
            if (attempts++ > 200) {
                throw new Error('Timeout');
            }
        } while (task.status === 'pending' || task.status === 'processing');
        if (task.status === 'completed') {
            console.log(task);
            const [image] = task.results.data.images;
            let buffer = Buffer.from(image.base64, 'base64');
            fs.writeFileSync(`images/inpaint_on_image${id}.png`, buffer);
        } else {
            console.log('task failed', task);
        }
    } catch (e: any) {
        console.log(e.response.data);
    } finally {
        process.exit(0);
    }

})();
