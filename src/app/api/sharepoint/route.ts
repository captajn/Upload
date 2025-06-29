import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'
import path from 'path'

export const maxDuration = 30 // Tối đa 30 giây cho mỗi request
export const dynamic = 'force-dynamic' // Không cache API route

interface SharePointConfig {
  tenantId: string
  clientId: string
  clientSecret: string
  sitePath: string
  domain: string
}

interface DriveQuota {
  name: string
  used: number
  total: number
  remaining: number
  usedGB: string
  totalGB: string
  remainingGB: string
  percentage: number
}

// Cache token trong 55 phút (token hết hạn sau 1 giờ)
let cachedToken: string | null = null
let tokenExpiry: number = 0

// Utility functions
async function getAccessToken() {
  const now = Date.now()
  
  if (cachedToken && now < tokenExpiry) {
    return cachedToken
  }

  const config: SharePointConfig = {
    tenantId: process.env.NEXT_PUBLIC_TENANT_ID || '',
    clientId: process.env.NEXT_PUBLIC_CLIENT_ID || '',
    clientSecret: process.env.SHAREPOINT_CLIENT_SECRET || '',
    sitePath: process.env.NEXT_PUBLIC_SITE_PATH || '',
    domain: process.env.NEXT_PUBLIC_SHAREPOINT_DOMAIN || ''
  }

  const tokenEndpoint = `https://login.microsoftonline.com/${config.tenantId}/oauth2/v2.0/token`
  const scope = 'https://graph.microsoft.com/.default'

  const params = new URLSearchParams()
  params.append('grant_type', 'client_credentials')
  params.append('client_id', config.clientId)
  params.append('client_secret', config.clientSecret)
  params.append('scope', scope)

  const response = await axios.post(tokenEndpoint, params)
  const token = response.data.access_token

  cachedToken = token
  tokenExpiry = now + 55 * 60 * 1000 // 55 phút

  return token
}

async function getSiteId() {
  try {
    const domain = process.env.NEXT_PUBLIC_SHAREPOINT_DOMAIN
    const sitePath = process.env.NEXT_PUBLIC_SITE_PATH

    if (!domain || !sitePath) {
      throw new Error('Thiếu thông tin domain hoặc site path')
    }

    const cleanSitePath = sitePath.replace(/^\/+|\/+$/g, '')
    const url = `https://graph.microsoft.com/v1.0/sites/${domain}:/${cleanSitePath}`
    
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${await getAccessToken()}`,
        Accept: 'application/json'
      }
    })

    if (response.data && response.data.id) {
      return response.data.id
    }
    
    throw new Error('Không tìm thấy site ID trong response')

  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('SharePoint API Error:', {
        status: error.response?.status,
        data: error.response?.data
      })
    } else {
      console.error('SharePoint API Error:', error)
    }
    throw error
  }
}

async function getDriveId(accessToken: string, siteId: string) {
  try {
    const response = await axios.get(
      `https://graph.microsoft.com/v1.0/sites/${siteId}/drive`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json'
        }
      }
    )

    if (!response.data || !response.data.id) {
      throw new Error('Không tìm thấy drive ID')
    }

    return response.data.id
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('SharePoint Drive API Error:', {
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers,
        config: {
          url: error.config?.url,
          method: error.config?.method
        }
      })
    }
    throw error
  }
}

async function getDriveQuota(accessToken: string, siteId: string): Promise<DriveQuota[]> {
  try {
    const response = await axios.get(
      `https://graph.microsoft.com/v1.0/sites/${siteId}/drives`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    )

    const drive = response.data.value[0]
    const quota = drive.quota
    const used = quota.used || 0
    const total = quota.total || 0
    const remaining = quota.remaining || 0
    const percentage = total > 0 ? Math.round((used / total) * 100) : 0

    // Chỉ trả về một đối tượng duy nhất cho Documents vì SharePoint chỉ có một drive
    return [{
      name: 'Documents',
      used,
      total,
      remaining,
      usedGB: (used / (1024 * 1024 * 1024)).toFixed(2),
      totalGB: (total / (1024 * 1024 * 1024)).toFixed(2),
      remainingGB: (remaining / (1024 * 1024 * 1024)).toFixed(2),
      percentage
    }]
  } catch (error) {
    console.error('Error fetching drive quota:', error)
    return [{
      name: "Documents",
      used: 0,
      total: 25600 * 1024 * 1024 * 1024, // 25TB mặc định nếu có lỗi
      remaining: 25600 * 1024 * 1024 * 1024,
      usedGB: "0",
      totalGB: "25600",
      remainingGB: "25600",
      percentage: 0
    }]
  }
}

