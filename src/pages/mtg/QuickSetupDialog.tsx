import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Autocomplete, Backdrop, Box, Button, Divider, IconButton,
  MenuItem, Select, TextField, Typography, useMediaQuery,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import type { CommanderEntry, Player } from './types';
import { useKnownPlayers, type KnownPlayerData } from './useKnownPlayers';

type QuickSetupEntry = {
  name: string;
  commander: string;
  partnerCommander: string;
};

type StartingLife = 20 | 40;

interface QuickSetupDialogProps {
  open: boolean;
  players: Player[];
  initialStartingLife: StartingLife;
  playerCount: 2 | 3 | 4;
  threeLayout: 'A' | 'B';
  commanders: CommanderEntry[];
  visiblePlayerIds: number[];
  onClose: () => void;
  onOpenPlayerLayout?: () => void;
  onTypingChange?: (typing: boolean) => void;
  onClearStoredData?: () => void;
  onApply: (entries: QuickSetupEntry[], startingLife: StartingLife) => void;
}

// ---------------------------------------------------------------------------
// Commander autocomplete field
// ---------------------------------------------------------------------------

interface CmdAutocompleteProps {
  value: string;
  commanders: CommanderEntry[];
  placeholder: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  onTypingChange?: (v: boolean) => void;
}

function CmdAutocomplete({ value, commanders, placeholder, onChange, onBlur, onTypingChange }: CmdAutocompleteProps) {
  return (
    <Autocomplete
      freeSolo
      options={commanders}
      inputValue={value}
      getOptionLabel={opt => (typeof opt === 'string' ? opt : opt.name)}
      filterOptions={(options, state) => {
        const input = state.inputValue.toLowerCase().trim();
        if (!input) return [];
        const out: CommanderEntry[] = [];
        for (const o of options) {
          if (o.name.toLowerCase().includes(input)) { out.push(o); if (out.length >= 8) break; }
        }
        return out;
      }}
      onInputChange={(_, v) => onChange(v)}
      onChange={(_, v) => { if (typeof v === 'string') onChange(v); else if (v) onChange(v.name); }}
      noOptionsText={value.trim() ? 'No commanders found' : 'Type to search'}
      slotProps={{
        popper: { sx: { zIndex: 2400 } },
        paper: { sx: { bgcolor: '#222', color: '#eee' } },
      }}
      sx={{ flex: 1 }}
      renderInput={(params) => (
        <TextField
          {...params}
          size="small"
          placeholder={placeholder}
          onFocus={() => onTypingChange?.(true)}
          onBlur={() => { onBlur?.(); onTypingChange?.(false); }}
          inputProps={{ ...params.inputProps, style: { color: '#eee' } }}
          sx={{
            '& .MuiOutlinedInput-root': {
              '& fieldset': { borderColor: '#444' },
              '&:hover fieldset': { borderColor: '#6c7490' },
              '&.Mui-focused fieldset': { borderColor: '#9aa6ca' },
            },
            '& .MuiAutocomplete-endAdornment svg': { color: '#555' },
          }}
        />
      )}
    />
  );
}

// ---------------------------------------------------------------------------
// Per-player setup step
// ---------------------------------------------------------------------------

interface PlayerSetupStepProps {
  entry: QuickSetupEntry;
  playerIndex: number;
  originalName: string;
  commanders: CommanderEntry[];
  knownPlayers: KnownPlayerData[];
  usedNames: string[];
  onUpdate: (update: Partial<QuickSetupEntry>) => void;
  onSaveCombo: (name: string, combo: string[]) => void;
  onTypingChange: (v: boolean) => void;
}

