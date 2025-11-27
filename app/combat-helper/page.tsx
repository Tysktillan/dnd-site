'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  X,
  Heart,
  Swords,
  Activity,
  Sparkles,
  Plus,
  Minus,
  Sun,
  Package
} from 'lucide-react';
import Image from 'next/image';
import { SpellLookup } from '@/components/character/SpellLookup';
import { SkillHelper } from '@/components/character/SkillHelper';
import { NumberInput } from '@/components/ui/number-input';

interface Equipment {
  helm?: { name: string; description?: string; stats?: string; imageUrl?: string }
  cloak?: { name: string; description?: string; stats?: string; imageUrl?: string }
  chest?: { name: string; description?: string; stats?: string; imageUrl?: string }
  boots?: { name: string; description?: string; stats?: string; imageUrl?: string }
  gloves?: { name: string; description?: string; stats?: string; imageUrl?: string }
  mainHand?: { name: string; description?: string; stats?: string; imageUrl?: string }
  offHand?: { name: string; description?: string; stats?: string; imageUrl?: string }
  necklace?: { name: string; description?: string; stats?: string; imageUrl?: string }
  ring?: { name: string; description?: string; stats?: string; imageUrl?: string }
}

interface CharacterStats {
  id: string;
  name: string;
  className: string | null;
  className2: string | null;
  level: number;
  level2: number | null;
  race: string | null;
  maxHp: number | null;
  currentHp: number | null;
  armorClass: number | null;
  speed: number;
  proficiency: number;
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  equipment: string | null;
  subclass: string | null;
  subclass2: string | null;
  skillProficiencies: string | null;
  jackOfAllTrades: boolean;
}

interface ClassFeature {
  index: string;
  name: string;
  level: number;
  desc: string[];
  url: string;
}

