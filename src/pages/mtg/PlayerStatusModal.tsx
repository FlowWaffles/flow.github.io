import { Box, Button, Typography, Backdrop, Checkbox, FormControlLabel } from '@mui/material';
import Icon from '@mdi/react';
import { mdiCrown } from '@mdi/js';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import SkullIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import HoldButton from './HoldButton';
import type { Player } from './types';
import { POISON_LETHAL, HOLD_INCREMENT, isEffectivelyDead } from './types';

interface PlayerStatusModalProps {
  open: boolean;
  player: Player;
  onClose: () => void;
  onUpdate: (update: Partial<Player>) => void;
  modalRotation?: number;
}

export default function PlayerStatusModal({
  open, player, onClose, onUpdate, modalRotation = 0,
}: PlayerStatusModalProps) {
  const accent = player.accentColor;
  const dead = isEffectivelyDead(player);
  const rotation = modalRotation;

  const counterBtnSx = {
    minWidth: 44,
    minHeight: 44,
    borderRadius: '50%',
    border: '1px solid #444',
    color: '#ccc',
    '&:hover': { bgcolor: 'rgba(255,255,255,0.08)', borderColor: '#666' },
    '&:active': { bgcolor: 'rgba(255,255,255,0.14)' },
  };

  const sectionLabelSx = {
    fontSize: '0.72rem',
    color: '#666',
    mb: 1,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  };

  if (!open) return null;

  return (
    <Backdrop
      open
      onClick={onClose}
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
          width: 'min(92vw, 320px)',
          maxWidth: 'calc(100% - 24px)',
          px: 3,
          py: 2.5,
          transform: `rotate(${rotation}deg)`,
          transformOrigin: 'center',
          display: 'flex',
          flexDirection: 'column',
          gap: 2.5,
        }}
      >
        <Typography sx={{ textAlign: 'center', fontWeight: 600, color: accent }}>
          {player.name}
        </Typography>

        {/* Poison Counters */}
        <Box>
          <Typography sx={sectionLabelSx}>
            Poison Counters
            {player.poisonCounters >= POISON_LETHAL && (
              <Box component="span" sx={{ ml: 1, color: '#f44336' }}>☠ Lethal</Box>
            )}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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

        {/* Status */}
        <Box>
          <Typography sx={sectionLabelSx}>
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
                  checked={player.isMonarch}
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

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={onClose} sx={{ color: '#888', textTransform: 'none' }}>
            Close
          </Button>
        </Box>
      </Box>
    </Backdrop>
  );
}
