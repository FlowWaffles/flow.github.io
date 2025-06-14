import { useEffect, useRef, useState } from 'react';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import './Radio.css';
import UniButton from '../../button/UniButton';

const Radio = () => {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isMuted, setIsMuted] = useState(true);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleCanPlay = () => {
            setIsVisible(true);
        };

        audio.addEventListener('canplaythrough', handleCanPlay);
        return () => {
            audio.removeEventListener('canplaythrough', handleCanPlay);
        };
    }, []);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.muted = isMuted;
        }
    }, [isMuted]);

    const toggleMute = () => {
        setIsMuted(prev => {
            const newMuted = !prev;
            const audio = audioRef.current;
            if (audio) {
                audio.muted = newMuted;
                if (!newMuted) {
                    audio.play().catch((err) => {
                        console.warn('Playback failed:', err);
                    });
                } else {
                    audio.pause();
                }
            }
            return newMuted;
        });
    };

    return (
        <div className={`music-player__container ${isVisible ? 'fade-in-05' : ''}`}>
            <audio
                ref={audioRef}
                src="/assets/SpaceForFlow.wav"
                preload="auto"
                autoPlay
                loop
            />

            <div className="music-player__controls">
                <UniButton
                    onClick={toggleMute}
                    selected={!isMuted}
                    label={isMuted ? 'Off' : 'On'}
                    icon={isMuted ? <VolumeOffIcon fontSize="small" /> : <VolumeUpIcon fontSize="small" />}
                    ariaLabel={isMuted ? 'Turn sound on' : 'Turn sound off'}
                />
                <span className="music-player__label">audio by <a href="https://www.instagram.com/res.output/" target="_blank">res-o</a></span>
            </div>
        </div>
    );
};

export default Radio;