export default function CombatHelperPage() {
  const router = useRouter();
  const [character, setCharacter] = useState<CharacterStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [damageAmount, setDamageAmount] = useState(0);
  const [hoveredItem, setHoveredItem] = useState<{
    item: { name: string; description?: string; stats?: string; imageUrl?: string };
    position: { x: number; y: number }
  } | null>(null);
  const [classFeatures, setClassFeatures] = useState<ClassFeature[]>([]);
  const [class2Features, setClass2Features] = useState<ClassFeature[]>([]);
  const [loadingFeatures, setLoadingFeatures] = useState(false);

  useEffect(() => {
    fetchCharacter();
  }, []);

  useEffect(() => {
    if (character?.className) {
      fetchClassFeatures(character.className, character.level, setClassFeatures);
    }
    if (character?.className2 && character?.level2) {
      fetchClassFeatures(character.className2, character.level2, setClass2Features);
    }
  }, [character?.className, character?.className2, character?.level, character?.level2]);

  const fetchCharacter = async () => {
    try {
      const res = await fetch('/api/character');
      if (res.ok) {
        const data = await res.json();
        setCharacter(data);
      }
    } catch (error) {
      console.error('Failed to fetch character:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClassFeatures = async (
    className: string,
    level: number,
    setFeatures: React.Dispatch<React.SetStateAction<ClassFeature[]>>
  ) => {
    try {
      setLoadingFeatures(true);
      const classIndex = className.toLowerCase().replace(/\s+/g, '-');

      // Fetch all level data up to character's level
      const levelsPromises = [];
      for (let lvl = 1; lvl <= level; lvl++) {
        levelsPromises.push(
          fetch(`https://www.dnd5eapi.co/api/classes/${classIndex}/levels/${lvl}`)
            .then(res => res.json())
        );
      }

      const levelsData = await Promise.all(levelsPromises);

      // Extract all unique features
      const allFeatures: ClassFeature[] = [];
      levelsData.forEach((levelData: { level: number; features: Array<{ index: string; name: string; url: string }> }) => {
        levelData.features.forEach((feature: { index: string; name: string; url: string }) => {
          if (!allFeatures.find(f => f.index === feature.index)) {
            allFeatures.push({
              index: feature.index,
              name: feature.name,
              level: levelData.level,
              desc: [],
              url: feature.url
            });
          }
        });
      });

      // Fetch details for each feature
      const detailsPromises = allFeatures.map(async (feature) => {
        const detailRes = await fetch(`https://www.dnd5eapi.co${feature.url}`);
        const detailData = await detailRes.json();
        return {
          ...feature,
          desc: detailData.desc || []
        };
      });

      const featuresWithDetails = await Promise.all(detailsPromises);
      setFeatures(featuresWithDetails);
    } catch (error) {
      console.error('Failed to fetch class features:', error);
    } finally {
      setLoadingFeatures(false);
    }
  };

  const getModifier = (score: number) => {
    const mod = Math.floor((score - 10) / 2);
    return mod >= 0 ? `+${mod}` : `${mod}`;
  };

  const handleExit = () => {
    router.back();
  };

  const handleDamage = async () => {
    if (!character || damageAmount <= 0) return;
    const newHp = Math.max(0, (character.currentHp ?? character.maxHp ?? 0) - damageAmount);
    await updateHp(newHp);
    setDamageAmount(0);
  };

  const handleHeal = async () => {
    if (!character || damageAmount <= 0) return;
    const newHp = Math.min(character.maxHp ?? 0, (character.currentHp ?? 0) + damageAmount);
    await updateHp(newHp);
    setDamageAmount(0);
  };

  const handleLongRest = async () => {
    if (!character) return;
    await updateHp(character.maxHp ?? 0);
  };

  const updateHp = async (newHp: number) => {
    try {
      const res = await fetch('/api/character', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...character, currentHp: newHp }),
      });
      if (res.ok) {
        setCharacter(prev => prev ? { ...prev, currentHp: newHp } : null);
      }
    } catch (error) {
      console.error('Failed to update HP:', error);
    }
  };

  const handleItemHover = (
    item: { name: string; description?: string; stats?: string; imageUrl?: string },
    event: React.MouseEvent
  ) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setHoveredItem({
      item,
      position: { x: rect.left - 320, y: rect.top } // Position to the left
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-stone-400">Loading combat helper...</div>
      </div>
    );
  }

  if (!character) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-stone-400">No character found</div>
      </div>
    );
  }

  const equipment: Equipment = character.equipment ? JSON.parse(character.equipment) : {};
  const equippedItems = Object.entries(equipment).filter(([, item]) => item !== undefined);
  const hpPercentage = ((character.currentHp ?? character.maxHp ?? 0) / (character.maxHp ?? 1)) * 100;
  const hpBarColor = hpPercentage > 50 ? 'bg-green-600' : hpPercentage > 25 ? 'bg-amber-600' : 'bg-red-600';

  return (
    <div className="min-h-screen p-6 pb-24">
      {/* Header with Exit Button */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black tracking-tighter mb-2">
              <span className="bg-gradient-to-b from-stone-100 via-stone-300 to-red-900 bg-clip-text text-transparent">
                Combat Helper
              </span>
            </h1>
            <p className="text-stone-400 text-sm">{character.name} - Ready for battle</p>
          </div>
          <Button
            onClick={handleExit}
            variant="ghost"
            className="text-stone-400 hover:text-stone-200"
          >
            <X className="h-5 w-5 mr-2" />
            Exit Combat
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Equipment & Class Features */}
        <div className="space-y-6">
          {/* Equipment Summary */}
          <Card className="p-6 bg-stone-950/90 backdrop-blur-xl border-stone-900 relative">
            <h2 className="text-lg font-bold text-stone-200 mb-4 flex items-center gap-2">
              <Package className="h-5 w-5 text-red-400" />
              Equipped Items
            </h2>
            {equippedItems.length > 0 ? (
              <div className="space-y-2">
                {equippedItems.map(([slot, item]) => {
                  const itemData = item as { name: string; description?: string; stats?: string; imageUrl?: string };
                  return (
                    <div
                      key={slot}
                      onMouseEnter={(e) => handleItemHover(itemData, e)}
                      onMouseLeave={() => setHoveredItem(null)}
                      className="bg-black/30 border border-stone-800 rounded-lg p-3 hover:border-amber-700 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        {itemData.imageUrl && (
                          <Image src={itemData.imageUrl} alt={itemData.name} width={32} height={32} className="object-contain" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-amber-200 truncate">{itemData.name}</div>
                          <div className="text-xs text-stone-500 capitalize">{slot.replace(/([A-Z])/g, ' $1').trim()}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-sm text-stone-500 text-center py-4">No equipment equipped</div>
            )}

            {/* Item Tooltip */}
            {hoveredItem && (
              <div
                className="fixed z-[200] w-64 p-3 bg-stone-950 border-2 border-amber-800 rounded-lg shadow-2xl"
                style={{
                  left: `${hoveredItem.position.x}px`,
                  top: `${hoveredItem.position.y}px`,
                }}
              >
                <div className="text-sm font-semibold text-amber-200 mb-1">{hoveredItem.item.name}</div>
                {hoveredItem.item.stats && (
                  <div className="text-xs text-green-400 mb-1">{hoveredItem.item.stats}</div>
                )}
                {hoveredItem.item.description && (
                  <div className="text-xs text-stone-400 mt-2">{hoveredItem.item.description}</div>
                )}
              </div>
            )}
          </Card>

          {/* Class Features */}
          <Card className="p-6 bg-stone-950/90 backdrop-blur-xl border-stone-900">
            <h2 className="text-lg font-bold text-stone-200 mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-red-400" />
              Class Features
            </h2>
            {loadingFeatures ? (
              <div className="text-sm text-stone-400 text-center py-4">Loading features...</div>
            ) : (
              <div className="space-y-4">
                {/* Primary Class Features */}
                {character?.className && classFeatures.length > 0 && (
                  <div>
                    <div className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">
                      {character.className} (Level {character.level})
                    </div>
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-stone-800 scrollbar-track-stone-950">
                      {classFeatures.map((feature) => (
                        <details key={feature.index} className="bg-black/30 border border-stone-800 rounded-lg">
                          <summary className="p-3 cursor-pointer hover:bg-stone-900/50 transition-colors">
                            <span className="text-sm font-semibold text-amber-200">{feature.name}</span>
                            <span className="text-xs text-stone-500 ml-2">(Level {feature.level})</span>
                          </summary>
                          <div className="px-3 pb-3 text-xs text-stone-400 space-y-1">
                            {feature.desc.map((paragraph, idx) => (
                              <p key={idx}>{paragraph}</p>
                            ))}
                          </div>
                        </details>
                      ))}
                    </div>
                  </div>
                )}

                {/* Secondary Class Features */}
                {character?.className2 && class2Features.length > 0 && (
                  <div>
                    <div className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">
                      {character.className2} (Level {character.level2})
                    </div>
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-stone-800 scrollbar-track-stone-950">
                      {class2Features.map((feature) => (
                        <details key={feature.index} className="bg-black/30 border border-stone-800 rounded-lg">
                          <summary className="p-3 cursor-pointer hover:bg-stone-900/50 transition-colors">
                            <span className="text-sm font-semibold text-amber-200">{feature.name}</span>
                            <span className="text-xs text-stone-500 ml-2">(Level {feature.level})</span>
                          </summary>
                          <div className="px-3 pb-3 text-xs text-stone-400 space-y-1">
                            {feature.desc.map((paragraph, idx) => (
                              <p key={idx}>{paragraph}</p>
                            ))}
                          </div>
                        </details>
                      ))}
                    </div>
                  </div>
                )}

                {!character?.className && (
                  <div className="text-sm text-stone-500 text-center py-4">
                    No class selected on character sheet
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>

        {/* Middle Column - Quick Stats & Actions */}
        <div className="space-y-6">
          {/* Quick Combat Stats with Ability Modifiers */}
          <Card className="p-4 bg-stone-950/90 backdrop-blur-xl border-stone-900">
            <div className="grid grid-cols-4 gap-2">
              <div className="bg-black/30 border border-stone-800 rounded-lg p-2 text-center">
                <div className="text-xs text-stone-500 uppercase tracking-wider mb-1">AC</div>
                <div className="text-xl font-bold text-stone-100">{character.armorClass ?? 10}</div>
              </div>
              <div className="bg-black/30 border border-stone-800 rounded-lg p-2 text-center">
                <div className="text-xs text-stone-500 uppercase tracking-wider mb-1">Initiative</div>
                <div className="text-xl font-bold text-stone-100">{getModifier(character.dexterity)}</div>
              </div>
              <div className="bg-black/30 border border-stone-800 rounded-lg p-2 text-center">
                <div className="text-xs text-stone-500 uppercase tracking-wider mb-1">Speed</div>
                <div className="text-xl font-bold text-stone-100">{character.speed}</div>
              </div>
              <div className="bg-black/30 border border-stone-800 rounded-lg p-2 text-center">
                <div className="text-xs text-stone-500 uppercase tracking-wider mb-1">Prof</div>
                <div className="text-xl font-bold text-stone-100">+{character.proficiency}</div>
              </div>
            </div>
            <div className="grid grid-cols-6 gap-2 mt-2">
              {[
                { name: 'STR', value: character.strength },
                { name: 'DEX', value: character.dexterity },
                { name: 'CON', value: character.constitution },
                { name: 'INT', value: character.intelligence },
                { name: 'WIS', value: character.wisdom },
                { name: 'CHA', value: character.charisma },
              ].map((ability) => (
                <div
                  key={ability.name}
                  className="bg-black/30 border border-stone-800 rounded-lg p-2 text-center"
                >
                  <div className="text-xs text-stone-500 uppercase tracking-wider mb-1">
                    {ability.name}
                  </div>
                  <div className="text-lg font-bold text-stone-100">
                    {getModifier(ability.value)}
                  </div>
                </div>
              ))}
            </div>
          </Card>
          <Card className="p-6 bg-stone-950/90 backdrop-blur-xl border-stone-900">
            <h2 className="text-lg font-bold text-stone-200 mb-4 flex items-center gap-2">
              <Swords className="h-5 w-5 text-red-400" />
              Attack & Damage
            </h2>
            <div className="space-y-3">
              <div className="bg-black/30 border border-stone-800 rounded-lg p-4">
                <div className="text-sm text-stone-400 mb-2">Quick reference for your attacks</div>
                <div className="text-xs text-stone-500">
                  Add your weapon/spell attack bonuses here based on your character sheet
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-stone-950/90 backdrop-blur-xl border-stone-900">
            <h2 className="text-lg font-bold text-stone-200 mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5 text-red-400" />
              Actions in Combat
            </h2>
            <div className="space-y-3 text-sm">
              <div className="bg-black/30 border border-stone-800 rounded-lg p-3">
                <div className="font-semibold text-stone-200 mb-1">Action</div>
                <div className="text-xs text-stone-400">
                  Attack, Cast a Spell, Dash, Disengage, Dodge, Help, Hide, Ready, Search, Use an Object
                </div>
              </div>
              <div className="bg-black/30 border border-stone-800 rounded-lg p-3">
                <div className="font-semibold text-stone-200 mb-1">Bonus Action</div>
                <div className="text-xs text-stone-400">
                  Class features, spells, or special abilities
                </div>
              </div>
              <div className="bg-black/30 border border-stone-800 rounded-lg p-3">
                <div className="font-semibold text-stone-200 mb-1">Reaction</div>
                <div className="text-xs text-stone-400">
                  Opportunity attacks, spells like Shield, other triggered abilities
                </div>
              </div>
              <div className="bg-black/30 border border-stone-800 rounded-lg p-3">
                <div className="font-semibold text-stone-200 mb-1">Movement</div>
                <div className="text-xs text-stone-400">
                  Up to {character.speed} ft on your turn
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column - HP Management & Spell Lookup */}
        <div className="space-y-6">
          {/* HP Management */}
          <Card className="p-6 bg-stone-950/90 backdrop-blur-xl border-stone-900">
            <h2 className="text-lg font-bold text-stone-200 mb-4 flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-400" />
              HP Management
            </h2>

            {/* HP Display with Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-stone-500 uppercase tracking-wider">Hit Points</span>
                <span className="text-2xl font-bold text-stone-100">
                  {character.currentHp ?? character.maxHp} / {character.maxHp}
                </span>
              </div>
              <div className="w-full h-4 bg-stone-900 rounded-full overflow-hidden border border-stone-800">
                <div
                  className={`h-full transition-all duration-300 ${hpBarColor}`}
                  style={{ width: `${hpPercentage}%` }}
                />
              </div>
            </div>

            {/* Damage/Heal Controls */}
            <div className="flex gap-2 mb-3">
              <NumberInput
                value={damageAmount}
                onChange={(e) => setDamageAmount(parseInt(e.target.value) || 0)}
                className="bg-stone-900 border-stone-800 text-stone-100 w-20"
                min={0}
                placeholder="Amount"
              />
              <Button
                onClick={handleDamage}
                disabled={damageAmount <= 0}
                className="flex-1 bg-red-950 hover:bg-red-900 border border-red-900/50 text-stone-100"
              >
                <Minus className="h-4 w-4 mr-1" />
                Damage
              </Button>
              <Button
                onClick={handleHeal}
                disabled={damageAmount <= 0 || (character.currentHp ?? 0) >= (character.maxHp ?? 0)}
                className="flex-1 bg-green-950 hover:bg-green-900 border border-green-900/50 text-stone-100"
              >
                <Plus className="h-4 w-4 mr-1" />
                Heal
              </Button>
            </div>

            {/* Long Rest */}
            <Button
              onClick={handleLongRest}
              variant="ghost"
              className="w-full text-amber-400 hover:text-amber-300 hover:bg-amber-950/20 border border-amber-900/30"
            >
              <Sun className="h-4 w-4 mr-2" />
              Long Rest
            </Button>
          </Card>

          <SpellLookup />

          <SkillHelper
            strength={character.strength}
            dexterity={character.dexterity}
            constitution={character.constitution}
            intelligence={character.intelligence}
            wisdom={character.wisdom}
            charisma={character.charisma}
            proficiency={character.proficiency}
            skillProficiencies={character.skillProficiencies}
            jackOfAllTrades={character.jackOfAllTrades}
          />
        </div>
      </div>
    </div>
  );
}
