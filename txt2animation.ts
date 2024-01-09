import fs from 'fs';
import { generativeCore, delay } from './utils';
import { BASE_URL, AUTH } from './consts';

// https://gitlab.com/realistic-ai/paas/render-dispatcher/-/blob/main/tools/http/tasks/create/animate.http
const request = {
  type: 'txt2animation',
  payload: {
    baseModel: 'SD 1.5',
    checkpoint: 'epicrealism_pureEvolutionV5.safetensors',
    fps: 16,
    interpolation: true,
    sd: {
      width: 512,
      height: 512,
      prompt: 'mix4, (8k, RAW photo, best quality, masterpiece:1.2), (realistic, photo-realistic:1.37), 1girl, cute, cityscape, night, rain, wet, professional lighting, photon mapping, radiosity, physically-based rendering, <lora:mix4:.5>, <lora:v2_lora_PanUp:.5>',
      negative_prompt: 'paintings, sketches, (worst quality:2), (low quality:2), (normal quality:2), lowres, normal quality, ((monochrome)), ((grayscale)), skin spots, acnes, skin blemishes, age spot, glans'
    }
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
      fs.writeFileSync(`images/${id}.mp4`, buffer);
    } else {
      console.log('task failed', task);
    }
  } catch (e: unknown) {
    console.log(e);
  } finally {
    process.exit(0);
  }
})();
