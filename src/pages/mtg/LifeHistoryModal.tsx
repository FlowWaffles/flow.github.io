import { useState, useEffect } from 'react';
import { Box, Typography, Button, IconButton } from '@mui/material';
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

interface LifeHistoryModalProps {
  open: boolean;
  history: LifeHistoryEntry[];
  accent: string;
  onClose: () => void;
  onRevert: () => void;
}

export default function LifeHistoryModal({ open, history, accent, onClose, onRevert }: LifeHistoryModalProps) {
  const [openTime, setOpenTime] = useState(Date.now());

  useEffect(() => {
    if (open) setOpenTime(Date.now());
  }, [open]);

  if (!open) return null;

  return (
    <Box
      sx={{
        position: 'absolute', inset: 0, zIndex: 80,
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
          p: 2,
          width: 'min(90%, 300px)',
          maxHeight: '76%',
          overflowY: 'auto',
          cursor: 'default',
          boxShadow: `0 0 28px ${accent}28`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
          <Typography sx={{
            fontWeight: 700, color: '#777',
            fontFamily: "'Orbitron-Regular', monospace",
            fontSize: '0.55rem', letterSpacing: '0.06em', textTransform: 'uppercase',
          }}>
            Life History
          </Typography>
          <IconButton
            size="small"
            onClick={onClose}
            sx={{ color: '#555', p: 0.25, '&:hover': { color: '#999' } }}
          >
            <CloseIcon sx={{ fontSize: '0.9rem' }} />
          </IconButton>
        </Box>

        {history.length === 0 && (
          <Typography sx={{ textAlign: 'center', color: '#555', fontSize: '0.8rem', py: 2 }}>
            No changes yet
          </Typography>
        )}

        {history.map((entry, i) => (
          <Box key={entry.id} sx={{
            display: 'flex', alignItems: 'center',
            py: 0.75, px: 0.5,
            borderBottom: i < history.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
            gap: 1,
          }}>
            <Typography sx={{
              fontWeight: 700,
              fontSize: '1rem',
              color: entry.delta > 0 ? '#4caf50' : '#f44336',
              minWidth: '4ch',
              fontFamily: "'Monoton-Regular', monospace",
              textShadow: entry.delta > 0
                ? '0 0 8px rgba(76,175,80,0.5)'
                : '0 0 8px rgba(244,67,54,0.5)',
            }}>
              {entry.delta > 0 ? `+${entry.delta}` : entry.delta}
            </Typography>

            {/* Meta */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontSize: '0.7rem', color: '#999', fontStyle: 'italic' }}>
                {formatTimeAgo(entry.timestamp, openTime)}
              </Typography>
              {entry.source === 'commander' && (
                <Typography sx={{
                  fontSize: '0.66rem',
                  color: entry.attackerAccent ?? '#aaa',
                  mt: 0.1,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  Commander dmg by {entry.attackerCommander || entry.attackerName}
                </Typography>
              )}
            </Box>

            {i === 0 && (
              <Button
                size="small"
                onClick={onRevert}
                sx={{
                  fontSize: '0.62rem', color: '#888', textTransform: 'none',
                  border: '1px solid #2a2a2a', borderRadius: 999,
                  px: 0.9, py: 0.2, minWidth: 'auto', flexShrink: 0,
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.07)', borderColor: '#444', color: '#bbb' },
                }}
              >
                Revert
              </Button>
            )}
          </Box>
        ))}
      </Box>
    </Box>
  );
}

