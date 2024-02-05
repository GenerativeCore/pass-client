import fs from 'fs';
import sharp, { Sharp } from 'sharp';
import { generativeCore, delay, fit } from './utils';
import { BASE_URL, AUTH } from './consts';

const MAX_WIDTH = 1024;
const MAX_HEIGHT = 1024;

const paas = generativeCore({ baseUrl: BASE_URL, auth: AUTH });

const file = fs.readFileSync('./for_undress2.jpg');

(async () => {

    const preview = false;
    const request = {
        type: 'undress',
        isFast: true, // VIP queue
        payload: {
            // raw preview or full undress?
            preview: preview,
            image: 'data:image/jpeg;base64,' + file.toString('base64')
        }
    };

    fs.writeFileSync('undress.json', JSON.stringify(request));

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