function getContentType(fileName: string): string {
  const ext = path.extname(fileName).toLowerCase()
  const contentTypes: Record<string, string> = {
    // Images
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg', 
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    
    // Documents
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    
    // Spreadsheets
    '.xls': 'application/vnd.ms-excel',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    
    // Presentations
    '.ppt': 'application/vnd.ms-powerpoint',
    '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    
    // Archives
    '.zip': 'application/zip',
    '.rar': 'application/x-rar-compressed',
    '.7z': 'application/x-7z-compressed',
    
    // Text
    '.txt': 'text/plain',
    '.csv': 'text/csv',
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css'
  }
  return contentTypes[ext] || 'application/octet-stream'
}

// Thêm hàm xử lý streaming
async function handleStreamingRequest(request: Request, driveId: string, itemId: string, fileName: string) {
  const accessToken = await getAccessToken()
  const range = request.headers.get('range')
  
  // Lấy thông tin file
  const fileInfo = await fetch(
    `https://graph.microsoft.com/v1.0/drives/${driveId}/items/${itemId}`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    }
  ).then(res => res.json())

  const fileSize = fileInfo.size
  const contentType = getContentType(fileName)

  if (!range) {
    // Nếu không có range header, trả về toàn bộ file
    const fileRes = await fetch(
      `https://graph.microsoft.com/v1.0/drives/${driveId}/items/${itemId}/content`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    )

    if (!fileRes.ok) {
      throw new Error('Không thể tải file')
    }

    return new Response(fileRes.body, {
      headers: {
        'Content-Type': contentType,
        'Content-Length': fileSize.toString(),
        'Accept-Ranges': 'bytes',
        'Content-Disposition': `inline; filename="${fileName}"`,
        'Cache-Control': 'public, max-age=3600'
      }
    })
  }

  // Xử lý range request cho video streaming
  const start = Number(range.replace(/bytes=/, '').split('-')[0])
  const end = Math.min(start + 1024 * 1024, fileSize - 1) // Stream 1MB chunks
  const contentLength = end - start + 1

  const fileRes = await fetch(
    `https://graph.microsoft.com/v1.0/drives/${driveId}/items/${itemId}/content`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Range': `bytes=${start}-${end}`
      }
    }
  )

  if (!fileRes.ok) {
    throw new Error('Không thể tải file')
  }

  return new Response(fileRes.body, {
    status: 206,
    headers: {
      'Content-Type': contentType,
      'Content-Length': contentLength.toString(),
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Disposition': `inline; filename="${fileName}"`,
      'Cache-Control': 'no-cache'
    }
  })
}

