import { useEffect, useRef, useState } from 'react';
import { Autocomplete, Box, IconButton, TextField } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import type { CommanderEntry } from './types';

interface CommanderChipInputProps {
  /** Up to 2 commander names (index 0 = primary, index 1 = partner). */
  values: string[];
  commanders: CommanderEntry[];
  onChange: (names: string[], artUrls: string[]) => void;
  accent?: string;
  popperZIndex?: number;
  onTypingChange?: (typing: boolean) => void;
}

export default function CommanderChipInput({
  values,
  commanders,
  onChange,
  accent = '#9aa6ca',
  popperZIndex = 2200,
  onTypingChange,
}: CommanderChipInputProps) {
  const [adding, setAdding] = useState(false);
  const [addInput, setAddInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (adding) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [adding]);

  const lookupArt = (name: string) =>
    commanders.find(c => c.name.toLowerCase() === name.toLowerCase())?.artCrop ?? '';

  const remove = (index: number) => {
    const next = values.filter((_, i) => i !== index);
    onChange(next, next.map(lookupArt));
  };

  const commit = (input: string) => {
    const name = input.trim();
    if (name) {
      const next = [...values.filter(v => v !== name), name].slice(0, 2);
      onChange(next, next.map(lookupArt));
    }
    setAdding(false);
    setAddInput('');
    onTypingChange?.(false);
  };

  const startAdding = () => {
    setAdding(true);
    onTypingChange?.(true);
  };

  const canAdd = values.length < 2;

  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 0.5,
        alignItems: 'center',
        border: '1px solid #444',
        borderRadius: 1,
        px: 1,
        py: 0.625,
        minHeight: 40,
        cursor: !adding && values.length === 0 ? 'text' : 'default',
        transition: 'border-color 0.15s',
        '&:focus-within': { borderColor: accent },
        '&:hover': { borderColor: values.length === 0 && !adding ? '#666' : undefined },
      }}
      onClick={() => { if (!adding && values.length === 0) startAdding(); }}
    >
      {values.map((name, i) => (
        <Box
          key={i}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.25,
            bgcolor: '#2c2c2c',
            border: '1px solid #444',
            borderRadius: 10,
            px: 1,
            py: 0.25,
            fontSize: '0.78rem',
            color: '#ddd',
            lineHeight: 1.4,
          }}
        >
          {name}
          <IconButton
            size="small"
            onClick={e => { e.stopPropagation(); remove(i); }}
            sx={{ p: 0.15, ml: 0.25, color: '#666', '&:hover': { color: '#ccc' } }}
          >
            <CloseIcon sx={{ fontSize: 12 }} />
          </IconButton>
        </Box>
      ))}

      {adding ? (
        <Autocomplete
          freeSolo
          options={commanders}
          inputValue={addInput}
          getOptionLabel={opt => (typeof opt === 'string' ? opt : opt.name)}
          filterOptions={(options, state) => {
            const input = state.inputValue.toLowerCase().trim();
            if (!input) return [];
            const matches: CommanderEntry[] = [];
            for (const option of options) {
              if (option.name.toLowerCase().includes(input)) {
                matches.push(option);
                if (matches.length >= 8) break;
              }
            }
            return matches;
          }}
          onInputChange={(_, v) => setAddInput(v)}
          onChange={(_, newValue) => {
            if (typeof newValue === 'string') commit(newValue);
            else if (newValue) commit(newValue.name);
          }}
          openOnFocus
          noOptionsText={addInput.trim() ? 'No commanders found' : 'Type to search'}
          slotProps={{
            popper: { sx: { zIndex: popperZIndex } },
            paper: { sx: { bgcolor: '#222', color: '#eee' } },
          }}
          sx={{ flex: 1, minWidth: 110 }}
          renderInput={(params) => (
            <TextField
              {...params}
              inputRef={inputRef}
              size="small"
              placeholder={values.length === 0 ? 'Commander…' : 'Partner…'}
              variant="standard"
              onBlur={() => commit(addInput)}
              inputProps={{ ...params.inputProps, style: { color: '#eee', fontSize: '0.85rem' } }}
              sx={{
                '& .MuiInput-root::before': { display: 'none' },
                '& .MuiInput-root::after': { display: 'none' },
                '& input': { color: '#eee', pb: 0 },
                '& .MuiAutocomplete-endAdornment': { display: 'none' },
              }}
            />
          )}
        />
      ) : (
        canAdd && (
          <IconButton
            size="small"
            onClick={e => { e.stopPropagation(); startAdding(); }}
            sx={{ p: 0.25, color: '#555', '&:hover': { color: '#aaa' } }}
          >
            <AddIcon sx={{ fontSize: 16 }} />
          </IconButton>
        )
      )}

      {values.length === 0 && !adding && (
        <Box sx={{ color: '#555', fontSize: '0.82rem', flex: 1, userSelect: 'none' }}>
          Add commander…
        </Box>
      )}
    </Box>
  );
}
