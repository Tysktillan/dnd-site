import { NextResponse } from 'next/server'
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        // You can add authentication here if needed
        return {
          allowedContentTypes: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/webm', 'audio/x-m4a'],
          tokenPayload: JSON.stringify({}),
        }
      },
      onUploadCompleted: async () => {
        // Optional: Do something after upload completes
      },
    })

    return NextResponse.json(jsonResponse)
  } catch (error) {
    console.error('Token generation error:', error)
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    )
  }
}
