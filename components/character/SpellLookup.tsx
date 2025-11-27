'use client';

import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { BookOpen, Search, Loader2, X, Pin, GripVertical } from 'lucide-react';

interface Spell {
  index: string;
  name: string;
  level: number;
  school: { name: string };
  casting_time: string;
  range: string;
  components: string[];
  duration: string;
  concentration: boolean;
  ritual: boolean;
  desc: string[];
  higher_level?: string[];
  damage?: {
    damage_type: { name: string };
  };
  dc?: {
    dc_type: { name: string };
    success_type: string;
  };
  classes?: Array<{ name: string }>;
}

interface SpellListItem {
  index: string;
  name: string;
  level: number;
  url: string;
}

export function SpellLookup() {
  const [searchTerm, setSearchTerm] = useState('');
  const [allSpells, setAllSpells] = useState<SpellListItem[]>([]);
  const [filteredSpells, setFilteredSpells] = useState<SpellListItem[]>([]);
  const [hoveredSpell, setHoveredSpell] = useState<Spell | null>(null);
  const [pinnedSpell, setPinnedSpell] = useState<Spell | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingSpells, setLoadingSpells] = useState(true);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const buttonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Fetch all spells on mount
  useEffect(() => {
    const fetchSpells = async () => {
      try {
        const res = await fetch('https://www.dnd5eapi.co/api/spells');
        const data = await res.json();
        setAllSpells(data.results);
      } catch (error) {
        console.error('Failed to fetch spells:', error);
      } finally {
        setLoadingSpells(false);
      }
    };

    fetchSpells();
  }, []);

  // Close tooltip on outside click or escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        // Check if the click is also not on any spell button
        const clickedSpellButton = Array.from(buttonRefs.current.values()).some(
          button => button.contains(event.target as Node)
        );
        if (!clickedSpellButton) {
          setPinnedSpell(null);
          setHoveredSpell(null);
        }
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setPinnedSpell(null);
        setHoveredSpell(null);
      }
    };

    if (hoveredSpell || pinnedSpell) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [hoveredSpell, pinnedSpell]);

  // Filter spells based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredSpells([]);
      return;
    }

    const filtered = allSpells
      .filter((spell) =>
        spell.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .slice(0, 10); // Limit to 10 results

    setFilteredSpells(filtered);
  }, [searchTerm, allSpells]);

  const fetchSpellDetails = async (spellIndex: string, buttonElement: HTMLButtonElement, pin: boolean = false) => {
    setLoading(true);
    try {
      const res = await fetch(`https://www.dnd5eapi.co/api/spells/${spellIndex}`);
      const data = await res.json();

      // Calculate tooltip position - position to the left and top of the card
      const cardElement = buttonElement.closest('.spell-lookup-card');
      const cardRect = cardElement?.getBoundingClientRect();

      if (cardRect) {
        // Position tooltip at top-left of the card (outside, to the left)
        // Move it up significantly to keep it visible on screen
        setTooltipPosition({
          top: -200, // Move up by 200px to be more visible
          left: -408, // Negative value to place it to the left (-400px width - 8px margin)
        });
      }

      if (pin) {
        setPinnedSpell(data);
        setHoveredSpell(null);
      } else {
        setHoveredSpell(data);
      }
    } catch (error) {
      console.error('Failed to fetch spell details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseTooltip = () => {
    setPinnedSpell(null);
    setHoveredSpell(null);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!pinnedSpell) return;

    // Only allow dragging from the header area (not from interactive elements)
    const target = e.target as HTMLElement;
    if (target.tagName === 'BUTTON' || target.closest('button')) return;

    setIsDragging(true);
    const rect = tooltipRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !tooltipRef.current) return;

    const cardElement = tooltipRef.current.closest('.spell-lookup-card');
    const cardRect = cardElement?.getBoundingClientRect();

    if (cardRect) {
      // Calculate new position relative to the card
      const newLeft = e.clientX - cardRect.left - dragOffset.x;
      const newTop = e.clientY - cardRect.top - dragOffset.y;

      setTooltipPosition({
        left: newLeft,
        top: newTop,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Handle dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  const getLevelText = (level: number) => {
    if (level === 0) return 'Cantrip';
    const suffix = level === 1 ? 'st' : level === 2 ? 'nd' : level === 3 ? 'rd' : 'th';
    return `${level}${suffix}-level`;
  };

  return (
    <>
      <style jsx>{`
        .spell-tooltip::-webkit-scrollbar {
          width: 8px;
        }
        .spell-tooltip::-webkit-scrollbar-track {
          background: rgba(28, 25, 23, 0.5);
          border-radius: 4px;
        }
        .spell-tooltip::-webkit-scrollbar-thumb {
          background: rgba(120, 113, 108, 0.5);
          border-radius: 4px;
        }
        .spell-tooltip::-webkit-scrollbar-thumb:hover {
          background: rgba(168, 162, 158, 0.7);
        }
      `}</style>
      <Card className="p-6 bg-stone-950/90 backdrop-blur-xl border-stone-900 relative spell-lookup-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-stone-200 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-red-400" />
            Spell Lookup
          </h2>
        </div>

      {/* Search Input */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-500" />
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search for a spell..."
          className="pl-10 bg-stone-900 border-stone-800 text-stone-100"
          disabled={loadingSpells}
        />
      </div>

      {/* Search Results */}
      {filteredSpells.length > 0 && (
        <div className="space-y-1 mb-4 max-h-64 overflow-y-auto">
          {filteredSpells.map((spell) => (
            <button
              key={spell.index}
              ref={(el) => {
                if (el) buttonRefs.current.set(spell.index, el);
              }}
              onMouseEnter={(e) => {
                if (!pinnedSpell) {
                  fetchSpellDetails(spell.index, e.currentTarget, false);
                }
              }}
              onMouseLeave={() => {
                if (!pinnedSpell) {
                  setHoveredSpell(null);
                }
              }}
              onClick={(e) => fetchSpellDetails(spell.index, e.currentTarget, true)}
              className="w-full text-left px-3 py-2 rounded bg-stone-900 hover:bg-stone-800 border border-stone-800 hover:border-stone-700 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-stone-200">{spell.name}</span>
                <span className="text-xs text-stone-500">
                  {spell.level === 0 ? 'Cantrip' : `Lvl ${spell.level}`}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {searchTerm && filteredSpells.length === 0 && !loadingSpells && (
        <div className="text-center text-stone-500 py-8">
          No spells found matching &ldquo;{searchTerm}&rdquo;
        </div>
      )}

      {!searchTerm && (
        <div className="text-center text-stone-500 py-8">
          {loadingSpells ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading spells...
            </div>
          ) : (
            'Search for a spell to view details'
          )}
        </div>
      )}

      {/* Tooltip */}
      {(hoveredSpell || pinnedSpell) && (
        <div
          ref={tooltipRef}
          className={`absolute z-[100] w-96 max-h-[600px] overflow-y-auto p-4 bg-stone-950 rounded-lg shadow-2xl spell-tooltip ${
            pinnedSpell ? 'border-2 border-amber-800' : 'border-2 border-stone-800'
          } ${pinnedSpell && isDragging ? 'cursor-grabbing' : pinnedSpell ? 'cursor-grab' : ''}`}
          style={{
            top: `${tooltipPosition.top}px`,
            left: `${tooltipPosition.left}px`,
            userSelect: isDragging ? 'none' : 'auto',
          }}
          onMouseDown={handleMouseDown}
        >
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-stone-500" />
            </div>
          ) : (
            <div className="space-y-3">
              {/* Close button and pinned indicator */}
              <div className="flex items-center justify-between -mt-1 -mr-1 mb-2">
                {pinnedSpell && (
                  <div className="flex items-center gap-1 text-xs text-amber-400">
                    <GripVertical className="h-3 w-3" />
                    <Pin className="h-3 w-3" />
                    <span>Pinned - Drag to move</span>
                  </div>
                )}
                <button
                  onClick={handleCloseTooltip}
                  className="ml-auto p-1 rounded hover:bg-stone-800 text-stone-400 hover:text-stone-200 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              {/* Spell Header */}
              <div>
                <h3 className="text-xl font-bold text-stone-100 mb-1">{(pinnedSpell || hoveredSpell)?.name}</h3>
                <p className="text-xs text-stone-400">
                  {getLevelText((pinnedSpell || hoveredSpell)!.level)} {(pinnedSpell || hoveredSpell)?.school.name.toLowerCase()}
                  {(pinnedSpell || hoveredSpell)?.ritual && ' (ritual)'}
                </p>
              </div>

              {/* Spell Stats */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-black/30 border border-stone-800 rounded p-2">
                  <div className="text-[10px] text-stone-500 uppercase tracking-wider mb-1">Casting Time</div>
                  <div className="text-stone-200">{(pinnedSpell || hoveredSpell)?.casting_time}</div>
                </div>
                <div className="bg-black/30 border border-stone-800 rounded p-2">
                  <div className="text-[10px] text-stone-500 uppercase tracking-wider mb-1">Range</div>
                  <div className="text-stone-200">{(pinnedSpell || hoveredSpell)?.range}</div>
                </div>
                <div className="bg-black/30 border border-stone-800 rounded p-2">
                  <div className="text-[10px] text-stone-500 uppercase tracking-wider mb-1">Components</div>
                  <div className="text-stone-200">{(pinnedSpell || hoveredSpell)?.components.join(', ')}</div>
                </div>
                <div className="bg-black/30 border border-stone-800 rounded p-2">
                  <div className="text-[10px] text-stone-500 uppercase tracking-wider mb-1">Duration</div>
                  <div className="text-stone-200">
                    {(pinnedSpell || hoveredSpell)?.concentration && 'Concentration, '}
                    {(pinnedSpell || hoveredSpell)?.duration}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="bg-black/30 border border-stone-800 rounded p-3">
                <div className="text-[10px] text-stone-500 uppercase tracking-wider mb-1">Description</div>
                <div className="text-xs text-stone-300 space-y-1">
                  {(pinnedSpell || hoveredSpell)?.desc.map((paragraph, idx) => (
                    <p key={idx}>{paragraph}</p>
                  ))}
                </div>
              </div>

              {/* At Higher Levels */}
              {(pinnedSpell || hoveredSpell)?.higher_level && (pinnedSpell || hoveredSpell)!.higher_level!.length > 0 && (
                <div className="bg-black/30 border border-stone-800 rounded p-3">
                  <div className="text-[10px] text-stone-500 uppercase tracking-wider mb-1">At Higher Levels</div>
                  <div className="text-xs text-stone-300 space-y-1">
                    {(pinnedSpell || hoveredSpell)?.higher_level?.map((paragraph, idx) => (
                      <p key={idx}>{paragraph}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* Classes */}
              {(pinnedSpell || hoveredSpell)?.classes && (pinnedSpell || hoveredSpell)!.classes!.length > 0 && (
                <div className="bg-black/30 border border-stone-800 rounded p-3">
                  <div className="text-[10px] text-stone-500 uppercase tracking-wider mb-1">Available To</div>
                  <div className="text-xs text-stone-300">
                    {(pinnedSpell || hoveredSpell)?.classes?.map((c) => c.name).join(', ')}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      </Card>
    </>
  );
}
