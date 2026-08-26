import { useRef, useState, useEffect } from 'react';
import { keyframes } from '@emotion/react';
import { Backdrop, Box, Button, Typography } from '@mui/material';
import type { Player } from './types';
import { accentToBg } from './types';

const threatSpinGlow = keyframes`
  0% {
    box-shadow:
      0 0 10px rgba(255, 60, 60, 0.55),
      0 0 22px rgba(220, 60, 60, 0.45);
  }
  50% {
    box-shadow:
      0 0 18px rgba(255, 80, 80, 0.95),
      0 0 38px rgba(220, 60, 60, 0.75);
  }
  100% {
    box-shadow:
      0 0 10px rgba(255, 60, 60, 0.55),
      0 0 22px rgba(220, 60, 60, 0.45);
  }
`;

const threatWinnerGlow = keyframes`
  0% {
    box-shadow:
      0 0 14px rgba(255, 60, 60, 0.8),
      0 0 30px rgba(220, 60, 60, 0.6);
  }
  40% {
    box-shadow:
      0 0 28px rgba(255, 80, 80, 1),
      0 0 56px rgba(220, 60, 60, 0.95),
      0 0 80px rgba(255, 0, 0, 0.5);
  }
  100% {
    box-shadow:
      0 0 18px rgba(255, 60, 60, 0.9),
      0 0 40px rgba(220, 60, 60, 0.78);
  }
`;

const threatTextPop = keyframes`
  0%   { transform: scale(0.4) rotate(-6deg); opacity: 0; }
  60%  { transform: scale(1.15) rotate(2deg); opacity: 1; }
  80%  { transform: scale(0.95) rotate(-1deg); opacity: 1; }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
`;

type ThreatModalProps = {
  open: boolean;
  rotation: number;
  players: Player[];
  physicalLayout: (number | null)[];
  onClose: () => void;
};

