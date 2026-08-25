import { useState, useRef, useEffect } from 'react';
import { Box, Typography, TextField } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import HoldButton from './HoldButton';
import { CMD_LETHAL, HOLD_INCREMENT } from './types';

interface DamageEditorProps {
  value: number;
  compact?: boolean;
  onChange: (v: number) => void;
}

export default function DamageEditor({ value, compact = false, onChange }: DamageEditorProps) {
  const [editing, setEditing] = useState(false);
  const [inputVal, setInputVal] = useState(String(value));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (!editing) setInputVal(String(value)); }, [value, editing]);
  useEffect(() => {
    if (editing) { inputRef.current?.focus(); inputRef.current?.select(); }
  }, [editing]);

  const commit = () => {
    const parsed = parseInt(inputVal, 10);
    if (!isNaN(parsed)) onChange(Math.max(0, parsed));
    else setInputVal(String(value));
    setEditing(false);
  };

  const clamp = (v: number) => Math.max(0, v);

  const btnSx = {
    width: compact ? 44 : 60, height: compact ? 44 : 60, borderRadius: '50%',
    bgcolor: 'rgba(255,255,255,0.08)', color: '#fff',
    transition: 'background-color 0.15s',
    '&:hover': { bgcolor: 'rgba(255,255,255,0.15)' },
    '&:active': { bgcolor: 'rgba(255,255,255,0.22)' },
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: compact ? 2 : 3, py: compact ? 0.5 : 1 }}>
      <HoldButton
        onTap={() => onChange(clamp(value - 1))}
        onHold={() => onChange(clamp(value - HOLD_INCREMENT))}
        sx={btnSx}
      >
        <RemoveIcon sx={{ fontSize: compact ? '1.2rem' : '1.6rem' }} />
      </HoldButton>

      <Box sx={{ minWidth: compact ? 60 : 90, textAlign: 'center' }}>
        {editing ? (
          <TextField
            inputRef={inputRef}
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            onBlur={commit}
            onKeyDown={e => { if (e.key === 'Enter') commit(); }}
            type="number"
            variant="standard"
            inputProps={{
              style: {
                textAlign: 'center', fontSize: compact ? '2rem' : '3rem', fontWeight: 700,
                color: '#fff', width: '3ch',
              },
            }}
            sx={{ '& .MuiInput-underline:before': { borderColor: '#555' } }}
          />
        ) : (
          <Typography
            onClick={() => { setInputVal(String(value)); setEditing(true); }}
            sx={{
              fontSize: compact ? '2.4rem' : '3.5rem', fontWeight: 700,
              color: value >= CMD_LETHAL ? '#f44336' : '#fff',
              cursor: 'pointer', userSelect: 'none',
              transition: 'color 0.3s', lineHeight: 1,
            }}
          >
            {value}
          </Typography>
        )}
      </Box>

      <HoldButton
        onTap={() => onChange(value + 1)}
        onHold={() => onChange(value + HOLD_INCREMENT)}
        sx={btnSx}
      >
        <AddIcon sx={{ fontSize: compact ? '1.2rem' : '1.6rem' }} />
      </HoldButton>
    </Box>
  );
}
