import { useState, useEffect, useLayoutEffect, useRef, useMemo } from 'react';
import { keyframes } from '@emotion/react';
import { Backdrop, Box, Button, IconButton, Tooltip, Typography, useMediaQuery } from '@mui/material';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightIcon from '@mui/icons-material/Light';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import { getMtgTheme, setMtgTheme, applyMtgTheme } from '../../utils/ThemeHandler';
import type { AppTheme } from '../../utils/ThemeHandler';
import { getPlayerColorsCookie, setPlayerColorsCookie } from '../../utils/ThemeCookie';
import Icon from '@mdi/react';
import { mdiUnicornVariant } from '@mdi/js';
import PlayerQuadrant from './PlayerQuadrant';
import CommanderDamageModal from './CommanderDamageModal';
import PlayerSettingsModal from './PlayerSettingsModal';
import ResetDialog from './ResetDialog';
import QuickSetupDialog from './QuickSetupDialog';
import commandersData from './commanders-data';
import type { Player, ModalState, CommanderEntry, LifeHistoryEntry } from './types';
import { getPlayerModalRotation, mkPlayers, syncAliveOverride } from './types';

type FullscreenDocument = Document & {
  webkitExitFullscreen?: () => Promise<void> | void;
  webkitFullscreenElement?: Element | null;
};

type FullscreenElement = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void> | void;
};

type SupportedOrientationLock = 'landscape';

type ScreenOrientationWithLock = ScreenOrientation & {
  lock?: (orientation: SupportedOrientationLock) => Promise<void>;
  unlock?: () => void;
};

type ScreenWithOrientation = Screen & {
  orientation?: ScreenOrientationWithLock;
};

const neonGlow = keyframes`
  0%, 100% {
    text-shadow:
      0 0 5px #ffffff,
      0 0 10px #acecec,
      0 0 20px #42dcdb;
  }
  50% {
    text-shadow:
      0 0 2px #ffffff,
      0 0 5px #acecec,
      0 0 10px #42dcdb;
  }
`;

const QUADRANTS: Array<{ pid: number; rotation: 0 | 180; area: string }> = [
  { pid: 2, rotation: 180, area: 'p0' },
  { pid: 3, rotation: 180, area: 'p1' },
  { pid: 1, rotation: 0,   area: 'p2' },
  { pid: 0, rotation: 0,   area: 'p3' },
];

const PLAYERS_STORAGE_KEY = 'mtg_commander_players_v1';
const MENU_AUTO_HIDE_MS = 5000;

function readStoredPlayers(): Player[] {
  if (typeof window === 'undefined') return mkPlayers();

  const defaults = mkPlayers();

  // Apply persisted accent colors from cookie onto defaults before checking session
  const cookieColors = getPlayerColorsCookie();
  if (cookieColors) {
    cookieColors.forEach((color, i) => {
      if (i < defaults.length && color) defaults[i] = { ...defaults[i], accentColor: color };
    });
  }

  const stored = sessionStorage.getItem(PLAYERS_STORAGE_KEY);
  if (!stored) return defaults;

  try {
    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed) || parsed.length !== defaults.length) return defaults;

    return defaults.map((fallback, index) => {
      const candidate = parsed[index];
      if (!candidate || typeof candidate !== 'object') return fallback;

      const player = candidate as Record<string, unknown>;

      // Migrate old flat [number,number,number,number] format to [[n,n],[n,n],[n,n],[n,n]]
      const cmdDmg: Player['cmdDmg'] = Array.isArray(player.cmdDmg) && player.cmdDmg.length === 4
        ? (player.cmdDmg as unknown[]).map((slot, i): [number, number] => {
            if (Array.isArray(slot) && slot.length === 2) {
              const d0 = typeof slot[0] === 'number' && Number.isFinite(slot[0]) ? slot[0] : fallback.cmdDmg[i][0];
              const d1 = typeof slot[1] === 'number' && Number.isFinite(slot[1]) ? slot[1] : fallback.cmdDmg[i][1];
              return [d0, d1];
            }
            // Legacy flat number — treat as primary commander damage, partner = 0
            const d0 = typeof slot === 'number' && Number.isFinite(slot) ? slot : 0;
            return [d0, 0];
          }) as Player['cmdDmg']
        : fallback.cmdDmg;

      return syncAliveOverride({
        name: typeof player.name === 'string' ? player.name : fallback.name,
        life: typeof player.life === 'number' && Number.isFinite(player.life) ? player.life : fallback.life,
        cmdDmg,
        accentColor: typeof player.accentColor === 'string' ? player.accentColor : fallback.accentColor,
        poisonCounters:
          typeof player.poisonCounters === 'number' && Number.isFinite(player.poisonCounters)
            ? player.poisonCounters
            : fallback.poisonCounters,
        isDead: typeof player.isDead === 'boolean' ? player.isDead : fallback.isDead,
        isAliveOverride:
          typeof player.isAliveOverride === 'boolean' ? player.isAliveOverride : fallback.isAliveOverride,
        isMonarch: typeof player.isMonarch === 'boolean' ? player.isMonarch : fallback.isMonarch,
        commander: typeof player.commander === 'string' ? player.commander : fallback.commander,
        commanderArtUrl:
          typeof player.commanderArtUrl === 'string' ? player.commanderArtUrl : fallback.commanderArtUrl,
        partnerCommander:
          typeof player.partnerCommander === 'string' ? player.partnerCommander : fallback.partnerCommander,
        partnerCommanderArtUrl:
          typeof player.partnerCommanderArtUrl === 'string'
            ? player.partnerCommanderArtUrl
            : fallback.partnerCommanderArtUrl,
      });
    });
  } catch (error) {
    console.error('Failed to restore commander tracker state.', error);
    return defaults;
  }
}

