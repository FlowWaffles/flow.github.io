import { useState } from 'react';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import UniButton from '../../button/UniButton';
import './Lights.css';
import { getTheme, setTheme } from '../../../utils/ThemeHandler';

type LightsProps = {
  onThemeSelected?: () => void;
};

const Lights = ({ onThemeSelected }: LightsProps) => {
  const theme = getTheme();
  const [isDark, setIsDark] = useState(theme === 'dark');

  const handleChange = (darkMode: boolean) => {
    setIsDark(darkMode);
    setTheme(darkMode ? 'dark' : 'light');
    onThemeSelected?.();
  }

  return (
    <div className="lights-group">
      <UniButton
        onClick={() => handleChange(false)}
        selected={!isDark}
        icon={<LightModeIcon />}
        label="Light"
        ariaLabel="Switch to light mode"
      />
      <UniButton
        onClick={() => handleChange(true)}
        selected={isDark}
        icon={<DarkModeOutlinedIcon />}
        label="Dark"
        ariaLabel="Switch to dark mode"
      />
    </div>
  );
};

export default Lights;
