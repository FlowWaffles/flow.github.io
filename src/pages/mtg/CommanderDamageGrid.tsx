import { Box, Typography } from '@mui/material';
import type { Player } from './types';
import { CMD_LETHAL } from './types';

interface CommanderDamageGridProps {
  pid: number;
  player: Player;
  allPlayers: Player[];
  accent: string;
  rotation: 0 | 180;
  compact?: boolean;
  onDamageClick: (attacker: number) => void;
  onSelfClick: () => void;
}

export default function CommanderDamageGrid({
  pid, player, allPlayers, accent, rotation, compact = false, onDamageClick, onSelfClick,
}: CommanderDamageGridProps) {
  const seatOrder = rotation === 180 ? [0, 1, 3, 2] : [2, 3, 1, 0];
  const cells: Array<{ kind: 'opp'; id: number } | { kind: 'me' }> = seatOrder.map(id => (
    id === pid ? { kind: 'me' } : { kind: 'opp', id }
  ));

  return (
    <Box sx={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      borderTop: `1px solid ${accent}33`,
      flexShrink: 0,
      bgcolor: 'rgba(6, 10, 18, 0.2)',
    }}>
      {cells.map((cell, idx) => {
        const isRight = idx % 2 === 1;
        const isBottom = idx >= 2;
        const borderSx = {
          borderLeft: isRight ? `1px solid ${accent}22` : undefined,
          borderTop: isBottom ? `1px solid ${accent}22` : undefined,
        };

        if (cell.kind === 'me') {
          return (
            <Box
              key={idx}
              onClick={onSelfClick}
              sx={{
                ...borderSx,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: compact ? { xs: 28, sm: 32 } : { xs: 32, sm: 38 },
                px: compact ? 0.35 : 0.5,
                bgcolor: 'rgba(255,255,255,0.03)',
                cursor: 'pointer',
                transition: 'background-color 0.15s',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.06)' },
                '&:active': { bgcolor: 'rgba(255,255,255,0.14)' },
              }}
            >
              <Typography
                sx={{
                  fontSize: compact ? '0.74rem' : '0.82rem',
                  color: player.accentColor,
                  fontWeight: 700,
                  lineHeight: 1,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}
              >
                You
              </Typography>
            </Box>
          );
        }

        const aid = cell.id;
        const [dmg1, dmg2] = player.cmdDmg[aid];
        const attacker = allPlayers[aid];
        const hasPartner = Boolean(attacker.partnerCommander);
        const lethal1 = dmg1 >= CMD_LETHAL;
        const lethal2 = dmg2 >= CMD_LETHAL;
        const anyLethal = lethal1 || lethal2;

        return (
          <Box
            key={idx}
            onClick={() => onDamageClick(aid)}
            sx={{
              ...borderSx,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              minHeight: compact ? { xs: 28, sm: 32 } : { xs: 32, sm: 38 },
              cursor: 'pointer',
              gap: compact ? 0.1 : 0.15,
              px: compact ? 0.35 : 0.5,
              bgcolor: anyLethal ? 'rgba(244,67,54,0.12)' : 'transparent',
              transition: 'background-color 0.15s',
              '&:hover': { bgcolor: anyLethal ? 'rgba(244,67,54,0.22)' : 'rgba(255,255,255,0.06)' },
              '&:active': { bgcolor: 'rgba(255,255,255,0.14)' },
            }}
          >
            {hasPartner ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: compact ? 0.3 : 0.4 }}>
                <Typography sx={{
                  fontSize: compact ? { xs: '0.9rem', sm: '1rem' } : { xs: '1rem', sm: '1.15rem' },
                  fontWeight: 700,
                  lineHeight: 1,
                  color: lethal1 ? '#f44336' : attacker.accentColor,
                  transition: 'color 0.3s',
                }}>
                  {dmg1}
                </Typography>
                <Typography sx={{
                  fontSize: compact ? '0.6rem' : '0.68rem',
                  color: 'rgb(255 255 255)',
                  lineHeight: 1,
                  fontWeight: 400,
                }}>
                  |
                </Typography>
                <Typography sx={{
                  fontSize: compact ? { xs: '0.9rem', sm: '1rem' } : { xs: '1rem', sm: '1.15rem' },
                  fontWeight: 700,
                  lineHeight: 1,
                  color: lethal2 ? '#f44336' : attacker.accentColor,
                  transition: 'color 0.3s',
                }}>
                  {dmg2}
                </Typography>
              </Box>
            ) : (
              <Typography sx={{
                fontSize: compact ? { xs: '1rem', sm: '1.08rem' } : { xs: '1.12rem', sm: '1.3rem' },
                fontWeight: 700,
                lineHeight: 1,
                color: lethal1 ? '#f44336' : attacker.accentColor,
                transition: 'color 0.3s',
              }}>
                {dmg1}
              </Typography>
            )}
          </Box>
        );
      })}
    </Box>
  );
}
