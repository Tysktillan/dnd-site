'use client'

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NumberInput } from "@/components/ui/number-input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Heart,
  Shield,
  Zap,
  User,
  BookOpen,
  Save,
  Loader2,
  Sparkles,
  X
} from "lucide-react";
import { Player } from "@prisma/client";
import { EquipmentScreen } from "./EquipmentScreen";
import { CombatTracker } from "./CombatTracker";
import { Switch } from "@/components/ui/switch";
import { SpellLookup } from "./SpellLookup";

interface CharacterSheetProps {
  character: Player;
  secondaryCharacter?: Player | null;
}

interface DndClass {
  index: string;
  name: string;
  url: string;
}

interface Subclass {
  index: string;
  name: string;
  url: string;
}

const DND_CLASSES = [
  { index: 'barbarian', name: 'Barbarian' },
  { index: 'bard', name: 'Bard' },
  { index: 'cleric', name: 'Cleric' },
  { index: 'druid', name: 'Druid' },
  { index: 'fighter', name: 'Fighter' },
  { index: 'monk', name: 'Monk' },
  { index: 'paladin', name: 'Paladin' },
  { index: 'ranger', name: 'Ranger' },
  { index: 'rogue', name: 'Rogue' },
  { index: 'sorcerer', name: 'Sorcerer' },
  { index: 'warlock', name: 'Warlock' },
  { index: 'wizard', name: 'Wizard' },
];

const DND_SKILLS = [
  { name: 'Acrobatics', ability: 'dexterity' },
  { name: 'Animal Handling', ability: 'wisdom' },
  { name: 'Arcana', ability: 'intelligence' },
  { name: 'Athletics', ability: 'strength' },
  { name: 'Deception', ability: 'charisma' },
  { name: 'History', ability: 'intelligence' },
  { name: 'Insight', ability: 'wisdom' },
  { name: 'Intimidation', ability: 'charisma' },
  { name: 'Investigation', ability: 'intelligence' },
  { name: 'Medicine', ability: 'wisdom' },
  { name: 'Nature', ability: 'intelligence' },
  { name: 'Perception', ability: 'wisdom' },
  { name: 'Performance', ability: 'charisma' },
  { name: 'Persuasion', ability: 'charisma' },
  { name: 'Religion', ability: 'intelligence' },
  { name: 'Sleight of Hand', ability: 'dexterity' },
  { name: 'Stealth', ability: 'dexterity' },
  { name: 'Survival', ability: 'wisdom' },
];

interface Equipment {
  helm?: { name: string; description?: string; stats?: string }
  cloak?: { name: string; description?: string; stats?: string }
  chest?: { name: string; description?: string; stats?: string }
  boots?: { name: string; description?: string; stats?: string }
  gloves?: { name: string; description?: string; stats?: string }
  mainHand?: { name: string; description?: string; stats?: string }
  offHand?: { name: string; description?: string; stats?: string }
  necklace?: { name: string; description?: string; stats?: string }
  ring?: { name: string; description?: string; stats?: string }
}

