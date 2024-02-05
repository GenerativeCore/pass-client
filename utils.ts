import axios from 'axios';
import { AUTH, BASE_URL } from './consts';
import sharp, { Sharp } from 'sharp';

export async function delay(time: number) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

export const generativeCore = ({ baseUrl, auth }: {
    baseUrl: (path: string) => string, auth: {
        username: string, password: string
    }
}) => ({
    async createTask(request: Object): Promise<string> {
        const response = await axios({
            method: 'post',
            url: baseUrl('tasks'),
            headers: {
                'Content-type': 'application/json'
            },
            auth,
            data: JSON.stringify(request)
        });
        const { id } = response.data;
        return id;
    },
    async checkTask(id: string): Promise<any> {
        const response = await axios({
            method: "get",
            url: baseUrl(`tasks/${id}`),
            headers: {
                "Content-type": "application/json",
            },
            auth,
        });
        return response.data;
    }
});

export async function fit(image: Sharp, {
    maxWidth,
    maxHeight
}: {
    maxWidth: number,
    maxHeight: number
}): Promise<Sharp> {
    const metadata = await image.metadata();
    if (!metadata.width) {
        throw new Error('can\'t detect width');
    }
    if (!metadata.height) {
        throw new Error('can\'t detect height');
    }
    const orientation: '-' | '|' = metadata.width >= metadata.height ? '-' : '|';
    switch (orientation) {
        case '-':
            if (metadata.width > maxWidth) {
                return sharp(await image.resize({ width: maxWidth }).toBuffer());
            }
            break;
        case '|':
            if (metadata.height > maxHeight) {
                return sharp(await image.resize({ height: maxHeight }).toBuffer());
            }
            break;
    }

    return image;
}