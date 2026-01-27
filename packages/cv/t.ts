import { array, boolean, object, string, enum as zenum } from 'zod/v4'

export default {
  blog: object({
    attachments: array(string()).max(5).optional(),
    category: zenum(['tech', 'life', 'tutorial'], { error: 'Select a category' }),
    content: string().min(3, 'At least 3 characters'),
    coverImage: string().optional(),
    published: boolean(),
    slug: string()
      .min(1, 'Required')
      .regex(/^[a-z0-9-]+$/u, 'Lowercase, numbers, hyphens only'),
    tags: array(string()).max(5, 'Max 5 tags').optional(),
    title: string().min(1, 'Required')
  }),
  message: object({
    body: string().min(1, 'Required')
  })
}
