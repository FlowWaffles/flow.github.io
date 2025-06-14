import { useEffect, useRef, useState } from 'react';
import type { FC } from 'react';
import SettingsIcon from '@mui/icons-material/Settings';
import Lights from './lights/Lights';
import Radio from './radio/Radio';
import './Settings.css';

type SettingsProps = {
    isDark: boolean;
    onThemeChange: (isDark: boolean) => void;
};

const Settings: FC<SettingsProps> = ({ isDark, onThemeChange }) => {
    const [open, setOpen] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;

        const handleClickOutside = (e: PointerEvent) => {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };

        document.addEventListener('pointerdown', handleClickOutside);
        return () => {
            document.removeEventListener('pointerdown', handleClickOutside);
        };
    }, [open]);

    return (
        <div className="settings-container">
            <button
                className={`settings-toggle ${open ? 'hidden' : 'visible'}`}
                aria-label="Toggle settings"
                onClick={() => setOpen(true)}
            >
                <SettingsIcon />
            </button>
            <div
                className={`settings-panel ${open ? 'visible' : 'hidden'}`}
                ref={panelRef}
            >
                <Lights checked={isDark} onChange={onThemeChange} />
                <Radio />
            </div>
        </div>
    );
};

export default Settings;
