Generative Core PaaS client https://www.generativecore.ai/

Check swagger API here https://api.generativecore.ai/swagger/

You need login & password.

# How to install

- [ ] Install NodeJs 16+
- [ ] Run in terminal

```
npm ci
```

- [ ] Put credentials to `~/consts.ts`

```ts
export const AUTH = {
  username: '?',
  password: '?',
};
```

- [ ] Create folder `~/images`

# How to use

## Show all available checkpoints

Checkpoints are machine learning models (sometimes called checkpoints) that all have different strengths. Some models are particularly good at generating reality like images, others specialize on fantasy or Anime. We suggest to try out your prompt with different models and find your own favorite.

- [ ] Run in terminal

```
npm run checkpoints
```

## Text to image

- [ ] Run in terminal

```
npm run text_to_image
```

- [ ] Check `images` folder
- [ ] Check file `text-to-image.ts`

## Text to animation

- [ ] Run in terminal

```
npm run text_to_animation
```

## Upscale

- [ ] Run in terminal

```
npm run upscale
```

## Dress

- [ ] Run in terminal

```
npm run dress
```

## Face to image

- [ ] Run in terminal

```
npm run face_to_image
```

## Face to animation

- [ ] Run in terminal

```
npm run face_to_animation
```

## Face swap on image

- [ ] Run in terminal

```
npm run face_swap_on_image
```

# In-paint

- [ ] Run in terminal

```
npm run inpaint
```

# Do you have bugs?

Please add you bugs [here](https://gitlab.com/realistic-ai/paas-client/-/issues)
