import fs from 'fs';
import { generativeCore, delay } from './utils';
import { BASE_URL, AUTH } from './consts';

const file = fs.readFileSync('./for_upscale.png');

const request = {
  type: 'upscale',
  isFast: true,
  payload: {
    sd: {
      resize_mode: 0,
      show_extras_results: true,
      gfpgan_visibility: 0,
      codeformer_visibility: 0,
      codeformer_weight: 0,
      upscaling_resize: 4,
      upscaling_crop: true,
      upscaler_1: 'R-ESRGAN 4x+',
      upscaler_2: 'None',
      extras_upscaler_2_visibility: 0,
      upscale_first: false,
      image: 'data:image/png;base64,' + file.toString('base64'),
    },
  },
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
