import { type NextRequest, NextResponse } from 'next/server'

const R2_PUBLIC_URL = process.env['R2_PUBLIC_URL'] ?? ''

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url')

  if (!url) {
    return NextResponse.json({ error: 'Missing url param' }, { status: 400 })
  }

  // Solo permitir URLs de nuestro propio bucket R2
  if (R2_PUBLIC_URL && !url.startsWith(R2_PUBLIC_URL)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  let res: Response
  try {
    res = await fetch(url)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch asset' }, { status: 502 })
  }

  if (!res.ok) {
    return NextResponse.json({ error: 'Asset not found' }, { status: 404 })
  }

  const contentType = res.headers.get('content-type') ?? 'application/octet-stream'
  const ext = contentType.includes('video') ? 'mp4'
    : contentType.includes('text')  ? 'txt'
    : contentType.includes('webp')  ? 'webp'
    : contentType.includes('png')   ? 'png'
    : 'jpg'

  const filename = `brandai-${Date.now()}.${ext}`

  return new NextResponse(res.body, {
    headers: {
      'Content-Type':        contentType,
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
