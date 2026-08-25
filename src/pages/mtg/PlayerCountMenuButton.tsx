import { IconButton, Tooltip } from '@mui/material';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';

type PlayerCountMenuButtonProps = {
  compact: boolean;
  playerCount: 2 | 3 | 4;
  onClick: () => void;
};

export default function PlayerCountMenuButton({ compact, playerCount, onClick }: PlayerCountMenuButtonProps) {
  return (
    <Tooltip title={`Players: ${playerCount}`}>
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
        <PeopleAltIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  );
}
