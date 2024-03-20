import fs from 'fs';
import { generativeCore, delay } from './utils';
import { BASE_URL, AUTH } from './consts';

const request = {
  type: 'text-to-image',
  // fast queue
  isFast: true,
  payload: {
    // check in README.md
    // SD 1.5
    //checkpoint: 'epicrealism_naturalSinRC1VAE.safetensors',
    // add LoRAs to prompt only for SD 1.5
    //prompt: `a balding male accountant in an office <lora:tonguedrop-d:1>`,
    //negativePrompt: `High pass filter, airbrush, portrait, zoomed, soft light, smooth skin,closeup, Anime, fake, cartoon, deformed, extra limbs, extra fingers, mutated hands, bad anatomy, bad proportions, blind, bad eyes, ugly eyes, dead eyes, blur, vignette, out of shot, out of focus, gaussian, closeup, monochrome, grainy, noisy, text, writing, watermark, logo, oversaturation , over saturation, over shadow, floating limbs, disconnected limbs, anime, kitsch, cartoon, penis, fake, (black and white), airbrush, drawing, illustration, boring, 3d render, long neck, out of frame, extra fingers, mutated hands, monochrome, ((poorly drawn hands)), ((poorly drawn face)), (((mutation))), (((deformed))), ((ugly)), blurry, ((bad anatomy)), (((bad proportions))), ((extra limbs)), cloned face, glitchy, bokeh, (((long neck))), (child), (childlike), 3D, 3DCG, cgstation, red eyes, multiple subjects, extra heads, close up, man, ((asian)), text, bad anatomy, morphing, messy broken legs decay, ((simple background)), deformed body, lowres, bad anatomy, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low jpeg artifacts, signature, watermark, username, blurry, out of focus, old, amateur drawing, odd, fat, morphing, ((simple background)), artifacts, signature, artist name, [blurry], disfigured, mutated, (poorly hands), messy broken legs, decay, painting, duplicate, closeup`,
    /*loras: [
      {
        modelName: 'tonguedrop-d.safetensors',
        weight: 1
      }
    ],*/
    // SDXL
    checkpoint: 'afroditexlNudePeople_20Bkdvae.safetensors',
    // SDXL don't like long prompts
    prompt: `fully naked girl, full body, cinematic film still, close up, photo of redheaded girl near grasses, fictional landscapes, (intense sunlight:1.4), realist detail, brooding mood, ue5, detailed character expressions, light amber and red, amazing quality, wallpaper, analog film grain`,
    //negativePrompt: '',
    loras: [
      {
        'modelName': 'sd_xl_offset_example-lora_1.0.safetensors',
        'weight': -0.54,
      },
      {
        'modelName': 'SDXL_FILM_PHOTOGRAPHY_STYLE_BetaV0.4.safetensors',
        'weight': 1.0,
      },
      {
        'modelName': 'add-detail-xl.safetensors',
        'weight': 0.78,
      },
    ],
    // SD 1.5 512x512 768x768 512x768 768x512 576x768 768x576 512x912 912x512
    // SDXL 704x1408 704x1344 768x1344 768x1280 832x1216 832x1152 896x1152 896x1088 960x1088 960x1024 1024x1024 1024x960 1088x960 1088x896 1152x896 1152x832 1216x832 1280x768 1344x768 1344x704 1408x704 1472x704 1536x640 1600x640 1664x576 1728x576 512x512 768x768 512x768 768x512 576x768 768x576 512x912 912x512
    size: '1024x1024',
    // more details
    hrEnable: false,
    // double size after generation
    upscale: 1,
    // real camera effect
    sharpness: 15,
    // check samplers.webp
    samplerName: 'DPM++ 2M Karras',
    steps: 35
  }
};

// for debugging purposes
fs.writeFileSync('payloads/text-to-image.json', JSON.stringify(request, null, '\t'));

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
      const [image] = task.results.data.images;
      let buffer = Buffer.from(image.base64, 'base64');
      fs.writeFileSync(`images/text_to_image_${id}.png`, buffer);
    } else {
      console.log('task failed', task);
    }
  } catch (e: any) {
    console.log(e.response.data);
  } finally {
    process.exit(0);
  }
})();
