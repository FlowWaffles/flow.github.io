import './Header.css';
import React from 'react';

const Header = React.memo(() => {
    return (
        <header className="bg-gray-800 text-white p-4">
            <div className="header">
                <h1><a href="/" aria-label="Home">FLOW.FAIL</a></h1>
                <p>... the only page you'll <a href="https://www.twitch.tv/bobross" target="_blank">never</a> need</p>
            </div>
        </header>
    );
})
export default Header;
