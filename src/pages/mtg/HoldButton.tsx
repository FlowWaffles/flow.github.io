import React, { useRef, useEffect, useCallback } from 'react';
import { Box } from '@mui/material';
import { HOLD_DELAY_MS } from './types';

interface HoldButtonProps {
  onTap: () => void;
  onHold: () => void;
  children: React.ReactNode;
  sx?: object;
}

export default function HoldButton({ onTap, onHold, children, sx }: HoldButtonProps) {
  const tapRef = useRef(false);
  const pointerRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onTapRef = useRef(onTap);
  const onHoldRef = useRef(onHold);
  onTapRef.current = onTap;
  onHoldRef.current = onHold;

  const clear = useCallback(() => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
  }, []);

  useEffect(() => clear, [clear]);

  const down = (e: React.PointerEvent) => {
    if (e.button !== 0 || pointerRef.current !== null) return;
    e.preventDefault();
    pointerRef.current = e.pointerId;
    tapRef.current = true;
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      tapRef.current = false;
      onHoldRef.current();
    }, HOLD_DELAY_MS);
  };

  const up = (e: React.PointerEvent) => {
    if (pointerRef.current !== e.pointerId) return;
    pointerRef.current = null;
    const wasTap = tapRef.current;
    tapRef.current = false;
    clear();
    if (wasTap) onTapRef.current();
  };

  const cancel = (e: React.PointerEvent) => {
    if (pointerRef.current !== e.pointerId) return;
    pointerRef.current = null;
    tapRef.current = false;
    clear();
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
      onPointerLeave={cancel}
      onPointerCancel={cancel}
      onContextMenu={(e) => e.preventDefault()}
    >
      {children}
    </Box>
  );
}
