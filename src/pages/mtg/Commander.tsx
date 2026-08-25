import { useState, useEffect, useRef } from 'react';
import { keyframes } from '@emotion/react';
import { Backdrop, Box, Button, Typography, useMediaQuery } from '@mui/material';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
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
  const stored = sessionStorage.getItem(PLAYERS_STORAGE_KEY);
  if (!stored) return defaults;

  try {
    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed) || parsed.length !== defaults.length) return defaults;

    return defaults.map((fallback, index) => {
      const candidate = parsed[index];
      if (!candidate || typeof candidate !== 'object') return fallback;

      const player = candidate as Record<string, unknown>;
      const cmdDmg = Array.isArray(player.cmdDmg) && player.cmdDmg.length === fallback.cmdDmg.length
        ? player.cmdDmg.map((value, damageIndex) => (
          typeof value === 'number' && Number.isFinite(value) ? value : fallback.cmdDmg[damageIndex]
        ))
        : fallback.cmdDmg;

      return syncAliveOverride({
        name: typeof player.name === 'string' ? player.name : fallback.name,
        life: typeof player.life === 'number' && Number.isFinite(player.life) ? player.life : fallback.life,
        cmdDmg: cmdDmg as Player['cmdDmg'],
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
  const boardRef = useRef<HTMLDivElement | null>(null);
  const fullscreenMenuTimerRef = useRef<number | null>(null);
  const mobileLayout = useMediaQuery('(pointer: coarse)');
  const portraitViewport = useMediaQuery('(pointer: coarse) and (orientation: portrait)');
  const narrowMobileWidth = useMediaQuery('(pointer: coarse) and (max-width: 480px)');
  const shortMobileHeight = useMediaQuery('(pointer: coarse) and (max-height: 480px)');
  const rotateMobileSurface = mobileLayout && portraitViewport;
  const surfaceRotation = rotateMobileSurface ? 90 : 0;
  const compactLayout = narrowMobileWidth || shortMobileHeight;

  useEffect(() => {
    try {
      sessionStorage.setItem(PLAYERS_STORAGE_KEY, JSON.stringify(players));
    } catch (error) {
      console.error('Failed to persist commander tracker state.', error);
    }
  }, [players]);

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
        const newDmg = [...next.cmdDmg] as [number, number, number, number];
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
    setModal({ victim, attacker, value: val, original: val });
  };

  const closeModal = () => {
    if (!modal) return;
    const diff = modal.value - modal.original;
    setPlayers(prev => prev.map((p, i) => {
      if (i !== modal.victim) return p;
      const newDmg = [...p.cmdDmg] as [number, number, number, number];
      newDmg[modal.attacker] = modal.value;
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
        cmdDmgFrom: modal.original,
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
  };

  const applyQuickSetup = (entries: Array<{ name: string; commander: string; partnerCommander: string }>) => {
    setPlayers(prev => prev.map((player, index) => {
      const entry = entries[index];
      if (!entry) return player;

      const nextName = entry.name.trim() || player.name;
      const nextCommander = entry.commander.trim();
      const nextPartnerCommander = entry.partnerCommander.trim();
      const found = commanders.find(c => c.name.toLowerCase() === nextCommander.toLowerCase());
      const foundPartner = commanders.find(c => c.name.toLowerCase() === nextPartnerCommander.toLowerCase());
      return {
        ...player,
        name: nextName,
        commander: nextCommander,
        commanderArtUrl: nextCommander ? (found?.artCrop ?? '') : '',
        partnerCommander: nextPartnerCommander,
        partnerCommanderArtUrl: nextPartnerCommander ? (foundPartner?.artCrop ?? '') : '',
      };
    }));
    setQuickSetupOpen(false);
  };

  const showCenterMenu = !isFullscreen || fullscreenMenuVisible;

  return (
    <Box sx={{
      position: 'fixed', inset: 0,
      background: `
        radial-gradient(circle at top, rgba(78, 116, 255, 0.18), transparent 32%),
        radial-gradient(circle at bottom right, rgba(66, 220, 219, 0.16), transparent 28%),
        linear-gradient(180deg, #10131d 0%, #090b12 52%, #05060b 100%)
      `,
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
          gridTemplateAreas: showCenterMenu ? '"p0 p1" "bar bar" "p2 p3"' : '"p0 p1" "p2 p3"',
          gridTemplateRows: showCenterMenu ? (compactLayout ? '1fr 44px 1fr' : '1fr 52px 1fr') : '1fr 1fr',
          gridTemplateColumns: '1fr 1fr',
          gap: compactLayout ? '6px' : '8px',
          p: compactLayout ? '6px' : '8px',
          boxSizing: 'border-box',
          transform: mobileLayout
            ? `translate(-50%, -50%)${rotateMobileSurface ? ' rotate(90deg)' : ''}`
            : 'none',
          transformOrigin: 'center',
        }}
      >
        {QUADRANTS.map(({ pid, rotation, area }) => (
          <PlayerQuadrant
            key={pid}
            pid={pid}
            player={players[pid]}
            allPlayers={players}
            rotation={rotation}
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
            sx={{ gridArea: area, borderRadius: compactLayout ? '10px' : '12px' }}
          />
        ))}

        {showCenterMenu && (
          <Box
            onClickCapture={handleFullscreenMenuInteraction}
            sx={{
              gridArea: 'bar',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2,
              px: compactLayout ? 1 : 1.25,
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
                  fontSize: compactLayout ? '0.75rem' : '0.8rem',
                  minHeight: compactLayout ? 32 : undefined,
                  px: compactLayout ? 1.25 : 1.5,
                  borderRadius: 999,
                  bgcolor: 'rgba(255,255,255,0.02)',
                  '&:hover': {
                    borderColor: 'rgba(191, 219, 254, 0.55)',
                    bgcolor: 'rgba(255,255,255,0.07)',
                  },
                }}
              >
                {isFullscreen ? 'Exit Full Screen' : 'Full Screen'}
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
                fontSize: compactLayout ? '0.75rem' : '0.8rem',
                minHeight: compactLayout ? 32 : undefined,
                px: compactLayout ? 1.25 : 1.5,
                borderRadius: 999,
                bgcolor: 'rgba(255,255,255,0.02)',
                '&:hover': {
                  borderColor: 'rgba(191, 219, 254, 0.55)',
                  bgcolor: 'rgba(255,255,255,0.07)',
                },
              }}
            >
              Quick setup
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setNewGameOpen(true)}
              sx={{
                color: '#d7deef', borderColor: 'rgba(148, 163, 184, 0.28)', textTransform: 'none',
                fontSize: compactLayout ? '0.75rem' : '0.8rem',
                minHeight: compactLayout ? 32 : undefined,
                px: compactLayout ? 1.25 : 1.5,
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
            <Button
              variant="outlined"
              size="small"
              startIcon={<RestartAltIcon />}
              onClick={() => setResetOpen(true)}
              sx={{
                color: '#d7deef', borderColor: 'rgba(148, 163, 184, 0.28)', textTransform: 'none',
                fontSize: compactLayout ? '0.75rem' : '0.8rem',
                minHeight: compactLayout ? 32 : undefined,
                px: compactLayout ? 1.25 : 1.5,
                borderRadius: 999,
                bgcolor: 'rgba(255,255,255,0.02)',
                '&:hover': {
                  borderColor: 'rgba(191, 219, 254, 0.55)',
                  bgcolor: 'rgba(255,255,255,0.07)',
                },
              }}
            >
              Reset
            </Button>
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
          onConfirm={() => { setPlayers(mkPlayers()); setMonarchIntroduced(false); setLifeHistory([[], [], [], []]); setResetOpen(false); }}
        />

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
        onClose={() => setQuickSetupOpen(false)}
        onApply={applyQuickSetup}
      />
    </Box>
  );
}