// API Routes
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    
    if (url.searchParams.has('proxy-file')) {
      const filePath = url.searchParams.get('proxy-file')
      if (!filePath) {
        return new Response('Missing file path', { status: 400 })
      }

      const [driveId, itemId, fileName] = filePath.split('/')
      
      if (!driveId || !itemId || !fileName) {
        return new Response('Invalid file path', { status: 400 })
      }

      const contentType = getContentType(fileName)
      const isStreamable = contentType.startsWith('video/') || contentType.startsWith('audio/')
      
      // Nếu là video/audio hoặc có range header, xử lý streaming
      if (isStreamable || request.headers.get('range')) {
        return handleStreamingRequest(request, driveId, itemId, fileName)
      }

      // Các file khác xử lý download bình thường
      const accessToken = await getAccessToken()
      const fileRes = await fetch(
        `https://graph.microsoft.com/v1.0/drives/${driveId}/items/${itemId}/content`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      )

      if (!fileRes.ok) {
        const errorText = await fileRes.text()
        let errorMessage = 'Lỗi SharePoint API'
        try {
          const errorJson = JSON.parse(errorText)
          errorMessage = errorJson.error?.message || errorText
        } catch {
          errorMessage = errorText
        }
        throw new Error(errorMessage)
      }

      const fileBuffer = await fileRes.arrayBuffer()
      
      return new Response(fileBuffer, {
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `attachment; filename="${fileName}"`,
          'Cache-Control': 'public, max-age=3600',
          'ETag': `"${driveId}_${itemId}"`,
          'Access-Control-Allow-Origin': '*'
        }
      })
    }

    // Default GET route - trả về thông tin SharePoint
    const accessToken = await getAccessToken()
    
    try {
      const siteId = await getSiteId()
      const quotas = await getDriveQuota(accessToken, siteId)

      return NextResponse.json({
        quotas
      }, {
        headers: {
          'Cache-Control': 'no-store'
        }
      })
    } catch (error) {
      console.error('SharePoint API error:', error)
      // Trả về dữ liệu mẫu khi có lỗi SharePoint API
      return NextResponse.json({
        quotas: [{
          name: "Documents",
          used: 0,
          total: 25600 * 1024 * 1024 * 1024,
          remaining: 25600 * 1024 * 1024 * 1024,
          usedGB: "0",
          totalGB: "25600",
          remainingGB: "25600",
          percentage: 0
        }]
      }, {
        headers: {
          'Cache-Control': 'no-store'
        }
      })
    }
  } catch (error: unknown) {
    console.error('Token error:', error)
    return NextResponse.json({
      error: 'Lỗi xác thực',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { 
      status: 401,
      headers: {
        'Cache-Control': 'no-store'
      }
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url)
    
    if (url.searchParams.has('upload')) {
      const formData = await request.formData()
      const file = formData.get('file') as File
      const folder = formData.get('folder') as string
      
      if (!file) {
        return new Response(JSON.stringify({ error: 'Không có file được tải lên' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      if (!folder) {
        return new Response(JSON.stringify({ error: 'Không có thông tin folder' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      const accessToken = await getAccessToken()
      const siteId = await getSiteId()
      const driveId = await getDriveId(accessToken, siteId)

      // Sử dụng folder được chọn thay vì hardcode 'Images'
      const uploadRes = await fetch(
        `https://graph.microsoft.com/v1.0/drives/${driveId}/root:/${folder}/${file.name}:/content`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': file.type
          },
          body: file
        }
      )

      if (!uploadRes.ok) {
        const errorText = await uploadRes.text()
        let errorMessage = 'Lỗi khi tải file lên SharePoint'
        try {
          const errorJson = JSON.parse(errorText)
          errorMessage = errorJson.error?.message || errorText
        } catch {
          errorMessage = errorText
        }
        throw new Error(errorMessage)
      }

      const result = await uploadRes.json()

      return new Response(JSON.stringify({
        url: result.webUrl,
        itemId: result.id,
        driveId: result.parentReference.driveId,
        name: file.name
      }), {
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store'
        }
      })
    }

    // Xử lý tạo public link
    if (url.searchParams.has('create-link')) {
      const { itemId, driveId } = await request.json()
      
      if (!itemId || !driveId) {
        return new Response(JSON.stringify({ 
          error: 'Thiếu itemId hoặc driveId' 
        }), { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      const accessToken = await getAccessToken()

      const fileRes = await fetch(
        `https://graph.microsoft.com/v1.0/drives/${driveId}/items/${itemId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      )

      if (!fileRes.ok) {
        const errorText = await fileRes.text()
        let errorMessage = 'Lỗi SharePoint API'
        try {
          const errorJson = JSON.parse(errorText)
          errorMessage = errorJson.error?.message || errorText
        } catch {
          errorMessage = errorText
        }
        throw new Error(errorMessage)
      }

      const fileData = await fileRes.json()
      
      const protocol = request.headers.get('x-forwarded-proto') || 'http'
      const host = request.headers.get('host') || 'localhost:3000'
      const baseUrl = `${protocol}://${host}`
      
      const fileName = fileData.name
      const proxyUrl = `${baseUrl}/api/sharepoint?proxy-file=${driveId}/${itemId}/${fileName}`
      
      return new Response(JSON.stringify({
        publicUrl: proxyUrl,
        originalUrl: fileData.webUrl,
        name: fileName
      }), {
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store'
        }
      })
    }

    return new Response('Invalid endpoint', { status: 404 })

  } catch (error) {
    console.error('API Error:', error)
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
} 