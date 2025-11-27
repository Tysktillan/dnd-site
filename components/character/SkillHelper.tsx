'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dices } from 'lucide-react';

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

interface SkillHelperProps {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  proficiency: number;
  skillProficiencies: string | null;
  jackOfAllTrades: boolean;
}

export function SkillHelper({
  strength,
  dexterity,
  constitution,
  intelligence,
  wisdom,
  charisma,
  proficiency,
  skillProficiencies,
  jackOfAllTrades,
}: SkillHelperProps) {
  const [selectedSkill, setSelectedSkill] = useState<string>('');

  const getModifier = (score: number) => {
    return Math.floor((score - 10) / 2);
  };

  const getAbilityScore = (ability: string) => {
    switch (ability) {
      case 'strength': return strength;
      case 'dexterity': return dexterity;
      case 'constitution': return constitution;
      case 'intelligence': return intelligence;
      case 'wisdom': return wisdom;
      case 'charisma': return charisma;
      default: return 10;
    }
  };

  const calculateBonus = (skillName: string) => {
    const skill = DND_SKILLS.find(s => s.name === skillName);
    if (!skill) return 0;

    const abilityMod = getModifier(getAbilityScore(skill.ability));
    const proficientSkills = skillProficiencies ? JSON.parse(skillProficiencies) : [];
    const isProficient = proficientSkills.includes(skillName);

    if (isProficient) {
      return abilityMod + proficiency;
    } else if (jackOfAllTrades) {
      return abilityMod + Math.floor(proficiency / 2);
    } else {
      return abilityMod;
    }
  };

  const selectedSkillData = DND_SKILLS.find(s => s.name === selectedSkill);
  const bonus = selectedSkill ? calculateBonus(selectedSkill) : 0;
  const proficientSkills = skillProficiencies ? JSON.parse(skillProficiencies) : [];
  const isProficient = selectedSkill ? proficientSkills.includes(selectedSkill) : false;

  return (
    <Card className="p-6 bg-stone-950/90 backdrop-blur-xl border-stone-900">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-stone-200 flex items-center gap-2">
          <Dices className="h-5 w-5 text-red-400" />
          Skill Helper
        </h2>
        <Select value={selectedSkill} onValueChange={setSelectedSkill}>
          <SelectTrigger className="bg-stone-900 border-stone-800 text-stone-100 w-48">
            <SelectValue placeholder="Select skill..." />
          </SelectTrigger>
          <SelectContent className="bg-stone-900 border-stone-800 max-h-64">
            {DND_SKILLS.map((skill) => (
              <SelectItem
                key={skill.name}
                value={skill.name}
                className="text-stone-100 focus:bg-stone-800"
              >
                {skill.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        {selectedSkill && (
          <div className="bg-black/30 border border-stone-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="text-lg font-semibold text-amber-200">{selectedSkill}</div>
                <div className="text-xs text-stone-500 uppercase mt-1">
                  Based on {selectedSkillData?.ability}
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-green-400">
                  {bonus >= 0 ? '+' : ''}{bonus}
                </div>
                {isProficient && (
                  <div className="text-xs text-amber-400 mt-1">Proficient</div>
                )}
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-stone-800 text-xs text-stone-400">
              <div className="flex justify-between">
                <span>Ability Modifier:</span>
                <span className="text-stone-300">
                  {getModifier(getAbilityScore(selectedSkillData?.ability || 'strength')) >= 0 ? '+' : ''}
                  {getModifier(getAbilityScore(selectedSkillData?.ability || 'strength'))}
                </span>
              </div>
              {isProficient && (
                <div className="flex justify-between mt-1">
                  <span>Proficiency Bonus:</span>
                  <span className="text-stone-300">+{proficiency}</span>
                </div>
              )}
              {!isProficient && jackOfAllTrades && (
                <div className="flex justify-between mt-1">
                  <span>Jack of All Trades:</span>
                  <span className="text-amber-400">+{Math.floor(proficiency / 2)}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {!selectedSkill && (
          <div className="text-sm text-stone-500 text-center py-4">
            Select a skill to see your bonus
          </div>
        )}
      </div>
    </Card>
  );
}
