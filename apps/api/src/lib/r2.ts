import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const REQUIRED_ENV = ['R2_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_BUCKET_NAME', 'R2_PUBLIC_URL'] as const

for (const key of REQUIRED_ENV) {
  if (!process.env[key]) throw new Error(`${key} environment variable is required`)
}

export const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env['R2_ACCOUNT_ID']!}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId:     process.env['R2_ACCESS_KEY_ID']!,
    secretAccessKey: process.env['R2_SECRET_ACCESS_KEY']!,
  },
})

const BUCKET = process.env['R2_BUCKET_NAME']!
const PUBLIC_URL = process.env['R2_PUBLIC_URL']!

export async function uploadToR2(
  key: string,
  body: Buffer | Uint8Array | string,
  contentType: string,
): Promise<string> {
  await r2.send(new PutObjectCommand({
    Bucket:      BUCKET,
    Key:         key,
    Body:        body,
    ContentType: contentType,
  }))
  return `${PUBLIC_URL}/${key}`
}

export async function getPresignedUrl(key: string, expiresIn = 3600): Promise<string> {
  return getSignedUrl(
    r2,
    new GetObjectCommand({ Bucket: BUCKET, Key: key }),
    { expiresIn },
  )
}

export async function deleteFromR2(key: string): Promise<void> {
  await r2.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }))
}

export function buildR2Key(userId: string, jobId: string, ext: string): string {
  return `users/${userId}/assets/${jobId}.${ext}`
}
