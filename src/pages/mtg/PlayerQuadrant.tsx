import { useState, useRef, useEffect, useMemo } from 'react';
import { keyframes } from '@emotion/react';
import { Box, Typography, TextField, Checkbox, FormControlLabel } from '@mui/material';
import Icon from '@mdi/react';
import { mdiCrown, mdiCrownOutline, mdiSkull } from '@mdi/js';

const neonGlow = keyframes`
  0%, 100% { filter: drop-shadow(0 0 4px #acecec) drop-shadow(0 0 10px #42dcdb); }
  50%       { filter: drop-shadow(0 0 2px #acecec) drop-shadow(0 0 4px #42dcdb); }
`;
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import HoldButton from './HoldButton';
import CommanderDamageGrid from './CommanderDamageGrid';
import LifeHistoryModal from './LifeHistoryModal';
import type { Player, LifeHistoryEntry } from './types';
import {
  CMD_LETHAL, HOLD_INCREMENT, POISON_LETHAL,
  isEffectivelyDead, isOverridingDeath, accentToBg,
} from './types';

const ALIVE_QUOTES = [
  'For whatever reason, still alive',
  'Seems to be a necromancer',
  'Death is just a suggestion',
  'Stubbornly refusing to die',
  'Has very good health insurance',
  'Running on spite and mana',
  'Technically dead, legally alive',
  'Sponsored by Lich\'s Mastery',
  '"I get better" — probably this player',
  'The undertaker is confused',
  'Living rent-free in the afterlife',
  'Just vibing in negative life',
];

interface PlayerQuadrantProps {
  pid: number;
  player: Player;
  allPlayers: Player[];
  rotation: 0 | 180;
  physicalLayout: (number | null)[];
  startingLife: 20 | 40;
  compact?: boolean;
  monarchIntroduced?: boolean;
  onLifeChange: (delta: number) => void;
  onLifeSet: (life: number) => void;
  onPlayerUpdate: (update: Partial<Player>) => void;
  onDamageClick: (attacker: number) => void;
  onOpenSettings: () => void;
  lifeHistory: LifeHistoryEntry[];
  onLifeHistoryCommit: (delta: number) => void;
  onRevertHistory: () => void;
  sx?: object;
}

