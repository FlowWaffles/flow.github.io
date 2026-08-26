import { useState, useEffect } from 'react';
import {
  Autocomplete, Box, Button, MenuItem, Select, TextField, Typography, Backdrop,
} from '@mui/material';
import type { Player, CommanderEntry } from './types';
import { useKnownPlayers } from './useKnownPlayers';
import { ACCENT_OPTIONS } from './types';

interface PlayerSettingsModalProps {
  open: boolean;
  player: Player;
  onClose: () => void;
  onUpdate: (update: Partial<Player>) => void;
  commanders?: CommanderEntry[];
  commandersLoading?: boolean;
}

export default function PlayerSettingsModal({
  open, player, onClose, onUpdate, commanders = [], commandersLoading = false,
}: PlayerSettingsModalProps) {
  const { knownPlayers, saveCombo } = useKnownPlayers();
  const [name, setName] = useState('');
  const [selectedComboIdx, setSelectedComboIdx] = useState<number>(-1);
  const [showManualCommanderInputs, setShowManualCommanderInputs] = useState(false);

  useEffect(() => {
    if (open) {
      setName('');
      setSelectedComboIdx(-1);
      setShowManualCommanderInputs(false);
    }
  }, [open, player.name]);

  const commitName = () => {
    const trimmed = name.trim() || player.name;
    setName(trimmed);
    onUpdate({ name: trimmed });
  };

  const accent = player.accentColor;
  const knownPlayer = knownPlayers.find(p => p.name.toLowerCase() === player.name.trim().toLowerCase());
  const knownCombos = knownPlayer?.combos ?? [];
  // No rotation - always portrait mode for better keyboard support (like QuickSetupDialog)
  const showCommanderBox = commandersLoading || commanders.length > 0;
  const sectionLabelSx = {
    fontSize: '0.72rem',
    color: '#666',
    mb: 0.5,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  };
  const colorSwatchSize = 28;

  const lookupArt = (commanderName: string) => (
    commanders.find(c => c.name.toLowerCase() === commanderName.toLowerCase())?.artCrop ?? ''
  );

  const applyCommanderPair = (primary: string, partner: string) => {
    const nextCommander = primary.trim();
    const nextPartner = partner.trim();
    onUpdate({
      commander: nextCommander,
      commanderArtUrl: nextCommander ? lookupArt(nextCommander) : '',
      partnerCommander: nextPartner,
      partnerCommanderArtUrl: nextPartner ? lookupArt(nextPartner) : '',
    });
  };

  const handleNameChange = (nextName: string) => {
    setName(nextName);
    const trimmed = nextName.trim() || player.name;
    onUpdate({ name: trimmed });
    setSelectedComboIdx(-1);
    setShowManualCommanderInputs(false);
  };

  const comboMatchIndex = (needle: string[]) => knownCombos.findIndex((combo) => (
    combo.length === needle.length
    && combo.every((namePart, i) => namePart.toLowerCase() === needle[i].toLowerCase())
  ));

  const saveCurrentCombo = () => {
    if (!knownPlayer) return;
    const combo = [player.commander.trim(), player.partnerCommander.trim()].filter(Boolean);
    if (!combo.length || !player.commander.trim()) return;
    const existingIdx = comboMatchIndex(combo);
    saveCombo(player.name, combo);
    setSelectedComboIdx(existingIdx >= 0 ? existingIdx : knownCombos.length);
    setShowManualCommanderInputs(false);
  };

  return (
    <Backdrop
      open={open}
      onClick={onClose}
      sx={{
        position: 'absolute',
        inset: 0,
        zIndex: 210,
        backdropFilter: 'blur(4px)',
        bgcolor: 'rgba(0,0,0,0.7)',
      }}
    >
      <Box
        onClick={e => e.stopPropagation()}
        sx={{
          bgcolor: '#1a1a1a',
          color: '#eee',
          border: `1px solid ${accent}55`,
          boxShadow: `0 0 40px ${accent}22`,
          borderRadius: 2,
          width: 'min(92vw, 420px)',
          maxHeight: 'calc(100dvh - 32px)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ px: 3, pt: 2.25, pb: 1.25, color: accent, fontWeight: 700, fontSize: '1rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          Player Settings
        </Box>

        <Box
          sx={{
            px: 3,
            pb: 2,
            flex: 1,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 2.5,
            overflowY: 'auto',
            overflowX: 'hidden',
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': { display: 'none' },
          }}
        >
        <Box sx={{ minWidth: 0 }}>
          <Box>
            <Typography sx={sectionLabelSx}>
              Name
            </Typography>
            <Autocomplete
              freeSolo
              options={knownPlayers.map(p => p.name)}
              inputValue={name}
              onInputChange={(_, v) => setName(v)}
              onChange={(_, v) => {
                if (typeof v === 'string') handleNameChange(v);
              }}
              onBlur={commitName}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder={player.name}
                  onBlur={commitName}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      commitName();
                    }
                  }}
                  size="small"
                  fullWidth
                  variant="outlined"
                  inputProps={{ ...params.inputProps, style: { color: '#eee' } }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: '#444' },
                      '&:hover fieldset': { borderColor: `${accent}88` },
                      '&.Mui-focused fieldset': { borderColor: accent },
                    },
                    '& .MuiAutocomplete-endAdornment svg': { color: '#666' },
                  }}
                />
              )}
              slotProps={{
                paper: { sx: { bgcolor: '#222', color: '#eee' } },
              }}
            />
          </Box>
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <Box>
            <Typography sx={{ ...sectionLabelSx, mb: 1 }}>
              Color
            </Typography>
            <Box sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1,
              alignItems: 'center',
            }}>
              {ACCENT_OPTIONS.map(color => (
                <Box
                  key={color}
                  onClick={() => onUpdate({ accentColor: color })}
                  sx={{
                    width: colorSwatchSize,
                    height: colorSwatchSize,
                    minWidth: colorSwatchSize,
                    borderRadius: '50%',
                    bgcolor: color,
                    cursor: 'pointer',
                    outline: player.accentColor === color ? `3px solid ${color}` : '3px solid transparent',
                    outlineOffset: '2px',
                    transition: 'transform 0.12s, outline 0.12s',
                    '&:hover': { transform: 'scale(1.2)' },
                  }}
                />
              ))}
            </Box>
          </Box>
        </Box>

        {showCommanderBox && (
          <Box sx={{ minWidth: 0 }}>
            <Box>
              <Typography sx={sectionLabelSx}>
                Commander
              </Typography>
              {commandersLoading ? (
                <Typography sx={{ color: '#888', fontSize: '0.86rem', py: 1.2 }}>
                  Loading commanders...
                </Typography>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {knownCombos.length > 0 && !showManualCommanderInputs && (
                    <>
                      <Select
                        size="small"
                        value={selectedComboIdx}
                        onChange={(e) => {
                          const idx = e.target.value as number;
                          setSelectedComboIdx(idx);
                          const combo = knownCombos[idx] ?? [];
                          applyCommanderPair(combo[0] ?? '', combo[1] ?? '');
                        }}
                        displayEmpty
                        sx={{
                          color: selectedComboIdx === -1 ? '#666' : '#ccc',
                          '& .MuiOutlinedInput-notchedOutline': { borderColor: '#444' },
                          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: `${accent}88` },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: accent },
                          '& .MuiSvgIcon-root': { color: '#555' },
                        }}
                        MenuProps={{ sx: { '& .MuiPaper-root': { bgcolor: '#222', color: '#eee' } } }}
                      >
                        <MenuItem value={-1} sx={{ color: '#666', fontSize: '0.85rem' }}>
                          Select commander
                        </MenuItem>
                        {knownCombos.map((combo, i) => (
                          <MenuItem key={i} value={i} sx={{ fontSize: '0.85rem' }}>
                            {combo.join(' / ')}
                          </MenuItem>
                        ))}
                      </Select>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => {
                            setSelectedComboIdx(-1);
                            setShowManualCommanderInputs(true);
                            applyCommanderPair('', '');
                          }}
                          sx={{ textTransform: 'none' }}
                        >
                          Add new commander
                        </Button>
                      </Box>
                    </>
                  )}

                  {(knownCombos.length === 0 || showManualCommanderInputs) && (
                    <>
                      {knownCombos.length > 0 && (
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <Button
                            size="small"
                            onClick={() => {
                              setShowManualCommanderInputs(false);
                            }}
                            sx={{ textTransform: 'none', color: '#999' }}
                          >
                            Cancel
                          </Button>
                        </Box>
                      )}
                      <Autocomplete
                        freeSolo
                        options={commanders}
                        inputValue={player.commander}
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
                        onInputChange={(_, value) => {
                          setSelectedComboIdx(-1);
                          applyCommanderPair(value, player.partnerCommander);
                        }}
                        onChange={(_, value) => {
                          if (typeof value === 'string') applyCommanderPair(value, player.partnerCommander);
                          else if (value) applyCommanderPair(value.name, player.partnerCommander);
                        }}
                        slotProps={{
                          paper: { sx: { bgcolor: '#222', color: '#eee' } },
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            size="small"
                            placeholder="Commander…"
                            inputProps={{ ...params.inputProps, style: { color: '#eee' } }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                '& fieldset': { borderColor: '#444' },
                                '&:hover fieldset': { borderColor: `${accent}88` },
                                '&.Mui-focused fieldset': { borderColor: accent },
                              },
                              '& .MuiAutocomplete-endAdornment svg': { color: '#555' },
                            }}
                          />
                        )}
                      />
                      <Autocomplete
                        freeSolo
                        options={commanders}
                        inputValue={player.partnerCommander}
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
                        onInputChange={(_, value) => {
                          setSelectedComboIdx(-1);
                          applyCommanderPair(player.commander, value);
                        }}
                        onChange={(_, value) => {
                          if (typeof value === 'string') applyCommanderPair(player.commander, value);
                          else if (value) applyCommanderPair(player.commander, value.name);
                        }}
                        slotProps={{
                          paper: { sx: { bgcolor: '#222', color: '#eee' } },
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            size="small"
                            placeholder="Partner commander (optional)…"
                            inputProps={{ ...params.inputProps, style: { color: '#eee' } }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                '& fieldset': { borderColor: '#444' },
                                '&:hover fieldset': { borderColor: `${accent}88` },
                                '&.Mui-focused fieldset': { borderColor: accent },
                              },
                              '& .MuiAutocomplete-endAdornment svg': { color: '#555' },
                            }}
                          />
                        )}
                      />
                      {knownPlayer && (
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                          <Button
                            size="small"
                            variant="contained"
                            onClick={saveCurrentCombo}
                            disabled={!player.commander.trim()}
                            sx={{ textTransform: 'none' }}
                          >
                            Save commander
                          </Button>
                        </Box>
                      )}
                    </>
                  )}
                </Box>
              )}
            </Box>
          </Box>
        )}

        </Box>

        <Box sx={{ px: 2, pb: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button onClick={onClose} sx={{ color: '#888', textTransform: 'none' }}>
          Close
        </Button>
        </Box>
      </Box>
    </Backdrop>
  );
}
