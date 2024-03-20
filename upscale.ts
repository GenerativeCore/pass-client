import fs from 'fs';
import { generativeCore, delay } from './utils';
import { BASE_URL, AUTH } from './consts';

const request = {
  type: 'upscale-image',
  payload: {
    image: fs.readFileSync('./for_upscale.png').toString('base64')
  }
};
// for debugging purposes
fs.writeFileSync('payloads/upscale-image.json', JSON.stringify(request, null, '\t'));

const paas = generativeCore({ baseUrl: BASE_URL, auth: AUTH });

(async () => {
  try {
    const id = await paas.createTask(request);
    let task;
    let attempts = 0;
    do {
      await delay(500);
      task = await await paas.checkTask(id);
      console.log(attempts, task.status);
      if (attempts++ > 100) {
        throw new Error('Timeout');
      }
    } while (task.status === 'pending' || task.status === 'processing');
    if (task.status === 'completed') {
      console.log(task);
      const {image} = task.results.data;
      let buffer = Buffer.from(image.base64, 'base64');
      fs.writeFileSync(`images/upscale_image_${id}.png`, buffer);
    } else {
      console.log('task failed', task);
    }
  } catch (e: any) {
    console.log(e.response.data);
  } finally {
    process.exit(0);
  }
})();
