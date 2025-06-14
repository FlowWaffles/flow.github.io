import type { FC } from 'react';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import UniButton from '../../button/UniButton';
import './Lights.css';

type LightsProps = {
  checked: boolean; // true = dark mode ON
  onChange: (checked: boolean) => void;
};

const Lights: FC<LightsProps> = ({ checked, onChange }) => {
  return (
    <div className="lights-group">
      <UniButton
        onClick={() => onChange(false)}
        selected={!checked}
        icon={<LightModeIcon />}
        label="Lights"
        ariaLabel="Switch to light mode"
      />
      <UniButton
        onClick={() => onChange(true)}
        selected={checked}
        icon={<DarkModeOutlinedIcon />}
        label="Dark"
        ariaLabel="Switch to dark mode"
      />
    </div>
  );
};

export default Lights;
