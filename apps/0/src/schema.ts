import { array, base64, object, string } from 'zod/v4'

export const message = object({
    content: string().nonempty(),
    role: string()
  }),
  imageInputLLM = object({
    b64: base64().nonempty(),
    model: string().nonempty(),
    tags: array(string().nonempty())
  })
