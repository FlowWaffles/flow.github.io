import { Backdrop, Box, Button, Typography } from '@mui/material';
import { getPlayerModalRotation } from './types';

interface ResetDialogProps {
  open: boolean;
  landscapeSurface?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ResetDialog({ open, landscapeSurface = false, onClose, onConfirm }: ResetDialogProps) {
  const modalRotation = getPlayerModalRotation(0);

  return (
    <Backdrop
      open={open}
      onClick={onClose}
      sx={{
        position: 'absolute',
        inset: 0,
        zIndex: 220,
        backdropFilter: 'blur(4px)',
        bgcolor: 'rgba(0,0,0,0.7)',
      }}
    >
      <Box
        onClick={e => e.stopPropagation()}
        sx={{
          bgcolor: '#1e1e1e',
          color: '#eee',
          border: '1px solid #333',
          borderRadius: 2,
          boxShadow: '0 0 32px rgba(0,0,0,0.35)',
          width: landscapeSurface ? 'min(78%, 420px)' : 'min(92vw, 420px)',
          maxWidth: 'calc(100% - 24px)',
          px: 3,
          py: 2.5,
          transform: `rotate(${modalRotation}deg)`,
          transformOrigin: 'center',
        }}
      >
        <Typography>
          Reset the whole game?
        </Typography>
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button onClick={onClose} sx={{ color: '#aaa' }}>Cancel</Button>
          <Button onClick={onConfirm} variant="contained" color="error">Reset</Button>
        </Box>
      </Box>
    </Backdrop>
  );
}
