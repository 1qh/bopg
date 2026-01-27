import { S3mini } from 's3mini'

import env from '~/env'

export const s3 = new S3mini({
  accessKeyId: env.S3_ACCESS_KEY_ID,
  endpoint: `${env.S3_ENDPOINT}/${env.S3_BUCKET}`,
  secretAccessKey: env.S3_SECRET_ACCESS_KEY
})