export default function CharacterSheet({ character: initialCharacter, secondaryCharacter }: CharacterSheetProps) {
  const [activeCharacterId, setActiveCharacterId] = useState(initialCharacter.id);
  const [character, setCharacter] = useState(initialCharacter);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [subclasses, setSubclasses] = useState<Subclass[]>([]);
  const [subclasses2, setSubclasses2] = useState<Subclass[]>([]);
  const [loadingSubclasses, setLoadingSubclasses] = useState(false);
  const [skillSearch, setSkillSearch] = useState('');

  const filteredSkills = skillSearch
    ? DND_SKILLS.filter(skill =>
        skill.name.toLowerCase().includes(skillSearch.toLowerCase())
      )
    : [];

  const handleCharacterSwitch = (characterId: string) => {
    if (characterId === initialCharacter.id) {
      setCharacter(initialCharacter);
      setActiveCharacterId(initialCharacter.id);
    } else if (secondaryCharacter && characterId === secondaryCharacter.id) {
      setCharacter(secondaryCharacter);
      setActiveCharacterId(secondaryCharacter.id);
    }
  };

  // Fetch subclasses when class changes
  useEffect(() => {
    const fetchSubclasses = async () => {
      if (!character.className) return;

      const classIndex = DND_CLASSES.find(c => c.name.toLowerCase() === character.className?.toLowerCase())?.index;
      if (!classIndex) return;

      setLoadingSubclasses(true);
      try {
        const res = await fetch(`https://www.dnd5eapi.co/api/classes/${classIndex}`);
        const data = await res.json();
        setSubclasses(data.subclasses || []);
      } catch (error) {
        console.error('Failed to fetch subclasses:', error);
      } finally {
        setLoadingSubclasses(false);
      }
    };

    fetchSubclasses();
  }, [character.className]);

  // Fetch subclasses for second class
  useEffect(() => {
    const fetchSubclasses2 = async () => {
      if (!character.className2) return;

      const classIndex = DND_CLASSES.find(c => c.name.toLowerCase() === character.className2?.toLowerCase())?.index;
      if (!classIndex) return;

      try {
        const res = await fetch(`https://www.dnd5eapi.co/api/classes/${classIndex}`);
        const data = await res.json();
        setSubclasses2(data.subclasses || []);
      } catch (error) {
        console.error('Failed to fetch subclasses for class 2:', error);
      }
    };

    fetchSubclasses2();
  }, [character.className2]);

  // Parse equipment from JSON string
  const equipment: Equipment = character.equipment ? JSON.parse(character.equipment) : {}

  const getModifier = (score: number) => {
    const mod = Math.floor((score - 10) / 2);
    return mod >= 0 ? `+${mod}` : `${mod}`;
  };

  const updateField = (field: keyof Player, value: string | number | boolean) => {
    setCharacter(prev => ({ ...prev, [field]: value }));
  };

  const updateEquipment = (newEquipment: Equipment) => {
    setCharacter(prev => ({ ...prev, equipment: JSON.stringify(newEquipment) }));
  };

  const handleSave = async (overrides?: Partial<Player>) => {
    setIsSaving(true);
    setSaveMessage('');

    try {
      const dataToSave = overrides ? { ...character, ...overrides } : character;

      const response = await fetch('/api/character', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSave)
      });

      if (!response.ok) {
        throw new Error('Failed to save character');
      }

      setSaveMessage('Character saved successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      setSaveMessage('Failed to save character');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-[90rem] mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl md:text-xl md:text-2xl lg:text-3xl lg:text-4xl font-black tracking-tighter mb-2">
            <span className="bg-gradient-to-b from-stone-100 via-stone-300 to-red-900 bg-clip-text text-transparent">
              {character.name}
            </span>
          </h1>
          <div className="flex gap-4 text-sm text-stone-400">
            <span>Level {character.level}</span>
            <span>•</span>
            <span>{character.race} {character.className}</span>
          </div>
        </div>
        <div className="flex gap-3">
          {secondaryCharacter && (
            <select
              value={activeCharacterId}
              onChange={(e) => handleCharacterSwitch(e.target.value)}
              className="px-4 py-2 bg-stone-900 border border-stone-800 rounded-lg text-sm text-stone-200 hover:bg-stone-800 transition-colors"
            >
              <option value={initialCharacter.id}>{initialCharacter.name}</option>
              <option value={secondaryCharacter.id}>{secondaryCharacter.name}</option>
            </select>
          )}
          <Button
            onClick={() => handleSave()}
            disabled={isSaving}
            className="bg-red-950 hover:bg-red-900 border border-red-900/50 text-stone-100"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Character
              </>
            )}
          </Button>
        </div>
      </div>

      {saveMessage && (
        <div className={`mb-4 p-3 rounded-lg ${saveMessage.includes('success') ? 'bg-green-950/30 text-green-300 border border-green-900/50' : 'bg-red-950/30 text-red-300 border border-red-900/50'}`}>
          {saveMessage}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Left Column - Ability Scores & Core Stats */}
        <div className="space-y-6 xl:col-span-1">
          {/* Ability Scores */}
          <Card className="p-6 bg-stone-950/90 backdrop-blur-xl border-stone-900">
            <h2 className="text-lg font-bold text-stone-200 mb-4 flex items-center gap-2">
              <Zap className="h-5 w-5 text-red-400" />
              Ability Scores
            </h2>
            <div className="space-y-3">
              {[
                { name: 'Strength', key: 'strength' as keyof Player },
                { name: 'Dexterity', key: 'dexterity' as keyof Player },
                { name: 'Constitution', key: 'constitution' as keyof Player },
                { name: 'Intelligence', key: 'intelligence' as keyof Player },
                { name: 'Wisdom', key: 'wisdom' as keyof Player },
                { name: 'Charisma', key: 'charisma' as keyof Player },
              ].map((ability) => (
                <div key={ability.key} className="flex items-center gap-3 bg-black/30 border border-stone-800 rounded-lg p-3">
                  <div className="flex-1">
                    <Label className="text-xs text-stone-500 uppercase tracking-wider">{ability.name}</Label>
                  </div>
                  <NumberInput
                    value={character[ability.key] as number}
                    onChange={(e) => updateField(ability.key, parseInt(e.target.value) || 10)}
                    className="w-20 text-center bg-stone-900 border-stone-800 text-stone-100"
                    min={1}
                    max={30}
                  />
                  <div className="w-12 text-center text-lg font-bold text-stone-300">
                    {getModifier(character[ability.key] as number)}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Core Stats */}
          <Card className="p-6 bg-stone-950/90 backdrop-blur-xl border-stone-900">
            <h2 className="text-lg font-bold text-stone-200 mb-4 flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-400" />
              Core Stats
            </h2>
            <div className="space-y-4">
                            <div>
                <Label className="text-xs text-stone-500 uppercase tracking-wider mb-2 block">Max HP</Label>
                <NumberInput
                  value={character.maxHp ?? 0}
                  onChange={(e) => updateField('maxHp', parseInt(e.target.value) || 0)}
                  className="bg-stone-900 border-stone-800 text-stone-100 text-xl font-bold"
                  min={1}
                />
              </div>
              <div>
                <Label className="text-xs text-stone-500 uppercase tracking-wider mb-2 block">Current HP</Label>
                <NumberInput
                  value={character.currentHp ?? character.maxHp ?? 0}
                  onChange={(e) => updateField('currentHp', parseInt(e.target.value) || 0)}
                  className="bg-stone-900 border-stone-800 text-stone-100 text-xl font-bold"
                  min={0}
                />
              </div>
              <div>
                <Label className="text-xs text-stone-500 uppercase tracking-wider mb-2 block">Armor Class</Label>
                <NumberInput
                  value={character.armorClass ?? 10}
                  onChange={(e) => updateField('armorClass', parseInt(e.target.value) || 10)}
                  className="bg-stone-900 border-stone-800 text-stone-100 text-xl font-bold"
                  min={1}
                  max={30}
                />
              </div>
              <div>
                <Label className="text-xs text-stone-500 uppercase tracking-wider mb-2 block">Speed</Label>
                <NumberInput
                  value={character.speed}
                  onChange={(e) => updateField('speed', parseInt(e.target.value) || 30)}
                  className="bg-stone-900 border-stone-800 text-stone-100"
                  min={0}
                />
              </div>
              <div>
                <Label className="text-xs text-stone-500 uppercase tracking-wider mb-2 block">Proficiency Bonus</Label>
                <NumberInput
                  value={character.proficiency}
                  onChange={(e) => updateField('proficiency', parseInt(e.target.value) || 2)}
                  className="bg-stone-900 border-stone-800 text-stone-100"
                  min={2}
                  max={6}
                />
              </div>
            </div>
          </Card>

          {/* Skill Proficiencies */}
          <Card className="p-6 bg-stone-950/90 backdrop-blur-xl border-stone-900">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-stone-200 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-red-400" />
                Skill Proficiencies
              </h2>
              <div className="flex items-center gap-2">
                <Label className="text-xs text-stone-400">Jack of All Trades</Label>
                <Switch
                  checked={character.jackOfAllTrades || false}
                  onCheckedChange={(checked) => updateField('jackOfAllTrades', checked)}
                />
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative mb-4">
              <Input
                placeholder="Search skills..."
                value={skillSearch}
                onChange={(e) => setSkillSearch(e.target.value)}
                className="bg-stone-900 border-stone-800 text-stone-100"
              />

              {/* Dropdown with filtered skills */}
              {skillSearch && filteredSkills.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-stone-900 border border-stone-800 rounded-lg shadow-lg max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-stone-700 scrollbar-track-stone-900">
                  {filteredSkills.map((skill) => {
                    const proficientSkills = character.skillProficiencies ? JSON.parse(character.skillProficiencies) : [];
                    const isProficient = proficientSkills.includes(skill.name);

                    return (
                      <div
                        key={skill.name}
                        onClick={() => {
                          if (!isProficient) {
                            const currentProfs = character.skillProficiencies ? JSON.parse(character.skillProficiencies) : [];
                            updateField('skillProficiencies', JSON.stringify([...currentProfs, skill.name]));
                          }
                          setSkillSearch('');
                        }}
                        className={`p-2 cursor-pointer hover:bg-stone-800 transition-colors flex items-center justify-between ${
                          isProficient ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        <span className="text-sm text-stone-300">{skill.name}</span>
                        <span className="text-xs text-stone-500 uppercase">{skill.ability.slice(0, 3)}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Selected Proficiencies */}
            <div className="space-y-2">
              {(() => {
                const proficientSkills = character.skillProficiencies ? JSON.parse(character.skillProficiencies) : [];

                if (proficientSkills.length === 0) {
                  return (
                    <div className="text-sm text-stone-500 text-center py-4">
                      No skill proficiencies selected
                    </div>
                  );
                }

                return proficientSkills.map((skillName: string) => {
                  const skill = DND_SKILLS.find(s => s.name === skillName);

                  return (
                    <div
                      key={skillName}
                      className="flex items-center justify-between p-2 bg-amber-950/30 border border-amber-900/50 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-amber-200">{skillName}</span>
                        {skill && (
                          <span className="text-xs text-stone-500 uppercase">({skill.ability.slice(0, 3)})</span>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          const currentProfs = character.skillProficiencies ? JSON.parse(character.skillProficiencies) : [];
                          const newProfs = currentProfs.filter((s: string) => s !== skillName);
                          updateField('skillProficiencies', JSON.stringify(newProfs));
                        }}
                        className="text-stone-400 hover:text-red-400 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  );
                });
              })()}
            </div>
          </Card>
        </div>

        {/* Middle Column - Equipment Screen & Combat Tracker */}
        <div className="xl:col-span-2 space-y-6">
          <EquipmentScreen
            equipment={equipment}
            avatarUrl={character.avatarUrl ?? undefined}
            backgroundUrl={character.backgroundUrl ?? undefined}
            playerId={character.id}
            onUpdateEquipment={updateEquipment}
            onUpdateAvatar={(url) => updateField('avatarUrl', url)}
            onUpdateBackground={(url) => updateField('backgroundUrl', url)}
            onSave={handleSave}
          />
          <CombatTracker
            currentHp={character.currentHp ?? character.maxHp ?? 0}
            maxHp={character.maxHp ?? 0}
            onUpdateHp={(newHp) => updateField('currentHp', newHp)}
          />
        </div>

        {/* Right Column - Character Info & Notes */}
        <div className="space-y-6 xl:col-span-1">
          <Card className="p-6 bg-stone-950/90 backdrop-blur-xl border-stone-900">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-stone-200 flex items-center gap-2">
                <User className="h-5 w-5 text-red-400" />
                Character Info
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-xs text-stone-400">
                  Multiclass
                </span>
                <Switch
                  checked={!!(character.className2 && character.className2.length > 0)}
                  onCheckedChange={(checked) => {
                    if (!checked) {
                      updateField('className2', '')
                      updateField('subclass2', '')
                      updateField('level2', 0)
                    } else {
                      // Initialize with level 1 when enabling
                      updateField('level2', 1)
                    }
                  }}
                />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <Label className="text-xs text-stone-500 uppercase tracking-wider mb-2 block">Name</Label>
                <Input
                  value={character.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  className="bg-stone-900 border-stone-800 text-stone-100"
                />
              </div>
              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-4">
                  <Label className="text-xs text-stone-500 uppercase tracking-wider mb-2 block">Class</Label>
                  <Select
                    value={character.className ?? ''}
                    onValueChange={(value) => updateField('className', value)}
                  >
                    <SelectTrigger className="bg-stone-900 border-stone-800 text-stone-100 [&>span]:flex-1 [&>span]:text-left [&>svg]:w-3 [&>svg]:h-3">
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent className="bg-stone-900 border-stone-800">
                      {DND_CLASSES.map((cls) => (
                        <SelectItem key={cls.index} value={cls.name} className="text-stone-100 focus:bg-stone-800">
                          {cls.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {character.className && subclasses.length > 0 && (
                  <div className="col-span-5">
                    <Label className="text-xs text-stone-500 uppercase tracking-wider mb-2 block">Subclass</Label>
                    <Select
                      value={character.subclass ?? undefined}
                      onValueChange={(value) => updateField('subclass', value === 'none' ? null : value)}
                    >
                      <SelectTrigger className="bg-stone-900 border-stone-800 text-stone-100 [&>span]:flex-1 [&>span]:text-left [&>svg]:w-3 [&>svg]:h-3">
                        <SelectValue placeholder="Subclass" />
                      </SelectTrigger>
                      <SelectContent className="bg-stone-900 border-stone-800">
                        <SelectItem value="none" className="text-stone-100 focus:bg-stone-800">
                          None
                        </SelectItem>
                        {subclasses.map((subclass) => (
                          <SelectItem key={subclass.index} value={subclass.name} className="text-stone-100 focus:bg-stone-800">
                            {subclass.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className={character.className && subclasses.length > 0 ? "col-span-3" : "col-span-8"}>
                  <Label className="text-xs text-stone-500 uppercase tracking-wider mb-2 block">Level</Label>
                  <NumberInput
                    value={character.level}
                    onChange={(e) => updateField('level', parseInt(e.target.value) || 1)}
                    className="bg-stone-900 border-stone-800 text-stone-100"
                    min={1}
                    max={20}
                  />
                </div>
              </div>
              {(character.className2 && character.className2.length > 0) && (
                <div className="grid grid-cols-12 gap-2">
                  <div className="col-span-4">
                    <Label className="text-xs text-stone-500 uppercase tracking-wider mb-2 block">Class 2</Label>
                    <Select
                      value={character.className2 ?? ''}
                      onValueChange={(value) => updateField('className2', value)}
                    >
                      <SelectTrigger className="bg-stone-900 border-stone-800 text-stone-100 [&>span]:flex-1 [&>span]:text-left [&>svg]:w-3 [&>svg]:h-3">
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                      <SelectContent className="bg-stone-900 border-stone-800">
                        {DND_CLASSES.map((cls) => (
                          <SelectItem key={cls.index} value={cls.name} className="text-stone-100 focus:bg-stone-800">
                            {cls.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {character.className2 && subclasses2.length > 0 && (
                    <div className="col-span-5">
                      <Label className="text-xs text-stone-500 uppercase tracking-wider mb-2 block">Subclass 2</Label>
                      <Select
                        value={character.subclass2 ?? undefined}
                        onValueChange={(value) => updateField('subclass2', value === 'none' ? null : value)}
                      >
                        <SelectTrigger className="bg-stone-900 border-stone-800 text-stone-100 [&>span]:flex-1 [&>span]:text-left [&>svg]:w-3 [&>svg]:h-3">
                          <SelectValue placeholder="Subclass" />
                        </SelectTrigger>
                        <SelectContent className="bg-stone-900 border-stone-800">
                          <SelectItem value="none" className="text-stone-100 focus:bg-stone-800">
                            None
                          </SelectItem>
                          {subclasses2.map((subclass) => (
                            <SelectItem key={subclass.index} value={subclass.name} className="text-stone-100 focus:bg-stone-800">
                              {subclass.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div className={character.className2 && subclasses2.length > 0 ? "col-span-3" : "col-span-8"}>
                    <Label className="text-xs text-stone-500 uppercase tracking-wider mb-2 block">Level 2</Label>
                    <NumberInput
                      value={character.level2 ?? 0}
                      onChange={(e) => updateField('level2', parseInt(e.target.value) || 0)}
                      className="bg-stone-900 border-stone-800 text-stone-100"
                      min={0}
                      max={20}
                    />
                  </div>
                </div>
              )}
              <div>
                <Label className="text-xs text-stone-500 uppercase tracking-wider mb-2 block">Race</Label>
                <Input
                  value={character.race ?? ''}
                  onChange={(e) => updateField('race', e.target.value)}
                  placeholder="e.g., Human, Elf"
                  className="bg-stone-900 border-stone-800 text-stone-100"
                />
              </div>
            </div>
          </Card>

          <SpellLookup />

          <Card className="p-6 bg-stone-950/90 backdrop-blur-xl border-stone-900">
            <h2 className="text-lg font-bold text-stone-200 mb-4 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-red-400" />
              Notes
            </h2>
            <Textarea
              value={character.notes ?? ''}
              onChange={(e) => updateField('notes', e.target.value)}
              placeholder="Personal notes, backstory, goals..."
              rows={12}
              className="bg-stone-900 border-stone-800 text-stone-100 resize-none"
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
