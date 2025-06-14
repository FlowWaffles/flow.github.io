import './Logo.css';
import React from 'react';

const UniLogo = React.memo(() => {
    return (
        <div className="uni-box">
            <div className="uni"></div>
        </div>
    );
});

export default UniLogo;