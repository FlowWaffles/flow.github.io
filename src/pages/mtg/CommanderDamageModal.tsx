import { Box, Typography, Backdrop } from '@mui/material';
import DamageEditor from './DamageEditor';
import type { ModalState, Player } from './types';
import { CMD_LETHAL, getPlayerModalRotation } from './types';

interface CommanderDamageModalProps {
  modal: ModalState | null;
  players: Player[];
  landscapeSurface?: boolean;
  onClose: () => void;
  onValueChange: (v: number) => void;
}

export default function CommanderDamageModal({
  modal, players, landscapeSurface = false, onClose, onValueChange,
}: CommanderDamageModalProps) {
  const rotation = modal ? getPlayerModalRotation(modal.victim) : 0;
  const landscapeLayout = landscapeSurface || Math.abs(rotation) % 180 === 90;

  return (
    <Backdrop
      open={!!modal}
      onClick={onClose}
      sx={{
        position: 'absolute',
        inset: 0,
        zIndex: 200,
        backdropFilter: 'blur(4px)',
        bgcolor: 'rgba(0,0,0,0.7)',
      }}
    >
      {modal && (
        <Box
          onClick={e => e.stopPropagation()}
          sx={{
            bgcolor: '#1a1a1a',
            borderRadius: 2,
            p: landscapeLayout ? 2.25 : 3,
            minWidth: landscapeLayout ? 300 : 280,
            width: landscapeLayout ? 'min(82%, 460px)' : 'min(88vw, 340px)',
            maxHeight: landscapeLayout ? 'min(82%, 280px)' : 'calc(100dvh - 32px)',
            border: `1px solid ${players[modal.attacker].accentColor}55`,
            boxShadow: `0 0 30px ${players[modal.attacker].accentColor}33`,
            transform: `rotate(${rotation}deg)`,
            transformOrigin: 'center',
            overflowY: 'auto',
          }}
        >
          <Typography variant="h6" sx={{ textAlign: 'center', mb: 0.5, fontWeight: 700, color: '#ddd' }}>
            Commander Damage
          </Typography>
          <Typography sx={{ textAlign: 'center', mb: 2, fontSize: '0.82rem', color: '#666' }}>
            <Box component="span" sx={{ color: players[modal.attacker].accentColor, fontWeight: 600 }}>
              {players[modal.attacker].name}
            </Box>
            {' → '}
            <Box component="span" sx={{ color: players[modal.victim].accentColor, fontWeight: 600 }}>
              {players[modal.victim].name}
            </Box>
          </Typography>

          <DamageEditor value={modal.value} onChange={onValueChange} />

          {modal.value >= CMD_LETHAL && (
            <Typography sx={{
              textAlign: 'center', mt: 1, fontSize: '0.78rem',
              color: '#f44336', fontWeight: 600,
            }}>
              ☠ Lethal commander damage
            </Typography>
          )}

          <Typography sx={{ textAlign: 'center', mt: 2, fontSize: '0.72rem', color: '#555' }}>
            Tap outside to apply & close
          </Typography>
        </Box>
      )}
    </Backdrop>
  );
}
