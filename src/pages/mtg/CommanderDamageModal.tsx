import { Box, Typography, Backdrop } from '@mui/material';
import DamageEditor from './DamageEditor';
import type { ModalState, Player } from './types';
import { CMD_LETHAL, getPlayerModalRotation } from './types';

interface CommanderDamageModalProps {
  modal: ModalState | null;
  players: Player[];
  landscapeSurface?: boolean;
  onClose: () => void;
  onValueChange: (v: [number, number]) => void;
}

export default function CommanderDamageModal({
  modal, players, landscapeSurface = false, onClose, onValueChange,
}: CommanderDamageModalProps) {
  const rotation = modal ? getPlayerModalRotation(modal.victim) : 0;
  const landscapeLayout = landscapeSurface || Math.abs(rotation) % 180 === 90;

  const attacker = modal ? players[modal.attacker] : null;
  const hasPartner = Boolean(attacker?.partnerCommander);

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
      {modal && attacker && (
        <Box
          onClick={e => e.stopPropagation()}
          sx={{
            bgcolor: '#1a1a1a',
            borderRadius: 2,
            p: hasPartner ? 2 : (landscapeLayout ? 2.25 : 3),
            minWidth: landscapeLayout ? 300 : 280,
            width: landscapeLayout ? 'min(82%, 460px)' : 'min(88vw, 340px)',
            border: `1px solid ${attacker.accentColor}55`,
            boxShadow: `0 0 30px ${attacker.accentColor}33`,
            transform: `rotate(${rotation}deg)`,
            transformOrigin: 'center',
          }}
        >
          {(() => {
            const lethal1 = modal.value[0] >= CMD_LETHAL;
            const lethal2 = modal.value[1] >= CMD_LETHAL;
            const anyLethal = lethal1 || lethal2;
            const lethalLabel = hasPartner
              ? lethal1 && lethal2 ? 'Both commanders lethal'
                : lethal1 ? `${attacker.commander || 'Commander 1'} lethal`
                : `${attacker.partnerCommander || 'Commander 2'} lethal`
              : 'Lethal commander damage';

            return anyLethal ? (
              <Typography variant="h6" sx={{ textAlign: 'center', mb: 0.5, fontWeight: 700, color: '#f44336',
                transition: 'color 0.3s', fontSize: hasPartner ? '0.95rem' : undefined }}>
                {lethalLabel}
              </Typography>
            ) : (
              <Typography variant="h6" sx={{ textAlign: 'center', mb: 0.5, fontWeight: 700, color: '#ddd' }}>
                Commander Damage
              </Typography>
            );
          })()}
          <Typography sx={{ textAlign: 'center', mb: 2, fontSize: '0.82rem', color: '#666' }}>
            <Box component="span" sx={{ color: attacker.accentColor, fontWeight: 600 }}>
              {attacker.name}
            </Box>
            {' → '}
            <Box component="span" sx={{ color: players[modal.victim].accentColor, fontWeight: 600 }}>
              {players[modal.victim].name}
            </Box>
          </Typography>

          {hasPartner ? (
            <>
              <Typography sx={{ textAlign: 'center', fontSize: '0.74rem', color: '#888', mb: 0.25 }}>
                {attacker.commander || 'Commander 1'}
              </Typography>
              <DamageEditor
                compact
                value={modal.value[0]}
                onChange={v => onValueChange([v, modal.value[1]])}
              />

              <Box sx={{ borderTop: '1px solid #333', mt: 0.5, pt: 1 }}>
                <Typography sx={{ textAlign: 'center', fontSize: '0.74rem', color: '#888', mb: 0.25 }}>
                  {attacker.partnerCommander || 'Commander 2'}
                </Typography>
                <DamageEditor
                  compact
                  value={modal.value[1]}
                  onChange={v => onValueChange([modal.value[0], v])}
                />
              </Box>
            </>
          ) : (
            <>
              <DamageEditor
                value={modal.value[0]}
                onChange={v => onValueChange([v, 0])}
              />
            </>
          )}

          <Typography sx={{ textAlign: 'center', mt: 2, fontSize: '0.72rem', color: '#555' }}>
            Tap outside to apply & close
          </Typography>
        </Box>
      )}
    </Backdrop>
  );
}
