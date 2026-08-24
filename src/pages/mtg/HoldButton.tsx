import React, { useRef, useEffect, useCallback } from 'react';
import { Box } from '@mui/material';
import { HOLD_DELAY_MS, HOLD_TICK_MS } from './types';

interface HoldButtonProps {
  onTap: () => void;
  onHold: () => void;
  children: React.ReactNode;
  sx?: object;
}

export default function HoldButton({ onTap, onHold, children, sx }: HoldButtonProps) {
  const tapRef = useRef(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onTapRef = useRef(onTap);
  const onHoldRef = useRef(onHold);
  onTapRef.current = onTap;
  onHoldRef.current = onHold;

  const clear = useCallback(() => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
  }, []);

  useEffect(() => clear, [clear]);

  const down = (e: React.PointerEvent) => {
    e.preventDefault();
    tapRef.current = true;
    timerRef.current = setTimeout(() => {
      tapRef.current = false;
      intervalRef.current = setInterval(() => onHoldRef.current(), HOLD_TICK_MS);
    }, HOLD_DELAY_MS);
  };

  const up = () => {
    const wasTap = tapRef.current;
    clear();
    if (wasTap) onTapRef.current();
  };

  return (
    <Box
      sx={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', userSelect: 'none',
        touchAction: 'none', WebkitTapHighlightColor: 'transparent',
        ...sx,
      }}
      onPointerDown={down}
      onPointerUp={up}
      onPointerLeave={clear}
      onPointerCancel={clear}
      onContextMenu={(e) => e.preventDefault()}
    >
      {children}
    </Box>
  );
}
