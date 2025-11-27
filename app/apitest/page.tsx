'use client';

import { useState } from 'react';

type EndpointCategory = {
  name: string;
  endpoints: { label: string; url: string }[];
};

const API_CATEGORIES: EndpointCategory[] = [
  {
    name: 'Classes',
    endpoints: [
      { label: 'All Classes', url: '/api/classes' },
      { label: 'Barbarian', url: '/api/classes/barbarian' },
      { label: 'Wizard', url: '/api/classes/wizard' },
    ],
  },
  {
    name: 'Spells',
    endpoints: [
      { label: 'All Spells', url: '/api/spells' },
      { label: 'Fireball', url: '/api/spells/fireball' },
      { label: 'Magic Missile', url: '/api/spells/magic-missile' },
    ],
  },
  {
    name: 'Monsters',
    endpoints: [
      { label: 'All Monsters', url: '/api/monsters' },
      { label: 'Adult Black Dragon', url: '/api/monsters/adult-black-dragon' },
      { label: 'Goblin', url: '/api/monsters/goblin' },
    ],
  },
  {
    name: 'Equipment',
    endpoints: [
      { label: 'All Equipment', url: '/api/equipment' },
      { label: 'Longsword', url: '/api/equipment/longsword' },
      { label: 'Chain Mail', url: '/api/equipment/chain-mail' },
    ],
  },
  {
    name: 'Races',
    endpoints: [
      { label: 'All Races', url: '/api/races' },
      { label: 'Elf', url: '/api/races/elf' },
      { label: 'Dwarf', url: '/api/races/dwarf' },
    ],
  },
  {
    name: 'Other',
    endpoints: [
      { label: 'All Abilities', url: '/api/ability-scores' },
      { label: 'All Skills', url: '/api/skills' },
      { label: 'All Conditions', url: '/api/conditions' },
      { label: 'All Magic Items', url: '/api/magic-items' },
    ],
  },
];

export default function APITestPage() {
  const [response, setResponse] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedUrl, setSelectedUrl] = useState<string>('');

  const fetchData = async (endpoint: string) => {
    setLoading(true);
    setError(null);
    setSelectedUrl(endpoint);

    try {
      const res = await fetch(`https://www.dnd5eapi.co${endpoint}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      const data = await res.json();
      setResponse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setResponse(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <h1 className="text-3xl font-bold mb-4">D&D 5e API Test</h1>

      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p className="text-sm">
          Testing the <strong>D&D 5e API</strong> (dnd5eapi.co) - Free, open-source SRD content under CC-BY-4.0 license
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar with endpoints */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <h2 className="text-xl font-semibold mb-4">Endpoints</h2>

            {API_CATEGORIES.map((category) => (
              <div key={category.name} className="mb-4">
                <h3 className="font-semibold text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {category.name}
                </h3>
                <div className="space-y-1">
                  {category.endpoints.map((endpoint) => (
                    <button
                      key={endpoint.url}
                      onClick={() => fetchData(endpoint.url)}
                      className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${selectedUrl === endpoint.url
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                    >
                      {endpoint.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Response display */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Response</h2>
              {selectedUrl && (
                <code className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                  {selectedUrl}
                </code>
              )}
            </div>

            {loading && (
              <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Loading...</div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-4">
                <p className="text-red-800 dark:text-red-200 font-semibold">Error:</p>
                <p className="text-red-600 dark:text-red-300">{error}</p>
              </div>
            )}

            {!loading && !error && !!response && (
              <div className="bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700 p-4 overflow-auto max-h-[600px]">
                <pre className="text-xs">
                  {JSON.stringify(response, null, 2)}
                </pre>
              </div>
            )}

            {!loading && !error && !response && (
              <div className="flex items-center justify-center h-64 text-gray-500">
                Select an endpoint to view the response
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
