import fs from 'fs';
import { generativeCore, delay } from './utils';
import { BASE_URL, AUTH } from './consts';

// https://gitlab.com/realistic-ai/paas/render-dispatcher/-/blob/main/tools/http/tasks/create/animate.http
const request = {
  type: 'face_to_animation',
  payload: {
    baseModel: 'sd_15',
    checkpoint: 'epicrealism_pureEvolutionV5.safetensors',
    face: 'data:image/png;base64,' + fs.readFileSync('./girl_face1.png').toString('base64'),
    prompt: 'dancing naked girl <lora:v2_lora_PanUp:.5>',
    negativePrompt: '',
    fps: 16,
    width: 512,
    height: 512,
    steps: 40
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
      const { animation } = task.results.data;
      let buffer = Buffer.from(animation, 'base64');
      fs.writeFileSync(`images/face_to_animation_${id}.mp4`, buffer);
    } else {
      console.log('task failed', task);
    }
  } catch (e: unknown) {
    console.log(e);
  } finally {
    process.exit(0);
  }
})();
