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
    //checkpoint: 'epicrealism_naturalSinRC1VAE.safetensors',
    //prompt: `photo of beautiful, a woman in a, (movie premiere gala:1.1), perfect hair, wearing, ((sexy gryffindor wizard outfit:1.1)), (paparazzi in background), ((Takenokozoku:1.1)), modelshoot style, (extremely detailed CG unity 8k wallpaper), professional majestic, (photography by tim walker:1.1), (Sony a6600 Mirrorless Camera), 24mm, exposure blend, hdr, faded, extremely intricate, High, (Detail:1.1), Sharp focus, dramatic, soft cinematic light, (looking at viewer), (detailed pupils), cute smile, 24mm, 4k textures, soft cinematic light, adobe lightroom, photolab, elegant, ((((cinematic look)))), soothing tones, insane details, hyperdetailed, low contrast`,
    //negativePrompt: `(((nsfw))), plastic, nudity, canvas frame, cartoon, 3d, ((disfigured)), ((bad art)), ((deformed)),((extra limbs)),((close up)),((b&w)), blurry, (((duplicate))), ((morbid)), ((mutilated)), [out of frame], extra fingers, mutated hands, ((poorly drawn hands)), ((poorly drawn face)), (((mutation))), (((deformed))), ((ugly)), blurry, ((bad anatomy)), (((bad proportions))), ((extra limbs)), cloned face, (((disfigured))), out of frame, ugly, extra limbs, (bad anatomy), gross proportions, (malformed limbs), ((missing arms)), ((missing legs)), (((extra arms))), (((extra legs))), mutated hands, (fused fingers), (too many fingers), (((long neck))), Photoshop, video game, ugly, tiling, poorly drawn hands, poorly drawn feet, poorly drawn face, out of frame, mutation, mutated, extra limbs, extra legs, extra arms, disfigured, deformed, cross-eye, body out of frame, blurry, bad art, bad anatomy, 3d render, (tiara), (((cleft))), (badhands)`,
    // SDXL
    checkpoint: 'afroditexlNudePeople_20Bkdvae.safetensors',
    // SDXL don't like long prompts
    prompt: `beautiful girl on a beach`,
    negativePrompt: '',
    // image size, bigger size
    height: 1024,
    width: 768,
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
