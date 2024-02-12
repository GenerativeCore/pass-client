import fs from 'fs';
import { generativeCore, delay } from './utils';
import { BASE_URL, AUTH } from './consts';

const request = {
  type: 'upscale',
  image: 'data:image/png;base64,' + fs.readFileSync('./for_upscale.png').toString('base64')
};

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
      const image = task.results.data.image;
      let buffer = Buffer.from(image, 'base64');
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
