import fs from 'fs';
import { generativeCore, delay } from './utils';
import { BASE_URL, AUTH } from './consts';

const request = {
  type: 'text_to_image',
  // fast queue
  isFast: true,
  payload: {
    // check in README.md
    // SD 1.5
    checkpoint: 'epicrealism_naturalSinRC1VAE.safetensors',
    // add LoRAs only for SD 1.5 to prompt
    prompt: `a balding male accountant in an office <lora:tonguedrop-d:1>`,
    negativePrompt: `High pass filter, airbrush,portrait,zoomed, soft light, smooth skin,closeup, Anime, fake, cartoon, deformed, extra limbs, extra fingers, mutated hands, bad anatomy, bad proportions , blind, bad eyes, ugly eyes, dead eyes, blur, vignette, out of shot, out of focus, gaussian, closeup, monochrome, grainy, noisy, text, writing, watermark, logo, oversaturation , over saturation, over shadow, floating limbs, disconnected limbs, anime, kitsch, cartoon, penis, fake, (black and white), airbrush, drawing, illustration, boring, 3d render, long neck, out of frame, extra fingers, mutated hands, monochrome, ((poorly drawn hands)), ((poorly drawn face)), (((mutation))), (((deformed))), ((ugly)), blurry, ((bad anatomy)), (((bad proportions))), ((extra limbs)), cloned face, glitchy, bokeh, (((long neck))), (child), (childlike), 3D, 3DCG, cgstation, red eyes, multiple subjects, extra heads, close up, man, ((asian)), text, bad anatomy, morphing, messy broken legs decay, ((simple background)), deformed body, lowres, bad anatomy, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low jpeg artifacts, signature, watermark, username, blurry, out of focus, old, amateur drawing, odd, fat, morphing, ((simple background)), artifacts, signature, artist name, [blurry], disfigured, mutated, (poorly hands), messy broken legs, decay, painting, duplicate, closeup`,
    loras: [
      {
        modelName: 'tonguedrop-d',
        weight: 1
      }
    ],
    // SDXL
    //checkpoint: 'afroditexlNudePeople_20Bkdvae.safetensors',
    // SDXL don't like long prompts
    //prompt: `beautiful girl on a beach`,
    //negativePrompt: '',
    // image size, bigger size
    height: 1024,
    width: 1024,
    // check samplers.webp
    samplerName: 'DPM++ 2M Karras',
    steps: 40
  },
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
      const image = task.results.data.images[0];
      let buffer = Buffer.from(image, 'base64');
      fs.writeFileSync(`images/text_to_image_${id}.png`, buffer);
    } else {
      console.log('task failed', task);
    }
  } catch (e: unknown) {
    console.log(e);
  } finally {
    process.exit(0);
  }
})();
