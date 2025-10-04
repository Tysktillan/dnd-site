import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const items = await prisma.magicalItem.findMany({
      where: { isActive: true },
      orderBy: [
        { slot: 'asc' },
        { name: 'asc' }
      ]
    });

    return NextResponse.json(items);
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
        name: data.name,
        slot: data.slot,
        rarity: data.rarity,
        stats: data.stats || null,
        description: data.description || null,
        imageUrl: data.imageUrl || null,
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
