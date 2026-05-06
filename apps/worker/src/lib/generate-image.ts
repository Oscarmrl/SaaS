import Replicate from 'replicate'

const replicate = new Replicate({ auth: process.env['REPLICATE_API_TOKEN'] ?? '' })

export async function generateImageBuffer(prompt: string, aspectRatio: '1:1' | '16:9' = '1:1'): Promise<Buffer> {
  const provider = process.env['IMAGE_PROVIDER'] ?? 'flux-schnell'

  if (provider === 'huggingface') {
    const hfToken = process.env['HF_TOKEN']
    if (!hfToken) throw new Error('HF_TOKEN env var is required for huggingface provider')

    const res = await fetch(
      'https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell',
      {
        method:  'POST',
        headers: { Authorization: `Bearer ${hfToken}`, 'Content-Type': 'application/json' },
        body:    JSON.stringify({ inputs: prompt, parameters: { num_inference_steps: 4 } }),
      }
    )
    if (!res.ok) {
      const msg = await res.text().catch(() => res.statusText)
      throw new Error(`HuggingFace error ${res.status}: ${msg}`)
    }
    return Buffer.from(await res.arrayBuffer())
  }

  const model = provider === 'flux-pro'
    ? 'black-forest-labs/flux-pro'
    : 'black-forest-labs/flux-schnell'

  const replicateInput = provider === 'flux-pro'
    ? { prompt, width: 1024, height: 1024, num_outputs: 1, guidance: 3.5, num_inference_steps: 28, output_format: 'webp', output_quality: 90 }
    : { prompt, num_outputs: 1, num_inference_steps: 4, output_format: 'webp', output_quality: 90, aspect_ratio: aspectRatio }

  const output = await replicate.run(model as `${string}/${string}`, { input: replicateInput })
  const urls   = Array.isArray(output) ? output : [output]
  const imgUrl = urls[0] as string
  if (!imgUrl) throw new Error(`No image URL returned from ${model}`)

  const res = await fetch(imgUrl)
  if (!res.ok) throw new Error(`Failed to download image: ${res.status}`)
  return Buffer.from(await res.arrayBuffer())
}
