import type { FC } from 'react';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import './Lights.css';

type LightsProps = {
  checked: boolean; // true = dark mode ON
  onChange: (checked: boolean) => void;
};

const Lights: FC<LightsProps> = ({ checked, onChange }) => {
  return (
    <div className="lights-group">
      <button
        type="button"
        aria-pressed={!checked}
        aria-label="Switch to light mode"
        className={`theme-button ${!checked ? 'selected' : ''}`}
        onClick={() => onChange(false)}
      >
        <LightModeIcon />
        <span>Light</span>
      </button>
      <button
        type="button"
        aria-pressed={checked}
        aria-label="Switch to dark mode"
        className={`theme-button ${checked ? 'selected' : ''}`}
        onClick={() => onChange(true)}
      >
        <DarkModeOutlinedIcon />
        <span>Dark</span>
      </button>
    </div>
  );
};

export default Lights;
