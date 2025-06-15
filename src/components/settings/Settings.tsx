import { useEffect, useRef, useState } from 'react';
import type { FC } from 'react';
import SettingsIcon from '@mui/icons-material/Settings';
import Lights from './lights/Lights';
import Radio from './radio/Radio';
import './Settings.css';

const Settings: FC = () => {
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
                    className={'settings-toggle'}
                    aria-label="Toggle settings menu"
                    onClick={() => setOpen(true)}
                >
                    <SettingsIcon />
                </button>
            )}
            <div
                className={`settings-panel ${open ? 'visible' : 'hidden'}`}
                ref={panelRef}
            >
                <Lights />
                <Radio />
            </div>
        </div>
    );
};

export default Settings;
