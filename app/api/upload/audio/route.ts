import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'

// Increase timeout for large file uploads
export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const filename = searchParams.get('filename')

    if (!filename) {
      return NextResponse.json({ error: 'Filename is required' }, { status: 400 })
    }

    // Get the file as a blob from the request body
    const blob = await request.blob()

    if (!blob || blob.size === 0) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Upload to Vercel Blob
    const uploadedBlob = await put(filename, blob, {
      access: 'public',
    })

    // Return blob URL
    return NextResponse.json({ url: uploadedBlob.url })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
  }
}
