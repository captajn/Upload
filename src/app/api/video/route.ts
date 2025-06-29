import { NextResponse } from 'next/server'
import { getFullApiUrl } from '@/config/env.config'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Missing video ID' }, { status: 400 })
    }

    // Lấy thông tin video từ SharePoint
    const response = await fetch(getFullApiUrl(`sharepoint/file/${id}`))
    if (!response.ok) {
      throw new Error('Failed to fetch video info')
    }

    const data = await response.json()

    // Kiểm tra nếu là video HLS
    const isHLS = data.url.includes('.m3u8')

    return NextResponse.json({
      ...data,
      isHLS,
      type: isHLS ? 'hls' : 'normal'
    })

  } catch (error) {
    console.error('Error fetching video:', error)
    return NextResponse.json(
      { error: 'Failed to fetch video' },
      { status: 500 }
    )
  }
} 