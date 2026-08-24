import { useState, useRef, useEffect, useMemo } from 'react';
import { keyframes } from '@emotion/react';
import { Box, Typography, TextField, Checkbox, FormControlLabel } from '@mui/material';

const neonGlow = keyframes`
  0%, 100% { text-shadow: 0 0 5px #ffffff, 0 0 10px #acecec, 0 0 20px #42dcdb; }
  50%       { text-shadow: 0 0 2px #ffffff, 0 0 5px #acecec, 0 0 10px #42dcdb; }
`;
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import HoldButton from './HoldButton';
import CommanderDamageGrid from './CommanderDamageGrid';
import type { Player, CommanderEntry } from './types';
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
  compact?: boolean;
  commanders?: CommanderEntry[];
  onLifeChange: (delta: number) => void;
  onLifeSet: (life: number) => void;
  onPlayerUpdate: (update: Partial<Player>) => void;
  onDamageClick: (attacker: number) => void;
  onOpenSettings: () => void;
  sx?: object;
}

export default function PlayerQuadrant({
  pid, player, allPlayers, rotation, compact = false, commanders,
  onLifeChange, onLifeSet, onPlayerUpdate, onDamageClick, onOpenSettings, sx,
}: PlayerQuadrantProps) {
  const [editLife, setEditLife] = useState(false);
  const [lifeVal, setLifeVal] = useState(String(player.life));
  const lifeRef = useRef<HTMLInputElement>(null);

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
    if (!isNaN(parsed)) onLifeSet(parsed);
    else setLifeVal(String(player.life));
    setEditLife(false);
  };

  const accent = player.accentColor;
  const bg = accentToBg(accent);
  const opponents = [0, 1, 2, 3].filter(i => i !== pid);
  const dead = isEffectivelyDead(player);
  const overridingDeath = isOverridingDeath(player);
  const nameFontSize = compact ? { xs: '0.72rem', sm: '0.78rem' } : { xs: '0.86rem', sm: '0.96rem' };
  const lifeFontSize = compact ? 'clamp(2.2rem, 11vh, 3.4rem)' : 'clamp(2.8rem, 8.8vw, 5.2rem)';
  const actionIconSize = compact ? { xs: '1.8rem', sm: '2rem' } : { xs: '2rem', sm: '2.8rem' };
  const lifeColor = player.life <= 5
    ? '#f44336'
    : player.life <= 10
      ? '#ff9800'
      : player.life <= 20
        ? '#ffeb3b'
        : '#fff';
  const lifeTextShadow = player.life <= 5
    ? '0 0 20px rgba(244,67,54,0.5)'
    : player.life <= 10
      ? '0 0 20px rgba(255,152,0,0.4)'
      : player.life <= 20
        ? '0 0 20px rgba(255,235,59,0.35)'
        : undefined;

  const lethalCmdAttacker = opponents.find(o => player.cmdDmg[o] >= CMD_LETHAL);

  const deathCause = player.isDead
    ? 'KO\'d'
    : player.poisonCounters >= POISON_LETHAL
      ? 'Unalived by poison ☠'
      : lethalCmdAttacker !== undefined
        ? allPlayers[lethalCmdAttacker].commander
          ? `Was killed by\n${allPlayers[lethalCmdAttacker].commander}`
          : `Died to commander damage\nfrom ${allPlayers[lethalCmdAttacker].name}`
        : '';

  // Only show cause text for non-life-based deaths (skull alone speaks for life)
  const showDeathCause = player.isDead
    || player.poisonCounters >= POISON_LETHAL
    || lethalCmdAttacker !== undefined;

  return (
    <Box sx={{
      ...sx,
      display: 'flex', flexDirection: 'column',
      bgcolor: bg,
      backgroundImage: player.commanderArtUrl
        ? `
            linear-gradient(180deg, rgba(6, 10, 18, 0.3), rgba(6, 10, 18, 0.76)),
            linear-gradient(135deg, ${accent}22, transparent 45%),
            url(${player.commanderArtUrl})
          `
        : `
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
      {/* Name row — tap to open settings */}
      <Box sx={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
        px: compact ? 0.75 : 1,
        py: compact ? 0.25 : 0.4,
        minHeight: compact ? 26 : 30,
        borderBottom: `1px solid ${accent}2c`,
        bgcolor: 'rgba(6, 10, 18, 0.28)',
        backdropFilter: 'blur(6px)',
      }}>
        <Typography
          onClick={onOpenSettings}
          sx={{
            color: accent, fontWeight: 600, fontSize: nameFontSize,
            letterSpacing: '0.04em', cursor: 'pointer', userSelect: 'none',
            textTransform: 'uppercase',
            fontFamily: "'Orbitron-Regular', monospace",
            display: 'flex',
            alignItems: 'center',
            gap: compact ? 0.4 : 0.75,
            textAlign: 'center',
            lineHeight: 1.1,
          }}
        >
          <Box component="span">{player.name}</Box>
          {player.commander && (
            <Box component="span" sx={{ color: '#ddd', opacity: 0.9, textTransform: 'none', fontSize: compact ? '0.74em' : '0.82em' }}>
              - {player.commander}
            </Box>
          )}
        </Typography>
      </Box>

      {/* Life row */}
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'stretch', minHeight: 0 }}>
        <HoldButton
          onTap={() => onLifeChange(-1)}
          onHold={() => onLifeChange(-HOLD_INCREMENT)}
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
        }}>
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
            <Typography
              onClick={() => { setLifeVal(String(player.life)); setEditLife(true); }}
              sx={{
                fontSize: lifeFontSize,
                fontWeight: 800, lineHeight: 1,
                color: lifeColor,
                cursor: 'pointer', userSelect: 'none',
                transition: 'color 0.35s',
                fontFamily: "'Monoton-Regular', monospace",
                letterSpacing: '-0.04em',
                ...(lifeTextShadow
                  ? { textShadow: lifeTextShadow }
                  : { animation: `${neonGlow} 4s infinite alternate ease-in-out` }),
              }}
            >
              {player.life}
            </Typography>
          )}
        </Box>

        <HoldButton
          onTap={() => onLifeChange(1)}
          onHold={() => onLifeChange(HOLD_INCREMENT)}
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

      {/* Poison counter badge */}
      {player.poisonCounters > 0 && (
        <Box
          onClick={onOpenSettings}
          sx={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5,
            py: compact ? 0.2 : 0.3, flexShrink: 0,
            borderTop: `1px solid ${accent}22`,
            cursor: 'pointer',
            bgcolor: player.poisonCounters >= POISON_LETHAL
              ? 'rgba(244,67,54,0.12)' : 'rgba(255,255,255,0.03)',
          }}
        >
          <Typography sx={{
            fontSize: compact ? '0.68rem' : '0.75rem',
            color: player.poisonCounters >= POISON_LETHAL ? '#f44336' : '#aaa',
            fontWeight: 600, userSelect: 'none',
            fontFamily: "'Orbitron-Regular', monospace",
          }}>
            ☠ {player.poisonCounters} poison
          </Typography>
        </Box>
      )}

      <CommanderDamageGrid
        pid={pid}
        player={player}
        allPlayers={allPlayers}
        accent={accent}
        rotation={rotation}
        compact={compact}
        onDamageClick={onDamageClick}
        onSelfClick={onOpenSettings}
      />

      {/* Alive-override strip: shown when player should be dead but clicked "Not dead" */}
      {overridingDeath && (
        <Box
          onClick={() => onPlayerUpdate({ isAliveOverride: false })}
          sx={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5,
            py: compact ? 0.25 : 0.4, px: compact ? 0.75 : 1, flexShrink: 0, cursor: 'pointer',
            borderTop: `1px solid #4acc7033`,
            bgcolor: 'rgba(74,204,112,0.07)',
            '&:hover': { bgcolor: 'rgba(74,204,112,0.12)' },
          }}
        >
          <Checkbox
            checked
            size="small"
            readOnly
            sx={{ color: '#4acc70', '&.Mui-checked': { color: '#4acc70' }, p: 0.25 }}
          />
          <Typography sx={{
            fontSize: compact ? '0.58rem' : '0.65rem', color: 'rgba(74,204,112,0.65)',
            fontStyle: 'italic', userSelect: 'none',
            fontFamily: "'Orbitron-Regular', monospace",
          }}>
            {aliveQuote}
          </Typography>
        </Box>
      )}

      {/* Dead overlay */}
      {dead && (
        <Box sx={{
          position: 'absolute', inset: 0, zIndex: 10,
          bgcolor: 'rgba(0,0,0,0.8)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center',
          pointerEvents: 'auto',
        }}>
          {/* Skull + cause — centered in available space */}
          <Box sx={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 1,
          }}>
            <Typography sx={{
              fontSize: 'clamp(4rem, 18vw, 9rem)',
              opacity: 0.22, userSelect: 'none', lineHeight: 1,
            }}>
              💀
            </Typography>
            {showDeathCause && (
              <Typography sx={{
                fontSize: compact ? { xs: '0.65rem', sm: '0.72rem' } : { xs: '0.72rem', sm: '0.8rem' }, color: '#888',
                userSelect: 'none', textAlign: 'center', px: 1.5,
                whiteSpace: 'pre-line', lineHeight: 1.4,
                fontFamily: "'Orbitron-Regular', monospace",
              }}>
                {deathCause}
              </Typography>
            )}
          </Box>

          {/* Not dead — anchored to bottom */}
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
            sx={{ m: 0, mb: 1.5, cursor: 'pointer' }}
          />
        </Box>
      )}

    </Box>
  );
}
