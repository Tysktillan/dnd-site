import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'official' or 'personal'

    // Build where clause based on type and user role
    type WhereClause = {
      type?: string;
      OR?: Array<{
        createdBy?: string;
        type?: string;
        isPublic?: boolean;
      }>;
    };

    const where: WhereClause = {};

    if (type === 'official') {
      // Official quests - visible to all
      where.type = 'official';
    } else if (type === 'personal') {
      // Personal quests - user's own + public ones from others
      where.OR = [
        { createdBy: session.user.id }, // User's own quests
        { type: 'personal', isPublic: true } // Public personal quests
      ];
    } else {
      // All quests user can see
      where.OR = [
        { type: 'official' }, // All official quests
        { createdBy: session.user.id }, // User's own personal quests
        { type: 'personal', isPublic: true } // Public personal quests
      ];
    }

    const quests = await prisma.quest.findMany({
      where,
      include: {
        User: {
          select: {
            id: true,
            name: true,
          }
        }
      },
      orderBy: [
        { status: 'asc' }, // Active first, then completed/failed
        { createdAt: 'desc' }
      ]
    });

    return NextResponse.json(quests);
  } catch (error) {
    console.error("Error fetching quests:", error);
    return NextResponse.json(
      { error: "Failed to fetch quests" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    const quest = await prisma.quest.create({
      data: {
        id: crypto.randomUUID(),
        title: data.title,
        description: data.description || null,
        type: data.type || 'personal',
        status: 'active',
        priority: data.priority || 'normal',
        isPublic: data.isPublic ?? false,
        reward: data.reward || null,
        isTimeSensitive: data.isTimeSensitive ?? false,
        timeConstraint: data.timeConstraint || null,
        createdBy: session.user.id,
        updatedAt: new Date(),
      },
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
    console.error("Error creating quest:", error);
    return NextResponse.json(
      { error: "Failed to create quest" },
      { status: 500 }
    );
  }
}
