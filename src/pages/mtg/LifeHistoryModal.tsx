import { useState, useEffect, useRef } from 'react';
import { Backdrop, Box, Typography, Button, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import type { LifeHistoryEntry } from './types';

function formatTimeAgo(timestamp: number, now: number): string {
  const seconds = Math.floor((now - timestamp) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (minutes < 60) return secs > 0 ? `${minutes}m ${secs}s ago` : `${minutes}m ago`;
  return `${Math.floor(minutes / 60)}h ago`;
}

function describeLifeChange(entry: LifeHistoryEntry): string {
  const amount = Math.abs(entry.delta);
  if (entry.source === 'paid') {
    return entry.delta < 0 ? `Paid ${amount} life` : `Regained ${amount} life`;
  }
  if (entry.source === 'gain') {
    return entry.delta > 0 ? `Gained ${amount} life` : `Lost ${amount} life`;
  }
  if (entry.source === 'commander') {
    return entry.delta > 0 ? `Gained ${amount} life` : `Lost ${amount} life`;
  }
  return entry.delta > 0 ? `Gained ${amount} life` : `Lost ${amount} life`;
}

interface LifeHistoryModalProps {
  open: boolean;
  history: LifeHistoryEntry[];
  accent: string;
  modalRotation: number;
  onClose: () => void;
  onRevert: () => void;
}

export default function LifeHistoryModal({ open, history, accent, modalRotation, onClose, onRevert }: LifeHistoryModalProps) {
  const [openTime, setOpenTime] = useState(Date.now());
  const dragRef = useRef<{
    pointerId: number;
    x: number;
    y: number;
    scrollTop: number;
    inverseTransform: DOMMatrix;
    moved: boolean;
  } | null>(null);

  useEffect(() => {
    if (open) setOpenTime(Date.now());
  }, [open]);

  if (!open) return null;

  return (
    <Backdrop
      open={open}
      sx={{
        position: 'absolute', inset: 0, zIndex: 230,
        bgcolor: 'rgba(0,0,0,0.88)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer',
      }}
      onClick={onClose}
    >
      <Box
        onClick={e => e.stopPropagation()}
        sx={{
          bgcolor: '#0f1318',
          border: `1px solid ${accent}44`,
          borderRadius: 2,
          p: 3,
          width: 'min(92%, 600px)',
          height: 'min(88%, 600px)',
          maxHeight: 'calc(100% - 32px)',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          transform: `rotate(${modalRotation}deg)`,
          transformOrigin: 'center',
          cursor: 'default',
          boxShadow: `0 0 28px ${accent}28`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5, flexShrink: 0 }}>
          <Typography sx={{
            fontWeight: 700, color: '#c1c8d6',
            fontFamily: "'Orbitron-Regular', monospace",
            fontSize: '1.1rem', letterSpacing: '0.06em', textTransform: 'uppercase',
          }}>
            Life History
          </Typography>
          <IconButton
            onClick={onClose}
            aria-label="Close life history"
            sx={{ color: '#c1c8d6', minWidth: 48, minHeight: 48, '&:hover': { color: '#fff' } }}
          >
            <CloseIcon sx={{ fontSize: '1.75rem' }} />
          </IconButton>
        </Box>

        <Box
          onPointerDown={event => {
            if (event.pointerType === 'touch' || event.button !== 0) return;
            if ((event.target as Element).closest('button')) return;
            const element = event.currentTarget;
            if (element.scrollHeight <= element.clientHeight) return;
            let transform = new DOMMatrix();
            for (let node: HTMLElement | null = element; node; node = node.parentElement) {
              const value = getComputedStyle(node).transform;
              if (value !== 'none') transform = new DOMMatrix(value).multiply(transform);
            }
            dragRef.current = {
              pointerId: event.pointerId,
              x: event.clientX,
              y: event.clientY,
              scrollTop: element.scrollTop,
              inverseTransform: transform.inverse(),
              moved: false,
            };
            element.setPointerCapture(event.pointerId);
          }}
          onPointerMove={event => {
            const drag = dragRef.current;
            if (!drag || drag.pointerId !== event.pointerId) return;
            // Convert the screen-space drag into the rotated list's local scroll axis.
            const delta = new DOMPoint(event.clientX - drag.x, event.clientY - drag.y, 0, 0)
              .matrixTransform(drag.inverseTransform);
            if (Math.abs(delta.y) > 4) drag.moved = true;
            if (drag.moved) event.currentTarget.scrollTop = drag.scrollTop - delta.y;
          }}
          onPointerUp={event => {
            if (event.currentTarget.hasPointerCapture(event.pointerId)) {
              event.currentTarget.releasePointerCapture(event.pointerId);
            }
          }}
          onLostPointerCapture={() => { dragRef.current = null; }}
          sx={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          pr: 1.5,
          scrollbarGutter: 'stable',
          scrollbarWidth: 'thin',
          scrollbarColor: '#667085 transparent',
          '&::-webkit-scrollbar': { width: 6 },
          '&::-webkit-scrollbar-track': { background: 'transparent' },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#667085',
            borderRadius: 999,
          },
          overscrollBehavior: 'contain',
          touchAction: 'auto',
          cursor: 'grab',
          '&:active': { cursor: 'grabbing' },
          WebkitOverflowScrolling: 'touch',
        }}>
        {history.length === 0 && (
          <Typography sx={{ textAlign: 'center', color: '#c1c8d6', fontSize: '1.2rem', py: 2 }}>
            No changes yet
          </Typography>
        )}

        {history.map((entry, i) => (
          <Box key={entry.id} sx={{
            display: 'flex', alignItems: 'center',
            py: 1.5, px: 0.5,
            borderBottom: i < history.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
            gap: 2,
          }}>
            <Typography sx={{
              fontWeight: 700,
              fontSize: '2rem',
              color: entry.delta > 0 ? '#4caf50' : '#f44336',
              minWidth: '3ch',
              flexShrink: 0,
              textShadow: entry.delta > 0
                ? '0 0 8px rgba(76,175,80,0.5)'
                : '0 0 8px rgba(244,67,54,0.5)',
            }}>
              {entry.delta > 0 ? `+${entry.delta}` : entry.delta}
            </Typography>

            {/* Meta */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontSize: '1.1rem', color: '#d2d9e8', fontStyle: 'italic' }}>
                {formatTimeAgo(entry.timestamp, openTime)}
              </Typography>
              <Typography sx={{ fontSize: '1.25rem', color: '#eef2f8', mt: 0.25 }}>
                {describeLifeChange(entry)}
              </Typography>
              {entry.source === 'commander' && (
                <Typography sx={{
                  fontSize: '1.1rem',
                  color: entry.attackerAccent ?? '#d2d9e8',
                  mt: 0.1,
                  overflowWrap: 'anywhere',
                }}>
                  Commander dmg by {entry.attackerCommander || entry.attackerName}
                </Typography>
              )}
            </Box>

            {i === 0 && (
              <Button
                onClick={onRevert}
                sx={{
                  fontSize: '1.1rem', color: '#e0e6f0', textTransform: 'none',
                  border: '1px solid #667085', borderRadius: 999,
                  px: 2, py: 1, minWidth: 88, minHeight: 48, flexShrink: 0,
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.07)', borderColor: '#999', color: '#fff' },
                }}
              >
                Revert
              </Button>
            )}
          </Box>
        ))}
        </Box>
      </Box>
    </Backdrop>
  );
}