export default function ThreatModal({
  open,
  rotation,
  players,
  physicalLayout,
  onClose,
}: ThreatModalProps) {
  const [selectedPids, setSelectedPids] = useState<Set<number>>(new Set());
  const [phase, setPhase] = useState<'select' | 'spinning' | 'winner'>('select');
  const [activePid, setActivePid] = useState<number | null>(null);

  const intervalRef = useRef<number | null>(null);
  const timeoutsRef = useRef<number[]>([]);

  const clearAnimation = () => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    timeoutsRef.current.forEach(id => window.clearTimeout(id));
    timeoutsRef.current = [];
  };

  useEffect(() => () => clearAnimation(), []);

  useEffect(() => {
    if (open) return;
    clearAnimation();
    setSelectedPids(new Set());
    setPhase('select');
    setActivePid(null);
  }, [open]);

  const togglePid = (pid: number) => {
    if (phase !== 'select') return;
    setSelectedPids(prev => {
      const next = new Set(prev);
      if (next.has(pid)) next.delete(pid);
      else next.add(pid);
      return next;
    });
  };

  const determineThreat = () => {
    const candidates = Array.from(selectedPids);
    if (candidates.length < 2) return;

    const randomCandidate = () => candidates[Math.floor(Math.random() * candidates.length)];

    clearAnimation();
    setPhase('spinning');
    setActivePid(randomCandidate());

    intervalRef.current = window.setInterval(() => {
      setActivePid(randomCandidate());
    }, 90);

    const finalTimeout = window.setTimeout(() => {
      clearAnimation();
      const winner = randomCandidate();
      setActivePid(winner);
      setPhase('winner');
    }, 2400);

    timeoutsRef.current.push(finalTimeout);
  };

  const handleClose = () => {
    clearAnimation();
    setSelectedPids(new Set());
    setPhase('select');
    setActivePid(null);
    onClose();
  };

  // physicalLayout is [topLeft, topRight, bottomLeft, bottomRight]
  const [tl, tr, bl, br] = physicalLayout;
  const hasRightColumn = tr !== null || br !== null;
  const gridCols = hasRightColumn ? '1fr 1fr' : '1fr';

  const renderTile = (pid: number | null, cellKey: string) => {
    if (pid === null) {
      return (
        <Box
          key={cellKey}
          sx={{ borderRadius: 1, bgcolor: 'transparent', minHeight: 60 }}
        />
      );
    }

    const player = players[pid];
    const accent = player.accentColor ?? '#60a5fa';
    const bg = accentToBg(accent);
    const isSelected = selectedPids.has(pid);
    const isActive = activePid === pid;
    const isWinner = phase === 'winner' && isActive;
    const isSpinning = phase === 'spinning' && isActive;

    return (
      <Box
        key={cellKey}
        onClick={() => togglePid(pid)}
        sx={{
          borderRadius: 1.5,
          minHeight: 60,
          bgcolor: bg,
          backgroundImage: `linear-gradient(135deg, ${accent}28, transparent 60%)`,
          border: isSelected
            ? '2px solid rgba(255,70,70,0.85)'
            : `2px solid ${accent}44`,
          cursor: phase === 'select' ? 'pointer' : 'default',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'border-color 0.15s, box-shadow 0.15s',
          animation: isWinner
            ? `${threatWinnerGlow} 0.45s ease-out 1 forwards`
            : isSpinning
              ? `${threatSpinGlow} 0.45s ease-in-out infinite`
              : 'none',
          boxShadow: isSelected && phase === 'select'
            ? '0 0 8px rgba(255,70,70,0.45), 0 0 16px rgba(220,50,50,0.3)'
            : undefined,
          '&:hover': phase === 'select' ? {
            border: isSelected ? '2px solid rgba(255,80,80,1)' : `2px solid ${accent}88`,
            boxShadow: isSelected
              ? '0 0 10px rgba(255,70,70,0.6), 0 0 20px rgba(220,50,50,0.4)'
              : `0 0 6px ${accent}44`,
          } : {},
        }}
      >
        <Typography
          sx={{
            fontSize: '0.7rem',
            fontWeight: 600,
            color: '#eee',
            textAlign: 'center',
            px: 0.5,
            zIndex: 1,
            pointerEvents: 'none',
          }}
        >
          {player.name || `P${pid + 1}`}
        </Typography>

        {isWinner && (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'rgba(0,0,0,0.45)',
              zIndex: 2,
            }}
          >
            <Typography
              sx={{
                fontSize: '1.1rem',
                fontWeight: 900,
                color: '#ff3c3c',
                letterSpacing: '0.08em',
                textShadow:
                  '0 0 8px rgba(255,60,60,0.9), 0 0 18px rgba(220,40,40,0.7)',
                animation: `${threatTextPop} 0.45s cubic-bezier(0.34,1.56,0.64,1) both`,
                pointerEvents: 'none',
                userSelect: 'none',
              }}
            >
              THREAT
            </Typography>
          </Box>
        )}
      </Box>
    );
  };

  return (
    <Backdrop
      open={open}
      onClick={handleClose}
      sx={{ position: 'absolute', inset: 0, zIndex: 235, backdropFilter: 'blur(4px)', bgcolor: 'rgba(0,0,0,0.7)' }}
    >
      <Box
        onClick={e => e.stopPropagation()}
        sx={{
          bgcolor: '#1e1e1e',
          color: '#eee',
          border: '1px solid #333',
          borderRadius: 2,
          boxShadow: '0 0 32px rgba(0,0,0,0.35)',
          width: 'min(92vw, 380px)',
          maxWidth: 'calc(100% - 24px)',
          px: 3,
          py: 2.5,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          transform: `rotate(${rotation}deg)`,
          transformOrigin: 'center',
        }}
      >
        <Typography sx={{ fontWeight: 600, textAlign: 'center', fontSize: '0.95rem' }}>
          Who is the threat?
        </Typography>

        {phase === 'select' && (
          <Typography sx={{ fontSize: '0.75rem', color: '#aaa', textAlign: 'center', mt: -1 }}>
            Tap players to mark potential threats
          </Typography>
        )}

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: gridCols,
            gridTemplateRows: '1fr 1fr',
            gap: 1,
            aspectRatio: hasRightColumn ? '2 / 1' : '1 / 1',
          }}
        >
          {renderTile(tl ?? null, 'tl')}
          {hasRightColumn && renderTile(tr ?? null, 'tr')}
          {renderTile(bl ?? null, 'bl')}
          {hasRightColumn && renderTile(br ?? null, 'br')}
        </Box>

        {selectedPids.size >= 2 && phase === 'select' && (
          <Button
            variant="contained"
            onClick={determineThreat}
            sx={{
              bgcolor: '#8b1a1a',
              color: '#fff',
              textTransform: 'none',
              fontWeight: 700,
              '&:hover': { bgcolor: '#a82020' },
              boxShadow: '0 0 12px rgba(180,30,30,0.5)',
            }}
          >
            Determine Threat
          </Button>
        )}

        {phase === 'winner' && (
          <Button
            variant="outlined"
            onClick={() => {
              clearAnimation();
              setSelectedPids(new Set());
              setPhase('select');
              setActivePid(null);
            }}
            sx={{ color: '#fff', borderColor: '#555', textTransform: 'none' }}
          >
            Roll Again
          </Button>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={handleClose} sx={{ color: '#aaa' }}>Close</Button>
        </Box>
      </Box>
    </Backdrop>
  );
}
