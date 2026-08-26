import SwapVertIcon from '@mui/icons-material/SwapVert';
import { Backdrop, Box, Button, Typography } from '@mui/material';

type PlayerLayoutModalProps = {
  open: boolean;
  playerCount: 2 | 3 | 4;
  threeLayout: 'A' | 'B';
  rotation: number;
  onClose: () => void;
  onSelectTwoPlayers: () => void;
  onSelectThreePlayersLayoutA: () => void;
  onSelectThreePlayersLayoutB: () => void;
  onSelectFourPlayers: () => void;
  onSwapThreePlayerSides: () => void;
};

export default function PlayerLayoutModal({
  open,
  playerCount,
  threeLayout,
  rotation,
  onClose,
  onSelectTwoPlayers,
  onSelectThreePlayersLayoutA,
  onSelectThreePlayersLayoutB,
  onSelectFourPlayers,
  onSwapThreePlayerSides,
}: PlayerLayoutModalProps) {
  return (
    <Backdrop
      open={open}
      onClick={onClose}
      sx={{ position: 'fixed', inset: 0, zIndex: 240, backdropFilter: 'blur(4px)', bgcolor: 'rgba(0,0,0,0.7)' }}
    >
      <Box
        onClick={e => e.stopPropagation()}
        sx={{
          bgcolor: '#1e1e1e',
          color: '#eee',
          border: '1px solid #333',
          borderRadius: 2,
          boxShadow: '0 0 32px rgba(0,0,0,0.35)',
          p: 2.5,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          transform: `rotate(${rotation}deg)`,
          transformOrigin: 'center',
        }}
      >
        <Typography sx={{ fontWeight: 600, textAlign: 'center' }}>Select Player Layout</Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', flexWrap: 'wrap', justifyContent: 'center' }}>

          <Box
            onClick={onSelectTwoPlayers}
            sx={{
              cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1,
              opacity: playerCount === 2 ? 1 : 0.55,
              '&:hover': { opacity: 1 },
            }}
          >
            <Box sx={{
              width: 80, height: 70, border: `2px solid ${playerCount === 2 ? '#60a5fa' : '#444'}`,
              borderRadius: 1.5, overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '3px', p: '4px', boxSizing: 'border-box',
              bgcolor: playerCount === 2 ? 'rgba(96,165,250,0.08)' : 'transparent',
            }}>
              <Box sx={{ flex: 1, bgcolor: '#334155', borderRadius: 1 }} />
              <Box sx={{ flex: 1, bgcolor: '#334155', borderRadius: 1 }} />
            </Box>
            <Typography variant="caption">2 Players</Typography>
          </Box>

          <Box
            onClick={onSelectThreePlayersLayoutA}
            sx={{
              cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1,
              opacity: playerCount === 3 && threeLayout === 'A' ? 1 : 0.55,
              '&:hover': { opacity: 1 },
            }}
          >
            <Box sx={{
              width: 80, height: 70, border: `2px solid ${playerCount === 3 && threeLayout === 'A' ? '#60a5fa' : '#444'}`,
              borderRadius: 1.5, overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '3px', p: '4px', boxSizing: 'border-box',
              bgcolor: playerCount === 3 && threeLayout === 'A' ? 'rgba(96,165,250,0.08)' : 'transparent',
            }}>
              <Box sx={{ flex: 1, display: 'flex', gap: '3px' }}>
                <Box sx={{ flex: 1, bgcolor: '#334155', borderRadius: 1 }} />
                <Box sx={{ flex: 1, borderRadius: 1 }} />
              </Box>
              <Box sx={{ flex: 1, display: 'flex', gap: '3px' }}>
                <Box sx={{ flex: 1, bgcolor: '#334155', borderRadius: 1 }} />
                <Box sx={{ flex: 1, bgcolor: '#334155', borderRadius: 1 }} />
              </Box>
            </Box>
            <Typography variant="caption">3 Players (A)</Typography>
          </Box>

          <Box
            onClick={onSelectThreePlayersLayoutB}
            sx={{
              cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1,
              opacity: playerCount === 3 && threeLayout === 'B' ? 1 : 0.55,
              '&:hover': { opacity: 1 },
            }}
          >
            <Box sx={{
              width: 80, height: 70, border: `2px solid ${playerCount === 3 && threeLayout === 'B' ? '#60a5fa' : '#444'}`,
              borderRadius: 1.5, overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '3px', p: '4px', boxSizing: 'border-box',
              bgcolor: playerCount === 3 && threeLayout === 'B' ? 'rgba(96,165,250,0.08)' : 'transparent',
            }}>
              <Box sx={{ flex: 1, display: 'flex', gap: '3px' }}>
                <Box sx={{ flex: 1, bgcolor: '#334155', borderRadius: 1 }} />
                <Box sx={{ flex: 1, bgcolor: '#334155', borderRadius: 1 }} />
              </Box>
              <Box sx={{ flex: 1, display: 'flex', gap: '3px' }}>
                <Box sx={{ flex: 1, bgcolor: '#334155', borderRadius: 1 }} />
                <Box sx={{ flex: 1, borderRadius: 1 }} />
              </Box>
            </Box>
            <Typography variant="caption">3 Players (B)</Typography>
          </Box>

          <Box
            onClick={onSelectFourPlayers}
            sx={{
              cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1,
              opacity: playerCount === 4 ? 1 : 0.55,
              '&:hover': { opacity: 1 },
            }}
          >
            <Box sx={{
              width: 80, height: 70, border: `2px solid ${playerCount === 4 ? '#60a5fa' : '#444'}`,
              borderRadius: 1.5, overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '3px', p: '4px', boxSizing: 'border-box',
              bgcolor: playerCount === 4 ? 'rgba(96,165,250,0.08)' : 'transparent',
            }}>
              <Box sx={{ flex: 1, display: 'flex', gap: '3px' }}>
                <Box sx={{ flex: 1, bgcolor: '#334155', borderRadius: 1 }} />
                <Box sx={{ flex: 1, bgcolor: '#334155', borderRadius: 1 }} />
              </Box>
              <Box sx={{ flex: 1, display: 'flex', gap: '3px' }}>
                <Box sx={{ flex: 1, bgcolor: '#334155', borderRadius: 1 }} />
                <Box sx={{ flex: 1, bgcolor: '#334155', borderRadius: 1 }} />
              </Box>
            </Box>
            <Typography variant="caption">4 Players</Typography>
          </Box>

        </Box>

        {playerCount === 3 && (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<SwapVertIcon />}
              onClick={onSwapThreePlayerSides}
              sx={{ color: '#d7deef', borderColor: 'rgba(148, 163, 184, 0.28)', textTransform: 'none', borderRadius: 999 }}
            >
              Swap Sides
            </Button>
          </Box>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={onClose} sx={{ color: '#aaa' }}>Close</Button>
        </Box>
      </Box>
    </Backdrop>
  );
}
