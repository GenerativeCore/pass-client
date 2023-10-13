import fs from 'fs';
import { generativeCore, delay } from './utils';
import { BASE_URL, AUTH } from './consts';

// https://gitlab.com/realistic-ai/paas/render-dispatcher/-/blob/main/tools/http/tasks/create/animate.http
const request = {
  type: 'txt2gif',
  payload: {
    baseModel: 'SD 1.5',
    checkpoint: 'epicrealism_pureEvolutionV5.safetensors',
    sd: {
      width: 512,
      height: 512,
      prompt: '<lora:v2_lora_PanDown:1> (best quality, masterpiece:1.2), photorealistic, ultra high res, front lighting, intricate detail, Exquisite details and textures, 1girl, (young), face highlight, upper body, detailed face, tear mole, white skin, silver hair, ponytail, braid hair, looking at viewer, big eyes, sun dress, slip dress, (hollow pattern, white, silk), earrings, small breasts, slim body, luxury room, royal palace, professional lighting, photon mapping, radiosity, physically-based rendering',
      negative_prompt: ''
    }
  }
};

const paas = generativeCore({ baseUrl: BASE_URL, auth: AUTH });

(async () => {
  try {
    const id = await paas.createTask(request);
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
      fs.writeFileSync(`images/${id}.gif`, buffer);
    } else {
      console.log('task failed', task);
    }
  } catch (e: unknown) {
    console.log(e);
  } finally {
    process.exit(0);
  }
})();