export default function Commander() {
  const [players, setPlayers] = useState<Player[]>(readStoredPlayers);
  const [monarchIntroduced, setMonarchIntroduced] = useState(
    () => readStoredPlayers().some(p => p.isMonarch),
  );
  const [lifeHistory, setLifeHistory] = useState<LifeHistoryEntry[][]>(() => [[], [], [], []]);
  const [resetOpen, setResetOpen] = useState(false);
  const [newGameOpen, setNewGameOpen] = useState(false);
  const [quickSetupOpen, setQuickSetupOpen] = useState(false);
  const [modal, setModal] = useState<ModalState | null>(null);
  const [settingsPid, setSettingsPid] = useState<number | null>(null);
  const [commanders] = useState<CommanderEntry[]>(commandersData);
  const commandersLoading = false;
  const [fullscreenSupported, setFullscreenSupported] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenMenuVisible, setFullscreenMenuVisible] = useState(false);
  const [mtgTheme, setMtgThemeState] = useState<AppTheme>(() => getMtgTheme());
  const [startingLifeTotal, setStartingLifeTotal] = useState<20 | 40>(() => {
    const stored = localStorage.getItem('mtg_starting_life');
    if (stored === '20' || stored === '40') return Number(stored) as 20 | 40;
    return readStoredPlayers().every(p => p.life === 20) ? 20 : 40;
  });
  const [playerCount, setPlayerCount] = useState<2 | 3 | 4>(() => {
    const stored = localStorage.getItem('mtg_player_count');
    return (stored === '2' ? 2 : stored === '3' ? 3 : 4) as 2 | 3 | 4;
  });
  const [threeLayout, setThreeLayout] = useState<'A' | 'B'>(() => {
    return (localStorage.getItem('mtg_three_layout') as 'A' | 'B') || 'A';
  });
  const [layoutModalOpen, setLayoutModalOpen] = useState(false);
  const boardRef = useRef<HTMLDivElement | null>(null);
  const fullscreenMenuTimerRef = useRef<number | null>(null);
  const mobileLayout = useMediaQuery('(pointer: coarse)');
  const portraitViewport = useMediaQuery('(pointer: coarse) and (orientation: portrait)');
  const narrowMobileWidth = useMediaQuery('(pointer: coarse) and (max-width: 480px)');
  const shortMobileHeight = useMediaQuery('(pointer: coarse) and (max-height: 480px)');
  const rotateMobileSurface = mobileLayout && portraitViewport;
  const surfaceRotation = rotateMobileSurface ? 90 : 0;
  const compactLayout = narrowMobileWidth || shortMobileHeight;

  useLayoutEffect(() => {
    applyMtgTheme();
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(PLAYERS_STORAGE_KEY, JSON.stringify(players));
    } catch (error) {
      console.error('Failed to persist commander tracker state.', error);
    }
  }, [players]);

  useEffect(() => {
    setPlayerColorsCookie(players.map(p => p.accentColor));
  }, [players[0].accentColor, players[1].accentColor, players[2].accentColor, players[3].accentColor]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    localStorage.setItem('mtg_starting_life', String(startingLifeTotal));
  }, [startingLifeTotal]);

  useEffect(() => {
    const doc = document as FullscreenDocument;
    const unlockOrientation = () => {
      if (!mobileLayout) return;
      try {
        (window.screen as ScreenWithOrientation).orientation?.unlock?.();
      } catch (error) {
        console.error('Failed to unlock screen orientation.', error);
      }
    };

    const syncFullscreenState = () => {
      const fullscreenActive = Boolean(doc.fullscreenElement ?? doc.webkitFullscreenElement);
      setIsFullscreen(fullscreenActive);
      setFullscreenSupported(Boolean(
        doc.fullscreenEnabled ||
        (doc.documentElement as FullscreenElement).requestFullscreen ||
        (doc.documentElement as FullscreenElement).webkitRequestFullscreen
      ));
      if (!fullscreenActive) unlockOrientation();
    };

    syncFullscreenState();
    doc.addEventListener('fullscreenchange', syncFullscreenState);
    doc.addEventListener('webkitfullscreenchange', syncFullscreenState as EventListener);

    return () => {
      doc.removeEventListener('fullscreenchange', syncFullscreenState);
      doc.removeEventListener('webkitfullscreenchange', syncFullscreenState as EventListener);
    };
  }, [mobileLayout]);

  const clearFullscreenMenuTimer = () => {
    if (fullscreenMenuTimerRef.current === null) return;
    window.clearTimeout(fullscreenMenuTimerRef.current);
    fullscreenMenuTimerRef.current = null;
  };

  const scheduleFullscreenMenuHide = () => {
    clearFullscreenMenuTimer();
    fullscreenMenuTimerRef.current = window.setTimeout(() => {
      setFullscreenMenuVisible(false);
      fullscreenMenuTimerRef.current = null;
    }, MENU_AUTO_HIDE_MS);
  };

  const showFullscreenMenu = () => {
    setFullscreenMenuVisible(true);
    scheduleFullscreenMenuHide();
  };

  const handleFullscreenMenuInteraction = () => {
    if (!isFullscreen || !fullscreenMenuVisible) return;
    scheduleFullscreenMenuHide();
  };

  useEffect(() => {
    if (!isFullscreen) {
      setFullscreenMenuVisible(false);
      clearFullscreenMenuTimer();
      return;
    }
    setFullscreenMenuVisible(false);
    clearFullscreenMenuTimer();
  }, [isFullscreen]);

  useEffect(() => () => clearFullscreenMenuTimer(), []);

  const lockLandscapeOrientation = async () => {
    if (!mobileLayout) return;
    try {
      await (window.screen as ScreenWithOrientation).orientation?.lock?.('landscape');
    } catch (error) {
      console.error('Failed to lock screen orientation.', error);
    }
  };

  const toggleFullscreen = async () => {
    const doc = document as FullscreenDocument;
    const root = doc.documentElement as FullscreenElement;

    try {
      if (doc.fullscreenElement ?? doc.webkitFullscreenElement) {
        if (doc.exitFullscreen) {
          await doc.exitFullscreen();
        } else if (doc.webkitExitFullscreen) {
          await doc.webkitExitFullscreen();
        }
        return;
      }

      if (root.requestFullscreen) {
        await root.requestFullscreen({ navigationUI: 'hide' });
      } else if (root.webkitRequestFullscreen) {
        await root.webkitRequestFullscreen();
      }

      await lockLandscapeOrientation();
    } catch (error) {
      console.error('Failed to toggle fullscreen mode.', error);
    }
  };

  const pushLifeHistory = (pid: number, entry: Omit<LifeHistoryEntry, 'id' | 'timestamp'>) => {
    setLifeHistory(prev => {
      const next = [...prev];
      next[pid] = [
        { ...entry, id: crypto.randomUUID(), timestamp: Date.now() },
        ...prev[pid],
      ].slice(0, 10);
      return next;
    });
  };

  const revertLatestHistory = (pid: number) => {
    const entries = lifeHistory[pid];
    if (!entries.length) return;
    const latest = entries[0];
    setPlayers(prev => prev.map((p, i) => {
      if (i !== pid) return p;
      let next = { ...p, life: p.life - latest.delta };
      if (
        latest.source === 'commander' &&
        latest.cmdDmgAttacker !== undefined &&
        latest.cmdDmgFrom !== undefined
      ) {
        const newDmg = [...next.cmdDmg] as Player['cmdDmg'];
        newDmg[latest.cmdDmgAttacker] = latest.cmdDmgFrom;
        next = { ...next, cmdDmg: newDmg };
      }
      return syncAliveOverride(next);
    }));
    setLifeHistory(prev => {
      const next = [...prev];
      next[pid] = prev[pid].slice(1);
      return next;
    });
  };

  const updatePlayer = (pid: number, update: Partial<Player>) => {
    if (update.isMonarch === true) setMonarchIntroduced(true);
    setPlayers(prev => prev.map((p, i) => {
      if (update.isMonarch === true && i !== pid) return { ...p, isMonarch: false };
      if (i !== pid) return p;
      const next = { ...p, ...update };
      if (update.isDead === true) next.isAliveOverride = false;
      return syncAliveOverride(next);
    }));
  };

  const updateLife = (pid: number, delta: number) =>
    setPlayers(prev => prev.map((p, i) => {
      if (i !== pid) return p;
      return syncAliveOverride({ ...p, life: p.life + delta });
    }));

  const setLife = (pid: number, life: number) =>
    setPlayers(prev => prev.map((p, i) => {
      if (i !== pid) return p;
      return syncAliveOverride({ ...p, life });
    }));

  const openModal = (victim: number, attacker: number) => {
    const val = players[victim].cmdDmg[attacker];
    setModal({ victim, attacker, value: [val[0], val[1]], original: [val[0], val[1]] });
  };

  const closeModal = () => {
    if (!modal) return;
    const diff = (modal.value[0] + modal.value[1]) - (modal.original[0] + modal.original[1]);
    setPlayers(prev => prev.map((p, i) => {
      if (i !== modal.victim) return p;
      const newDmg = [...p.cmdDmg] as Player['cmdDmg'];
      newDmg[modal.attacker] = [modal.value[0], modal.value[1]];
      return syncAliveOverride({ ...p, life: p.life - diff, cmdDmg: newDmg });
    }));
    if (diff !== 0) {
      const attacker = players[modal.attacker];
      pushLifeHistory(modal.victim, {
        delta: -diff,
        source: 'commander',
        attackerPid: modal.attacker,
        attackerName: attacker.name,
        attackerCommander: [attacker.commander, attacker.partnerCommander].filter(Boolean).join(' // '),
        attackerAccent: attacker.accentColor,
        cmdDmgAttacker: modal.attacker,
        cmdDmgFrom: [modal.original[0], modal.original[1]],
      });
    }
    setModal(null);
  };

  const startNewGame = (refreshCommanders: boolean) => {
    setPlayers(prev => {
      const defaults = mkPlayers();
      return defaults.map((fallback, index) => ({
        ...fallback,
        name: prev[index]?.name ?? fallback.name,
        commander: refreshCommanders ? fallback.commander : (prev[index]?.commander ?? fallback.commander),
        commanderArtUrl: refreshCommanders ? fallback.commanderArtUrl : (prev[index]?.commanderArtUrl ?? fallback.commanderArtUrl),
        partnerCommander: refreshCommanders ? fallback.partnerCommander : (prev[index]?.partnerCommander ?? fallback.partnerCommander),
        partnerCommanderArtUrl: refreshCommanders
          ? fallback.partnerCommanderArtUrl
          : (prev[index]?.partnerCommanderArtUrl ?? fallback.partnerCommanderArtUrl),
      }));
    });
    setModal(null);
    setSettingsPid(null);
    setNewGameOpen(false);
    setLifeHistory([[], [], [], []]);
    setStartingLifeTotal(40);
  };

  const applyQuickSetup = (entries: Array<{ name: string; commander: string; partnerCommander: string }>, startingLife: 20 | 40) => {
    setPlayers(prev => prev.map((player, index) => {
      const entry = entries[index];
      if (!entry) return player;

      const nextName = entry.name.trim() || player.name;
      const nextCommander = entry.commander.trim();
      const nextPartnerCommander = entry.partnerCommander.trim();
      const found = commanders.find(c => c.name.toLowerCase() === nextCommander.toLowerCase());
      const foundPartner = commanders.find(c => c.name.toLowerCase() === nextPartnerCommander.toLowerCase());
      return syncAliveOverride({
        ...player,
        name: nextName,
        life: startingLife,
        isDead: false,
        commander: nextCommander,
        commanderArtUrl: nextCommander ? (found?.artCrop ?? '') : '',
        partnerCommander: nextPartnerCommander,
        partnerCommanderArtUrl: nextPartnerCommander ? (foundPartner?.artCrop ?? '') : '',
      });
    }));
    setLifeHistory([[], [], [], []]);
    setStartingLifeTotal(startingLife);
    setQuickSetupOpen(false);
  };

  const showCenterMenu = !isFullscreen || fullscreenMenuVisible;

  const layoutConfig = useMemo(() => {
    if (playerCount === 2) {
      return {
        activeQuadrants: [
          { pid: 0, rotation: 180 as const, area: 'pa' },
          { pid: 1, rotation: 0 as const,   area: 'pb' },
        ],
        gridTemplateAreas: showCenterMenu ? '"pa" "bar" "pb"' : '"pa" "pb"',
        gridTemplateColumns: '1fr',
        // top-left=pid0, top-right=null, bottom-left=pid1, bottom-right=null
        physicalLayout: [0, null, 1, null] as (number | null)[],
      };
    }
    if (playerCount === 3) {
      if (threeLayout === 'A') {
        return {
          activeQuadrants: [
            { pid: 0, rotation: 180 as const, area: 'pa' },
            { pid: 1, rotation: 0 as const,   area: 'pb' },
            { pid: 2, rotation: 0 as const,   area: 'pc' },
          ],
          gridTemplateAreas: showCenterMenu ? '"pa ." "bar bar" "pb pc"' : '"pa ." "pb pc"',
          gridTemplateColumns: '1fr 1fr',
          // top-left=pid0, top-right=null, bottom-left=pid1, bottom-right=pid2
          physicalLayout: [0, null, 1, 2] as (number | null)[],
        };
      }
      return {
        activeQuadrants: [
          { pid: 0, rotation: 180 as const, area: 'pa' },
          { pid: 1, rotation: 180 as const, area: 'pb' },
          { pid: 2, rotation: 0 as const,   area: 'pc' },
        ],
        gridTemplateAreas: showCenterMenu ? '"pa pb" "bar bar" "pc ."' : '"pa pb" "pc ."',
        gridTemplateColumns: '1fr 1fr',
        // top-left=pid0, top-right=pid1, bottom-left=pid2, bottom-right=null
        physicalLayout: [0, 1, 2, null] as (number | null)[],
      };
    }
    return {
      activeQuadrants: QUADRANTS,
      gridTemplateAreas: showCenterMenu ? '"p0 p1" "bar bar" "p2 p3"' : '"p0 p1" "p2 p3"',
      gridTemplateColumns: '1fr 1fr',
      // top-left=pid2, top-right=pid3, bottom-left=pid1, bottom-right=pid0
      physicalLayout: [2, 3, 1, 0] as (number | null)[],
    };
  }, [playerCount, threeLayout, showCenterMenu]);
  const modalRotation = useMemo(() => {
    if (!modal) return 0;
    return layoutConfig.activeQuadrants.find(q => q.pid === modal.victim)?.rotation ?? 0;
  }, [layoutConfig.activeQuadrants, modal]);

  return (
    <Box sx={{
      position: 'fixed', inset: 0,
      overflow: 'hidden',
    }}>
      <Box
        ref={boardRef}
        sx={{
          position: 'absolute',
          inset: mobileLayout ? '50%' : 0,
          width: mobileLayout ? '100dvmax' : '100%',
          height: mobileLayout ? '100dvmin' : '100%',
          display: 'grid',
          gridTemplateAreas: layoutConfig.gridTemplateAreas,
          gridTemplateRows: showCenterMenu ? (compactLayout ? '1fr 44px 1fr' : '1fr 52px 1fr') : '1fr 1fr',
          gridTemplateColumns: layoutConfig.gridTemplateColumns,
          gap: compactLayout ? '6px' : '8px',
          p: compactLayout ? '6px' : '8px',
          boxSizing: 'border-box',
          transform: mobileLayout
            ? `translate(-50%, -50%)${rotateMobileSurface ? ' rotate(90deg)' : ''}`
            : 'none',
          transformOrigin: 'center',
        }}
      >
        {layoutConfig.activeQuadrants.map(({ pid, rotation, area }) => (
          <PlayerQuadrant
            key={pid}
            pid={pid}
            player={players[pid]}
            allPlayers={players}
            rotation={rotation}
            physicalLayout={layoutConfig.physicalLayout}
            startingLife={startingLifeTotal}
            monarchIntroduced={monarchIntroduced}
            onLifeChange={delta => updateLife(pid, delta)}
            onLifeSet={life => setLife(pid, life)}
            onPlayerUpdate={update => updatePlayer(pid, update)}
            onDamageClick={attacker => openModal(pid, attacker)}
            onOpenSettings={() => setSettingsPid(pid)}
            lifeHistory={lifeHistory[pid]}
            onLifeHistoryCommit={delta => pushLifeHistory(pid, { delta, source: 'manual' })}
            onRevertHistory={() => revertLatestHistory(pid)}
            compact={compactLayout}
            sx={{
              gridArea: area,
              borderRadius: compactLayout ? '10px' : '12px',
              ...(playerCount === 2 ? { width: '100%', maxWidth: '75%', justifySelf: 'center' } : {}),
            }}
          />
        ))}

        {showCenterMenu && (
          <Box
            onClickCapture={handleFullscreenMenuInteraction}
            sx={{
              gridArea: 'bar',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1,
              px: compactLayout ? 0.5 : 1,
              mx: compactLayout ? 0.25 : 0.5,
              borderRadius: compactLayout ? '14px' : '18px',
              bgcolor: 'transparent',
              backdropFilter: 'none',
              boxShadow: 'none',
            }}
          >
            {fullscreenSupported && (
              <Button
                variant="outlined"
                size="small"
                startIcon={isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
                onClick={toggleFullscreen}
                sx={{
                  color: '#d7deef', borderColor: 'rgba(148, 163, 184, 0.28)', textTransform: 'none',
                  fontSize: compactLayout ? '0.72rem' : '0.78rem',
                  minHeight: compactLayout ? 32 : undefined,
                  px: compactLayout ? 1 : 1.25,
                  borderRadius: 999,
                  bgcolor: 'rgba(255,255,255,0.02)',
                  '&:hover': {
                    borderColor: 'rgba(191, 219, 254, 0.55)',
                    bgcolor: 'rgba(255,255,255,0.07)',
                  },
                }}
              >
                {isFullscreen ? 'Exit' : 'Fullscreen'}
              </Button>
            )}
            <Typography
              component="a"
              href="/"
              aria-label="Home"
              sx={{
                color: '#eff6ff',
                textDecoration: 'none',
                textAlign: 'center',
                whiteSpace: 'nowrap',
                fontFamily: "'Monoton-Regular', monospace",
                fontSize: compactLayout ? '1.15rem' : '1.6rem',
                lineHeight: 1,
                animation: `${neonGlow} 4s infinite alternate ease-in-out`,
                textShadow: `
                  0 0 5px #ffffff,
                  0 0 12px rgba(172, 236, 236, 0.8),
                  0 0 26px rgba(66, 220, 219, 0.65)
                `,
              }}
            >
              FLOW.FAIL
            </Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setQuickSetupOpen(true)}
              sx={{
                color: '#d7deef', borderColor: 'rgba(148, 163, 184, 0.28)', textTransform: 'none',
                fontSize: compactLayout ? '0.72rem' : '0.78rem',
                minHeight: compactLayout ? 32 : undefined,
                px: compactLayout ? 1 : 1.25,
                borderRadius: 999,
                bgcolor: 'rgba(255,255,255,0.02)',
                '&:hover': {
                  borderColor: 'rgba(191, 219, 254, 0.55)',
                  bgcolor: 'rgba(255,255,255,0.07)',
                },
              }}
            >
              Setup
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setNewGameOpen(true)}
              sx={{
                color: '#d7deef', borderColor: 'rgba(148, 163, 184, 0.28)', textTransform: 'none',
                fontSize: compactLayout ? '0.72rem' : '0.78rem',
                minHeight: compactLayout ? 32 : undefined,
                px: compactLayout ? 1 : 1.25,
                borderRadius: 999,
                bgcolor: 'rgba(255,255,255,0.02)',
                '&:hover': {
                  borderColor: 'rgba(191, 219, 254, 0.55)',
                  bgcolor: 'rgba(255,255,255,0.07)',
                },
              }}
            >
              New game
            </Button>
            <Tooltip title="Reset">
              <IconButton
                size="small"
                onClick={() => setResetOpen(true)}
                sx={{
                  color: '#d7deef',
                  border: '1px solid rgba(148, 163, 184, 0.28)',
                  borderRadius: 999,
                  width: compactLayout ? 32 : 36,
                  height: compactLayout ? 32 : 36,
                  bgcolor: 'rgba(255,255,255,0.02)',
                  '&:hover': {
                    borderColor: 'rgba(191, 219, 254, 0.55)',
                    bgcolor: 'rgba(255,255,255,0.07)',
                  },
                }}
              >
                <RestartAltIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={`Players: ${playerCount}`}>
              <IconButton
                size="small"
                onClick={() => setLayoutModalOpen(true)}
                sx={{
                  color: '#d7deef',
                  border: '1px solid rgba(148, 163, 184, 0.28)',
                  borderRadius: 999,
                  width: compactLayout ? 32 : 36,
                  height: compactLayout ? 32 : 36,
                  bgcolor: 'rgba(255,255,255,0.02)',
                  '&:hover': {
                    borderColor: 'rgba(191, 219, 254, 0.55)',
                    bgcolor: 'rgba(255,255,255,0.07)',
                  },
                }}
              >
                <PeopleAltIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={mtgTheme === 'static' ? 'Switch to light mode' : mtgTheme === 'light' ? 'Switch to dark mode' : 'Switch to static mode'}>
              <IconButton
                size="small"
                onClick={() => {
                  const next: AppTheme = mtgTheme === 'static' ? 'light' : mtgTheme === 'light' ? 'dark' : 'static';
                  setMtgThemeState(next);
                  setMtgTheme(next);
                }}
                sx={{
                  color: mtgTheme === 'static' ? '#4b5563' : '#d7deef',
                  border: `1px solid ${mtgTheme === 'static' ? 'rgba(75, 85, 99, 0.4)' : 'rgba(148, 163, 184, 0.28)'}`,
                  borderRadius: 999,
                  width: compactLayout ? 32 : 36,
                  height: compactLayout ? 32 : 36,
                  bgcolor: 'rgba(255,255,255,0.02)',
                  '&:hover': {
                    borderColor: 'rgba(191, 219, 254, 0.55)',
                    bgcolor: 'rgba(255,255,255,0.07)',
                    color: '#d7deef',
                  },
                }}
              >
                {mtgTheme === 'static' ? <LightIcon fontSize="small" /> : mtgTheme === 'light' ? <LightModeIcon fontSize="small" /> : <DarkModeOutlinedIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
          </Box>
        )}

        {isFullscreen && !showCenterMenu && (
          <Box
            onClick={showFullscreenMenu}
            aria-label="Show menu"
            role="button"
            tabIndex={0}
            onKeyDown={event => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                showFullscreenMenu();
              }
            }}
            sx={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: `translate(-50%, -50%) rotate(${getPlayerModalRotation(1)}deg)`,
              width: compactLayout ? 44 : 60,
              height: compactLayout ? 44 : 60,
              cursor: 'pointer',
              outline: 'none',
              zIndex: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon
              path={mdiUnicornVariant}
              size={compactLayout ? 1.5 : 2.1}
              color="#fff"
              style={{ filter: 'drop-shadow(0 0 10px rgba(255, 192, 222, 0.95))' }}
            />
          </Box>
        )}

        <CommanderDamageModal
          modal={modal}
          players={players}
          modalRotation={modalRotation}
          landscapeSurface={mobileLayout}
          onClose={closeModal}
          onValueChange={v => setModal(m => m ? { ...m, value: v } : m)}
        />

        {settingsPid !== null && (
          <PlayerSettingsModal
            open
            player={{ ...players[settingsPid], seat: settingsPid }}
            commanders={commanders}
            commandersLoading={commandersLoading}
            surfaceRotation={surfaceRotation}
            onClose={() => setSettingsPid(null)}
            onUpdate={update => updatePlayer(settingsPid, update)}
          />
        )}

        <ResetDialog
          open={resetOpen}
          landscapeSurface={mobileLayout}
          onClose={() => setResetOpen(false)}
          onConfirm={() => { setPlayers(mkPlayers()); setMonarchIntroduced(false); setLifeHistory([[], [], [], []]); setStartingLifeTotal(40); setResetOpen(false); }}
        />

        {/* Layout selection modal */}
        <Backdrop
          open={layoutModalOpen}
          onClick={() => setLayoutModalOpen(false)}
          sx={{ position: 'absolute', inset: 0, zIndex: 230, backdropFilter: 'blur(4px)', bgcolor: 'rgba(0,0,0,0.7)' }}
        >
          <Box
            onClick={e => e.stopPropagation()}
            sx={{
              bgcolor: '#1e1e1e',
              color: '#eee',
              border: '1px solid #333',
              borderRadius: 2,
              boxShadow: '0 0 32px rgba(0,0,0,0.35)',
              p: 2.5,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              transform: `rotate(${getPlayerModalRotation(0)}deg)`,
              transformOrigin: 'center',
            }}
          >
            <Typography sx={{ fontWeight: 600, textAlign: 'center' }}>Select player layout</Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', flexWrap: 'wrap', justifyContent: 'center' }}>

              {/* 2 players */}
              <Box
                onClick={() => { setPlayerCount(2); localStorage.setItem('mtg_player_count', '2'); setLayoutModalOpen(false); }}
                sx={{
                  cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1,
                  opacity: playerCount === 2 ? 1 : 0.55,
                  '&:hover': { opacity: 1 },
                }}
              >
                <Box sx={{
                  width: 80, height: 70, border: `2px solid ${playerCount === 2 ? '#60a5fa' : '#444'}`,
                  borderRadius: 1.5, overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '3px', p: '4px', boxSizing: 'border-box',
                  bgcolor: playerCount === 2 ? 'rgba(96,165,250,0.08)' : 'transparent',
                }}>
                  <Box sx={{ flex: 1, bgcolor: '#334155', borderRadius: 1 }} />
                  <Box sx={{ flex: 1, bgcolor: '#334155', borderRadius: 1 }} />
                </Box>
                <Typography variant="caption">2 players</Typography>
              </Box>

              {/* 3 players layout A — 1 top, 2 bottom */}
              <Box
                onClick={() => { setPlayerCount(3); setThreeLayout('A'); localStorage.setItem('mtg_player_count', '3'); localStorage.setItem('mtg_three_layout', 'A'); setLayoutModalOpen(false); }}
                sx={{
                  cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1,
                  opacity: playerCount === 3 && threeLayout === 'A' ? 1 : 0.55,
                  '&:hover': { opacity: 1 },
                }}
              >
                <Box sx={{
                  width: 80, height: 70, border: `2px solid ${playerCount === 3 && threeLayout === 'A' ? '#60a5fa' : '#444'}`,
                  borderRadius: 1.5, overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '3px', p: '4px', boxSizing: 'border-box',
                  bgcolor: playerCount === 3 && threeLayout === 'A' ? 'rgba(96,165,250,0.08)' : 'transparent',
                }}>
                  <Box sx={{ flex: 1, display: 'flex', gap: '3px' }}>
                    <Box sx={{ flex: 1, bgcolor: '#334155', borderRadius: 1 }} />
                    <Box sx={{ flex: 1, borderRadius: 1 }} />
                  </Box>
                  <Box sx={{ flex: 1, display: 'flex', gap: '3px' }}>
                    <Box sx={{ flex: 1, bgcolor: '#334155', borderRadius: 1 }} />
                    <Box sx={{ flex: 1, bgcolor: '#334155', borderRadius: 1 }} />
                  </Box>
                </Box>
                <Typography variant="caption">3 players (A)</Typography>
              </Box>

              {/* 3 players layout B — 2 top, 1 bottom */}
              <Box
                onClick={() => { setPlayerCount(3); setThreeLayout('B'); localStorage.setItem('mtg_player_count', '3'); localStorage.setItem('mtg_three_layout', 'B'); setLayoutModalOpen(false); }}
                sx={{
                  cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1,
                  opacity: playerCount === 3 && threeLayout === 'B' ? 1 : 0.55,
                  '&:hover': { opacity: 1 },
                }}
              >
                <Box sx={{
                  width: 80, height: 70, border: `2px solid ${playerCount === 3 && threeLayout === 'B' ? '#60a5fa' : '#444'}`,
                  borderRadius: 1.5, overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '3px', p: '4px', boxSizing: 'border-box',
                  bgcolor: playerCount === 3 && threeLayout === 'B' ? 'rgba(96,165,250,0.08)' : 'transparent',
                }}>
                  <Box sx={{ flex: 1, display: 'flex', gap: '3px' }}>
                    <Box sx={{ flex: 1, bgcolor: '#334155', borderRadius: 1 }} />
                    <Box sx={{ flex: 1, bgcolor: '#334155', borderRadius: 1 }} />
                  </Box>
                  <Box sx={{ flex: 1, display: 'flex', gap: '3px' }}>
                    <Box sx={{ flex: 1, bgcolor: '#334155', borderRadius: 1 }} />
                    <Box sx={{ flex: 1, borderRadius: 1 }} />
                  </Box>
                </Box>
                <Typography variant="caption">3 players (B)</Typography>
              </Box>

              {/* 4 players */}
              <Box
                onClick={() => { setPlayerCount(4); localStorage.setItem('mtg_player_count', '4'); setLayoutModalOpen(false); }}
                sx={{
                  cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1,
                  opacity: playerCount === 4 ? 1 : 0.55,
                  '&:hover': { opacity: 1 },
                }}
              >
                <Box sx={{
                  width: 80, height: 70, border: `2px solid ${playerCount === 4 ? '#60a5fa' : '#444'}`,
                  borderRadius: 1.5, overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '3px', p: '4px', boxSizing: 'border-box',
                  bgcolor: playerCount === 4 ? 'rgba(96,165,250,0.08)' : 'transparent',
                }}>
                  <Box sx={{ flex: 1, display: 'flex', gap: '3px' }}>
                    <Box sx={{ flex: 1, bgcolor: '#334155', borderRadius: 1 }} />
                    <Box sx={{ flex: 1, bgcolor: '#334155', borderRadius: 1 }} />
                  </Box>
                  <Box sx={{ flex: 1, display: 'flex', gap: '3px' }}>
                    <Box sx={{ flex: 1, bgcolor: '#334155', borderRadius: 1 }} />
                    <Box sx={{ flex: 1, bgcolor: '#334155', borderRadius: 1 }} />
                  </Box>
                </Box>
                <Typography variant="caption">4 players</Typography>
              </Box>

            </Box>

            {playerCount === 3 && (
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<SwapVertIcon />}
                  onClick={() => {
                    const next = threeLayout === 'A' ? 'B' : 'A';
                    setThreeLayout(next);
                    localStorage.setItem('mtg_three_layout', next);
                  }}
                  sx={{ color: '#d7deef', borderColor: 'rgba(148, 163, 184, 0.28)', textTransform: 'none', borderRadius: 999 }}
                >
                  Swap sides
                </Button>
              </Box>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button onClick={() => setLayoutModalOpen(false)} sx={{ color: '#aaa' }}>Close</Button>
            </Box>
          </Box>
        </Backdrop>

        <Backdrop
          open={newGameOpen}
          onClick={() => setNewGameOpen(false)}
          sx={{
            position: 'absolute',
            inset: 0,
            zIndex: 230,
            backdropFilter: 'blur(4px)',
            bgcolor: 'rgba(0,0,0,0.7)',
          }}
        >
          <Box
            onClick={e => e.stopPropagation()}
            sx={{
              bgcolor: '#1e1e1e',
              color: '#eee',
              border: '1px solid #333',
              borderRadius: 2,
              boxShadow: '0 0 32px rgba(0,0,0,0.35)',
              width: mobileLayout ? 'min(78%, 420px)' : 'min(92vw, 420px)',
              maxWidth: 'calc(100% - 24px)',
              px: 3,
              py: 2.5,
              transform: `rotate(${getPlayerModalRotation(0)}deg)`,
              transformOrigin: 'center',
            }}
          >
            <Typography sx={{ mb: 2 }}>
              Start a new game and refresh commanders too?
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, flexWrap: 'wrap' }}>
              <Button onClick={() => setNewGameOpen(false)} sx={{ color: '#aaa' }}>Cancel</Button>
              <Button onClick={() => startNewGame(false)} variant="outlined" sx={{ textTransform: 'none' }}>
                Keep commanders
              </Button>
              <Button onClick={() => startNewGame(true)} variant="contained" sx={{ textTransform: 'none' }}>
                Refresh commanders
              </Button>
            </Box>
          </Box>
        </Backdrop>
      </Box>

      <QuickSetupDialog
        open={quickSetupOpen}
        players={players}
        commanders={commanders}
        visiblePlayerIds={layoutConfig.activeQuadrants.map(q => q.pid)}
        onClose={() => setQuickSetupOpen(false)}
        onApply={applyQuickSetup}
      />
    </Box>
  );
}
