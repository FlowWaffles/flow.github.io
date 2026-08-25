import { useEffect, useRef, useState } from 'react';
import {
  Backdrop, Box, Button, TextField, Typography, useMediaQuery,
} from '@mui/material';
import CommanderChipInput from './CommanderChipInput';
import type { CommanderEntry, Player } from './types';

type QuickSetupEntry = {
  name: string;
  commander: string;
  partnerCommander: string;
};

type StartingLife = 20 | 40;

interface QuickSetupDialogProps {
  open: boolean;
  players: Player[];
  commanders: CommanderEntry[];
  visiblePlayerIds: number[];
  onClose: () => void;
  onApply: (entries: QuickSetupEntry[], startingLife: StartingLife) => void;
}

export default function QuickSetupDialog({
  open,
  players,
  commanders,
  visiblePlayerIds,
  onClose,
  onApply,
}: QuickSetupDialogProps) {
  const [entries, setEntries] = useState<QuickSetupEntry[]>([]);
  const [originalNames, setOriginalNames] = useState<string[]>([]);
  const [startingLife, setStartingLife] = useState<StartingLife>(40);
  const [isTyping, setIsTyping] = useState(false);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const compactViewport = useMediaQuery('(max-width: 700px)');
  const compactLayout = isTyping || compactViewport;

  useEffect(() => {
    if (!open) {
      setIsTyping(false);
      return;
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setOriginalNames(players.map(p => p.name));
    setStartingLife(players.every(p => p.life === 20) ? 20 : 40);
    setEntries(players.map(player => ({
      name: '',
      commander: player.commander,
      partnerCommander: player.partnerCommander,
    })));
  }, [open, players]);

  const setEntry = (index: number, update: Partial<QuickSetupEntry>) => {
    setEntries(prev => prev.map((entry, entryIndex) => (
      entryIndex === index ? { ...entry, ...update } : entry
    )));
  };

  return (
    <Backdrop
      open={open}
      onClick={onClose}
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: 230,
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
          bgcolor: '#1e1e1e',
          color: '#eee',
          border: '1px solid #333',
          borderRadius: 2,
          boxShadow: '0 0 32px rgba(0,0,0,0.35)',
          width: compactLayout ? 'min(92vw, 420px)' : 'min(96vw, 720px)',
          maxWidth: 'calc(100% - 24px)',
          height: compactLayout ? 'auto' : 'min(94dvh, 760px)',
          maxHeight: 'calc(100dvh - 24px)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ px: 3, pt: 2.25, pb: 1.25 }}>
          <Typography sx={{
            color: '#d7deef',
            fontWeight: 700,
            fontSize: '1rem',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}
          >
            Quick Setup
          </Typography>
          <Typography sx={{ color: '#98a3b8', fontSize: '0.82rem', mt: 0.6 }}>
            Set visible player names and commanders (including partners), and choose starting life.
          </Typography>
          <Box sx={{ mt: 1.25, display: 'inline-flex', gap: 0.75 }}>
            <Button
              size="small"
              variant={startingLife === 20 ? 'contained' : 'outlined'}
              onClick={() => setStartingLife(20)}
              sx={{ minWidth: 56, textTransform: 'none' }}
            >
              20
            </Button>
            <Button
              size="small"
              variant={startingLife === 40 ? 'contained' : 'outlined'}
              onClick={() => setStartingLife(40)}
              sx={{ minWidth: 56, textTransform: 'none' }}
            >
              40
            </Button>
          </Box>
        </Box>

        <Box sx={{ px: 3, pb: 2, overflowY: 'auto', display: 'grid', gap: 1.4 }}>
          {entries.map((entry, index) => (
            !visiblePlayerIds.includes(index) ? null : (
            <Box
              key={index}
              sx={{
                display: 'grid',
                gridTemplateColumns: compactLayout ? '1fr' : '84px minmax(0, 1fr) minmax(0, 2fr)',
                gap: 1,
                alignItems: 'center',
              }}
            >
              <Typography sx={{
                color: '#8a93a8',
                fontSize: '0.74rem',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
              >
                Player {index + 1}
              </Typography>
              <TextField
                value={entry.name}
                onChange={e => setEntry(index, { name: e.target.value })}
                size="small"
                placeholder={originalNames[index] ?? `Player ${index + 1}`}
                fullWidth
                inputProps={{ style: { color: '#eee' } }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: '#444' },
                    '&:hover fieldset': { borderColor: '#6c7490' },
                    '&.Mui-focused fieldset': { borderColor: '#9aa6ca' },
                  },
                }}
              />
              <CommanderChipInput
                values={[entry.commander, entry.partnerCommander].filter(Boolean)}
                commanders={commanders}
                popperZIndex={2400}
                onChange={(names) => {
                  setEntry(index, {
                    commander: names[0] ?? '',
                    partnerCommander: names[1] ?? '',
                  });
                }}
              />
            </Box>
            )
          ))}
        </Box>

        <Box sx={{ px: 3, pb: 2.25, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button onClick={onClose} sx={{ color: '#aaa' }}>Cancel</Button>
          <Button
            onClick={() => onApply(entries.map((e, i) => ({
              ...e,
              name: e.name.trim() || originalNames[i] || `Player ${i + 1}`,
            })), startingLife)}
            variant="contained"
            sx={{ textTransform: 'none' }}
          >
            Apply
          </Button>
        </Box>
      </Box>
    </Backdrop>
  );
}
