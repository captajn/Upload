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
      console.error('Missing env vars:', { domain, sitePath })
      throw new Error('Thiếu thông tin domain hoặc site path')
    }

    // Loại bỏ dấu / ở đầu và cuối nếu có
    const cleanSitePath = sitePath.replace(/^\/+|\/+$/g, '')
    
    // URL format: https://graph.microsoft.com/v1.0/sites/{hostname}:/{site-path}
    const url = `https://graph.microsoft.com/v1.0/sites/${domain}:/${cleanSitePath}`
    
    console.log('Calling SharePoint API:', url)
    
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${await getAccessToken()}`,
        Accept: 'application/json'
      }
    })

    console.log('SharePoint API Response:', response.data)

    if (response.data && response.data.id) {
      return response.data.id
    }
    
    throw new Error('Không tìm thấy site ID trong response')

  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('SharePoint API Error Details:', {
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers
        }
      })
    } else {
      console.error('SharePoint API Error:', error)
    }
    throw new Error(`Lỗi khi lấy site ID: ${error instanceof Error ? error.message : 'Unknown error'}`)
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

    console.log('Drive Info:', response.data)

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
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg', 
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml'
  }
  return contentTypes[ext] || 'application/octet-stream'
}

// API Routes
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    
    // Xử lý proxy-file nếu có query parameter
    if (url.searchParams.has('proxy-file')) {
      const filePath = url.searchParams.get('proxy-file')
      if (!filePath) {
        return new Response('Missing file path', { status: 400 })
      }

      const [driveId, itemId, fileName] = filePath.split('/')
      
      if (!driveId || !itemId || !fileName) {
        return new Response('Invalid file path', { status: 400 })
      }

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
      const contentType = getContentType(fileName)
      
      return new Response(fileBuffer, {
        headers: {
          'Content-Type': contentType,
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
    
    // Xử lý upload file
    if (url.searchParams.has('upload')) {
      const formData = await request.formData()
      const file = formData.get('file') as File
      
      if (!file) {
        return new Response(JSON.stringify({ error: 'Không có file được tải lên' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      console.log('Uploading file:', {
        name: file.name,
        type: file.type,
        size: file.size
      })

      const accessToken = await getAccessToken()
      const siteId = await getSiteId()
      const driveId = await getDriveId(accessToken, siteId)

      // Upload file vào thư mục Images
      const uploadRes = await fetch(
        `https://graph.microsoft.com/v1.0/drives/${driveId}/root:/Images/${file.name}:/content`,
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
        console.error('Upload error response:', errorText)
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
      console.log('Upload success:', result)

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