import fs from 'fs';
import sharp, { Sharp } from 'sharp';
import { generativeCore, delay, fit } from './utils';
import { BASE_URL, AUTH } from './consts';

const preview = false;

const request = {
    type: 'dress-on-image',
    isFast: true, // VIP queue
    payload: {
        // raw preview or full undress?
        preview,
        // don't pass if fully naked
        //prompt: 'girl in white dress',
        //negativePrompt: '',
        gender: 'auto',
        image: fs.readFileSync('./for_dress.jpg').toString('base64')
    }
};

// for debugging purposes
fs.writeFileSync('payloads/dress-on-image.json', JSON.stringify(request, null, '\t'));

const paas = generativeCore({ baseUrl: BASE_URL, auth: AUTH });

(async () => {

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
            if (preview) {
                buffer = await sharp(buffer)
                    .blur(5)
                    .toBuffer();
            }
            fs.writeFileSync(`images/dress_${id}.png`, buffer);
        } else {
            console.log('task failed', task);
        }
    } catch (e: any) {
        console.log(e.response.data);
    } finally {
        process.exit(0);
    }

})();
