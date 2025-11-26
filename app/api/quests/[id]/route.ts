import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const data = await request.json();

    // Get the quest to check ownership
    const existingQuest = await prisma.quest.findUnique({
      where: { id }
    });

    if (!existingQuest) {
      return NextResponse.json({ error: "Quest not found" }, { status: 404 });
    }

    // Only creator or DM can update the quest
    if (existingQuest.createdBy !== session.user.id && session.user.role !== 'dm') {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updateData: any = {
      updatedAt: new Date(),
    };

    // Update fields if provided
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.status !== undefined) {
      updateData.status = data.status;
      // Set completedAt when status changes to completed
      if (data.status === 'completed' && !existingQuest.completedAt) {
        updateData.completedAt = new Date();
      } else if (data.status !== 'completed') {
        updateData.completedAt = null;
      }
    }
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.isPublic !== undefined) updateData.isPublic = data.isPublic;
    if (data.reward !== undefined) updateData.reward = data.reward;

    const quest = await prisma.quest.update({
      where: { id },
      data: updateData,
      include: {
        User: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    });

    return NextResponse.json(quest);
  } catch (error) {
    console.error("Error updating quest:", error);
    return NextResponse.json(
      { error: "Failed to update quest" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Get the quest to check ownership
    const existingQuest = await prisma.quest.findUnique({
      where: { id }
    });

    if (!existingQuest) {
      return NextResponse.json({ error: "Quest not found" }, { status: 404 });
    }

    // Only creator or DM can delete the quest
    if (existingQuest.createdBy !== session.user.id && session.user.role !== 'dm') {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.quest.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting quest:", error);
    return NextResponse.json(
      { error: "Failed to delete quest" },
      { status: 500 }
    );
  }
}
