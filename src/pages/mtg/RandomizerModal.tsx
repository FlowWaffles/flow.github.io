import { useEffect, useRef, useState } from 'react';
import { keyframes } from '@emotion/react';
import { Backdrop, Box, Button, Typography } from '@mui/material';
import Icon from '@mdi/react';
import { mdiHandCoin, mdiDice5 } from '@mdi/js';

const iconFadePulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.2; }
`;

const COIN_RESULTS = ['Heads', 'Tails'] as const;
const DICE_SIDES_OPTIONS = [4, 6, 8, 10, 12, 20] as const;
const RESULT_ICON_RESHOW_DELAY_MS = 900;
type DiceSides = (typeof DICE_SIDES_OPTIONS)[number];

type RandomizerModalProps = {
  open: boolean;
  mobileLayout: boolean;
  rotation: number;
  onClose: () => void;
  onRollStartingPlayer: () => void;
  onOpenThreatModal: () => void;
};

export default function RandomizerModal({
  open,
  mobileLayout,
  rotation,
  onClose,
  onRollStartingPlayer,
  onOpenThreatModal,
}: RandomizerModalProps) {
  const [isRandomizing, setIsRandomizing] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [resultLabel, setResultLabel] = useState('');
  const [rollingType, setRollingType] = useState<'coin' | 'dice' | null>(null);
  const randomizerIntervalRef = useRef<number | null>(null);
  const randomizerTimeoutRef = useRef<number | null>(null);
  const showControlsTimeoutRef = useRef<number | null>(null);

  const clearRandomizerAnimation = () => {
    if (randomizerIntervalRef.current !== null) {
      window.clearInterval(randomizerIntervalRef.current);
      randomizerIntervalRef.current = null;
    }
    if (randomizerTimeoutRef.current !== null) {
      window.clearTimeout(randomizerTimeoutRef.current);
      randomizerTimeoutRef.current = null;
    }
    if (showControlsTimeoutRef.current !== null) {
      window.clearTimeout(showControlsTimeoutRef.current);
      showControlsTimeoutRef.current = null;
    }
  };

  useEffect(() => () => clearRandomizerAnimation(), []);

  useEffect(() => {
    if (open) return;
    clearRandomizerAnimation();
    setIsRandomizing(false);
    setShowControls(true);
    setRollingType(null);
    setResultLabel('');
  }, [open]);

  const randomFrom = <T,>(values: readonly T[]) => values[Math.floor(Math.random() * values.length)];
  const runShuffleAnimation = <T,>(
    values: readonly T[],
    onFrame: (value: T) => void,
    onDone: (value: T) => void,
  ) => {
    clearRandomizerAnimation();
    setIsRandomizing(true);
    setShowControls(false);
    onFrame(randomFrom(values));
    randomizerIntervalRef.current = window.setInterval(() => {
      onFrame(randomFrom(values));
    }, 90);
    randomizerTimeoutRef.current = window.setTimeout(() => {
      clearRandomizerAnimation();
      const finalValue = randomFrom(values);
      onFrame(finalValue);
      onDone(finalValue);
      setIsRandomizing(false);
      showControlsTimeoutRef.current = window.setTimeout(() => {
        setShowControls(true);
        setRollingType(null);
        showControlsTimeoutRef.current = null;
      }, RESULT_ICON_RESHOW_DELAY_MS);
    }, 1200);
  };

  const spinCoin = () => {
    setRollingType('coin');
    runShuffleAnimation(
      COIN_RESULTS,
      value => setResultLabel(value),
      value => setResultLabel(value),
    );
  };

  const rollDice = (sides: DiceSides) => {
    setRollingType('dice');
    const values = Array.from({ length: sides }, (_, index) => index + 1);
    runShuffleAnimation(
      values,
      value => setResultLabel(`d${sides}: ${value}`),
      value => setResultLabel(`d${sides}: ${value}`),
    );
  };

  const handleClose = () => {
    clearRandomizerAnimation();
    setIsRandomizing(false);
    setShowControls(true);
    setRollingType(null);
    setResultLabel('');
    onClose();
  };

  return (
    <Backdrop
      open={open}
      onClick={handleClose}
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
          width: mobileLayout ? 'min(78%, 440px)' : 'min(92vw, 440px)',
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
        {showControls && (
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 1.5, alignItems: 'stretch' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
              <Button
                variant="outlined"
                onClick={spinCoin}
                disabled={isRandomizing}
                sx={{ textTransform: 'none', color: '#fff', borderColor: '#fff' }}
              >
                Flip coin
              </Button>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 1 }}>
                {DICE_SIDES_OPTIONS.map(sides => (
                  <Button
                    key={sides}
                    size="small"
                    variant="outlined"
                    disabled={isRandomizing}
                    onClick={() => rollDice(sides)}
                    sx={{ minWidth: 0, textTransform: 'none', color: '#fff', borderColor: '#fff' }}
                  >
                    d{sides}
                  </Button>
                ))}
              </Box>
            </Box>
          </Box>
        )}
        {!showControls && rollingType && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              color: '#fff',
              animation: isRandomizing ? `${iconFadePulse} 0.45s linear infinite` : 'none',
            }}
          >
            <Icon path={rollingType === 'coin' ? mdiHandCoin : mdiDice5} size={1} />
          </Box>
        )}
        {resultLabel && (
          <Typography sx={{ textAlign: 'center', fontSize: '1.25rem', fontWeight: 700 }}>
            {resultLabel}
          </Typography>
        )}
        {showControls && (
          <Button
            variant="outlined"
            onClick={onRollStartingPlayer}
            disabled={isRandomizing}
            sx={{ color: '#fff', borderColor: '#fff', textTransform: 'none' }}
          >
            Roll starting player
          </Button>
        )}
        {showControls && (
          <Button
            variant="outlined"
            onClick={onOpenThreatModal}
            disabled={isRandomizing}
            sx={{ color: '#f87171', borderColor: '#f87171', textTransform: 'none' }}
          >
            Who is the threat?
          </Button>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={handleClose} sx={{ color: '#aaa' }}>Close</Button>
        </Box>
      </Box>
    </Backdrop>
  );
}
