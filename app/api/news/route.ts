import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'dm') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    const post = await prisma.newsPost.create({
      data: {
        id: crypto.randomUUID(),
        title: data.title,
        excerpt: data.excerpt,
        content: data.content,
        audioUrl: data.audioUrl || null,
        isPublished: false,
        updatedAt: new Date(),
      }
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
}
