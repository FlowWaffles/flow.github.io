const NyanCat = () => {
    return (
        <img
            src={'../assets/nyanCat.gif'}
            alt=""
            id="cat"
            style={{
                zIndex: 1000,
                position: 'fixed',
                left: '40px',
                top: '40px',
                transform: 'translate(-50%, -50%)',
                cursor: 'noe',
                userSelect: 'none',
                pointerEvents: 'auto',
                width: '80px',
                transition: 'left 0.1s ease, top 0.1s ease',
            }}
        />
    );
};

export default NyanCat;
