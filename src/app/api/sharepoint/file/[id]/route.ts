import { NextRequest, NextResponse } from 'next/server'
import { getFullApiUrl } from '@/config/env.config'

type Context = {
  params: Promise<{ id: string }>
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest, context: Context) {
  try {
    const params = await context.params
    const { id } = params

    // Lấy access token từ SharePoint API
    const tokenRes = await fetch(getFullApiUrl('sharepoint'), { cache: 'no-store' })
    if (!tokenRes.ok) {
      throw new Error('Failed to get SharePoint access token')
    }

    // Lấy access token từ response
    const tokenData = await tokenRes.json()
    const accessToken = tokenData.accessToken

    // Lấy site ID
    const domain = process.env.NEXT_PUBLIC_SHAREPOINT_DOMAIN
    const sitePath = process.env.NEXT_PUBLIC_SITE_PATH
    if (!domain || !sitePath) {
      throw new Error('Missing SharePoint configuration')
    }

    const cleanSitePath = sitePath.replace(/^\/+|\/+$/g, '')
    const siteRes = await fetch(
      `https://graph.microsoft.com/v1.0/sites/${domain}:/${cleanSitePath}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json'
        },
        cache: 'no-store'
      }
    )

    if (!siteRes.ok) {
      throw new Error('Failed to get site info')
    }

    const siteData = await siteRes.json()
    
    // Lấy drive ID
    const driveRes = await fetch(
      `https://graph.microsoft.com/v1.0/sites/${siteData.id}/drive`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json'
        },
        cache: 'no-store'
      }
    )

    if (!driveRes.ok) {
      throw new Error('Failed to get drive info')
    }

    const driveData = await driveRes.json()
    const driveId = driveData.id

    // Lấy thông tin file từ SharePoint Graph API
    const fileRes = await fetch(
      `https://graph.microsoft.com/v1.0/drives/${driveId}/items/${id}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json'
        },
        cache: 'no-store'
      }
    )

    if (!fileRes.ok) {
      throw new Error('Failed to fetch file info')
    }

    const data = await fileRes.json()
    console.log('SharePoint response:', data)

    // Tạo proxy URL cho file
    const protocol = request.headers.get('x-forwarded-proto') || 'http'
    const host = request.headers.get('host') || 'localhost:3000'
    const baseUrl = `${protocol}://${host}`
    const proxyUrl = `${baseUrl}/api/sharepoint?proxy-file=${driveId}/${id}/${data.name}`

    // Trả về dữ liệu đã được format
    const fileInfo = {
      url: proxyUrl,
      publicUrl: proxyUrl,
      name: data.name || 'Unknown file',
      type: data.file?.mimeType || 'video/mp4',
      isHLS: false
    }

    console.log('Formatted file info:', fileInfo)
    return NextResponse.json(fileInfo)

  } catch (error) {
    console.error('Error fetching file:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 