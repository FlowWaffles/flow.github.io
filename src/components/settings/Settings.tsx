import { useEffect, useRef, useState } from 'react';
import type { FC } from 'react';
import SettingsIcon from '@mui/icons-material/Settings';
import Lights from './lights/Lights';
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
            {!open && (
                <button
                    className="settings-toggle"
                    aria-label="Toggle settings"
                    onClick={() => setOpen((prev) => !prev)}
                >
                    <SettingsIcon />
                </button>
            )}
            {open && (
                <div className="settings-panel" ref={panelRef}>
                    <Lights checked={isDark} onChange={onThemeChange} />
                </div>
            )}
        </div>
    );
};

export default Settings;