export default function PlayerQuadrant({
  pid, player, allPlayers, rotation, physicalLayout, startingLife, compact = false, monarchIntroduced = false,
  onLifeChange, onLifeSet, onPlayerUpdate, onDamageClick, onOpenSettings,
  lifeHistory, onLifeHistoryCommit, onRevertHistory, sx,
}: PlayerQuadrantProps) {
  const [editLife, setEditLife] = useState(false);
  const [lifeVal, setLifeVal] = useState(String(player.life));
  const [historyOpen, setHistoryOpen] = useState(false);
  const lifeRef = useRef<HTMLInputElement>(null);
  const [lifeDelta, setLifeDelta] = useState(0);
  const deltaTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingDeltaRef = useRef(0);
  const lastTapRef = useRef<number>(0);
  const onLifeHistoryCommitRef = useRef(onLifeHistoryCommit);
  onLifeHistoryCommitRef.current = onLifeHistoryCommit;

  useEffect(() => { if (!editLife) setLifeVal(String(player.life)); }, [player.life, editLife]);
  useEffect(() => {
    if (editLife) { lifeRef.current?.focus(); lifeRef.current?.select(); }
  }, [editLife]);

  // Pick a new mockery quote each time the alive-override is activated
  const aliveQuote = useMemo(
    () => ALIVE_QUOTES[Math.floor(Math.random() * ALIVE_QUOTES.length)],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [player.isAliveOverride],
  );

  const commitLife = () => {
    const parsed = parseInt(lifeVal, 10);
    if (!isNaN(parsed)) {
      const delta = parsed - player.life;
      onLifeSet(parsed);
      if (delta !== 0) onLifeHistoryCommitRef.current(delta);
    } else {
      setLifeVal(String(player.life));
    }
    setEditLife(false);
  };

  const handleLifeTap = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      lastTapRef.current = 0;
      setLifeVal(String(player.life));
      setEditLife(true);
    } else {
      lastTapRef.current = now;
    }
  };

  const handleLifeChange = (delta: number) => {
    onLifeChange(delta);
    pendingDeltaRef.current += delta;
    setLifeDelta(pendingDeltaRef.current);
    if (deltaTimerRef.current) clearTimeout(deltaTimerRef.current);
    deltaTimerRef.current = setTimeout(() => {
      onLifeHistoryCommitRef.current(pendingDeltaRef.current);
      pendingDeltaRef.current = 0;
      setLifeDelta(0);
    }, 1500);
  };

  const accent = player.accentColor;
  const bg = accentToBg(accent);
  const opponents = [0, 1, 2, 3].filter(i => i !== pid);
  const dead = isEffectivelyDead(player);
  const overridingDeath = isOverridingDeath(player);
  const nameFontSize = compact ? { xs: '0.72rem', sm: '0.78rem' } : { xs: '0.86rem', sm: '0.96rem' };
  const lifeFontSize = compact ? 'clamp(2.2rem, 11vh, 3.4rem)' : 'clamp(2.8rem, 8.8vw, 5.2rem)';
  const actionIconSize = compact ? { xs: '1.8rem', sm: '2rem' } : { xs: '2rem', sm: '2.8rem' };
  const yellowLifeThreshold = startingLife === 20 ? 15 : 20;
  const lifeColor = player.life <= 5
    ? '#f44336'
    : player.life <= 10
      ? '#ff9800'
      : player.life <= yellowLifeThreshold
        ? '#ffeb3b'
        : '#fff';
  const lifeTextShadow = player.life <= 5
    ? '0 0 20px rgba(244,67,54,0.5)'
    : player.life <= 10
      ? '0 0 20px rgba(255,152,0,0.4)'
      : player.life <= yellowLifeThreshold
        ? '0 0 20px rgba(255,235,59,0.35)'
        : undefined;

  const quadrantRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!historyOpen) return;
    const handlePointerDown = (e: PointerEvent) => {
      if (quadrantRef.current && !quadrantRef.current.contains(e.target as Node)) {
        setHistoryOpen(false);
      }
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [historyOpen]);

  const commanderDisplay = [player.commander, player.partnerCommander].filter(Boolean).join(' // ');
  const hasPrimaryArt = Boolean(player.commanderArtUrl);
  const hasPartnerArt = Boolean(player.partnerCommanderArtUrl);

  const lethalCmdAttacker = opponents.find(o => player.cmdDmg[o][0] >= CMD_LETHAL || player.cmdDmg[o][1] >= CMD_LETHAL);

  const deathCause = player.isDead
    ? 'KO\'d'
    : player.poisonCounters >= POISON_LETHAL
      ? 'Unalived by poison'
      : lethalCmdAttacker !== undefined
      ? [allPlayers[lethalCmdAttacker].commander, allPlayers[lethalCmdAttacker].partnerCommander].filter(Boolean).join(' // ')
        ? `Was killed by\n${[allPlayers[lethalCmdAttacker].commander, allPlayers[lethalCmdAttacker].partnerCommander].filter(Boolean).join(' // ')}`
          : `Died to commander damage\nfrom ${allPlayers[lethalCmdAttacker].name}`
        : player.life <= 0
          ? `Life total: ${player.life}`
          : 'Defeated';

  return (
    <Box ref={quadrantRef} sx={{
      ...sx,
      display: 'flex', flexDirection: 'column',
      bgcolor: bg,
      backgroundImage: `
        linear-gradient(180deg, rgba(6, 10, 18, 0.12), rgba(6, 10, 18, 0.58)),
        linear-gradient(135deg, ${accent}24, transparent 42%)
      `,
      backgroundSize: 'cover',
      backgroundPosition: 'top center',
      backgroundRepeat: 'no-repeat',
      border: `1px solid ${accent}44`,
      boxShadow: `0 18px 36px rgba(0, 0, 0, 0.24), inset 0 1px 0 rgba(255, 255, 255, 0.04)`,
      transform: rotation ? 'rotate(180deg)' : 'none',
      overflow: 'hidden',
      position: 'relative',
      minHeight: 0,
    }}>
      {hasPrimaryArt && !hasPartnerArt && (
        <Box sx={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          backgroundImage: `
            linear-gradient(180deg, rgba(6, 10, 18, 0.3), rgba(6, 10, 18, 0.76)),
            linear-gradient(135deg, ${accent}22, transparent 45%),
            url(${player.commanderArtUrl})
          `,
          backgroundSize: 'cover',
          backgroundPosition: 'top center',
          backgroundRepeat: 'no-repeat',
        }}
        />
      )}
      {hasPrimaryArt && hasPartnerArt && (
        <>
          <Box sx={{
            position: 'absolute',
            left: 0, top: 0, bottom: 0, width: '55%',
            zIndex: 0,
            pointerEvents: 'none',
            backgroundImage: `
              linear-gradient(180deg, rgba(6, 10, 18, 0.22), rgba(6, 10, 18, 0.72)),
              linear-gradient(135deg, ${accent}1f, transparent 52%),
              url(${player.commanderArtUrl})
            `,
            backgroundSize: 'cover',
            backgroundPosition: 'center top',
            backgroundRepeat: 'no-repeat',
            clipPath: 'polygon(0 0, 100% 0, 82% 100%, 0 100%)',
          }}
          />
          <Box sx={{
            position: 'absolute',
            right: 0, top: 0, bottom: 0, width: '55%',
            zIndex: 0,
            pointerEvents: 'none',
            backgroundImage: `
              linear-gradient(180deg, rgba(6, 10, 18, 0.22), rgba(6, 10, 18, 0.72)),
              linear-gradient(225deg, ${accent}1f, transparent 52%),
              url(${player.partnerCommanderArtUrl})
            `,
            backgroundSize: 'cover',
            backgroundPosition: 'center top',
            backgroundRepeat: 'no-repeat',
            clipPath: 'polygon(18% 0, 100% 0, 100% 100%, 0 100%)',
          }}
          />
          <Box sx={{
            position: 'absolute',
            inset: 0,
            zIndex: 1,
            pointerEvents: 'none',
            background: 'linear-gradient(100deg, transparent 49%, rgba(255,255,255,0.28) 50%, transparent 51%)',
          }}
          />
        </>
      )}

      {/* Name row — tap to open settings */}
      <Box sx={{
        position: 'relative',
        zIndex: 2,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
        px: compact ? 0.75 : 1,
        py: compact ? 0.25 : 0.4,
        minHeight: compact ? 26 : 30,
        borderBottom: `1px solid ${accent}2c`,
        bgcolor: 'rgba(6, 10, 18, 0.28)',
        backdropFilter: 'blur(6px)',
      }}>
        {(monarchIntroduced || player.poisonCounters > 0) && (
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              transform: 'translateY(-50%)',
              ...(pid % 2 === 1 ? { left: compact ? 4 : 6 } : { right: compact ? 4 : 6 }),
              display: 'inline-flex',
              flexDirection: pid % 2 === 1 ? 'row' : 'row-reverse',
              alignItems: 'center',
              gap: compact ? 0.4 : 0.6,
            }}
          >
            {monarchIntroduced && (
              <Box
                onClick={e => { e.stopPropagation(); if (!player.isMonarch) onPlayerUpdate({ isMonarch: true }); }}
                sx={{
                  display: 'inline-flex', alignItems: 'center',
                  color: player.isMonarch ? accent : '#484848',
                  cursor: player.isMonarch ? 'default' : 'pointer',
                  transition: 'color 0.15s',
                  '&:hover': player.isMonarch ? {} : { color: '#777' },
                }}
              >
                <Icon path={player.isMonarch ? mdiCrown : mdiCrownOutline} size={compact ? 0.65 : 0.8} />
              </Box>
            )}
            {player.poisonCounters > 0 && (
              <Box
                sx={{
                  display: 'inline-flex', alignItems: 'center', gap: 0.3,
                  color: player.poisonCounters >= POISON_LETHAL ? '#f44336' : accent,
                }}
              >
                <Box component="span" sx={{ fontSize: compact ? '0.6rem' : '0.7rem', fontWeight: 700, lineHeight: 1 }}>
                  {player.poisonCounters}
                </Box>
                <Icon path={mdiSkull} size={compact ? 0.55 : 0.7} />
              </Box>
            )}
          </Box>
        )}
        <Typography
          onClick={onOpenSettings}
          sx={{
            color: overridingDeath ? '#4acc70' : accent,
            fontWeight: 600,
            fontSize: overridingDeath ? (compact ? '0.66rem' : '0.74rem') : nameFontSize,
            letterSpacing: '0.04em', cursor: 'pointer', userSelect: 'none',
            textTransform: overridingDeath ? 'none' : 'uppercase',
            fontFamily: "'Orbitron-Regular', monospace",
            display: 'flex',
            alignItems: 'center',
            gap: compact ? 0.3 : 0.5,
            textAlign: 'center',
            lineHeight: 1.1,
            fontStyle: overridingDeath ? 'italic' : 'normal',
          }}
        >
          {overridingDeath ? (
            <>
              <Box component="span">{aliveQuote}</Box>
            </>
          ) : (
            <>
              <Box component="span">{player.name}</Box>
              {commanderDisplay && (
                <Box component="span" sx={{ color: '#ddd', opacity: 0.9, textTransform: 'none', fontSize: compact ? '0.74em' : '0.82em' }}>
                  - {commanderDisplay}
                </Box>
              )}
            </>
          )}
        </Typography>
      </Box>

      {/* Life row */}
      <Box sx={{ position: 'relative', zIndex: 2, flex: 1, display: 'flex', alignItems: 'stretch', minHeight: 0 }}>
        <HoldButton
          onTap={() => handleLifeChange(-1)}
          onHold={() => handleLifeChange(-HOLD_INCREMENT)}
          sx={{
            flex: 1, color: 'rgba(255,255,255,0.7)',
            transition: 'background-color 0.12s',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.04)' },
            '&:active': { bgcolor: 'rgba(255,255,255,0.1)' },
          }}
        >
          <RemoveIcon sx={{ fontSize: actionIconSize }} />
        </HoldButton>

        <Box sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          minWidth: compact ? '4ch' : '5ch', px: compact ? 0.25 : 0.5,
          position: 'relative',
        }}>
          {lifeDelta !== 0 && (
            <Typography sx={{
              position: 'absolute',
              top: compact ? 2 : 4,
              left: 'calc(100% + 4px)',
              fontSize: compact ? '0.7rem' : '0.85rem',
              fontWeight: 700,
              color: lifeDelta > 0 ? '#4caf50' : '#f44336',
              fontFamily: "'Orbitron-Regular', monospace",
              lineHeight: 1,
              pointerEvents: 'none',
              userSelect: 'none',
              textShadow: lifeDelta > 0
                ? '0 0 8px rgba(76,175,80,0.7)'
                : '0 0 8px rgba(244,67,54,0.7)',
              zIndex: 10,
            }}>
              {lifeDelta > 0 ? `+${lifeDelta}` : lifeDelta}
            </Typography>
          )}
          {editLife ? (
            <TextField
              inputRef={lifeRef}
              value={lifeVal}
              onChange={e => setLifeVal(e.target.value)}
              onBlur={commitLife}
              onKeyDown={e => { if (e.key === 'Enter') commitLife(); }}
              type="number"
              variant="standard"
              inputProps={{
                style: {
                  textAlign: 'center',
                  fontSize: lifeFontSize,
                  fontWeight: 800,
                  color: lifeColor,
                  width: compact ? '3ch' : '3.5ch',
                  fontFamily: "'Monoton-Regular', monospace",
                },
              }}
              sx={{ '& .MuiInput-underline:before': { borderColor: '#555' } }}
            />
          ) : (
            <HoldButton
              onTap={handleLifeTap}
              onHold={() => setHistoryOpen(true)}
              sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Typography
                sx={{
                  fontSize: lifeFontSize,
                  fontWeight: 800, lineHeight: 1,
                  color: lifeColor,
                  cursor: 'pointer', userSelect: 'none',
                  transition: 'color 0.35s',
                  fontFamily: "'Monoton-Regular', monospace",
                  letterSpacing: '-0.04em',
                  willChange: 'filter',
                  ...(lifeTextShadow
                    ? { filter: `drop-shadow(0 0 8px ${lifeTextShadow.replace('0 0 20px ', '')})` }
                    : { animation: `${neonGlow} 4s infinite alternate ease-in-out` }),
                }}
              >
                {player.life}
              </Typography>
            </HoldButton>
          )}
        </Box>

        <HoldButton
          onTap={() => handleLifeChange(1)}
          onHold={() => handleLifeChange(HOLD_INCREMENT)}
          sx={{
            flex: 1, color: 'rgba(255,255,255,0.7)',
            transition: 'background-color 0.12s',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.04)' },
            '&:active': { bgcolor: 'rgba(255,255,255,0.1)' },
          }}
        >
          <AddIcon sx={{ fontSize: actionIconSize }} />
        </HoldButton>
      </Box>

      <Box sx={{ position: 'relative', zIndex: 2, flexShrink: 0 }}>
        <CommanderDamageGrid
          pid={pid}
          player={player}
          allPlayers={allPlayers}
          accent={accent}
          rotation={rotation}
          physicalLayout={physicalLayout}
          compact={compact}
          onDamageClick={onDamageClick}
          onSelfClick={onOpenSettings}
        />
      </Box>

      {/* Life history modal */}
      <LifeHistoryModal
        open={historyOpen}
        history={lifeHistory}
        accent={accent}
        onClose={() => setHistoryOpen(false)}
        onRevert={() => { onRevertHistory(); setHistoryOpen(false); }}
      />

      {/* Dead overlay */}
      {dead && (
        <Box sx={{
          position: 'absolute', inset: 0, zIndex: 60,
          bgcolor: 'rgba(0,0,0,0.92)',
          backdropFilter: 'blur(2px)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'auto',
          px: 1.5,
        }}>
          <Box sx={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 0.8,
            textAlign: 'center',
          }}>
            <Typography sx={{
              fontSize: compact ? { xs: '1rem', sm: '1.1rem' } : { xs: '1.1rem', sm: '1.25rem' },
              color: '#d9dde8',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              fontWeight: 700,
              userSelect: 'none',
              fontFamily: "'Orbitron-Regular', monospace",
            }}>
              Dead
            </Typography>
            <Typography sx={{
              fontSize: compact ? { xs: '0.66rem', sm: '0.74rem' } : { xs: '0.74rem', sm: '0.82rem' },
              color: '#98a3b8',
              userSelect: 'none',
              whiteSpace: 'pre-line',
              lineHeight: 1.4,
              fontFamily: "'Orbitron-Regular', monospace",
            }}>
              {deathCause}
            </Typography>
          </Box>

          <Box sx={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 'max(10px, env(safe-area-inset-bottom))',
            display: 'flex',
            justifyContent: 'center',
            px: 1,
          }}>
            <FormControlLabel
              onClick={e => {
                e.stopPropagation();
                onPlayerUpdate({ isDead: false, isAliveOverride: true });
              }}
              control={
                <Checkbox
                  checked={false}
                  size="small"
                  sx={{ color: '#4acc70', '&.Mui-checked': { color: '#4acc70' }, p: 0.5 }}
                />
              }
              label={
                <Typography sx={{
                  fontSize: compact ? { xs: '0.74rem', sm: '0.82rem' } : { xs: '0.82rem', sm: '0.9rem' }, color: '#4acc70',
                  userSelect: 'none', fontWeight: 600,
                  fontFamily: "'Orbitron-Regular', monospace",
                }}>
                  Not dead
                </Typography>
              }
              sx={{
                m: 0,
                cursor: 'pointer',
                border: '1px solid #4acc7055',
                borderRadius: 999,
                bgcolor: 'rgba(0, 0, 0, 0.35)',
                pr: 0.6,
              }}
            />
          </Box>
        </Box>
      )}

    </Box>
  );
}
