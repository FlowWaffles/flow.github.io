import { useState, useEffect, useRef } from 'react';
import {
  Box, Button, TextField, Typography, Backdrop, useMediaQuery, Checkbox, FormControlLabel,
} from '@mui/material';
import Icon from '@mdi/react';
import { mdiCrown } from '@mdi/js';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import SkullIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import HoldButton from './HoldButton';
import CommanderChipInput from './CommanderChipInput';
import type { Player, CommanderEntry } from './types';
import {
  ACCENT_OPTIONS, POISON_LETHAL, HOLD_INCREMENT, getPlayerModalRotation,
  isEffectivelyDead,
} from './types';

interface PlayerSettingsModalProps {
  open: boolean;
  player: Player;
  onClose: () => void;
  onUpdate: (update: Partial<Player>) => void;
  commanders?: CommanderEntry[];
  commandersLoading?: boolean;
  surfaceRotation?: number;
}

export default function PlayerSettingsModal({
  open, player, onClose, onUpdate, commanders = [], commandersLoading = false, surfaceRotation = 0,
}: PlayerSettingsModalProps) {
  const [name, setName] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const mobileLayout = useMediaQuery('(pointer: coarse)');

  useEffect(() => {
    if (open) {
      setName('');
    }
  }, [open, player.name]);

  const commitName = () => {
    const trimmed = name.trim() || player.name;
    setName(trimmed);
    onUpdate({ name: trimmed });
  };

  const dead = isEffectivelyDead(player);
  const accent = player.accentColor;
  const baseModalRotation = getPlayerModalRotation(player.seat ?? 0);
  const normalizedSurfaceRotation = ((surfaceRotation % 360) + 360) % 360;
  const modalRotation = isTyping ? -normalizedSurfaceRotation : baseModalRotation;
  const landscapeLayout = !isTyping && (mobileLayout || Math.abs(modalRotation) % 180 === 90);
  const showCommanderBox = commandersLoading || commanders.length > 0;
  const contentGap = landscapeLayout ? 1.5 : 2.5;
  const sectionLabelSx = {
    fontSize: '0.72rem',
    color: '#666',
    mb: landscapeLayout ? 0.75 : 0.5,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  };
  const colorSwatchSize = landscapeLayout ? 24 : 28;

  const counterBtnSx = {
    width: 44,
    minWidth: 44,
    maxWidth: 44,
    height: 44,
    minHeight: 44,
    maxHeight: 44,
    flexShrink: 0,
    aspectRatio: '1 / 1',
    borderRadius: '50%',
    bgcolor: 'rgba(255,255,255,0.08)', color: '#fff',
    '&:hover': { bgcolor: 'rgba(255,255,255,0.15)' },
    '&:active': { bgcolor: 'rgba(255,255,255,0.25)' },
  };

  return (
    <Backdrop
      open={open}
      onClick={onClose}
      sx={{
        position: 'absolute',
        inset: 0,
        zIndex: 210,
        backdropFilter: 'blur(4px)',
        bgcolor: 'rgba(0,0,0,0.7)',
      }}
    >
      <Box
        ref={modalRef}
        onClick={e => e.stopPropagation()}
        onFocusCapture={() => setIsTyping(true)}
        onBlurCapture={() => {
          window.setTimeout(() => {
            const root = modalRef.current;
            if (!root) return;
            if (!root.contains(document.activeElement)) setIsTyping(false);
          }, 0);
        }}
        sx={{
          bgcolor: '#1a1a1a',
          color: '#eee',
          border: `1px solid ${accent}55`,
          boxShadow: `0 0 40px ${accent}22`,
          borderRadius: 2,
          width: landscapeLayout ? 'min(92%, 720px)' : 'min(92vw, 420px)',
          height: landscapeLayout ? 'min(88%, 392px)' : 'auto',
          maxHeight: landscapeLayout ? 'min(88%, 392px)' : 'calc(100dvh - 32px)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          transform: `rotate(${modalRotation}deg)`,
          transformOrigin: 'center',
        }}
      >
        <Box sx={{ px: landscapeLayout ? 2.5 : 3, pt: 2.25, pb: landscapeLayout ? 0.75 : 1.25, color: accent, fontWeight: 700, fontSize: '1rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          Player Settings
        </Box>

        <Box
          sx={{
            px: landscapeLayout ? 2.5 : 3,
            pb: landscapeLayout ? 1.5 : 2,
            flex: 1,
            minHeight: 0,
            display: 'grid',
            gridTemplateColumns: landscapeLayout && showCommanderBox
              ? 'minmax(0, 1fr) minmax(0, 1fr)'
              : 'minmax(0, 1fr)',
            gridTemplateAreas: landscapeLayout
              ? showCommanderBox
                ? `
                  "name commander"
                  "color commander"
                  "poison status"
                `
                : `
                  "name"
                  "color"
                  "poison"
                  "status"
                `
              : showCommanderBox
                ? `
                  "name"
                  "color"
                  "commander"
                  "poison"
                  "status"
                `
                : `
                  "name"
                  "color"
                  "poison"
                  "status"
                `,
            gap: contentGap,
            overflowY: 'auto',
            overflowX: 'hidden',
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': { display: 'none' },
          }}
        >
        <Box sx={{ gridArea: 'name', minWidth: 0 }}>
          <Box>
            <Typography sx={sectionLabelSx}>
              Name
            </Typography>
            <TextField
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={player.name}
              onFocus={() => setIsTyping(true)}
              onBlur={() => {
                commitName();
              }}
              onKeyDown={e => { if (e.key === 'Enter') commitName(); }}
              size="small"
              fullWidth
              variant="outlined"
              inputProps={{ style: { color: '#eee' } }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#444' },
                  '&:hover fieldset': { borderColor: `${accent}88` },
                  '&.Mui-focused fieldset': { borderColor: accent },
                },
              }}
            />
          </Box>
        </Box>

        <Box sx={{ gridArea: 'color', minWidth: 0 }}>
          <Box>
            <Typography sx={{ ...sectionLabelSx, mb: 1 }}>
              Color
            </Typography>
            <Box sx={{
              display: 'flex',
              flexWrap: landscapeLayout ? 'nowrap' : 'wrap',
              gap: landscapeLayout ? 0.75 : 1,
              alignItems: 'center',
              justifyContent: landscapeLayout ? 'space-between' : 'flex-start',
            }}>
              {ACCENT_OPTIONS.map(color => (
                <Box
                  key={color}
                  onClick={() => onUpdate({ accentColor: color })}
                  sx={{
                    width: colorSwatchSize,
                    height: colorSwatchSize,
                    minWidth: colorSwatchSize,
                    borderRadius: '50%',
                    bgcolor: color,
                    cursor: 'pointer',
                    outline: player.accentColor === color ? `3px solid ${color}` : '3px solid transparent',
                    outlineOffset: '2px',
                    transition: 'transform 0.12s, outline 0.12s',
                    '&:hover': { transform: 'scale(1.2)' },
                  }}
                />
              ))}
            </Box>
          </Box>
        </Box>

        {showCommanderBox && (
          <Box sx={{ gridArea: 'commander', minWidth: 0 }}>
            <Box>
              <Typography sx={sectionLabelSx}>
                Commander
              </Typography>
              {commandersLoading ? (
                <Typography sx={{ color: '#888', fontSize: '0.86rem', py: 1.2 }}>
                  Loading commanders...
                </Typography>
              ) : (
                <CommanderChipInput
                  values={[player.commander, player.partnerCommander].filter(Boolean)}
                  commanders={commanders}
                  accent={accent}
                  popperZIndex={2200}
                  onTypingChange={setIsTyping}
                  onChange={(names, artUrls) => {
                    onUpdate({
                      commander: names[0] ?? '',
                      commanderArtUrl: artUrls[0] ?? '',
                      partnerCommander: names[1] ?? '',
                      partnerCommanderArtUrl: artUrls[1] ?? '',
                    });
                  }}
                />
              )}
            </Box>
          </Box>
        )}

        <Box sx={{ gridArea: 'poison', minWidth: 0 }}>
          <Box>
            <Typography sx={{ ...sectionLabelSx, mb: 1 }}>
              Poison Counters
              {player.poisonCounters >= POISON_LETHAL && (
                <Box component="span" sx={{ ml: 1, color: '#f44336' }}>☠ Lethal</Box>
              )}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: landscapeLayout ? 1.25 : 2 }}>
              <HoldButton
                onTap={() => onUpdate({ poisonCounters: Math.max(0, player.poisonCounters - 1) })}
                onHold={() => onUpdate({ poisonCounters: Math.max(0, player.poisonCounters - HOLD_INCREMENT) })}
                sx={counterBtnSx}
              >
                <RemoveIcon />
              </HoldButton>
              <Typography sx={{
                fontSize: '2rem', fontWeight: 700, minWidth: '3ch', textAlign: 'center',
                color: player.poisonCounters >= POISON_LETHAL ? '#f44336' : '#eee',
                transition: 'color 0.3s',
              }}>
                {player.poisonCounters}
              </Typography>
              <HoldButton
                onTap={() => onUpdate({ poisonCounters: player.poisonCounters + 1 })}
                onHold={() => onUpdate({ poisonCounters: player.poisonCounters + HOLD_INCREMENT })}
                sx={counterBtnSx}
              >
                <AddIcon />
              </HoldButton>
            </Box>
          </Box>
        </Box>

        <Box sx={{ gridArea: 'status', minWidth: 0 }}>
          <Box>
            <Typography sx={{ ...sectionLabelSx, mb: 1 }}>
              Status
            </Typography>
            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
              <Button
                variant={player.isDead ? 'contained' : 'outlined'}
                color="error"
                size="small"
                startIcon={<SkullIcon />}
                onClick={() => onUpdate({ isDead: !player.isDead, isAliveOverride: false })}
                sx={{ textTransform: 'none', fontSize: '0.8rem' }}
              >
                {player.isDead ? 'KO\'d (undo)' : 'KO player'}
              </Button>
              {dead && (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => onUpdate({ isDead: false, isAliveOverride: true })}
                  sx={{
                    textTransform: 'none', fontSize: '0.8rem',
                    color: '#4acc70', borderColor: '#4acc7088',
                    '&:hover': { borderColor: '#4acc70', bgcolor: 'rgba(74,204,112,0.08)' },
                  }}
                >
                  ✓ Not dead
                </Button>
              )}
              <FormControlLabel
                control={
                  <Checkbox
                    checked={!!player.isMonarch}
                    onChange={e => onUpdate({ isMonarch: e.target.checked })}
                    size="small"
                    icon={<Icon path={mdiCrown} size={0.85} color="#555" />}
                    checkedIcon={<Icon path={mdiCrown} size={0.85} color={accent} />}
                    sx={{ p: 0.5 }}
                  />
                }
                label={
                  <Typography sx={{ fontSize: '0.8rem', color: player.isMonarch ? accent : '#888', userSelect: 'none' }}>
                    Monarch
                  </Typography>
                }
                sx={{ ml: 0, gap: 0.5 }}
              />
            </Box>
          </Box>
        </Box>

        </Box>

        <Box sx={{ px: 2, pb: landscapeLayout ? 1.5 : 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button onClick={onClose} sx={{ color: '#888', textTransform: 'none' }}>
          Close
        </Button>
        </Box>
      </Box>
    </Backdrop>
  );
}
