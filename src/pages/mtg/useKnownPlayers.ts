import { useCallback, useState } from 'react';

/** A commander combo: 1 name (solo) or 2 names (partners). */
export type CommanderCombo = string[];

export type KnownPlayerData = {
  name: string;
  combos: CommanderCombo[];
};

type UseKnownPlayersResult = {
  knownPlayers: KnownPlayerData[];
  saveCombo: (name: string, combo: CommanderCombo) => void;
  removeCombo: (playerName: string, comboIndex: number) => void;
  removePlayer: (playerName: string) => void;
  clearAllPlayers: () => void;
};

type LegacyPlayerData = { name: string; commanders: string[] };

const STORAGE_KEY = 'mtg-known-players';

function loadFromStorage(): KnownPlayerData[] {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    if (!Array.isArray(raw)) return [];
    return raw.map((item: KnownPlayerData | LegacyPlayerData) => {
      // Migrate old flat `commanders: string[]` format
      if ('commanders' in item && !('combos' in item)) {
        return { name: item.name, combos: (item as LegacyPlayerData).commanders.map(c => [c]) };
      }
      return item as KnownPlayerData;
    });
  } catch {
    return [];
  }
}

function combosEqual(a: CommanderCombo, b: CommanderCombo): boolean {
  return a.length === b.length && a.every((v, i) => v.toLowerCase() === b[i].toLowerCase());
}

export function useKnownPlayers(): UseKnownPlayersResult {
  const [knownPlayers, setKnownPlayers] = useState<KnownPlayerData[]>(loadFromStorage);

  const persist = useCallback((players: KnownPlayerData[]) => {
    setKnownPlayers(players);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(players));
  }, []);

  /** Upserts a player and adds the combo if it isn't already saved. */
  const saveCombo = useCallback((name: string, combo: CommanderCombo) => {
    const trimmed = name.trim();
    const filtered = combo.filter(Boolean);
    if (!trimmed || !filtered.length) return;
    const current = loadFromStorage();
    const idx = current.findIndex(p => p.name.toLowerCase() === trimmed.toLowerCase());
    if (idx >= 0) {
      const already = current[idx].combos.some(c => combosEqual(c, filtered));
      if (already) return;
      persist(current.map((p, i) => (i === idx ? { ...p, combos: [...p.combos, filtered] } : p)));
    } else {
      persist([...current, { name: trimmed, combos: [filtered] }]);
    }
  }, [persist]);

  const removeCombo = useCallback((playerName: string, comboIndex: number) => {
    const current = loadFromStorage();
    persist(
      current.map(p =>
        p.name.toLowerCase() === playerName.toLowerCase()
          ? { ...p, combos: p.combos.filter((_, i) => i !== comboIndex) }
          : p
      )
    );
  }, [persist]);

  const removePlayer = useCallback((playerName: string) => {
    const current = loadFromStorage();
    persist(current.filter(p => p.name.toLowerCase() !== playerName.toLowerCase()));
  }, [persist]);

  const clearAllPlayers = useCallback(() => {
    persist([]);
  }, [persist]);

  return { knownPlayers, saveCombo, removeCombo, removePlayer, clearAllPlayers };
}
