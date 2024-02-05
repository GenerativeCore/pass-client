import fs from 'fs';
import sharp, { Sharp } from 'sharp';
import { generativeCore, delay, fit } from './utils';
import { BASE_URL, AUTH } from './consts';

const MAX_WIDTH = 1024;
const MAX_HEIGHT = 1024;

const paas = generativeCore({ baseUrl: BASE_URL, auth: AUTH });

const file = fs.readFileSync('./for_undress2.jpg');

(async () => {
    const image = await fit(await sharp(file), {
        maxWidth: MAX_WIDTH,
        maxHeight: MAX_HEIGHT
    });

    const png = await image.png().toBuffer();
    const { width, height } = await sharp(png).metadata();

    const preview = false;

    const request = {
        type: 'undress',
        isFast: true, // VIP queue
        payload: {
            baseModel: 'SD 1.5',
            // raw preview or full undress?
            preview: preview,
            sd: {
                width: width,
                height: height,
                init_images: ['data:image/png;base64,' + png.toString('base64')],
                // for draft undress (will be fully implemented 16.10.2023)
                /*cfg_scale: 0.1,
                sampler_name: 'Euler a',
                steps: 1,
                script_name: 'MaskGeneratorLite'*/
            }
        }
    };

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
            const image = task.results.data.images[0];
            let buffer = Buffer.from(image, 'base64');
            if (preview) {
                buffer = await sharp(buffer)
                    .blur(5)
                    .toBuffer();
            }
            fs.writeFileSync(`images/${id}.png`, buffer);
        } else {
            console.log('task failed', task);
        }
    } catch (e: unknown) {
        console.log(e);
    } finally {
        process.exit(0);
    }

})();