function PlayerSetupStep({
  entry, playerIndex, originalName, commanders, knownPlayers, usedNames,
  onUpdate, onSaveCombo, onTypingChange,
}: PlayerSetupStepProps) {
  const [selectedComboIdx, setSelectedComboIdx] = useState<number>(-1);
  const [showManualInputs, setShowManualInputs] = useState(false);

  const knownPlayer = knownPlayers.find(
    p => p.name.toLowerCase() === entry.name.trim().toLowerCase(),
  );
  const isKnownPlayer = Boolean(knownPlayer);
  const combos = knownPlayer?.combos ?? [];

  const availableKnownNames = knownPlayers
    .filter(p => !usedNames.map(n => n.toLowerCase()).includes(p.name.toLowerCase()))
    .map(p => p.name);

  // When name changes (to a different known player), reset combo selection
  const prevNameRef = useRef(entry.name);
  useEffect(() => {
    if (prevNameRef.current !== entry.name) {
      prevNameRef.current = entry.name;
      setSelectedComboIdx(-1);
      setShowManualInputs(false);
    }
  }, [entry.name]);

  const handleSelectCombo = (idx: number) => {
    setSelectedComboIdx(idx);
    setShowManualInputs(false);
    const combo = combos[idx];
    onUpdate({ commander: combo?.[0] ?? '', partnerCommander: combo?.[1] ?? '' });
  };

  const handleCommanderChange = (v: string) => {
    setSelectedComboIdx(-1);
    onUpdate({ commander: v });
  };

  const handlePartnerChange = (v: string) => {
    setSelectedComboIdx(-1);
    onUpdate({ partnerCommander: v });
  };

  const comboMatchIndex = (needle: string[]) => combos.findIndex((combo) => (
    combo.length === needle.length
    && combo.every((name, i) => name.toLowerCase() === needle[i].toLowerCase())
  ));

  const saveCurrentCombo = () => {
    if (!isKnownPlayer) return;
    const name = entry.name.trim();
    const cmds = [entry.commander.trim(), entry.partnerCommander.trim()].filter(Boolean);
    if (!name || !cmds.length) return;

    const existingIdx = comboMatchIndex(cmds);
    onSaveCombo(name, cmds);

    // New combos are appended; existing ones keep their index.
    const nextIdx = existingIdx >= 0 ? existingIdx : combos.length;
    setSelectedComboIdx(nextIdx);
    setShowManualInputs(false);
    onTypingChange(false);
  };

  const saveNewPlayer = () => {
    if (isKnownPlayer) return;
    const name = entry.name.trim();
    const cmds = [entry.commander.trim(), entry.partnerCommander.trim()].filter(Boolean);
    if (!name || !cmds.length) return;
    onSaveCombo(name, cmds);
    setSelectedComboIdx(0);
    setShowManualInputs(false);
    onTypingChange(false);
  };

  const showDropdown = combos.length > 0 && !showManualInputs;
  const showInputs = combos.length === 0 || showManualInputs;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
      {/* Name row */}
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        <Autocomplete
          freeSolo
          options={availableKnownNames}
          inputValue={entry.name}
          onInputChange={(_, v) => onUpdate({ name: v })}
          onChange={(_, v) => { if (typeof v === 'string' && v) onUpdate({ name: v }); }}
          sx={{ flex: 1 }}
          slotProps={{
            popper: { sx: { zIndex: 2400 } },
            paper: { sx: { bgcolor: '#222', color: '#eee' } },
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              size="small"
              placeholder={originalName || `Player ${playerIndex + 1}`}
              onFocus={() => onTypingChange(true)}
              onBlur={() => onTypingChange(false)}
              inputProps={{ ...params.inputProps, style: { color: '#eee' } }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#444' },
                  '&:hover fieldset': { borderColor: '#6c7490' },
                  '&.Mui-focused fieldset': { borderColor: '#9aa6ca' },
                },
                '& .MuiAutocomplete-endAdornment svg': { color: '#555' },
              }}
            />
          )}
        />
        {!isKnownPlayer && (
          <IconButton
            size="small"
            disabled={!entry.name.trim() || !entry.commander.trim()}
            title="Save player and commander combo"
            onClick={saveNewPlayer}
            sx={{ flexShrink: 0, color: '#9aa6ca', '&.Mui-disabled': { color: '#383838' } }}
          >
            <SaveIcon />
          </IconButton>
        )}
      </Box>

      {/* Saved combos dropdown */}
      {showDropdown && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Select
            size="small"
            value={selectedComboIdx}
            onChange={e => handleSelectCombo(e.target.value as number)}
            displayEmpty
            sx={{
              color: selectedComboIdx === -1 ? '#666' : '#ccc',
              '& .MuiOutlinedInput-notchedOutline': { borderColor: '#444' },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#6c7490' },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#9aa6ca' },
              '& .MuiSvgIcon-root': { color: '#555' },
            }}
            MenuProps={{ sx: { '& .MuiPaper-root': { bgcolor: '#222', color: '#eee' } } }}
          >
            <MenuItem value={-1} sx={{ color: '#666', fontSize: '0.85rem' }}>
              Select commander
            </MenuItem>
            {combos.map((combo, i) => (
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
                setShowManualInputs(true);
                onUpdate({ commander: '', partnerCommander: '' });
              }}
              sx={{ textTransform: 'none' }}
            >
              Add new commander
            </Button>
          </Box>
        </Box>
      )}

      {/* Commander inputs */}
      {showInputs && (
        <>
          {combos.length > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                size="small"
                onClick={() => {
                  setShowManualInputs(false);
                  onTypingChange(false);
                }}
                sx={{ textTransform: 'none', color: '#999' }}
              >
                Cancel
              </Button>
            </Box>
          )}
          <CmdAutocomplete
            value={entry.commander}
            commanders={commanders}
            placeholder="Commander…"
            onChange={handleCommanderChange}
            onTypingChange={onTypingChange}
          />
          <CmdAutocomplete
            value={entry.partnerCommander}
            commanders={commanders}
            placeholder="Partner commander (optional)…"
            onChange={handlePartnerChange}
            onTypingChange={onTypingChange}
          />
          {isKnownPlayer && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button
                size="small"
                variant="contained"
                onClick={saveCurrentCombo}
                disabled={!entry.name.trim() || !entry.commander.trim()}
                sx={{ textTransform: 'none' }}
              >
                Save commander
              </Button>
            </Box>
          )}
        </>
      )}
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Manage saved players view
// ---------------------------------------------------------------------------

