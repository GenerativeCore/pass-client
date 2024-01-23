Generative Core PaaS client https://www.generativecore.ai/

Check swagger API here https://dev-api.generativecore.ai/swagger/

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

## Text to image

- [ ] Run in terminal

```
npm run txt2img
```

- [ ] Check `images` folder
- [ ] Check file `txt2img.ts`

## Upscale

- [ ] Run in terminal

```
npm run upscale
```

## 🔥 Undress

- [ ] Run in terminal

```
npm run undress
```

## 🔥 Text to animation

- [ ] Run in terminal

```
npm run txt2animation
```

# In-paint

A bit later.

# Do you have bugs?

Please add you bugs [here](https://gitlab.com/realistic-ai/paas-client/-/issues)