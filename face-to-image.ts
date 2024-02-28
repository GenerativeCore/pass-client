import fs from 'fs';
import { generativeCore, delay } from './utils';
import { BASE_URL, AUTH } from './consts';

const request = {
  type: 'face-to-image',
  payload: {
    checkpoint: 'epicrealism_pureEvolutionV5.safetensors',
    face: fs.readFileSync('./girl_face1.png').toString('base64'),
    prompt: 'full body 1girl in office <lora:tonguedrop-d:1>',
    loras: [
      {
        modelName: 'tonguedrop-d.safetensors',
        weight: 1
      }
    ],
    negativePrompt: '',
    size: '768x768',
    hrEnable: true,
    upscale: 2,
    steps: 40
  }
};

// for debugging purposes
fs.writeFileSync('payloads/face-to-image.json', JSON.stringify(request, null, '\t'));

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
      const [image] = task.results.data.images;
      let buffer = Buffer.from(image.base64, 'base64');
      fs.writeFileSync(`images/face_to_image_${id}.png`, buffer);
    } else {
      console.log('task failed', task);
    }
  } catch (e: any) {
    console.log(e.response.data);
  } finally {
    process.exit(0);
  }
})();
