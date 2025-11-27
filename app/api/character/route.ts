import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if requesting secondary character
    const { searchParams } = new URL(request.url);
    const isSecondary = searchParams.get('secondary') === 'true';

    // Get the user's player character
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    const playerId = isSecondary ? user?.secondaryPlayerId : user?.playerId;

    if (!playerId) {
      return NextResponse.json({ error: "No character found" }, { status: 404 });
    }

    const player = await prisma.player.findUnique({
      where: { id: playerId }
    });

    if (!player) {
      return NextResponse.json({ error: "No character found" }, { status: 404 });
    }

    return NextResponse.json(player);
  } catch (error) {
    console.error("Error fetching character:", error);
    return NextResponse.json(
      { error: "Failed to fetch character" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    // Get the user's player characters
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user?.playerId && !user?.secondaryPlayerId) {
      return NextResponse.json({ error: "No character found" }, { status: 404 });
    }

    // Validate that the character being updated belongs to this user
    const characterId = data.id;
    if (characterId !== user.playerId && characterId !== user.secondaryPlayerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Update the character
    const updatedCharacter = await prisma.player.update({
      where: { id: characterId },
      data: {
        name: data.name,
        className: data.className,
        className2: data.className2,
        subclass: data.subclass,
        subclass2: data.subclass2,
        race: data.race,
        level: data.level,
        level2: data.level2,
        currentHp: data.currentHp,
        maxHp: data.maxHp,
        armorClass: data.armorClass,
        proficiency: data.proficiency,
        speed: data.speed,
        inspiration: data.inspiration,
        strength: data.strength,
        dexterity: data.dexterity,
        constitution: data.constitution,
        intelligence: data.intelligence,
        wisdom: data.wisdom,
        charisma: data.charisma,
        background: data.background,
        alignment: data.alignment,
        equipment: data.equipment,
        features: data.features,
        spells: data.spells,
        notes: data.notes,
        avatarUrl: data.avatarUrl,
        backgroundUrl: data.backgroundUrl,
        skillProficiencies: data.skillProficiencies,
        jackOfAllTrades: data.jackOfAllTrades,
      }
    });

    return NextResponse.json(updatedCharacter);
  } catch (error) {
    console.error("Error updating character:", error);
    return NextResponse.json(
      { error: "Failed to update character" },
      { status: 500 }
    );
  }
}
