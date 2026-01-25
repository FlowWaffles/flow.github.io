import { useEffect, useRef, useState } from 'react';
import AcUnitIcon from '@mui/icons-material/AcUnit'; // snowflake icon
import './Snowflake.css';

const Snowflake = () => {
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
        <div className="snowflake-container">
            {!open && (
                <button
                    className="snowflake-toggle"
                    aria-label="Toggle Snowflake"
                    onClick={() => setOpen(true)}
                >
                    <AcUnitIcon />
                </button>
            )}

            <div
                ref={panelRef}
                className={`snowflake-panel ${open ? 'visible' : 'hidden'}`}
            >
                <iframe
                    src="https://snowflake.torproject.org/embed.html"
                    width="320"
                    height="240"
                    frameBorder="0"
                    scrolling="no"
                    title="Snowflake"
                />
            </div>
        </div>
    );
};

export default Snowflake;