interface ManageViewProps {
  knownPlayers: KnownPlayerData[];
  onRemovePlayer: (name: string) => void;
  onRemoveCombo: (name: string, idx: number) => void;
  onClearAll: () => void;
}

function ManageView({ knownPlayers, onRemovePlayer, onRemoveCombo, onClearAll }: ManageViewProps) {
  const [selectedPlayerName, setSelectedPlayerName] = useState<string | null>(null);
  const [confirmPlayer, setConfirmPlayer] = useState<string | null>(null);
  const [confirmCombo, setConfirmCombo] = useState<{ player: string; idx: number } | null>(null);
  const [confirmClearAll, setConfirmClearAll] = useState(false);

  useEffect(() => {
    if (!selectedPlayerName) return;
    const stillExists = knownPlayers.some(p => p.name === selectedPlayerName);
    if (!stillExists) setSelectedPlayerName(null);
  }, [knownPlayers, selectedPlayerName]);

  if (knownPlayers.length === 0) {
    return (
      <Typography sx={{ color: '#c8d1e6', fontSize: '0.9rem', textAlign: 'center', py: 3 }}>
        No saved players yet.
      </Typography>
    );
  }

  if (!selectedPlayerName) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'stretch', mb: 0.25 }}>
          {confirmClearAll ? (
            <Box
              sx={{
                width: '100%',
                borderRadius: 1.5,
                border: '1px solid rgba(244, 67, 54, 0.35)',
                bgcolor: 'rgba(244, 67, 54, 0.08)',
                px: 1.5,
                py: 1.25,
              }}
            >
              <Typography sx={{ fontSize: '0.92rem', fontWeight: 600, color: '#ffd3d3' }}>
                Delete all saved data?
              </Typography>
              <Typography sx={{ fontSize: '0.8rem', color: '#ffb3b3', mt: 0.4 }}>
                This removes all saved players and commander combos on this device.
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1.25 }}>
                <Button
                  size="small"
                  variant="text"
                  onClick={() => setConfirmClearAll(false)}
                  sx={{ textTransform: 'none', color: '#c8d1e6' }}
                >
                  Cancel
                </Button>
                <Button
                  size="small"
                  color="error"
                  variant="contained"
                  startIcon={<CheckIcon sx={{ fontSize: 16 }} />}
                  onClick={() => {
                    onClearAll();
                    setConfirmClearAll(false);
                    setConfirmPlayer(null);
                  }}
                  sx={{ textTransform: 'none' }}
                >
                  Delete all
                </Button>
              </Box>
            </Box>
          ) : (
            <Button
              size="small"
              color="error"
              variant="outlined"
              fullWidth
              onClick={() => {
                setConfirmClearAll(true);
                setConfirmPlayer(null);
              }}
              sx={{ textTransform: 'none' }}
            >
              Delete all saved data
            </Button>
          )}
        </Box>
        {knownPlayers.map((player, pi) => (
          <Box key={player.name}>
            {pi > 0 && <Divider sx={{ borderColor: '#2f3444', mb: 1 }} />}
            <Box
              onClick={() => setSelectedPlayerName(player.name)}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderRadius: 1,
                px: 0.5,
                py: 0.4,
                cursor: 'pointer',
                '&:hover': { bgcolor: '#272b38' },
              }}
            >
              <Typography sx={{ fontWeight: 600, fontSize: '0.94rem', color: '#e6ebff' }}>
                {player.name}
              </Typography>
              {confirmPlayer === player.name ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Typography sx={{ fontSize: '0.78rem', color: '#ffb3b3' }}>Delete?</Typography>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemovePlayer(player.name);
                      setConfirmPlayer(null);
                    }}
                    sx={{ p: 0.2, color: '#ff8080', '&:hover': { color: '#ff3f3f' } }}
                  >
                    <CheckIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      setConfirmPlayer(null);
                    }}
                    sx={{ p: 0.2, color: '#b7c0d9', '&:hover': { color: '#e0e6f7' } }}
                  >
                    <CloseIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                </Box>
              ) : (
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    setConfirmPlayer(player.name);
                  }}
                  sx={{ color: '#93a1c7', '&:hover': { color: '#ff6b6b' } }}
                >
                  <DeleteIcon sx={{ fontSize: 18 }} />
                </IconButton>
              )}
            </Box>
          </Box>
        ))}
      </Box>
    );
  }

  const selectedPlayer = knownPlayers.find(p => p.name === selectedPlayerName);
  if (!selectedPlayer) return null;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button
          size="small"
          variant="text"
          onClick={() => {
            setSelectedPlayerName(null);
            setConfirmCombo(null);
          }}
          sx={{ textTransform: 'none', px: 0, color: '#9db0dd' }}
        >
          Back to players
        </Button>
        <Typography sx={{ fontWeight: 700, fontSize: '0.94rem', color: '#e6ebff' }}>
          {selectedPlayer.name}
        </Typography>
      </Box>
      <Divider sx={{ borderColor: '#2f3444' }} />
      {selectedPlayer.combos.length === 0 ? (
        <Typography sx={{ color: '#c8d1e6', fontSize: '0.86rem', pl: 0.5 }}>
          No combos saved.
        </Typography>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {selectedPlayer.combos.map((combo, ci) => {
            const isConfirming = confirmCombo?.player === selectedPlayer.name && confirmCombo.idx === ci;
            return (
              <Box key={ci} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pl: 0.5 }}>
                <Typography sx={{ fontSize: '0.84rem', color: '#d7deef' }}>
                  {combo.join(' / ')}
                </Typography>
                {isConfirming ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Typography sx={{ fontSize: '0.75rem', color: '#ffb3b3' }}>Remove?</Typography>
                    <IconButton
                      size="small"
                      onClick={() => { onRemoveCombo(selectedPlayer.name, ci); setConfirmCombo(null); }}
                      sx={{ p: 0.2, color: '#ff8080', '&:hover': { color: '#ff3f3f' } }}
                    >
                      <CheckIcon sx={{ fontSize: 12 }} />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => setConfirmCombo(null)}
                      sx={{ p: 0.2, color: '#b7c0d9', '&:hover': { color: '#e0e6f7' } }}
                    >
                      <CloseIcon sx={{ fontSize: 12 }} />
                    </IconButton>
                  </Box>
                ) : (
                  <IconButton
                    size="small"
                    onClick={() => setConfirmCombo({ player: selectedPlayer.name, idx: ci })}
                    sx={{ p: 0.25, color: '#93a1c7', '&:hover': { color: '#ff6b6b' } }}
                  >
                    <DeleteIcon sx={{ fontSize: 15 }} />
                  </IconButton>
                )}
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Main dialog
// ---------------------------------------------------------------------------

export default function QuickSetupDialog({
  open, players, initialStartingLife, playerCount, threeLayout, commanders, visiblePlayerIds,
  onClose, onOpenPlayerLayout, onTypingChange, onClearStoredData, onApply,
}: QuickSetupDialogProps) {
  const { knownPlayers, saveCombo, removeCombo, removePlayer, clearAllPlayers } = useKnownPlayers();
  const landscapeMobileLayout = useMediaQuery('(pointer: coarse) and (orientation: landscape)');
  const [entries, setEntries] = useState<QuickSetupEntry[]>([]);
  const [originalNames, setOriginalNames] = useState<string[]>([]);
  const [startingLife, setStartingLife] = useState<StartingLife>(40);
  const [currentStep, setCurrentStep] = useState(0);
  const [view, setView] = useState<'setup' | 'manage'>('setup');
  const modalRef = useRef<HTMLDivElement | null>(null);

  const setTyping = useCallback((typing: boolean) => {
    onTypingChange?.(typing);
  }, [onTypingChange]);

  useEffect(() => {
    if (!open) { setTyping(false); return; }
    setCurrentStep(0);
    setView('setup');
  }, [open, setTyping]);

  useEffect(() => {
    if (!open) return;
    setOriginalNames(players.map(p => p.name));
    setStartingLife(initialStartingLife);
    setEntries(players.map(player => ({
      name: '',
      commander: player.commander,
      partnerCommander: player.partnerCommander,
    })));
  }, [open, players, initialStartingLife]);

  const setEntry = (index: number, update: Partial<QuickSetupEntry>) => {
    setEntries(prev => prev.map((e, i) => (i === index ? { ...e, ...update } : e)));
  };

  const clearAllStoredData = () => {
    clearAllPlayers();
    onClearStoredData?.();
  };

  const visibleSteps = [...visiblePlayerIds].sort((a, b) => a - b);
  const totalSteps = visibleSteps.length;
  const currentPlayerIdx = visibleSteps[currentStep] ?? 0;
  const isLastStep = currentStep === totalSteps - 1;
  const playerLayoutLabel = playerCount === 3 ? `3 Players (${threeLayout})` : `${playerCount} Players`;

  useEffect(() => {
    if (currentStep < totalSteps) return;
    setCurrentStep(Math.max(totalSteps - 1, 0));
  }, [currentStep, totalSteps]);

  const usedNames = visibleSteps
    .filter((_, i) => i !== currentStep)
    .map(idx => entries[idx]?.name ?? '')
    .filter(Boolean);

  if (!entries.length) return null;

  return (
    <Backdrop
      open={open}
      onClick={onClose}
      sx={{ position: 'fixed', inset: 0, zIndex: 230, backdropFilter: 'blur(4px)', bgcolor: 'rgba(0,0,0,0.7)' }}
    >
      <Box
        ref={modalRef}
        onClick={e => e.stopPropagation()}
        onFocusCapture={() => setTyping(true)}
        onBlurCapture={() => {
          window.setTimeout(() => {
            if (!modalRef.current?.contains(document.activeElement)) setTyping(false);
          }, 0);
        }}
        sx={{
          bgcolor: '#1e1e1e',
          color: '#eee',
          border: '1px solid #333',
          borderRadius: 2,
          boxShadow: '0 0 32px rgba(0,0,0,0.35)',
          width: landscapeMobileLayout ? 'min(92dvh, 460px)' : 'min(92vw, 460px)',
          maxWidth: landscapeMobileLayout ? 'calc(100dvh - 24px)' : 'calc(100% - 24px)',
          maxHeight: landscapeMobileLayout ? 'calc(100dvw - 24px)' : 'calc(100dvh - 24px)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          transform: landscapeMobileLayout ? 'rotate(90deg)' : 'none',
          transformOrigin: 'center',
        }}
      >
        {/* Header */}
        <Box sx={{ px: 3, pt: 2.25, pb: 1.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Typography sx={{
                color: '#d7deef', fontWeight: 700, fontSize: '1rem',
                letterSpacing: '0.06em', textTransform: 'uppercase',
              }}>
                {view === 'manage' ? 'Saved Players' : 'Quick Setup'}
              </Typography>
              {view === 'setup' && (
                <>
                  <Box sx={{ mt: 1, display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 1 }}>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ color: '#98a3b8', fontSize: '0.72rem', mb: 0.45, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                        Starting Life
                      </Typography>
                      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 0.75 }}>
                        <Button size="small" variant={startingLife === 20 ? 'contained' : 'outlined'}
                          onClick={() => setStartingLife(20)} sx={{ minWidth: 0, textTransform: 'none' }}>20</Button>
                        <Button size="small" variant={startingLife === 40 ? 'contained' : 'outlined'}
                          onClick={() => setStartingLife(40)} sx={{ minWidth: 0, textTransform: 'none' }}>40</Button>
                      </Box>
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ color: '#98a3b8', fontSize: '0.72rem', mb: 0.45, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                        Players
                      </Typography>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={onOpenPlayerLayout}
                        fullWidth
                        sx={{ minWidth: 0, textTransform: 'none' }}
                      >
                        {playerLayoutLabel}
                      </Button>
                    </Box>
                  </Box>
                  <Typography sx={{ color: '#98a3b8', fontSize: '0.82rem', mt: 0.75 }}>
                    Player {currentStep + 1} of {totalSteps}
                  </Typography>
                </>
              )}
            </Box>
            {view === 'setup' && (
              <Box sx={{ display: 'flex', gap: 0.75, mt: 0.5 }}>
                {visibleSteps.map((_, i) => (
                  <Box
                    key={i}
                    onClick={() => setCurrentStep(i)}
                    sx={{
                      width: 8, height: 8, borderRadius: '50%',
                      bgcolor: i === currentStep ? '#9aa6ca' : '#444',
                      cursor: 'pointer', transition: 'background-color 0.2s',
                      '&:hover': { bgcolor: i === currentStep ? '#9aa6ca' : '#666' },
                    }}
                  />
                ))}
              </Box>
            )}
          </Box>
        </Box>

        {/* Content */}
        <Box sx={{ px: 3, pb: 2, overflowY: 'auto', flex: 1 }}>
          {view === 'setup' ? (
            <PlayerSetupStep
              key={currentPlayerIdx}
              entry={entries[currentPlayerIdx]}
              playerIndex={currentPlayerIdx}
              originalName={originalNames[currentPlayerIdx] ?? ''}
              commanders={commanders}
              knownPlayers={knownPlayers}
              usedNames={usedNames}
              onUpdate={update => setEntry(currentPlayerIdx, update)}
              onSaveCombo={saveCombo}
              onTypingChange={setTyping}
            />
          ) : (
            <ManageView
              knownPlayers={knownPlayers}
              onRemovePlayer={removePlayer}
              onRemoveCombo={removeCombo}
              onClearAll={clearAllStoredData}
            />
          )}
        </Box>

        {/* Footer */}
        <Box sx={{ px: 3, pb: 2.25, borderTop: '1px solid #282828' }}>
          {view === 'setup' ? (
            <>
              <Box
                onClick={() => setView('manage')}
                sx={{
                  color: '#747485', fontSize: '0.75rem', cursor: 'pointer', textAlign: 'center',
                  pt: 1.25, pb: 0.25,
                  '&:hover': { color: '#9aa6ca' },
                }}
              >
                Manage saved players
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1 }}>
                <Button onClick={onClose} sx={{ color: '#aaa', textTransform: 'none' }}>Cancel</Button>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {currentStep > 0 && (
                    <Button variant="outlined" onClick={() => setCurrentStep(s => s - 1)}
                      sx={{ textTransform: 'none' }}>Back</Button>
                  )}
                  {isLastStep ? (
                    <Button
                      variant="contained"
                      onClick={() => onApply(
                        entries.map((e, i) => ({
                          ...e,
                          name: e.name.trim() || originalNames[i] || `Player ${i + 1}`,
                        })),
                        startingLife,
                      )}
                      sx={{ textTransform: 'none' }}
                    >
                      Apply
                    </Button>
                  ) : (
                    <Button variant="contained" onClick={() => setCurrentStep(s => s + 1)}
                      sx={{ textTransform: 'none' }}>Next</Button>
                  )}
                </Box>
              </Box>
            </>
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 1.25 }}>
              <Button variant="outlined" onClick={() => setView('setup')}
                sx={{ textTransform: 'none' }}>Back to setup</Button>
            </Box>
          )}
        </Box>
      </Box>
    </Backdrop>
  );
}
