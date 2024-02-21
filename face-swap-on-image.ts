import fs from 'fs';
import { generativeCore, delay } from './utils';
import { BASE_URL, AUTH } from './consts';

const request = {
  type: 'faceswap_on_image',
  payload: {
    image: 'data:image/png;base64,' + fs.readFileSync('./for_face_swap.jpg').toString('base64'),
    face: 'data:image/png;base64,' + fs.readFileSync('./girl_face1.png').toString('base64')
  }
};

const paas = generativeCore({ baseUrl: BASE_URL, auth: AUTH });

(async () => {
  try {
    const id = await paas.createTask(request);
    console.log(id);
    let task;
    let attempts = 0;
    do {
      await delay(1000);
      task = await paas.checkTask(id);
      console.log(attempts, task.status);
      if (attempts++ > 200) {
        throw new Error('Timeout');
      }
    } while (task.status === 'pending' || task.status === 'processing');
    if (task.status === 'completed') {
      console.log(task);
      const { image } = task.results.data;
      let buffer = Buffer.from(image, 'base64');
      fs.writeFileSync(`images/face_swap_on_image_${id}.png`, buffer);
    } else {
      console.log('task failed', task);
    }
  } catch (e: unknown) {
    console.log(e);
  } finally {
    process.exit(0);
  }
})();
