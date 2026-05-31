import { type NextRequest, NextResponse } from 'next/server'

const R2_PUBLIC_URL = process.env['R2_PUBLIC_URL'] ?? ''

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url')

  if (!url) {
    return NextResponse.json({ error: 'Missing url param' }, { status: 400 })
  }

  if (R2_PUBLIC_URL && !url.startsWith(R2_PUBLIC_URL)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  let res: Response
  try {
    res = await fetch(url)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch caption' }, { status: 502 })
  }

  if (!res.ok) {
    return NextResponse.json({ error: 'Caption not found' }, { status: 404 })
  }

  const text = await res.text()
  return new NextResponse(text, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
