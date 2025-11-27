'use client';

import { useState } from 'react';
import { Swords } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function CombatFloatingButton() {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  const handleStartCombat = () => {
    router.push('/combat-helper');
  };

  return (
    <button
      onClick={handleStartCombat}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-red-900 hover:bg-red-800 border-2 border-red-700 rounded-full shadow-2xl transition-all duration-200 hover:scale-110 flex items-center justify-center group"
      aria-label="Start Combat"
    >
      <Swords className="h-8 w-8 text-stone-100" />

      {/* Tooltip */}
      {isHovered && (
        <div className="absolute bottom-full mb-2 right-0 bg-stone-950 border border-stone-800 rounded px-3 py-2 whitespace-nowrap text-sm text-stone-200 pointer-events-none">
          Start Combat
        </div>
      )}
    </button>
  );
}
