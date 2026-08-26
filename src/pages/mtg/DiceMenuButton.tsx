import { IconButton, Tooltip } from '@mui/material';
import Icon from '@mdi/react';
import { mdiDiceMultiple } from '@mdi/js';

type DiceMenuButtonProps = {
  compact: boolean;
  onClick: () => void;
};

export default function DiceMenuButton({ compact, onClick }: DiceMenuButtonProps) {
  return (
    <Tooltip title="Dice & Coin">
      <IconButton
        size="small"
        onClick={onClick}
        sx={{
          color: '#d7deef',
          border: '1px solid rgba(148, 163, 184, 0.28)',
          borderRadius: 999,
          width: compact ? 32 : 36,
          height: compact ? 32 : 36,
          bgcolor: 'rgba(255,255,255,0.02)',
          '&:hover': {
            borderColor: 'rgba(191, 219, 254, 0.55)',
            bgcolor: 'rgba(255,255,255,0.07)',
          },
        }}
      >
        <Icon path={mdiDiceMultiple} size={0.8} />
      </IconButton>
    </Tooltip>
  );
}
