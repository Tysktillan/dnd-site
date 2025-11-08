import { NextResponse } from 'next/server'
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname: string) => {
        // Validate file type from pathname
        const ext = pathname.split('.').pop()?.toLowerCase()
        const audioExtensions = ['mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac', 'wma']

        if (!ext || !audioExtensions.includes(ext)) {
          throw new Error('Invalid file type. Only audio files are allowed.')
        }

        return {
          allowedContentTypes: ['audio/*'],
          tokenPayload: JSON.stringify({}),
        }
      },
      onUploadCompleted: async ({ blob }) => {
        console.log('Upload completed:', blob.url)
      },
    })

    return NextResponse.json(jsonResponse)
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload file' },
      { status: 400 }
    )
  }
}
