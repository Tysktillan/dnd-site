import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const { searchParams } = new URL(request.url);
    const playerId = searchParams.get('playerId');

    // DM sees all items
    if (session?.user?.role === 'dm') {
      const items = await prisma.magicalItem.findMany({
        where: { isActive: true },
        orderBy: [
          { slot: 'asc' },
          { name: 'asc' }
        ]
      });
      return NextResponse.json(items);
    }

    // Players only see published items that are visible to them
    const items = await prisma.magicalItem.findMany({
      where: {
        isActive: true,
        isPublished: true
      },
      orderBy: [
        { slot: 'asc' },
        { name: 'asc' }
      ]
    });

    // Filter items based on player visibility
    const filteredItems = playerId
      ? items.filter(item => {
          if (!item.visibleToPlayerIds) return true; // No restriction means visible to all
          const visibleIds = item.visibleToPlayerIds.split(',').map(id => id.trim());
          return visibleIds.includes(playerId);
        })
      : items.filter(item => !item.visibleToPlayerIds); // Only show unrestricted items if no playerId

    return NextResponse.json(filteredItems);
  } catch (error) {
    console.error("Error fetching items:", error);
    return NextResponse.json(
      { error: "Failed to fetch items" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'dm') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    const item = await prisma.magicalItem.create({
      data: {
        id: crypto.randomUUID(),
        name: data.name,
        slot: data.slot,
        rarity: data.rarity,
        stats: data.stats || null,
        description: data.description || null,
        imageUrl: data.imageUrl || null,
        isPublished: data.isPublished ?? false,
        visibleToPlayerIds: data.visibleToPlayerIds || null,
        updatedAt: new Date(),
      }
    });

    return NextResponse.json(item);
  } catch (error) {
    console.error("Error creating item:", error);
    return NextResponse.json(
      { error: "Failed to create item" },
      { status: 500 }
    );
  }
}
