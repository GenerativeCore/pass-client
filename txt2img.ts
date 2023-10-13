import fs from 'fs';
import { generativeCore, delay } from './utils';
import { BASE_URL, AUTH } from './consts';

const request = {
  type: 'txt2img',
  isFast: true,
  payload: {
    baseModel: 'SD 1.5',
    checkpoint: 'darknp_v10.safetensors',
    sd: {
      prompt: `{professional high quality|majestic|stunning view|spectacular} 
        { (HDR photo)|digital art|digital painting|1.05::analog photo|photorealistic painting|0.5::hyperrealistic scenery|1.1::digital photography} 
        {containing|of} a picturesque nature of a {humid tropical jungle|foggy fjord|ocean bay|seashore|desert landscape|cherry blossom on cliff|ocean shore|wild life scenery|bare tree and desert|river in forest|body of water surrounded by trees and rocks|landscape photo of northern forest|lush vegetation view|calm body of water surrounded with trees and stones|silhouette of an old bare tree on body of water near cliff|sun rays through trees, voluminous light and light rays|steep rocky walls gorge|tropic island beach with a few palms|foggy swamp|peaceful lushious forest|lush green deep forest|prairie|alpine meadow|savannah {mirage|}|lush bloom oasis|amazon river forest|quaint northern hills in the moss|reflective lake|spectacular river view|endless plain|picturesque forest edge with an old driftwood|dark thicket} in a {winter|spring|summer|autumn} [imagination] {in the morning {dawn|}|in the afternoon|in the evening {sunset| }|at the night, {moonlit|} }, {clear|cloudy{(raining)|}|partly cloudy {windy||}|overcast|snowing { (blizzard) |}|foggy|0.7::stormy and lightning| (hurricane) } weather, {global lighting|environmental lighting|dramatic lighting|(god rays:0.9)}, 8k resolution, detailed, focus, (close shot){featured on flickr|environmental art photography|shutterstock contest winner|deviantart|hudson river school painting|pixiv|atmospheric dreamscape painting|pinterest|0.5::inverted darkness (extravaganza) }{by Michael James Smith|by Mark Keathley|by Thomas Vijayan|by Guy Tal|by Mandy Lea|by Thomas Kinkade|by Ted Gore|by Jake Guzman|by Marc Adamus|by Ryan Dyar} <lora:to8contrast-1-5:0.7>`,
      negative_prompt: `fish eye, blurry, undetailed, city, people, man, person, entity, character, monochrome, b&w, animal`,
      height: 960,
      width: 512,
      sampler_name: 'DPM++ 2M Karras',
      steps: 50,
      cfg_scale: 7,
      seed: -1,
      denoising_strength: 0.3,
      image_cfg_scale: 1.5,

      // if you need hight resolution
      /*enable_hr: true,
      firstphase_width: 0,
      firstphase_height: 0,
      hr_scale: 2,
      hr_upscaler: '4x_foolhardy_Remacri',
      hr_second_pass_steps: 0,
      hr_resize_x: 0,
      hr_resize_y: 0,
      hr_checkpoint_name: '',
      hr_sampler_name: '',
      hr_prompt: '',
      hr_negative_prompt: '',*/
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
