import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'dm') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId, playerId } = await request.json();

    // Link the character to the user
    await prisma.user.update({
      where: { id: userId },
      data: { playerId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error linking character:", error);
    return NextResponse.json(
      { error: "Failed to link character" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'dm') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = await request.json();

    // Unlink the character from the user
    await prisma.user.update({
      where: { id: userId },
      data: { playerId: null }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error unlinking character:", error);
    return NextResponse.json(
      { error: "Failed to unlink character" },
      { status: 500 }
    );
  }
}
