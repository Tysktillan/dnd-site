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

    // Create the character
    const character = await prisma.player.create({
      data: {
        name: data.name,
        className: data.className,
        race: data.race,
        level: data.level,
        maxHp: data.maxHp || 10,
        currentHp: data.currentHp || data.maxHp || 10,
        armorClass: data.armorClass || 10,
        proficiency: Math.ceil(data.level / 4) + 1, // Calculate proficiency bonus
        speed: data.speed || 30,
        strength: data.strength || 10,
        dexterity: data.dexterity || 10,
        constitution: data.constitution || 10,
        intelligence: data.intelligence || 10,
        wisdom: data.wisdom || 10,
        charisma: data.charisma || 10,
        background: data.background,
        alignment: data.alignment,
      }
    });

    // If userId is provided, link the character to the user
    if (data.userId) {
      await prisma.user.update({
        where: { id: data.userId },
        data: { playerId: character.id }
      });
    }

    return NextResponse.json(character);
  } catch (error) {
    console.error("Error creating character:", error);
    return NextResponse.json(
      { error: "Failed to create character" },
      { status: 500 }
    );
  }
}
