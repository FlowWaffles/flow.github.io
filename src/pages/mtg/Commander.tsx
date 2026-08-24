import { useState, useEffect, useRef } from 'react';
import { keyframes } from '@emotion/react';
import { Box, Button, Typography, useMediaQuery } from '@mui/material';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import PlayerQuadrant from './PlayerQuadrant';
import CommanderDamageModal from './CommanderDamageModal';
import PlayerSettingsModal from './PlayerSettingsModal';
import ResetDialog from './ResetDialog';
import commandersData from './commanders-data';
import type { Player, ModalState, CommanderEntry } from './types';
import { mkPlayers, syncAliveOverride } from './types';

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
        commander: typeof player.commander === 'string' ? player.commander : fallback.commander,
        commanderArtUrl:
          typeof player.commanderArtUrl === 'string' ? player.commanderArtUrl : fallback.commanderArtUrl,
      });
    });
  } catch (error) {
    console.error('Failed to restore commander tracker state.', error);
    return defaults;
  }
}

export default function Commander() {
  const [players, setPlayers] = useState<Player[]>(readStoredPlayers);
  const [resetOpen, setResetOpen] = useState(false);
  const [modal, setModal] = useState<ModalState | null>(null);
  const [settingsPid, setSettingsPid] = useState<number | null>(null);
  const [commanders] = useState<CommanderEntry[]>(commandersData);
  const commandersLoading = false;
  const [fullscreenSupported, setFullscreenSupported] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const boardRef = useRef<HTMLDivElement | null>(null);
  const mobileLayout = useMediaQuery('(pointer: coarse)');
  const portraitViewport = useMediaQuery('(pointer: coarse) and (orientation: portrait)');
  const narrowMobileWidth = useMediaQuery('(pointer: coarse) and (max-width: 480px)');
  const shortMobileHeight = useMediaQuery('(pointer: coarse) and (max-height: 480px)');
  const rotateMobileSurface = mobileLayout && portraitViewport;
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

  const updatePlayer = (pid: number, update: Partial<Player>) =>
    setPlayers(prev => prev.map((p, i) => {
      if (i !== pid) return p;
      const next = { ...p, ...update };
      if (update.isDead === true) next.isAliveOverride = false;
      return syncAliveOverride(next);
    }));

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
    setModal(null);
  };

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
          gridTemplateAreas: '"p0 p1" "bar bar" "p2 p3"',
          gridTemplateRows: compactLayout ? '1fr 44px 1fr' : '1fr 52px 1fr',
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
            commanders={commanders}
            onLifeChange={delta => updateLife(pid, delta)}
            onLifeSet={life => setLife(pid, life)}
            onPlayerUpdate={update => updatePlayer(pid, update)}
            onDamageClick={attacker => openModal(pid, attacker)}
            onOpenSettings={() => setSettingsPid(pid)}
            compact={compactLayout}
            sx={{ gridArea: area, borderRadius: compactLayout ? '10px' : '12px' }}
          />
        ))}

        {/* Center bar */}
        <Box sx={{
          gridArea: 'bar',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2,
          px: compactLayout ? 1 : 1.25,
          mx: compactLayout ? 0.25 : 0.5,
          borderRadius: compactLayout ? '14px' : '18px',
          bgcolor: 'transparent',
          backdropFilter: 'none',
          boxShadow: 'none',
        }}>
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
            onClose={() => setSettingsPid(null)}
            onUpdate={update => updatePlayer(settingsPid, update)}
          />
        )}

        <ResetDialog
          open={resetOpen}
          landscapeSurface={mobileLayout}
          onClose={() => setResetOpen(false)}
          onConfirm={() => { setPlayers(mkPlayers()); setResetOpen(false); }}
        />
      </Box>
    </Box>
  );
}
