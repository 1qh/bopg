'use server'

import type { HWXY } from 'types'
import type { z } from 'zod/v4'

import { inArray } from '@a/db'
import db from '@a/db/client'
import { Bbox } from '@a/db/schema'
import ky from 'ky'
import { createSafeActionClient } from 'next-safe-action'
import { revalidatePath } from 'next/cache'
import ollama, { Ollama } from 'ollama'
import sharp from 'sharp'
import { ulid } from 'ulid'
import { array, custom, number, object, string, toJSONSchema, enum as zenum } from 'zod/v4'

import { getSession } from '~/auth/server'
import env from '~/env'
import { s3 } from '~/s3'
import { imageInputLLM, message } from '~/schema'
import { url2b64 } from '~/utils'

const a = createSafeActionClient().use(async ({ next }) => {
    const session = await getSession()
    if (!session) throw new Error('Unauthorized')
    const { email, id } = session.user
    return next({ ctx: { email, userId: id } })
  }),
  o = env.NODE_ENV === 'development' ? ollama : new Ollama({ host: env.OLLAMA_URL })

export const chatA = a
    .inputSchema(
      object({
        messages: array(message),
        model: string().nonempty()
      })
    )
    .action(async ({ parsedInput }) => o.chat(parsedInput)),
  fetchModels = async () => {
    const res = await ky.get(`${env.OPENAI_BASE_URL}/models`).json<{ data: { id: string }[] }>()
    return res.data.map(i => i.id)
  },
  cropBoxesToBase64 = async (b64: string, boxes: HWXY[]): Promise<string[]> => {
    const imageBuffer = Buffer.from(url2b64(b64), 'base64'),
      { height, width } = await sharp(imageBuffer).metadata(),
      res = await Promise.all(
        boxes.map(async box => {
          const boxWidth = Math.round(box.w * width),
            boxHeight = Math.round(box.h * height),
            left = Math.max(0, Math.round(box.x * width - boxWidth / 2)),
            top = Math.max(0, Math.round(box.y * height - boxHeight / 2)),
            croppedBuffer = await sharp(imageBuffer)
              .extract({
                height: Math.min(boxHeight, height - top),
                left,
                top,
                width: Math.min(boxWidth, width - left)
              })
              .png()
              .toBuffer()
          return croppedBuffer.toString('base64')
        })
      )
    return res
  },
  boxesDetectFn = async (path: string) => {
    const b64 = Buffer.from(await s3.file(path).arrayBuffer()).toString('base64'),
      res = await ky.post(`${env.FASTAPI_URL}/boxes`, { json: { image: b64 } }).json<HWXY[]>(),
      croppedImages = await cropBoxesToBase64(b64, res),
      boxes = res.map((hwxy, i) => ({
        annot: Number(path.split('/')[0]),
        hwxy,
        id: ulid(),
        path,
        src: `data:image/png;base64,${croppedImages[i]}`
      }))
    await db.insert(Bbox).values(boxes)
    return true
  },
  boxesDetectA = a.inputSchema(string().nonempty()).action(async ({ parsedInput }) => boxesDetectFn(parsedInput)),
  classifyImageFn = async ({ b64, model, tags }: z.infer<typeof imageInputLLM>) => {
    const format = toJSONSchema(zenum(tags))
    console.log({ format, model, tags })
    const res = await o.generate({
      format,
      images: [b64],
      model,
      prompt: `Classify the image into one of the following classes: ${tags.join(', ')}`
    })
    console.log(res)
    return res.response.replaceAll('"', '')
  },
  classifyImageA = a.inputSchema(imageInputLLM).action(async ({ parsedInput }) => classifyImageFn(parsedInput)),
  objectDetectionFn = async ({ b64, model, tags }: z.infer<typeof imageInputLLM>) => {
    const format = toJSONSchema(
      array(
        object({
          hwxy: object({
            h: number().min(0).max(1),
            w: number().min(0).max(1),
            x: number().min(0).max(1),
            y: number().min(0).max(1)
          }),
          predict: zenum(tags)
        })
      )
    )
    console.log({ format, model, tags })
    const res = await o.generate({
      format,
      images: [b64],
      model,
      prompt: `Analyze this image and detect all objects that match the provided classes: ${tags.join(', ')}.

For each detected object:
1. Identify the object and classify it using ONLY one of these exact classes: ${tags.join(', ')}
2. Draw a bounding box around the object
3. Convert the bounding box to YOLO format (normalized coordinates 0-1):
   - x: center x coordinate (0=left edge, 1=right edge)
   - y: center y coordinate (0=top edge, 1=bottom edge)
   - w: width as fraction of image width
   - h: height as fraction of image height

Return a JSON array where each detected object has:
- hwxy: {h: height, w: width, x: center_x, y: center_y} in YOLO format
- predict: the exact class name from the provided list

Important:
- Only detect objects that clearly match one of the specified classes
- Use precise bounding boxes that tightly fit each object
- All coordinate values must be between 0 and 1
- Only use the exact class names provided: ${tags.join(', ')}
- If no objects from the specified classes are found, return an empty array

Example output format:
[
  {"hwxy": {"h": 0.3, "w": 0.2, "x": 0.5, "y": 0.4}, "predict": "class_name"},
  {"hwxy": {"h": 0.15, "w": 0.1, "x": 0.8, "y": 0.2}, "predict": "another_class"}
]`
    })
    console.log(res)
    return res.response
  },
  objectDetectionA = a.inputSchema(imageInputLLM).action(async ({ parsedInput }) => objectDetectionFn(parsedInput)),
  s3put = a
    .inputSchema(
      object({
        files: array(custom<File>()),
        pathname: string().nonempty(),
        prefix: string().optional().default('')
      })
    )
    .action(async ({ parsedInput: { files, pathname, prefix } }) => {
      await Promise.all(files.map(async f => s3.write(prefix + f.name, f, { type: f.type })))
      revalidatePath(pathname)
    }),
  s3del = a
    .inputSchema(
      object({
        keys: array(string().nonempty()),
        pathname: string().nonempty()
      })
    )
    .action(async ({ parsedInput: { keys, pathname } }) => {
      await db.delete(Bbox).where(inArray(Bbox.path, keys))
      await Promise.all(keys.map(async k => s3.delete(k)))
      revalidatePath(pathname)
    }),
  s3buf = a.inputSchema(string().nonempty()).action(async ({ parsedInput: key }) => {
    const file = s3.file(decodeURI(key)),
      { type } = await file.stat()
    return `data:${type};base64,${Buffer.from(await file.arrayBuffer()).toString('base64')}`
  })
