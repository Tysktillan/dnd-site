'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import CharacterSheet from "@/components/character/CharacterSheet";
import { Player } from '@prisma/client';

export default function CharacterPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [character, setCharacter] = useState<Player | null>(null);
  const [secondaryCharacter, setSecondaryCharacter] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchCharacter();
    }
  }, [status]);

  // Refetch character data when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && status === 'authenticated') {
        fetchCharacter();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [status]);

  const fetchCharacter = async () => {
    try {
      const res = await fetch('/api/character');
      if (res.ok) {
        const data = await res.json();
        setCharacter(data);
      }

      // Fetch secondary character if exists
      const secondaryRes = await fetch('/api/character?secondary=true');
      if (secondaryRes.ok) {
        const secondaryData = await secondaryRes.json();
        setSecondaryCharacter(secondaryData);
      }
    } catch (error) {
      console.error('Failed to fetch character:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-stone-400">Laddar karaktär...</div>
      </div>
    );
  }

  if (!character) {
    return (
      <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto">
        <div className="text-center py-20">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-stone-200 mb-4">Ingen Karaktär Hittades</h1>
          <p className="text-stone-400">Kontakta din SL för att skapa din karaktär.</p>
        </div>
      </div>
    );
  }

  return <CharacterSheet character={character} secondaryCharacter={secondaryCharacter} />;
}
