interface SharePointClient {
  downloadFile(imagePath: string): Promise<Response>
  uploadFile(file: File): Promise<{
    id: string
    webUrl: string
    parentReference: {
      driveId: string
    }
  }>
}

export async function getSharePointClient(): Promise<SharePointClient> {
  // Lấy access token từ API
  const baseUrl = typeof window === 'undefined' 
    ? 'http://localhost:3000' // Server-side
    : window.location.origin; // Client-side
    
  const response = await fetch(`${baseUrl}/api/sharepoint`)
  if (!response.ok) {
    throw new Error('Không thể lấy thông tin xác thực SharePoint')
  }

  const { accessToken, driveId } = await response.json()
  if (!accessToken || !driveId) {
    throw new Error('Thiếu thông tin xác thực SharePoint')
  }

  return {
    async downloadFile(imagePath: string): Promise<Response> {
      const sharePointUrl = `https://taikhoandev.sharepoint.com/sites/allcompany/Shared%20Documents/Image/${imagePath}`
      
      return fetch(sharePointUrl, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })
    },

    async uploadFile(file: File) {
      // Tạo file trống trước
      const fileName = encodeURIComponent(file.name)
      const createFileUrl = `https://graph.microsoft.com/v1.0/drives/${driveId}/items/root:/Image/${fileName}:/content`
      
      // Upload file
      const buffer = await file.arrayBuffer()
      const response = await fetch(createFileUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': file.type
        },
        body: buffer
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`Upload failed: ${error}`)
      }

      const result = await response.json()
      if (!result.id || !result.webUrl || !result.parentReference?.driveId) {
        throw new Error('Invalid response from SharePoint API')
      }

      return result
    }
  }
} 