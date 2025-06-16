import { useState, useEffect } from 'react';

const NyanCat = () => {
    const [following, setFollowing] = useState(false);
    const [position, setPosition] = useState({ x: 40, y: 40 });

    useEffect(() => {
        if (!following) return;

        const handleMouseMove = (e:any) => {
            setPosition({ x: e.clientX -40, y: e.clientY -40 });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [following]);

    const handleClick = () => {
        setFollowing((prev) => !prev);
    };

    return (
        <img
            src={'../assets/nyanCat.gif'}
            alt=""
            id="cat"
            onClick={handleClick}
            style={{
                zIndex: 1000,
                position: 'fixed',
                left: position.x,
                top: position.y,
                transform: 'translate(-50%, -50%)',
                cursor: 'pointer',
                userSelect: 'none',
                pointerEvents: 'auto',
                width: '80px',
                transition: 'left 0.1s ease, top 0.1s ease',
            }}
        />
    );
};

export default NyanCat;
