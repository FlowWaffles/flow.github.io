import React, { useState, useEffect } from 'react';
import {
  Box, Button, TextField, Typography, Autocomplete, Backdrop, useMediaQuery,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import SkullIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import HoldButton from './HoldButton';
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
  const [name, setName] = useState(player.name);
  const [commanderInput, setCommanderInput] = useState(player.commander);
  const [isTyping, setIsTyping] = useState(false);
  const mobileLayout = useMediaQuery('(pointer: coarse)');

  useEffect(() => {
    if (open) {
      setName(player.name);
      setCommanderInput(player.commander);
    }
  }, [open, player.name, player.commander]);

  const commitName = () => {
    const trimmed = name.trim() || player.name;
    setName(trimmed);
    onUpdate({ name: trimmed });
  };

  const commitCommander = (input: string) => {
    const trimmed = input.trim();
    const found = commanders.find(c => c.name.toLowerCase() === trimmed.toLowerCase());
    onUpdate({ commander: trimmed, commanderArtUrl: found?.artCrop ?? '' });
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
        onClick={e => e.stopPropagation()}
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
              onFocus={() => setIsTyping(true)}
              onBlur={() => {
                commitName();
                setIsTyping(false);
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
                <Autocomplete
                  freeSolo
                  options={commanders}
                  getOptionLabel={(opt) => (typeof opt === 'string' ? opt : opt.name)}
                  filterOptions={(options, state) => {
                    const input = state.inputValue.toLowerCase().trim();
                    if (!input) return [];
                    const matches: CommanderEntry[] = [];
                    for (const option of options) {
                      if (option.name.toLowerCase().includes(input)) {
                        matches.push(option);
                        if (matches.length >= 8) break;
                      }
                    }
                    return matches;
                  }}
                  inputValue={commanderInput}
                  onInputChange={(_, v) => setCommanderInput(v)}
                  openOnFocus
                  noOptionsText={commanderInput.trim() ? 'No commanders found' : 'Type to search'}
                  onChange={(_, newValue) => {
                    if (!newValue) {
                      onUpdate({ commander: '', commanderArtUrl: '' });
                    } else if (typeof newValue === 'string') {
                      const found = commanders.find(c => c.name.toLowerCase() === newValue.toLowerCase());
                      onUpdate({ commander: newValue, commanderArtUrl: found?.artCrop ?? '' });
                    } else {
                      onUpdate({ commander: newValue.name, commanderArtUrl: newValue.artCrop });
                      setCommanderInput(newValue.name);
                    }
                  }}
                  slotProps={{
                    popper: { sx: { zIndex: 2200 } },
                    paper: { sx: { bgcolor: '#222', color: '#eee' } },
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Search commanders…"
                      size="small"
                      fullWidth
                      variant="outlined"
                      onFocus={() => setIsTyping(true)}
                      onBlur={() => {
                        commitCommander(commanderInput);
                        setIsTyping(false);
                      }}
                      inputProps={{ ...params.inputProps, style: { ...((params.inputProps as React.InputHTMLAttributes<HTMLInputElement>).style), color: '#eee' } }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': { borderColor: '#444' },
                          '&:hover fieldset': { borderColor: `${accent}88` },
                          '&.Mui-focused fieldset': { borderColor: accent },
                        },
                        '& input': { color: '#eee' },
                        '& .MuiAutocomplete-endAdornment svg': { color: '#888' },
                      }}
                    />
                  )}
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
            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
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
