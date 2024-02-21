import fs from 'fs';
import { generativeCore, delay } from './utils';
import { BASE_URL, AUTH } from './consts';

const request = {
  type: 'text_to_animation',
  payload: {
    // use only checkpoints for SD 1.5
    checkpoint: 'revAnimated_v122EOL.safetensors',
    //checkpoint: 'epicrealism_pureEvolutionV5.safetensors',
    prompt: 'mix4, (8k, RAW photo, best quality, masterpiece:1.2), (realistic, photo-realistic:1.37), 1girl, cute, cityscape, night, rain, wet, professional lighting, photon mapping, radiosity, physically-based rendering, <lora:mix4:.5>, <lora:v2_lora_PanUp:.5>',
    negativePrompt: 'paintings, sketches, (worst quality:2), (low quality:2), (normal quality:2), lowres, normal quality, ((monochrome)), ((grayscale)), skin spots, acnes, skin blemishes, age spot, glans',
    // totally we have 48 frames, how much frames per second
    fps: 16,
    // image size
    width: 512,
    height: 512
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
      fs.writeFileSync(`images/text_to_animation_${id}.mp4`, buffer);
    } else {
      console.log('task failed', task);
    }
  } catch (e: unknown) {
    console.log(e);
  } finally {
    process.exit(0);
  }
})();
