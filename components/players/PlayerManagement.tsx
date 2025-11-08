'use client'

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Player } from "@prisma/client";
import { UserPlus, Trash2, Save, X } from "lucide-react";
import { useRouter } from "next/navigation";

type UserWithPlayer = User & {
  player: Player | null;
  secondaryPlayer: Player | null;
};

interface PlayerManagementProps {
  players: UserWithPlayer[];
  allCharacters: Player[];
}

export default function PlayerManagement({ players: initialPlayers, allCharacters: initialCharacters }: PlayerManagementProps) {
  const router = useRouter();
  const [creatingCharacter, setCreatingCharacter] = useState<string | false>(false);
  const [newCharacter, setNewCharacter] = useState({
    name: '',
    className: '',
    race: '',
    level: 1,
  });

  const handleCreateCharacter = async (userId: string) => {
    try {
      const response = await fetch('/api/players/characters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newCharacter,
          userId
        })
      });

      if (!response.ok) throw new Error('Failed to create character');

      setCreatingCharacter(false);
      setNewCharacter({ name: '', className: '', race: '', level: 1 });
      router.refresh();
    } catch (error) {
      console.error('Error creating character:', error);
      alert('Failed to create character');
    }
  };

  const handleLinkCharacter = async (userId: string, playerId: string, isSecondary = false) => {
    try {
      const response = await fetch('/api/players/link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, playerId, isSecondary })
      });

      if (!response.ok) throw new Error('Failed to link character');

      router.refresh();
    } catch (error) {
      console.error('Error linking character:', error);
      alert('Failed to link character');
    }
  };

  const handleUnlinkCharacter = async (userId: string, isSecondary = false) => {
    try {
      const response = await fetch('/api/players/link', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, isSecondary })
      });

      if (!response.ok) throw new Error('Failed to unlink character');

      router.refresh();
    } catch (error) {
      console.error('Error unlinking character:', error);
      alert('Failed to unlink character');
    }
  };

  const handleDeleteCharacter = async (playerId: string) => {
    if (!confirm('Are you sure you want to delete this character?')) return;

    try {
      const response = await fetch(`/api/players/characters/${playerId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete character');

      router.refresh();
    } catch (error) {
      console.error('Error deleting character:', error);
      alert('Failed to delete character');
    }
  };

  // Get unlinked characters
  const linkedCharacterIds = [
    ...initialPlayers.map(p => p.playerId).filter(Boolean),
    ...initialPlayers.map(p => p.secondaryPlayerId).filter(Boolean)
  ];
  const unlinkedCharacters = initialCharacters.filter(c => !linkedCharacterIds.includes(c.id));

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl md:text-xl md:text-2xl lg:text-3xl lg:text-4xl font-black tracking-tighter mb-2">
          <span className="bg-gradient-to-b from-stone-100 via-stone-300 to-red-900 bg-clip-text text-transparent">
            Player Management
          </span>
        </h1>
        <p className="text-stone-400">Manage player accounts and their characters</p>
      </div>

      <div className="space-y-4">
        {initialPlayers.map((player) => (
          <Card key={player.id} className="p-6 bg-stone-950/90 backdrop-blur-xl border-stone-900">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-stone-100">{player.name}</h3>
                    <p className="text-sm text-stone-500">@{player.username}</p>
                  </div>
                </div>

                {player.player ? (
                  <div className="bg-black/30 border border-stone-800 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="text-lg font-semibold text-stone-200">{player.player.name}</h4>
                        <p className="text-sm text-stone-400">
                          Level {player.player.level} {player.player.race} {player.player.className}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleUnlinkCharacter(player.id)}
                          className="text-stone-400 hover:text-stone-200"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteCharacter(player.player!.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-stone-500">HP:</span>{' '}
                        <span className="text-stone-200">{player.player.currentHp ?? player.player.maxHp}/{player.player.maxHp}</span>
                      </div>
                      <div>
                        <span className="text-stone-500">AC:</span>{' '}
                        <span className="text-stone-200">{player.player.armorClass ?? 10}</span>
                      </div>
                      <div>
                        <span className="text-stone-500">Speed:</span>{' '}
                        <span className="text-stone-200">{player.player.speed} ft.</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-stone-500">No primary character assigned</p>

                    {creatingCharacter === player.id ? (
                      <div className="bg-black/30 border border-stone-800 rounded-lg p-4 space-y-3">
                        <div>
                          <Label className="text-xs text-stone-400 mb-1 block">Character Name</Label>
                          <Input
                            value={newCharacter.name}
                            onChange={(e) => setNewCharacter(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Character Name"
                            className="bg-stone-900 border-stone-800 text-stone-100"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs text-stone-400 mb-1 block">Race</Label>
                            <Input
                              value={newCharacter.race}
                              onChange={(e) => setNewCharacter(prev => ({ ...prev, race: e.target.value }))}
                              placeholder="e.g., Male Grung"
                              className="bg-stone-900 border-stone-800 text-stone-100"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-stone-400 mb-1 block">Class</Label>
                            <Input
                              value={newCharacter.className}
                              onChange={(e) => setNewCharacter(prev => ({ ...prev, className: e.target.value }))}
                              placeholder="e.g., Rogue 2 / Bard 3"
                              className="bg-stone-900 border-stone-800 text-stone-100"
                            />
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs text-stone-400 mb-1 block">Level</Label>
                          <Input
                            type="number"
                            value={newCharacter.level}
                            onChange={(e) => setNewCharacter(prev => ({ ...prev, level: parseInt(e.target.value) || 1 }))}
                            className="bg-stone-900 border-stone-800 text-stone-100"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleCreateCharacter(player.id)}
                            className="bg-red-950 hover:bg-red-900 border border-red-900/50 text-stone-100"
                          >
                            <Save className="h-4 w-4 mr-2" />
                            Create
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setCreatingCharacter(false);
                              setNewCharacter({ name: '', className: '', race: '', level: 1 });
                            }}
                            className="text-stone-400 hover:text-stone-200"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => setCreatingCharacter(player.id)}
                          className="bg-red-950 hover:bg-red-900 border border-red-900/50 text-stone-100"
                        >
                          <UserPlus className="h-4 w-4 mr-2" />
                          Create New Character
                        </Button>

                        {unlinkedCharacters.length > 0 && (
                          <select
                            onChange={(e) => {
                              if (e.target.value) {
                                handleLinkCharacter(player.id, e.target.value);
                                e.target.value = '';
                              }
                            }}
                            className="px-3 py-2 bg-stone-900 border border-stone-800 rounded-lg text-sm text-stone-300 hover:bg-stone-800 transition-colors"
                          >
                            <option value="">Link Existing Character...</option>
                            {unlinkedCharacters.map((char) => (
                              <option key={char.id} value={char.id}>
                                {char.name} (Lvl {char.level} {char.race} {char.className})
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Secondary Character */}
                <div className="mt-4">
                  <h5 className="text-sm font-semibold text-stone-400 mb-2">Secondary Character (Optional)</h5>
                  {player.secondaryPlayer ? (
                    <div className="bg-black/30 border border-stone-800 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="text-lg font-semibold text-stone-200">{player.secondaryPlayer.name}</h4>
                          <p className="text-sm text-stone-400">
                            Level {player.secondaryPlayer.level} {player.secondaryPlayer.race} {player.secondaryPlayer.className}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleUnlinkCharacter(player.id, true)}
                            className="text-stone-400 hover:text-stone-200"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteCharacter(player.secondaryPlayer!.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-stone-500">HP:</span>{' '}
                          <span className="text-stone-200">{player.secondaryPlayer.currentHp ?? player.secondaryPlayer.maxHp}/{player.secondaryPlayer.maxHp}</span>
                        </div>
                        <div>
                          <span className="text-stone-500">AC:</span>{' '}
                          <span className="text-stone-200">{player.secondaryPlayer.armorClass ?? 10}</span>
                        </div>
                        <div>
                          <span className="text-stone-500">Speed:</span>{' '}
                          <span className="text-stone-200">{player.secondaryPlayer.speed} ft.</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {unlinkedCharacters.length > 0 && (
                        <select
                          onChange={(e) => {
                            if (e.target.value) {
                              handleLinkCharacter(player.id, e.target.value, true);
                              e.target.value = '';
                            }
                          }}
                          className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded-lg text-sm text-stone-300 hover:bg-stone-800 transition-colors"
                        >
                          <option value="">Link Secondary Character...</option>
                          {unlinkedCharacters.map((char) => (
                            <option key={char.id} value={char.id}>
                              {char.name} (Lvl {char.level} {char.race} {char.className})
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {initialPlayers.length === 0 && (
        <Card className="p-12 bg-stone-950/90 backdrop-blur-xl border-stone-900 text-center">
          <p className="text-stone-400">No player accounts found</p>
          <p className="text-sm text-stone-600 mt-2">Create player accounts to manage their characters</p>
        </Card>
      )}
    </div>
  );
}
