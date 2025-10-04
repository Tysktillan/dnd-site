import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { put, del } from '@vercel/blob';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    // Allow both DM and authenticated players to upload
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const oldUrl = formData.get('oldUrl') as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Delete old blob if URL is provided and it's a Vercel Blob URL
    if (oldUrl && oldUrl.includes('vercel-storage.com')) {
      try {
        await del(oldUrl);
      } catch (error) {
        console.error("Error deleting old blob:", error);
        // Continue with upload even if deletion fails
      }
    }

    // Upload to Vercel Blob
    // Determine folder based on file type
    const folder = file.type.startsWith('image/') ? 'images' : 'items';
    const blob = await put(`${folder}/${Date.now()}-${file.name}`, file, {
      access: 'public',
    });

    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
